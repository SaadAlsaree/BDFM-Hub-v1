using BDFM.Application.Features.UserCorrespondenceInteractionFeatures.IsInTrash;
using BDFM.Application.Features.UserCorrespondenceInteractionFeatures.IsPostponed;
using BDFM.Application.Features.UserCorrespondenceInteractionFeatures.IsRead;
using BDFM.Application.Features.UserCorrespondenceInteractionFeatures.IsStarred;
using BDFM.Application.Features.UserCorrespondenceInteractionFeatures.ReceiveNotifications;

namespace BDFM.Api.Controllers
{
    //[Authorize(Policy = "Auth")]
    [Route("BDFM/v1/api/[controller]/[action]")]
    [ApiController]
    [Produces("application/json")]
    [Tags("UserCorrespondenceInteraction")]
    //[Permission]

    public class UserCorrespondenceInteractionController : Base<UserCorrespondenceInteractionController>
    {
        private readonly IMediator _mediator;
        public UserCorrespondenceInteractionController(ILogger<UserCorrespondenceInteractionController> logger, IMediator mediator)
            : base(logger)
        {
            _mediator = mediator;
        }
        // Add your action methods here, e.g., for handling user correspondence interactions
        [HttpPost]
        [ServiceFilter(typeof(LogActionArguments))]
        [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<Response<bool>>> IsInTrash([FromBody] IsInTrashCommand command, CancellationToken cancellationToken)
        {
            return await Okey(() => _mediator.Send(command, cancellationToken));
        }

        [HttpPost]
        [ServiceFilter(typeof(LogActionArguments))]
        [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<Response<bool>>> IsPostponed([FromBody] IsPostponedCommand command, CancellationToken cancellationToken)
        {
            return await Okey(() => _mediator.Send(command, cancellationToken));
        }

        [HttpPost]
        [ServiceFilter(typeof(LogActionArguments))]
        [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<Response<bool>>> IsRead([FromBody] IsReadCommand command, CancellationToken cancellationToken)
        {
            return await Okey(() => _mediator.Send(command, cancellationToken));
        }


        [HttpPost]
        [ServiceFilter(typeof(LogActionArguments))]
        [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<Response<bool>>> IsStarred([FromBody] IsStarredCommand command, CancellationToken cancellationToken)
        {
            return await Okey(() => _mediator.Send(command, cancellationToken));
        }


        [HttpPost]
        [ServiceFilter(typeof(LogActionArguments))]
        [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<Response<bool>>> ReceiveNotification([FromBody] ReceiveNotificationsCommand command, CancellationToken cancellationToken)
        {
            return await Okey(() => _mediator.Send(command, cancellationToken));
        }
    }
}
