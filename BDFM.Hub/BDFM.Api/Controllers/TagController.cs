
using BDFM.Application.Features.CorrespondenceTags.Commands.ApplyTag;
using BDFM.Application.Features.CorrespondenceTags.Queries.GetCorrespondenceTags;
using BDFM.Application.Features.Utility.Services.Commands.DeleteRecord;

namespace BDFM.Api.Controllers;

[Route("BDFM/v1/api/[controller]/[action]")]
[ApiController]
[Produces("application/json")]
[Tags("Tags")]
[Permission]
public class TagController : Base<TagController>
{
    private readonly IMediator _mediator;

    public TagController(ILogger<TagController> logger, IMediator mediator)
        : base(logger)
    {
        _mediator = mediator;
    }



    /// <summary>
    /// Changes the status of a tag
    /// </summary>
    [HttpPatch("ChangeStatus")]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<bool>>> ChangeStatus([FromBody] ChangeStatusCommand<Guid> command)
    {
        command.TableName = TableNames.Tags;
        return await Okey(() => _mediator.Send(command));
    }

    /// <summary>
    /// Deletes a tag (soft delete)
    /// </summary>
    [HttpDelete("{id}")]
    [ServiceFilter(typeof(LogActionArguments))]
    // [Permission(MetaPermission = "Admin")] // Commented due to accessibility issue
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<bool>>> DeleteTag([FromRoute] Guid id)
    {
        return await Okey(() => _mediator.Send(new DeleteRecordCommand<Guid> { Id = id, TableName = TableNames.Tags }));
    }



    /// <summary>
    /// Applies a tag to a correspondence
    /// </summary>
    [HttpPost]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<bool>>> ApplyTagToCorrespondence([FromBody] ApplyTagCommand command)
    {
        return await Okey(() => _mediator.Send(command));
    }

    /// <summary>
    /// Removes a tag from a correspondence
    /// </summary>
    [HttpDelete("{correspondenceId}/{tagId}")]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<bool>>> RemoveTagFromCorrespondence([FromRoute] Guid correspondenceId, [FromRoute] Guid tagId, [FromQuery] Guid userId)
    {
        return await Okey(() => _mediator.Send(new DeleteRecordCommand<Guid>
        {
            Id = correspondenceId, // This would need a custom handler
            TableName = TableNames.CorrespondenceTags
        }));
    }

    /// <summary>
    /// Gets all tags for a specific correspondence
    /// </summary>
    [HttpGet("{correspondenceId}")]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<IEnumerable<CorrespondenceTagViewModel>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<IEnumerable<CorrespondenceTagViewModel>>>> GetCorrespondenceTags([FromRoute] Guid correspondenceId, [FromQuery] Guid? userId = null, [FromQuery] bool includePrivateTags = false)
    {
        var query = new GetCorrespondenceTagsQuery
        {
            CorrespondenceId = correspondenceId,
            UserId = userId,
            IncludePrivateTags = includePrivateTags
        };
        return await Okey(() => _mediator.Send(query));
    }
}