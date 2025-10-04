namespace BDFM.Application.Features.Correspondences.Commands.LinkCorrespondences
{
    public class LinkCorrespondencesValidator : AbstractValidator<LinkCorrespondencesCommand>
    {
        //private readonly ICorrespondenceRepository _correspondenceRepository;
        //private readonly ICorrespondenceLinkRepository _correspondenceLinkRepository;

        //public LinkCorrespondencesValidator(
        //    ICorrespondenceRepository correspondenceRepository,
        //    ICorrespondenceLinkRepository correspondenceLinkRepository)
        //{
        //    _correspondenceRepository = correspondenceRepository;
        //    _correspondenceLinkRepository = correspondenceLinkRepository;

        //    RuleFor(x => x.SourceCorrespondenceId)
        //        .NotEmpty().WithMessage("معرف الكتاب المصدر مطلوب")
        //        .MustAsync(CorrespondenceExists).WithMessage("الكتاب المصدر غير موجودة");

        //    RuleFor(x => x.LinkedCorrespondenceId)
        //        .NotEmpty().WithMessage("معرف الكتاب المرتبطة مطلوب")
        //        .MustAsync(CorrespondenceExists).WithMessage("الكتاب المرتبطة غير موجودة");

        //    RuleFor(x => x.LinkType)
        //        .IsInEnum().WithMessage("نوع الارتباط غير صالح");

        //    RuleFor(x => x)
        //        .Must(x => x.SourceCorrespondenceId != x.LinkedCorrespondenceId)
        //        .WithMessage("لا يمكن ربط الكتاب بنفسها")
        //        .MustAsync(LinkDoesNotExist)
        //        .WithMessage("الارتباط بين المراسلتين بهذا النوع موجود بالفعل");

        //    When(x => x.Notes != null, () => {
        //        RuleFor(x => x.Notes)
        //            .MaximumLength(500).WithMessage("الملاحظات يجب أن لا تتجاوز 500 حرف");
        //    });
        //}

        //private async Task<bool> CorrespondenceExists(Guid id, CancellationToken cancellationToken)
        //{
        //    return await _correspondenceRepository.ExistsAsync(id, cancellationToken);
        //}

        //private async Task<bool> LinkDoesNotExist(LinkCorrespondencesCommand command, CancellationToken cancellationToken)
        //{
        //    return !await _correspondenceLinkRepository.ExistsLinkAsync(
        //        command.SourceCorrespondenceId,
        //        command.LinkedCorrespondenceId,
        //        command.LinkType,
        //        cancellationToken);
        //}
    }
}
