namespace BDFM.Application.Features.Tags.Queries.GetTagById
{
    public class GetTagByIdQuery : IRequest<Response<TagViewModel>>
    {
        public Guid Id { get; set; }
    }
}
