using BDFM.Application.Features.Utility.BaseUtility.Query.GetById;
using BDFM.Domain.Entities.Supporting;

namespace BDFM.Application.Features.Tags.Queries.GetTagById
{
    public class GetTagByIdQueryHandler : GetByIdHandler<Tag, TagViewModel, GetTagByIdQuery>, IRequestHandler<GetTagByIdQuery, Response<TagViewModel>>
    {
        public GetTagByIdQueryHandler(IBaseRepository<Tag> repository) : base(repository)
        {
        }

        public override Expression<Func<Tag, TagViewModel>> Selector => t => new TagViewModel
        {
            Id = t.Id,
            Name = t.Name,
            Description = t.Description,
            Color = t.Color,
            Category = t.Category,
            CategoryName = t.Category.ToString(),
            IsSystemTag = t.IsSystemTag,
            IsPublic = t.IsPublic,
            UsageCount = t.UsageCount,
            CreatedByUserId = t.CreatedByUserId,
            CreatedByUserName = t.CreatedByUser != null ? t.CreatedByUser.FullName : null,
            OrganizationalUnitId = t.OrganizationalUnitId,
            OrganizationalUnitName = t.OrganizationalUnit != null ? t.OrganizationalUnit.UnitName : null,
            CreateAt = t.CreateAt,
            LastUpdateAt = t.LastUpdateAt,
            StatusName = t.StatusId.ToString()
        };

        public override Expression<Func<Tag, bool>> IdPredicate(GetTagByIdQuery request)
        {
            return t => t.Id == request.Id && !t.IsDeleted;
        }

        public async Task<Response<TagViewModel>> Handle(GetTagByIdQuery request, CancellationToken cancellationToken)
        {
            // Override the default implementation to include the related entities
            var tag = await _repository
                .Query(IdPredicate(request))
                .Include(t => t.CreatedByUser)
                .Include(t => t.OrganizationalUnit)
                .Select(Selector)
                .FirstOrDefaultAsync(cancellationToken);

            if (tag == null)
                return ErrorsMessage.NotFoundData.ToErrorMessage<TagViewModel>(null!);

            tag.StatusName = ((Status)Enum.Parse(typeof(Status), tag.StatusName)).GetDisplayName();

            return SuccessMessage.Get.ToSuccessMessage(tag);
        }
    }
}
