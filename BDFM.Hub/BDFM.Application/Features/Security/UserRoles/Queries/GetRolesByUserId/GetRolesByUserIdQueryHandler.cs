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
using BDFM.Domain.Entities.Security;
using BDFM.Domain.Enums;

namespace BDFM.Application.Features.Security.UserRoles.Queries.GetRolesByUserId;

public class GetRolesByUserIdQueryHandler : IRequestHandler<GetRolesByUserIdQuery, Response<PagedResult<RolesByUserViewModel>>>
{
    private readonly IBaseRepository<BDFM.Domain.Entities.Security.UserRole> _userRoleRepository;
    private readonly IBaseRepository<BDFM.Domain.Entities.Security.Role> _roleRepository;
    private readonly IBaseRepository<User> _userRepository;

    public GetRolesByUserIdQueryHandler(
        IBaseRepository<BDFM.Domain.Entities.Security.UserRole> userRoleRepository,
        IBaseRepository<BDFM.Domain.Entities.Security.Role> roleRepository,
        IBaseRepository<User> userRepository)
    {
        _userRoleRepository = userRoleRepository ?? throw new ArgumentNullException(nameof(userRoleRepository));
        _roleRepository = roleRepository ?? throw new ArgumentNullException(nameof(roleRepository));
        _userRepository = userRepository ?? throw new ArgumentNullException(nameof(userRepository));
    }

    public async Task<Response<PagedResult<RolesByUserViewModel>>> Handle(GetRolesByUserIdQuery request, CancellationToken cancellationToken)
    {
        // Verify user exists
        var user = await _userRepository.Find(u => u.Id == request.UserId, cancellationToken: cancellationToken);
        if (user == null)
            return ErrorsMessage.NotFoundData.ToErrorMessage<PagedResult<RolesByUserViewModel>>(null!);

        // Get userRoles for this user
        var query = _userRoleRepository.GetQueryable()
            .Where(ur => ur.UserId == request.UserId && !ur.IsDeleted)
            .Join(_roleRepository.GetQueryable().Where(r => !r.IsDeleted),
                ur => ur.RoleId,
                r => r.Id,
                (ur, r) => new RolesByUserViewModel
                {
                    Id = r.Id,
                    Name = r.Name,
                    Description = r.Description,
                    CreatedAt = r.CreateAt,
                    StatusId = (int)r.StatusId
                });

        // Apply search filter if provided
        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            query = query.Where(r =>
                r.Name.Contains(request.SearchTerm) ||
                r.Description.Contains(request.SearchTerm));
        }

        // Get total count
        var totalCount = await query.CountAsync(cancellationToken);
        if (totalCount == 0)
            return ErrorsMessage.NotFoundData.ToErrorMessage<PagedResult<RolesByUserViewModel>>(null!);

        // Apply pagination
        var roles = await query
            .OrderBy(r => r.Name)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        // Set status names
        foreach (var role in roles)
        {
            role.StatusName = ((Status)role.StatusId).ToString();
        }

        // Build paged result
        var pagedResult = new PagedResult<RolesByUserViewModel>
        {
            Items = roles,
            TotalCount = totalCount
        };

        return SuccessMessage.Get.ToSuccessMessage(pagedResult);
    }
}
