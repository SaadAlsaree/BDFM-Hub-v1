using BDFM.Application.Contracts.Infrastructure;
using BDFM.Application.Contracts.Persistence;
using BDFM.Domain.Entities.Core;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace BDFM.Application.Features.Users.Queries.GetUsersPerEntityReport
{
    public class GetUsersPerEntityReportQueryHandler : IRequestHandler<GetUsersPerEntityReportQuery, byte[]>
    {
        private readonly IBaseRepository<User> _userRepository;
        private readonly IPdfService _pdfService;

        public GetUsersPerEntityReportQueryHandler(IBaseRepository<User> userRepository, IPdfService pdfService)
        {
            _userRepository = userRepository;
            _pdfService = pdfService;
        }

        public async Task<byte[]> Handle(GetUsersPerEntityReportQuery request, CancellationToken cancellationToken)
        {
            var users = await _userRepository.Query()
                .Include(u => u.OrganizationalUnit)
                .Where(u => !u.IsDeleted)
                .OrderBy(u => u.OrganizationalUnit != null ? u.OrganizationalUnit.UnitName : "بدون جهة")
                .ThenBy(u => u.CreateAt)
                .ToListAsync(cancellationToken);

            var reportData = users
                .GroupBy(u => u.OrganizationalUnit != null ? u.OrganizationalUnit.UnitName : "بدون جهة")
                .Select(g => new UsersPerEntityReportDto
                {
                    EntityName = g.Key,
                    UsersCount = g.Count(),
                    Users = g.Select(u => new UserReportItemDto
                    {
                        FullName = u.FullName,
                        Username = u.Username,
                        CreatedAt = u.CreateAt
                    }).ToList()
                })
                .ToList();

            return _pdfService.GenerateUsersPerEntityReport(reportData);
        }
    }
}
