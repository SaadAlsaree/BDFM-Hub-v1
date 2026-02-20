using BDFM.Application.Features.MailFiles.Commands.CreateMailFile;
using BDFM.Application.Features.MailFiles.Commands.UpdateMailFile;
using BDFM.Application.Features.MailFiles.Queries.GetMailFileById;
using BDFM.Application.Features.MailFiles.Queries.GetMailFileContents;
using BDFM.Application.Features.MailFiles.Queries.GetMailFileList;
using BDFM.Application.Features.MailFiles.Queries.SearchMailFIles;
using BDFM.Application.Features.Utility.Services.Commands.DeleteRecord;
using Microsoft.AspNetCore.RateLimiting;

namespace BDFM.Api.Controllers;

[Route("BDFM/v1/api/[controller]/[action]")]
[ApiController]
[Produces("application/json")]
[Tags("MailFiles")]
[EnableRateLimiting("per-user")]
[Authorize(Roles = "Correspondence, SuAdmin, User, Manager, President")]
//[Permission]
public class MailFileController : Base<MailFileController>
{
    private readonly IMediator _mediator;

    public MailFileController(ILogger<MailFileController> logger, IMediator mediator)
        : base(logger)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Creates a new mail file
    /// </summary>
    [HttpPost]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<bool>>> CreateMailFile([FromBody] CreateMailFileCommand command)
    {
        return await Okey(() => _mediator.Send(command));
    }

    /// <summary>
    /// Updates an existing mail file
    /// </summary>
    [HttpPut]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<bool>>> UpdateMailFile([FromBody] UpdateMailFileCommand command)
    {
        return await Okey(() => _mediator.Send(command));
    }

    /// <summary>
    /// Changes the status of a mail file
    /// </summary>
    [HttpPatch("ChangeStatus")]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<bool>>> ChangeStatus([FromBody] ChangeStatusCommand<Guid> command)
    {
        command.TableName = TableNames.MailFiles;
        return await Okey(() => _mediator.Send(command));
    }

    /// <summary>
    /// Deletes a mail file
    /// </summary>
    [HttpDelete("{id}")]
    [ServiceFilter(typeof(LogActionArguments))]
    //[Permission(MetaPermission = "Admin")]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<bool>>> DeleteMailFile([FromRoute] Guid id)
    {
        return await Okey(() => _mediator.Send(new DeleteRecordCommand<Guid> { Id = id, TableName = TableNames.MailFiles }));
    }

    /// <summary>
    /// Gets a mail file by ID
    /// </summary>
    [HttpGet("{id}")]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<MailFileViewModel>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<MailFileViewModel>>> GetMailFileById([FromRoute] Guid id)
    {
        return await Okey(() => _mediator.Send(new GetMailFileByIdQuery { Id = id }));
    }

    /// <summary>
    /// Gets a paginated list of mail files with optional filtering
    /// </summary>
    [HttpGet]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<PagedResult<MailFileListViewModel>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<PagedResult<MailFileListViewModel>>>> GetMailFileList([FromQuery] GetMailFileListQuery query)
    {
        return await Okey(() => _mediator.Send(query));
    }

    /// <summary>
    /// Gets a mail file with its correspondences (paginated and filterable)
    /// </summary>
    [HttpGet("{id}/contents")]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<MailFileWithContentsViewModel>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<MailFileWithContentsViewModel>>> GetMailFileContents(
        [FromRoute] Guid id,
        [FromQuery] GetMailFileContentsQuery query)
    {
        query.MailFileId = id;
        return await Okey(() => _mediator.Send(query));
    }

    /// <summary>
    /// Search mail files
    /// </summary>
    [HttpGet]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<IEnumerable<SearchMailFilesVm>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<IEnumerable<SearchMailFilesVm>>>> SearchMailFiles([FromQuery] SearchMailFilesQuery query)
    {
        return await Okey(() => _mediator.Send(query));
    }
}