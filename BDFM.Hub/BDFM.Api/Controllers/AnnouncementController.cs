using BDFM.Application.Features.AnnouncementFeature.Commands.CreateAnnouncement;
using BDFM.Application.Features.AnnouncementFeature.Commands.DeleteAnnouncement;
using BDFM.Application.Features.AnnouncementFeature.Commands.UpdateAnnouncement;
using BDFM.Application.Features.AnnouncementFeature.Queries.GetActiveAnnouncements;
using BDFM.Application.Features.AnnouncementFeature.Queries.GetAnnouncementById;
using BDFM.Application.Features.AnnouncementFeature.Queries.GetAnnouncements;

namespace BDFM.Api.Controllers;

[Route("BDFM/v1/api/[controller]/[action]")]
[ApiController]
[Produces("application/json")]
[Tags("Announcements")]
public class AnnouncementController : Base<AnnouncementController>
{
    private readonly IMediator _mediator;

    public AnnouncementController(ILogger<AnnouncementController> logger, IMediator mediator)
        : base(logger)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<ActionResult<Response<bool>>> CreateAnnouncement([FromBody] CreateAnnouncementCommand command)
    {
        return await Okey(() => _mediator.Send(command));
    }

    [HttpPut]
    public async Task<ActionResult<Response<bool>>> UpdateAnnouncement([FromBody] UpdateAnnouncementCommand command)
    {
        return await Okey(() => _mediator.Send(command));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<Response<bool>>> DeleteAnnouncement([FromRoute] Guid id)
    {
        return await Okey(() => _mediator.Send(new DeleteAnnouncementCommand { Id = id }));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Response<AnnouncementVm>>> GetAnnouncementById([FromRoute] Guid id)
    {
        return await Okey(() => _mediator.Send(new GetAnnouncementByIdQuery { Id = id }));
    }

    [HttpGet]
    public async Task<ActionResult<Response<PagedResult<AnnouncementVm>>>> GetAnnouncements([FromQuery] GetAnnouncementsQuery query)
    {
        return await Okey(() => _mediator.Send(query));
    }

    [HttpGet]
    public async Task<ActionResult<Response<PagedResult<AnnouncementVm>>>> GetActiveAnnouncements([FromQuery] GetActiveAnnouncementsQuery query)
    {
        return await Okey(() => _mediator.Send(query));
    }
}
