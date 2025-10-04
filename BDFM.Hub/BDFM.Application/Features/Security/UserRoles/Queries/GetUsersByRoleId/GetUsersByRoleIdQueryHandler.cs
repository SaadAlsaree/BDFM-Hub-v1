using MediatR;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using BDFM.Application.Contracts.Persistence;
using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;
using BDFM.Domain.Common;
using BDFM.Domain.Entities.Core;
using BDFM.Domain.Enums;

namespace BDFM.Application.Features.Security.UserRoles.Queries.GetUsersByRoleId;

public class GetUsersByRoleIdQueryHandler : IRequestHandler<GetUsersByRoleIdQuery, Response<PagedResult<UsersByRoleViewModel>>>
{
    private readonly IBaseRepository<BDFM.Domain.Entities.Security.UserRole> _userRoleRepository;
    private readonly IBaseRepository<BDFM.Domain.Entities.Security.Role> _roleRepository;
    private readonly IBaseRepository<User> _userRepository;

    public GetUsersByRoleIdQueryHandler(
        IBaseRepository<BDFM.Domain.Entities.Security.UserRole> userRoleRepository,
        IBaseRepository<BDFM.Domain.Entities.Security.Role> roleRepository,
        IBaseRepository<User> userRepository)
    {
        _userRoleRepository = userRoleRepository ?? throw new ArgumentNullException(nameof(userRoleRepository));
        _roleRepository = roleRepository ?? throw new ArgumentNullException(nameof(roleRepository));
        _userRepository = userRepository ?? throw new ArgumentNullException(nameof(userRepository));
    }

    public async Task<Response<PagedResult<UsersByRoleViewModel>>> Handle(GetUsersByRoleIdQuery request, CancellationToken cancellationToken)
    {
        // Verify role exists
        var role = await _roleRepository.Find(r => r.Id == request.RoleId, cancellationToken: cancellationToken);
        if (role == null)
            return ErrorsMessage.NotFoundData.ToErrorMessage<PagedResult<UsersByRoleViewModel>>(null!);

        // Get users for this role
        var query = _userRoleRepository.GetQueryable()
            .Where(ur => ur.RoleId == request.RoleId && !ur.IsDeleted)
            .Join(_userRepository.GetQueryable().Where(u => !u.IsDeleted),
                ur => ur.UserId,
                u => u.Id,
                (ur, u) => new UsersByRoleViewModel
                {
                    Id = u.Id,
                    Username = u.Username,
                    Email = u.Email,
                    FullName = u.FullName,
                    CreatedAt = u.CreateAt,
                    StatusId = (int)u.StatusId
                });

        // Apply search filter if provided
        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            query = query.Where(u =>
                u.Username.Contains(request.SearchTerm) ||
                u.Email.Contains(request.SearchTerm) ||
                u.FullName.Contains(request.SearchTerm));
        }

        // Get total count
        var totalCount = await query.CountAsync(cancellationToken);
        if (totalCount == 0)
            return ErrorsMessage.NotFoundData.ToErrorMessage<PagedResult<UsersByRoleViewModel>>(null!);

        // Apply pagination
        var users = await query
            .OrderBy(u => u.Username)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        // Set status names
        foreach (var user in users)
        {
            user.StatusName = ((Status)user.StatusId).ToString();
        }

        // Build paged result
        var pagedResult = new PagedResult<UsersByRoleViewModel>
        {
            Items = users,
            TotalCount = totalCount
        };

        return SuccessMessage.Get.ToSuccessMessage(pagedResult);
    }
}
