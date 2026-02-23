using BDFM.Application.Contracts.Infrastructure;
using BDFM.Application.Contracts.Persistence;
using BDFM.Domain.Entities.Core;
using BDFM.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace BDFM.Application.Features.Users.Queries.GetUsersPerEntityReport
{
    public class GetUsersPerEntityReportQueryHandler : IRequestHandler<GetUsersPerEntityReportQuery, byte[]>
    {
        private readonly IBaseRepository<User> _userRepository;
        private readonly IBaseRepository<OrganizationalUnit> _unitRepository;
        private readonly IPdfService _pdfService;

        public GetUsersPerEntityReportQueryHandler(
            IBaseRepository<User> userRepository,
            IBaseRepository<OrganizationalUnit> unitRepository,
            IPdfService pdfService)
        {
            _userRepository = userRepository;
            _unitRepository = unitRepository;
            _pdfService = pdfService;
        }

        public async Task<byte[]> Handle(GetUsersPerEntityReportQuery request, CancellationToken cancellationToken)
        {
            var units = await _unitRepository.Query()
                .Where(u => !u.IsDeleted)
                .ToListAsync(cancellationToken);

            var users = await _userRepository.Query()
                .Include(u => u.OrganizationalUnit)
                .Where(u => !u.IsDeleted)
                .ToListAsync(cancellationToken);

            var targetUnitTypes = new[] { UnitType.DEPARTMENT, UnitType.DIRECTORATE, UnitType.OFFICE }; // 1, 2, 5

            var targetUnits = units.Where(u => targetUnitTypes.Contains(u.UnitType))
                                   .OrderBy(u => u.UnitName)
                                   .ToList();

            var reportData = new List<UsersPerEntityReportDto>();

            foreach (var unit in targetUnits)
            {
                var descendantIds = GetDescendantIds(unit.Id, units);

                var unitUsers = users
                    .Where(u => u.OrganizationalUnitId.HasValue && descendantIds.Contains(u.OrganizationalUnitId.Value))
                    .OrderBy(u => u.CreateAt)
                    .ToList();

                reportData.Add(new UsersPerEntityReportDto
                {
                    EntityName = unit.UnitName,
                    UsersCount = unitUsers.Count,
                    Users = unitUsers.Select(u => new UserReportItemDto
                    {
                        FullName = u.FullName,
                        Username = u.Username,
                        CreatedAt = u.CreateAt
                    }).ToList()
                });
            }

            return _pdfService.GenerateUsersPerEntityReport(reportData);
        }

        private List<Guid> GetDescendantIds(Guid parentId, List<OrganizationalUnit> allUnits)
        {
            var descendants = new List<Guid> { parentId };
            var children = allUnits.Where(u => u.ParentUnitId == parentId).Select(u => u.Id).ToList();

            foreach (var childId in children)
            {
                descendants.AddRange(GetDescendantIds(childId, allUnits));
            }

            return descendants;
        }
    }
}
