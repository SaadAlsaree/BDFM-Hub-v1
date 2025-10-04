using BDFM.Application.Features.Utility.BaseUtility.Command.Create;
using BDFM.Domain.Entities.Supporting;

namespace BDFM.Application.Features.CorrespondenceTags.Commands.ApplyTag
{
    public class ApplyTagCommandHandler : CreateHandler<CorrespondenceTag, ApplyTagCommand>, IRequestHandler<ApplyTagCommand, Response<bool>>
    {
        private readonly IBaseRepository<Tag> _tagRepository;

        public ApplyTagCommandHandler(IBaseRepository<CorrespondenceTag> repository, IBaseRepository<Tag> tagRepository)
            : base(repository)
        {
            _tagRepository = tagRepository;
        }

        protected override Expression<Func<CorrespondenceTag, bool>> ExistencePredicate(ApplyTagCommand request)
        {
            return ct => ct.CorrespondenceId == request.CorrespondenceId &&
                        ct.TagId == request.TagId &&
                        ct.AppliedByUserId == request.AppliedByUserId &&
                        ct.IsPrivateTag == request.IsPrivateTag &&
                        !ct.IsDeleted;
        }

        protected override CorrespondenceTag MapToEntity(ApplyTagCommand request)
        {
            return new CorrespondenceTag
            {
                Id = Guid.NewGuid(),
                CorrespondenceId = request.CorrespondenceId,
                TagId = request.TagId,
                AppliedByUserId = request.AppliedByUserId,
                Notes = request.Notes,
                IsPrivateTag = request.IsPrivateTag,
                Priority = request.Priority
            };
        }

        public async Task<Response<bool>> Handle(ApplyTagCommand request, CancellationToken cancellationToken)
        {
            var result = await HandleBase(request, cancellationToken);

            if (result.Succeeded)
            {
                // Update tag usage count
                var tag = await _tagRepository.Find(t => t.Id == request.TagId, cancellationToken: cancellationToken);
                if (tag != null)
                {
                    var updatedUsageCount = tag.UsageCount + 1;
                    await _tagRepository.UpdateEntity(
                        t => t.Id == request.TagId,
                        new { UsageCount = updatedUsageCount },
                        cancellationToken);
                }
            }

            return result;
        }
    }
}
