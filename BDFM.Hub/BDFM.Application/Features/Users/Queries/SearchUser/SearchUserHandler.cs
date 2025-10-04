using BDFM.Domain.Entities.Core;

namespace BDFM.Application.Features.Users.Queries.SearchUser
{
    public class SearchUserHandler : IRequestHandler<SearchUserQuery, Response<IEnumerable<SearchUserVm>>>
    {
        private readonly IBaseRepository<User> _userRepository;
        public SearchUserHandler(IBaseRepository<User> userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<Response<IEnumerable<SearchUserVm>>> Handle(SearchUserQuery request, CancellationToken cancellationToken)
        {
            var result = await _userRepository.GetAsync<SearchUserVm>(
                filter: x => string.IsNullOrEmpty(request.User) ||
                             EF.Functions.Like(x.FullName, request.User + "%") ||
                             EF.Functions.Like(x.UserLogin, request.User + "%"),
                selector: x => new SearchUserVm
                {
                    Id = x.Id,
                    FullName = x.FullName,
                    UserLogin = x.UserLogin,
                    Email = x.Email,
                    OrganizationalUnitId = x.OrganizationalUnit!.Id,
                    OrganizationalUnitName = x.OrganizationalUnit!.UnitName,
                    OrganizationalUnitCode = x.OrganizationalUnit!.UnitCode,
                    CreateAt = x.CreateAt,
                    PositionTitle = x.PositionTitle,
                    RfidTagId = x.RfidTagId,
                    IsActive = x.IsActive
                },
                orderBy: q => q.OrderBy(x => x.FullName),
                take: 10,
                cancellationToken: cancellationToken
            );

            return SuccessMessage.Get.ToSuccessMessage(result.Item1);
        }
    }
}
