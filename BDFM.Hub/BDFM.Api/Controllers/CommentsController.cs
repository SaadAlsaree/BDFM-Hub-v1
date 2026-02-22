using BDFM.Application.Features.Comments.Commands.CreateComment;
using BDFM.Application.Features.Comments.Commands.UpdateComment;
using BDFM.Application.Features.Comments.Queries.GetCommentById;
using BDFM.Application.Features.Comments.Queries.GetCommentsList;
using BDFM.Application.Features.Comments.Queries.GetCommentsListByCorrespondenceId;
using BDFM.Application.Features.Comments.Queries.SearchComments;
using BDFM.Application.Features.Utility.Services.Commands.DeleteRecord;
using Microsoft.AspNetCore.RateLimiting;

namespace BDFM.Api.Controllers;

[Route("BDFM/v1/api/[controller]/[action]")]
[ApiController]
[Produces("application/json")]
[Tags("Comments")]
[EnableRateLimiting("per-user")]
// [Authorize(Roles = "Correspondence, SuAdmin, User, Manager, President")]
 [Authorize]
//[Permission]
public class CommentsController : Base<CommentsController>
{
    private readonly IMediator _mediator;

    public CommentsController(ILogger<CommentsController> logger, IMediator mediator)
        : base(logger)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Creates a new comment
    /// </summary>
    [HttpPost]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<bool>>> CreateComment([FromBody] CreateCommentCommand command)
    {
        return await Okey(() => _mediator.Send(command));
    }

    /// <summary>
    /// Updates an existing comment
    /// </summary>
    [HttpPut]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<bool>>> UpdateComment([FromBody] UpdateCommentCommand command)
    {
        return await Okey(() => _mediator.Send(command));
    }

    /// <summary>
    /// Changes the status of a comment
    /// </summary>
    [HttpPatch("ChangeStatus")]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<bool>>> ChangeStatus([FromBody] ChangeStatusCommand<Guid> command)
    {
        command.TableName = TableNames.CorrespondenceComment;
        return await Okey(() => _mediator.Send(command));
    }

    /// <summary>
    /// Deletes a comment
    /// </summary>
    [HttpDelete("{id}")]
    [ServiceFilter(typeof(LogActionArguments))]
    //[Permission(MetaPermission = "Admin")]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<bool>>> DeleteComment([FromRoute] Guid id)
    {
        return await Okey(() => _mediator.Send(new DeleteRecordCommand<Guid> { Id = id, TableName = TableNames.CorrespondenceComment }));
    }

    /// <summary>
    /// Gets a comment by ID
    /// </summary>
    [HttpGet("{id}")]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<CommentViewModel>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<CommentViewModel>>> GetCommentById([FromRoute] Guid id)
    {
        return await Okey(() => _mediator.Send(new GetCommentByIdQuery { Id = id }));
    }

    /// <summary>
    /// Gets a paginated list of comments with optional filtering
    /// </summary>
    [HttpGet]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<PagedResult<CommentListViewModel>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<PagedResult<CommentListViewModel>>>> GetCommentsList([FromQuery] GetCommentsListQuery query)
    {
        return await Okey(() => _mediator.Send(query));
    }

    /// <summary>
    /// Gets comments for a specific correspondence with hierarchical structure
    /// </summary>
    [HttpGet("{correspondenceId}/correspondence")]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<List<CommentByCorrespondenceViewModel>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<List<CommentByCorrespondenceViewModel>>>> GetCommentsListByCorrespondenceId(
        [FromRoute] Guid correspondenceId,
        [FromQuery] bool includeReplies = true)
    {
        var query = new GetCommentsListByCorrespondenceIdQuery
        {
            CorrespondenceId = correspondenceId,
            IncludeReplies = includeReplies
        };
        return await Okey(() => _mediator.Send(query));
    }

    /// <summary>
    /// Search comments
    /// </summary>
    [HttpGet]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<IEnumerable<SearchCommentsViewModel>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<IEnumerable<SearchCommentsViewModel>>>> SearchComments([FromQuery] SearchCommentsQuery query)
    {
        return await Okey(() => _mediator.Send(query));
    }
}