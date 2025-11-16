using BDFM.Application.Features.Utility.BaseUtility.Query.GetById;
using BDFM.Domain.Entities.Core;

namespace BDFM.Application.Features.Users.Queries.GetUserById;

public class GetUserByIdQueryHandler : GetByIdHandler<User, UserViewModel, GetUserByIdQuery>, IRequestHandler<GetUserByIdQuery, Response<UserViewModel>>
{
    public GetUserByIdQueryHandler(IBaseRepository<User> repository)
        : base(repository)
    {
    }

    public override Expression<Func<User, bool>> IdPredicate(GetUserByIdQuery request)
    {
        return u => u.Id == request.Id;
    }

    public override Expression<Func<User, UserViewModel>> Selector => u => new UserViewModel
    {
        Id = u.Id,
        Username = u.Username,
        UserLogin = u.UserLogin,
        FullName = u.FullName,
        Email = u.Email,
        OrganizationalUnitId = u.OrganizationalUnitId,
        OrganizationalUnitName = u.OrganizationalUnit != null ? u.OrganizationalUnit.UnitName : null,
        PositionTitle = u.PositionTitle,
        RfidTagId = u.RfidTagId,
        IsActive = u.IsActive,
        IsDefaultPassword = u.IsDefaultPassword,
        CreateAt = u.CreateAt,
        Status = (int)u.StatusId,
        UserRoles = u.UserRoles.Select(ur => new UserRoleViewModel
        {
            Id = ur.RoleId,
            Name = ur.Role.Name,
            Value = ur.Role.Value,
            Description = ur.Role.Description!
        }).ToList(),
        UserPermissions = u.UserPermissions.Select(up => new UserPermissionViewModel
        {
            Id = up.PermissionId,
            Name = up.Permission.Name,
            Value = up.Permission.Value,
            Description = up.Permission.Description!
        }).ToList()
    };

    public async Task<Response<UserViewModel>> Handle(GetUserByIdQuery request, CancellationToken cancellationToken)
    {
        // Override the default implementation to include the related entities
        var user = await _repository
            .Query(IdPredicate(request))
            .Select(Selector)
            .FirstOrDefaultAsync(cancellationToken);

        if (user == null)
            return ErrorsMessage.NotFoundData.ToErrorMessage<UserViewModel>(null!);

        user.StatusName = ((Status)user.Status).GetDisplayName();

        return SuccessMessage.Get.ToSuccessMessage(user);
    }
}
