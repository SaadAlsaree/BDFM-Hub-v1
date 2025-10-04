using BDFM.Application.Contracts.Identity;
using BDFM.Application.Features.Utility.BaseUtility.Command.Create;
using BDFM.Domain.Entities.Supporting;
using BDFM.Domain.Extensions;

namespace BDFM.Application.Features.Tags.Commands.CreateTag
{
    public class CreateTagCommandHandler : CreateHandler<Tag, CreateTagCommand>, IRequestHandler<CreateTagCommand, Response<bool>>
    {
        private readonly ICurrentUserService _currentUserService;
        public CreateTagCommandHandler(IBaseRepository<Tag> repository, ICurrentUserService currentUserService) : base(repository)
        {
            _currentUserService = currentUserService;
        }

        protected override Expression<Func<Tag, bool>> ExistencePredicate(CreateTagCommand request)
        {
            return t => t.Name.ToLower() == request.Name.ToLower() && !t.IsDeleted;
        }

        protected override Tag MapToEntity(CreateTagCommand request)
        {
            return new Tag
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                Description = request.Description,
                Color = request.Color ?? request.Category.GetDefaultColorForCategory(),
                Category = request.Category,
                IsSystemTag = request.IsSystemTag,
                IsPublic = request.IsPublic,
                CreatedByUserId = _currentUserService.UserId,
                OrganizationalUnitId = request.OrganizationalUnitId,
                UsageCount = 0
            };
        }

        public async Task<Response<bool>> Handle(CreateTagCommand request, CancellationToken cancellationToken)
        {
            return await HandleBase(request, cancellationToken);
        }
    }
}
