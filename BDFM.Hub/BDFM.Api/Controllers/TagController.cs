
using BDFM.Application.Features.CorrespondenceTags.Queries.GetCorrespondencesWithTags;
using BDFM.Application.Features.Tags.Commands.CreateArrayTags;
using BDFM.Application.Features.Tags.Commands.CreateTag;
using BDFM.Application.Features.Tags.Commands.SoftDeleteTag;
using BDFM.Application.Features.Tags.Commands.UpdateTag;
using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;
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

    #region Tag CRUD Operations

    /// <summary>
    /// Creates a new tag
    /// </summary>
    [HttpPost]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<bool>>> CreateTag([FromBody] CreateTagCommand command)
    {
        return await Okey(() => _mediator.Send(command));
    }

    /// <summary>
    /// Updates an existing tag
    /// </summary>
    [HttpPut]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<bool>>> UpdateTag([FromBody] UpdateTagCommand command)
    {
        return await Okey(() => _mediator.Send(command));
    }

    /// <summary>
    /// Soft deletes a tag
    /// </summary>
    [HttpDelete("SoftDelete/{id}")]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<bool>>> SoftDeleteTag([FromRoute] Guid id)
    {
        return await Okey(() => _mediator.Send(new SoftDeleteTagCommand { Id = id }));
    }

    /// <summary>
    /// Creates an array of tags
    /// </summary>
    [HttpPost]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<bool>>> CreateArrayTags([FromBody] CreateArrayTagsCommand command)
    {
        return await Okey(() => _mediator.Send(command));
    }

    #endregion

    #region Tag Queries

    /// <summary>
    /// Gets all correspondences that contain tags accessible to the current user
    /// Filters based on Tag.IsAll, Tag.ForUserId, and Tag.ForOrganizationalUnitId
    /// </summary>
    [HttpGet]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<PagedResult<CorrespondenceWithTagsVm>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<PagedResult<CorrespondenceWithTagsVm>>>> GetCorrespondencesWithTags([FromQuery] GetCorrespondencesWithTagsQuery query)
    {
        return await Okey(() => _mediator.Send(query));
    }

    #endregion

}