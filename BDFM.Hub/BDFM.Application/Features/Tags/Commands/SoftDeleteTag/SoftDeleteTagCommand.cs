namespace BDFM.Application.Features.Tags.Commands.SoftDeleteTag;

public class SoftDeleteTagCommand : IRequest<Response<bool>>
{
    [Required]
    public Guid Id { get; set; }
}




