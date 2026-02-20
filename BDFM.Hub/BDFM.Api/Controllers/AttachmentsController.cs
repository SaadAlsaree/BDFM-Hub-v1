using BDFM.Api.Attributes;
using BDFM.Application.Contracts.Identity;
using BDFM.Application.Features.Attachments.Commands.CreateAttachments;
using BDFM.Application.Features.Attachments.Commands.DeleteAttachments;
using BDFM.Application.Features.Attachments.Commands.UpdateAttachments;
using BDFM.Application.Features.Attachments.Queries.GetAttachmentById;
using BDFM.Application.Features.Attachments.Queries.GetAttachmentsList;
using BDFM.Application.Features.Attachments.Queries.GetAttachmentsListByPrimaryTableId;
using Microsoft.AspNetCore.RateLimiting;

namespace BDFM.Api.Controllers;

//[Authorize(Policy = "Auth")]
[Route("BDFM/v1/api/[controller]/[action]")]
[ApiController]
[Produces("application/json")]
[Tags("Attachments")]
[EnableRateLimiting("per-user")]
[Authorize(Roles = "Correspondence, SuAdmin, User, Manager, President")]
//[Permission]
public class AttachmentsController : Base<AttachmentsController>
{
    private readonly IMediator _mediator;
    private readonly ICurrentUserService _currentUserService;

    public AttachmentsController(ILogger<AttachmentsController> logger, IMediator mediator, ICurrentUserService currentUserService)
        : base(logger)
    {
        _mediator = mediator;
        _currentUserService = currentUserService;
    }

    /// <summary>
    /// Creates a new attachment
    /// </summary>
    [HttpPost]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<bool>>> CreateAttachment([FromForm] CreateAttachmentsCommand command)
    {
        return await Okey(() => _mediator.Send(command));
    }

    /// <summary>
    /// Updates an existing attachment
    /// </summary>
    [HttpPut]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<bool>>> UpdateAttachment([FromForm] UpdateAttachmentsCommand command)
    {
        return await Okey(() => _mediator.Send(command));
    }

    /// <summary>
    /// Deletes an attachment
    /// </summary>
    [HttpDelete]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<bool>>> DeleteAttachment([FromBody] DeleteAttachmentsCommand command)
    {
        return await Okey(() => _mediator.Send(command));
    }

    /// <summary>
    /// Changes an attachment's status
    /// </summary>
    [HttpPatch("ChangeStatus")]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<bool>>> ChangeStatus([FromBody] ChangeStatusCommand<Guid> command)
    {
        command.TableName = TableNames.Attachments;
        return await Okey(() => _mediator.Send(command));
    }

    /// <summary>
    /// Gets an attachment by ID with file content as Base64
    /// </summary>
    [HttpGet("{id}")]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<AttachmentViewModel>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<AttachmentViewModel>>> GetAttachmentById([FromRoute] Guid id)
    {
        return await Okey(() => _mediator.Send(new GetAttachmentByIdQuery { Id = id }));
    }

    /// <summary>
    /// Gets a paginated list of attachments with optional filtering
    /// </summary>
    [HttpGet]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<PagedResult<AttachmentListViewModel>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<PagedResult<AttachmentListViewModel>>>> GetAttachmentsList([FromQuery] GetAttachmentsListQuery query)
    {
        return await Okey(() => _mediator.Send(query));
    }

    /// <summary>
    /// Gets attachments for a specific primary table ID and table name
    /// </summary>
    [HttpGet]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<PagedResult<AttachmentListByTableViewModel>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<PagedResult<AttachmentListByTableViewModel>>>> GetAttachmentsByTable([FromQuery] GetAttachmentsListByPrimaryTableIdQuery query)
    {
        return await Okey(() => _mediator.Send(query));
    }

    /// <summary>
    /// Downloads an attachment file directly
    /// </summary>
    [HttpGet("{id}/download")]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DownloadAttachment([FromRoute] Guid id)
    {
        var result = await _mediator.Send(new GetAttachmentByIdQuery { Id = id });

        if (!result.Succeeded || result.Data == null)
            return BadRequest(result);

        var attachment = result.Data;
        
        // Security: Verify user has permission to access this attachment
        // This prevents IDOR (Insecure Direct Object Reference) attacks
        var currentUserId = _currentUserService.UserId;
        var userUnitId = _currentUserService.OrganizationalUnitId;
        var userRoles = _currentUserService.GetRoles();
        
        // Allow download if:
        // 1. User is the attachment creator
        // 2. User has SuAdmin or President role
        // 3. Attachment belongs to correspondence in user's unit and user has Manager role
        var isCreator = attachment.CreateBy == currentUserId;
        var isAdmin = userRoles.Contains("SuAdmin") || userRoles.Contains("President");
        var isManagerInUnit = userRoles.Contains("Manager") && 
                                 userUnitId.HasValue && 
                                 attachment.PrimaryTableId.HasValue && 
                                 attachment.PrimaryTableId == userUnitId.Value;
        
        var canAccess = isCreator || isAdmin || isManagerInUnit;
        
        if (!canAccess)
        {
            return Forbid();
        }
        
        var fileBytes = Convert.FromBase64String(attachment.FileBase64);

        return File(fileBytes,
            GetContentType(attachment.FileExtension),
            attachment.FileName ?? $"attachment{attachment.FileExtension}");
    }

    private static string GetContentType(string? fileExtension)
    {
        return fileExtension?.ToLower() switch
        {
            ".pdf" => "application/pdf",
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            ".gif" => "image/gif",
            ".doc" => "application/msword",
            ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ".xls" => "application/vnd.ms-excel",
            ".xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            ".txt" => "text/plain",
            ".zip" => "application/zip",
            _ => "application/octet-stream"
        };
    }
}