namespace BDFM.Application.Features.Attachments.Queries.GetAttachmentsListByPrimaryTableId
{
    public class GetAttachmentsListByPrimaryTableIdValidator : AbstractValidator<GetAttachmentsListByPrimaryTableIdQuery>
    {
        public GetAttachmentsListByPrimaryTableIdValidator()
        {
            RuleFor(v => v.PrimaryTableId)
                .NotEmpty()
                .WithMessage("PrimaryTableId is required");

            RuleFor(v => v.TableName)
                .NotEmpty()
                .WithMessage("TableName is required");

            RuleFor(v => v.Page)
                .GreaterThan(0)
                .WithMessage("Page must be greater than 0");

            RuleFor(v => v.PageSize)
                .GreaterThan((byte)0)
                .LessThanOrEqualTo((byte)100)
                .WithMessage("PageSize must be between 1 and 100");
        }
    }
}
