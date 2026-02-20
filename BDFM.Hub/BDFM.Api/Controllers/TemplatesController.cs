using BDFM.Application.Features.Administration.Templates.Commands.CreateCorrespondenceTemplate;
using BDFM.Application.Features.Administration.Templates.Commands.UpdateCorrespondenceTemplate;
using BDFM.Application.Features.Administration.Templates.Queries.GetCorrespondenceTemplateById;
using BDFM.Application.Features.Administration.Templates.Queries.GetCorrespondenceTemplateList;
using Microsoft.AspNetCore.RateLimiting;

namespace BDFM.Api.Controllers
{
    [Route("BDFM/v1/api/[controller]/[action]")]
    [ApiController]
    [Produces("application/json")]
    [Tags("Templates")]
    [EnableRateLimiting("per-user")]
    [Authorize(Roles = "Correspondence, SuAdmin, User, Manager, President")]
    //[Permission]
    public class TemplatesController : Base<AuditLogController>
    {
        private readonly IMediator _mediator;
        public TemplatesController(ILogger<AuditLogController> logger, IMediator mediator) : base(logger)
        {
            _mediator = mediator;
        }


        [HttpPost]
        [ServiceFilter(typeof(LogActionArguments))]
        [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateCorrespondenceTemplate(CreateCorrespondenceTemplateCommand command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [HttpPut]
        [ServiceFilter(typeof(LogActionArguments))]
        [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> UpdateCorrespondenceTemplate(UpdateCorrespondenceTemplateCommand command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [HttpPatch("ChangeStatus")]
        [ServiceFilter(typeof(LogActionArguments))]
        [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> ChangeStatus(ChangeStatusCommand<Guid> command)
        {
            command.TableName = TableNames.CorrespondenceTemplates;
            return await Okey(() => _mediator.Send(command));
        }

        [HttpGet]
        [ServiceFilter(typeof(LogActionArguments))]
        [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> GetCorrespondenceTemplateList(GetCorrespondenceTemplateListQuery query)
        {
            return await Okey(() => _mediator.Send(query));
        }

        [HttpGet]
        [ServiceFilter(typeof(LogActionArguments))]
        [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> GetCorrespondenceTemplateById(Guid id)
        {
            var result = await _mediator.Send(new GetCorrespondenceTemplateByIdQuery { Id = id });
            return Ok(result);
        }

    }
}
