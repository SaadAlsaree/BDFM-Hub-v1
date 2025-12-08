using BDFM.Application.Contracts.Identity;
using BDFM.Domain.Entities.Supporting;

namespace BDFM.Application.Features.Tags.Commands.SoftDeleteTag;

public class SoftDeleteTagCommandHandler : IRequestHandler<SoftDeleteTagCommand, Response<bool>>
{
    private readonly IBaseRepository<Tag> _repository;
    private readonly ICurrentUserService _currentUserService;

    public SoftDeleteTagCommandHandler(
        IBaseRepository<Tag> repository,
        ICurrentUserService currentUserService)
    {
        _repository = repository ?? throw new ArgumentNullException(nameof(repository));
        _currentUserService = currentUserService ?? throw new ArgumentNullException(nameof(currentUserService));
    }

    public async Task<Response<bool>> Handle(SoftDeleteTagCommand request, CancellationToken cancellationToken)
    {
        var tag = await _repository.Find(
            t => t.Id == request.Id && !t.IsDeleted,
            cancellationToken: cancellationToken);

        if (tag == null)
            return ErrorsMessage.NotFoundData.ToErrorMessage(false);

        try
        {
            tag.IsDeleted = true;
            tag.DeletedAt = DateTime.UtcNow;
            tag.DeletedBy = _currentUserService.UserId;
            tag.StatusId = Status.InActive;
            tag.LastUpdateAt = DateTime.UtcNow;
            tag.LastUpdateBy = _currentUserService.UserId;

            var result = _repository.Update(tag);

            return result
                ? SuccessMessage.Delete.ToSuccessMessage(true)
                : ErrorsMessage.FailOnDelete.ToErrorMessage(false);
        }
        catch (Exception)
        {
            return ErrorsMessage.FailOnDelete.ToErrorMessage(false);
        }
    }
}


