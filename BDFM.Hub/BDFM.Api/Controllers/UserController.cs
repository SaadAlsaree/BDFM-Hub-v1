using BDFM.Application.Features.Users.Commands.ChangePassword;
using BDFM.Application.Features.Users.Commands.CreateUser;
using BDFM.Application.Features.Users.Commands.InportFromCsv;
using BDFM.Application.Features.Users.Commands.ResetPassword;
using BDFM.Application.Features.Users.Commands.UpdateUser;
using BDFM.Application.Features.Users.Commands.UpdateUserRoles;
using BDFM.Application.Features.Users.Commands.UpdateUserStatus;
using BDFM.Application.Features.Users.Queries.GetAllUsers;
using BDFM.Application.Features.Users.Queries.GetMe;
using BDFM.Application.Features.Users.Queries.GetUserById;
using BDFM.Application.Features.Users.Queries.SearchUser;
using Microsoft.AspNetCore.RateLimiting;



namespace BDFM.Api.Controllers;

//[Authorize(Policy = "Auth")]
[Route("BDFM/v1/api/[controller]/[action]")]
[ApiController]
[Produces("application/json")]
[Tags("Users")]
[EnableRateLimiting("per-user")]
// [Authorize(Roles = "SuAdmin, President, Admin")]
//[Permission]
public class UserController : Base<UserController>
{
    private readonly IMediator _mediator;
    private readonly ILogger<UserController> _log;

    public UserController(ILogger<UserController> logger, IMediator mediator)
        : base(logger)
    {
        _mediator = mediator;
        _log = logger;
    }

    /// <summary>
    /// Creates a new user
    /// </summary>
    [HttpPost]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<Response<bool>>> CreateUser([FromBody] CreateUserCommand command)
    {
        return await Okey(() => _mediator.Send(command));
    }

    /// <summary>
    /// Updates an existing user
    /// </summary>
    [HttpPut]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<Response<bool>>> UpdateUser([FromBody] UpdateUserCommand command)
    {
        return await Okey(() => _mediator.Send(command));
    }

    [HttpPatch("ChangeStatus")]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<Response<bool>>> ChangeStatus([FromBody] ChangeStatusCommand<Guid> command)
    {
        command.TableName = TableNames.Users;
        return await Okey(() => _mediator.Send(command));
    }

    /// <summary>
    /// Changes a user's password (requires current password)
    /// </summary>
    [HttpPut]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<bool>>> ChangePassword([FromBody] ChangePasswordCommand command)
    {

        return await Okey(() => _mediator.Send(command));
    }

    /// <summary>
    /// Resets a user's password (admin only)
    /// </summary>
    [HttpPut]
    [ServiceFilter(typeof(LogActionArguments))]
    //[Permission(MetaPermission = "Admin")]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<bool>>> ResetPassword([FromBody] ResetPasswordCommand command)
    {

        return await Okey(() => _mediator.Send(command));
    }

    /// <summary>
    /// Updates a user's roles
    /// </summary>
    [HttpPut]
    [ServiceFilter(typeof(LogActionArguments))]
    //[Permission(MetaPermission = "Admin")]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<Response<bool>>> UpdateUserRoles([FromBody] UpdateUserRolesCommand command)
    {
        return await Okey(() => _mediator.Send(command));
    }

    /// <summary>
    /// Updates a user's status
    /// </summary>
    [HttpPut]
    [ServiceFilter(typeof(LogActionArguments))]
    //[Permission(MetaPermission = "Admin")]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<Response<bool>>> UpdateUserStatus([FromBody] UpdateUserStatusCommand command)
    {
        return await Okey(() => _mediator.Send(command));
    }

    /// <summary>
    /// Gets a user by ID
    /// </summary>
    [HttpGet("{id}")]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<UserViewModel>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<UserViewModel>>> GetUserById([FromRoute] Guid id)
    {
        return await Okey(() => _mediator.Send(new GetUserByIdQuery { Id = id }));
    }

    /// <summary>
    /// Gets a paginated list of users with optional filtering
    /// </summary>
    [HttpGet]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<PagedResult<UserListViewModel>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [Authorize]
    public async Task<ActionResult<Response<PagedResult<UserListViewModel>>>> GetAllUsers([FromQuery] GetAllUsersQuery query)
    {
        return await Okey(() => _mediator.Send(query));
    }

    /// <summary>
    /// Get Me
    /// </summary>
    [ServiceFilter(typeof(LogActionArguments))]
    [HttpGet]
    [ProducesResponseType(typeof(Response<GetMeVm>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Response<GetMeVm>>> GetMe()
    {
        var query = new GetMeQuery();
        return await Okey(() => _mediator.Send(query));
    }


    /// <summary>
    /// search user
    /// <summary>
    [ServiceFilter(typeof(LogActionArguments))]
    [HttpGet]
    [ProducesResponseType(typeof(Response<GetMeVm>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<Response<IEnumerable<SearchUserVm>>>> SearchUser([FromQuery] SearchUserQuery query)
    {
        return await Okey(() => _mediator.Send(query));
    }


    /// <summary>
    /// Imports users from a CSV file
    /// </summary>
    [HttpPost]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<ImportFromCsvResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<Response<ImportFromCsvResponse>>> ImportFromCsv([FromForm] ImportFromCsvCommand command)
    {
        return await Okey(() => _mediator.Send(command));
    }

}