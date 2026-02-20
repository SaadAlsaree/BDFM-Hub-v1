using BDFM.Application.Helper.Pagination;
using FluentValidation;

namespace BDFM.Application.Helper.Pagination.Validators
{
    public class PaginationQueryValidator : AbstractValidator<IPaginationQuery>
    {
        private const int MinPageSize = 1;
        private const int MaxPageSize = 100;
        private const int MinPageNumber = 1;

        public PaginationQueryValidator()
        {
            RuleFor(x => x.Page)
                .GreaterThanOrEqualTo(MinPageNumber)
                .WithMessage($"Page number must be at least {MinPageNumber}");

            RuleFor(x => x.PageSize)
                .Must(pageSize => pageSize >= MinPageSize)
                .WithMessage($"Page size must be at least {MinPageSize}");

            RuleFor(x => x.PageSize)
                .Must(pageSize => pageSize <= MaxPageSize)
                .WithMessage($"Page size cannot exceed {MaxPageSize}. Please use pagination for large datasets.");

            RuleFor(x => x.PageSize)
                .Must(pageSize => pageSize != 0)
                .WithMessage("Page size cannot be zero");
        }
    }
}
