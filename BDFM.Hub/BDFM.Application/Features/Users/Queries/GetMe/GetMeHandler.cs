using BDFM.Application.Features.Utility.BaseUtility.Query.GetById;
using BDFM.Domain.Entities.Core;

namespace BDFM.Application.Features.Users.Queries.GetMe
{
    public class GetMeHandler : GetByIdHandler<User, GetMeVm, GetMeQuery>, IRequestHandler<GetMeQuery, Response<GetMeVm>>
    {
        private readonly ILoggedInUserService _loggedInUserService;
        public GetMeHandler(IBaseRepository<User> repository, ILoggedInUserService loggedInUserService) : base(repository)
        {
            _loggedInUserService = loggedInUserService;
        }


        // Map the User entity to GetMeVm
        public override Expression<Func<User, GetMeVm>> Selector => x => new GetMeVm
        {
            Id = x.Id,
            Username = x.Username,
            UserLogin = x.UserLogin,
            FullName = x.FullName,
            Email = x.Email,
            OrganizationalUnitId = x.OrganizationalUnitId,
            PositionTitle = x.PositionTitle,
            RfidTagId = x.RfidTagId,
            IsActive = x.IsActive,
            IsDefaultPassword = x.IsDefaultPassword,
            TwoFactorSecret = x.TwoFactorSecret,
            LastLogin = x.LastLogin,
            UserPermissions = x.UserPermissions.Select(up => new UserPermissionDto
            {
                Id = up.Permission.Id,
                Name = up.Permission.Name,
                Value = up.Permission.Value,
                Description = up.Permission.Description
            }).ToList(),
            OrganizationalUnit = x.OrganizationalUnit != null ? new OrganizationalUnitDto
            {
                Id = x.OrganizationalUnit.Id,
                UnitName = x.OrganizationalUnit.UnitName,
                UnitCode = x.OrganizationalUnit.UnitCode,
                UnitDescription = x.OrganizationalUnit.UnitDescription,
                Email = x.OrganizationalUnit.Email,
                PhoneNumber = x.OrganizationalUnit.PhoneNumber,
                Address = x.OrganizationalUnit.Address,
                PostalCode = x.OrganizationalUnit.PostalCode,
                UnitLogo = x.OrganizationalUnit.UnitLogo,
                UnitLevel = x.OrganizationalUnit.UnitLevel,
                CanReceiveExternalMail = x.OrganizationalUnit.CanReceiveExternalMail,
                CanSendExternalMail = x.OrganizationalUnit.CanSendExternalMail
            } : null!,

            UserRoles = x.UserRoles.Select(ur => new UserRoleDto
            {
                Id = ur.Role.Id,
                Name = ur.Role.Name,
                Value = ur.Role.Value,
                Description = ur.Role.Description,
                Delegations = ur.Role.Delegations.Select(d => new DelegationDto
                {
                    DelegatorUserId = d.DelegatorUserId,
                    DelegateeUserId = d.DelegateeUserId,
                    StartDate = d.StartDate,
                    EndDate = d.EndDate,
                    IsActive = d.IsActive
                }).ToList()
            }).ToList(),
        };


        // Get the current user's ID from the logged-in user service
        public override Expression<Func<User, bool>> IdPredicate(GetMeQuery request)
        {
            var authId = _loggedInUserService.UserId;

            if (string.IsNullOrEmpty(authId) || !Guid.TryParse(authId, out Guid userId))
            {
                throw new UnauthorizedAccessException("User is not authenticated or has an invalid ID.");
            }

            return x => x.Id == userId;
        }


        public async Task<Response<GetMeVm>> Handle(GetMeQuery request, CancellationToken cancellationToken)
        {
            return await HandleBase(request, cancellationToken);
        }


    }
}
