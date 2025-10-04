using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;
using BDFM.Domain.Entities.Core;
using BDFM.Domain.Entities.Security;

namespace BDFM.Application.Features.Security.UserPermissions.Queries.GetPermissionsByUserId;

public class GetPermissionsByUserIdQueryHandler : IRequestHandler<GetPermissionsByUserIdQuery, Response<PagedResult<PermissionsByUserViewModel>>>
{
    private readonly IBaseRepository<UserPermission> _userPermissionRepository;
    private readonly IBaseRepository<User> _userRepository;

    public GetPermissionsByUserIdQueryHandler(
        IBaseRepository<UserPermission> userPermissionRepository,
        IBaseRepository<User> userRepository)
    {
        _userPermissionRepository = userPermissionRepository ?? throw new ArgumentNullException(nameof(userPermissionRepository));
        _userRepository = userRepository ?? throw new ArgumentNullException(nameof(userRepository));
    }

    public async Task<Response<PagedResult<PermissionsByUserViewModel>>> Handle(GetPermissionsByUserIdQuery request, CancellationToken cancellationToken)
    {
        // Verify user exists
        var user = await _userRepository.Find(u => u.Id == request.UserId, cancellationToken: cancellationToken);
        if (user == null)
            return ErrorsMessage.NotFoundData.ToErrorMessage<PagedResult<PermissionsByUserViewModel>>(null!);

        // Get the user permissions for the given user
        IQueryable<UserPermission> userPermissionsQuery = _userPermissionRepository.Query()
            .Where(up => up.UserId == request.UserId && !up.IsDeleted)
            .Include(up => up.Permission);

        // Apply permission search and filter criteria
        if (!string.IsNullOrEmpty(request.SearchTerm))
        {
            var searchTerm = request.SearchTerm.ToLower();
            userPermissionsQuery = userPermissionsQuery.Where(up =>
                up.Permission.Name.ToLower().Contains(searchTerm) ||
                up.Permission.Value.ToLower().Contains(searchTerm) ||
                (up.Permission.Description != null && up.Permission.Description.ToLower().Contains(searchTerm)));
        }

        if (request.StatusId.HasValue)
        {
            userPermissionsQuery = userPermissionsQuery.Where(up => (int)up.Permission.StatusId == request.StatusId.Value);
        }

        // Apply pagination and projection
        var results = await userPermissionsQuery
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(up => new PermissionsByUserViewModel
            {
                Id = up.Permission.Id,
                Name = up.Permission.Name,
                Value = up.Permission.Value,
                Description = up.Permission.Description,
                StatusId = (int)up.Permission.StatusId,
                StatusName = up.Permission.StatusId.GetDisplayName(),
                CreatedDate = up.Permission.CreateAt,
                LastModifiedDate = up.Permission.LastUpdateAt
            })
            .ToListAsync(cancellationToken);

        // Get total count for pagination
        var count = await userPermissionsQuery.CountAsync(cancellationToken);

        var pagedResult = new PagedResult<PermissionsByUserViewModel>
        {
            Items = results,
            TotalCount = count
        };

        return SuccessMessage.Get.ToSuccessMessage(pagedResult);
    }
}
