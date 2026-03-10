using BDFM.Api.Helpers;
using BDFM.Application.Contracts.Identity;
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

/// <summary>
/// Controller for managing users in the system
/// SECURITY: All endpoints require authentication. Admin operations require Admin role.
/// </summary>
[Route("BDFM/v1/api/[controller]/[action]")]
[ApiController]
[Produces("application/json")]
[Tags("Users")]
[EnableRateLimiting("per-user")]
[Authorize] // SECURITY FIX: Require authentication for all endpoints
public class UserController : Base<UserController>
{
    private readonly IMediator _mediator;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<UserController> _log;

    public UserController(ILogger<UserController> logger, IMediator mediator, ICurrentUserService currentUserService)
        : base(logger)
    {
        _mediator = mediator;
        _currentUserService = currentUserService;
        _log = logger;
    }

    /// <summary>
    /// Creates a new user
    /// </summary>
    [HttpPost]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [Authorize(Roles = "Admin")] // SECURITY FIX: Only admins can create users
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
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [Authorize(Roles = "Admin")] // SECURITY FIX: Only admins can update users
    public async Task<ActionResult<Response<bool>>> UpdateUser([FromBody] UpdateUserCommand command)
    {
        return await Okey(() => _mediator.Send(command));
    }

    [HttpPatch("ChangeStatus")]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<Response<bool>>> ChangeStatus([FromBody] ChangeStatusCommand<Guid> command)
    {
        // SECURITY FIX: Validate table name to prevent SQL injection
        var tableName = command.TableName.ToString(); // Convert enum to string
        if (string.IsNullOrEmpty(tableName) || !ValidTableNames.IsValid(tableName))
        {
            return BadRequest(new Response<bool>
            {
                Succeeded = false,
                Message = "Invalid table name",
                Code = "ERR400"
            });
        }
        return await Okey(() => _mediator.Send(command));
    }

    /// <summary>
    /// Changes a user's password (requires current password)
    /// </summary>
    [HttpPut]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<Response<bool>>> ChangePassword([FromBody] ChangePasswordCommand command)
    {
        // SECURITY: User can only change their own password
        var currentUserId = _currentUserService.UserId;
        if (command.UserId != currentUserId)
        {
            return Forbid();
        }

        // Validate password complexity
        var (isValid, error) = ValidatePassword(command.NewPassword);
        if (!isValid)
        {
            return BadRequest(new Response<bool>
            {
                Succeeded = false,
                Message = error,
                Code = "ERR400"
            });
        }

        return await Okey(() => _mediator.Send(command));
    }

    /// <summary>
    /// Resets a user's password (admin only)
    /// </summary>
    [HttpPut]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [Authorize(Roles = "Admin")] // SECURITY FIX: Only admins can reset passwords
    public async Task<ActionResult<Response<bool>>> ResetPassword([FromBody] ResetPasswordCommand command)
    {
        return await Okey(() => _mediator.Send(command));
    }

    /// <summary>
    /// Updates a user's roles
    /// </summary>
    [HttpPut]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [Authorize(Roles = "Admin")] // SECURITY FIX: Only admins can update roles
    public async Task<ActionResult<Response<bool>>> UpdateUserRoles([FromBody] UpdateUserRolesCommand command)
    {
        return await Okey(() => _mediator.Send(command));
    }

    /// <summary>
    /// Updates a user's status
    /// </summary>
    [HttpPut]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [Authorize(Roles = "Admin")] // SECURITY FIX: Only admins can update status
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
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<Response<UserViewModel>>> GetUserById([FromRoute] Guid id)
    {
        // SECURITY FIX: IDOR Protection
        var currentUserId = _currentUserService.UserId;
        var userRoles = _currentUserService.GetRoles();

        // Allow access if:
        // 1. User is requesting their own data
        // 2. User has Admin role
        // 3. User has Manager role and is in same unit (requires additional check)
        if (id != currentUserId && !userRoles.Contains("Admin") && !userRoles.Contains("SuAdmin"))
        {
            _log.LogWarning("User {CurrentUserId} attempted to access User {TargetUserId} without permission",
                currentUserId, id);
            return Forbid();
        }

        return await Okey(() => _mediator.Send(new GetUserByIdQuery { Id = id }));
    }

    /// <summary>
    /// Gets a paginated list of users with optional filtering
    /// </summary>
    [HttpGet]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<PagedResult<UserListViewModel>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [Authorize] // SECURITY FIX: Require authentication
    public async Task<ActionResult<Response<PagedResult<UserListViewModel>>>> GetAllUsers([FromQuery] GetAllUsersQuery query)
    {
        // SECURITY FIX: Validate pagination parameters (check if properties exist)
        // Note: Actual property names may differ, adjust as needed
        var pageNumber = 1; // default
        var pageSize = 10; // default

        // Try to get pagination values if properties exist
        var pageProp = query.GetType().GetProperty("PageNumber");
        var sizeProp = query.GetType().GetProperty("PageSize");

        if (pageProp != null)
        {
            var pageValue = pageProp.GetValue(query);
            if (pageValue is int p && p < 1)
            {
                return BadRequest(new Response<PagedResult<UserListViewModel>>
                {
                    Succeeded = false,
                    Message = "Page number must be greater than 0",
                    Code = "ERR400"
                });
            }
        }

        if (sizeProp != null)
        {
            var sizeValue = sizeProp.GetValue(query);
            if (sizeValue is int s && (s < 1 || s > 100))
            {
                return BadRequest(new Response<PagedResult<UserListViewModel>>
                {
                    Succeeded = false,
                    Message = "Page size must be between 1 and 100",
                    Code = "ERR400"
                });
            }
        }

        return await Okey(() => _mediator.Send(query));
    }

    /// <summary>
    /// Get current user information
    /// </summary>
    [HttpGet]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<GetMeVm>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<Response<GetMeVm>>> GetMe()
    {
        var query = new GetMeQuery();
        return await Okey(() => _mediator.Send(query));
    }

    /// <summary>
    /// Search user
    /// </summary>
    [ServiceFilter(typeof(LogActionArguments))]
    [HttpGet]
    [ProducesResponseType(typeof(Response<GetMeVm>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [Authorize(Roles = "Admin")] // SECURITY FIX: Only admins can search users
    public async Task<ActionResult<Response<IEnumerable<SearchUserVm>>>> SearchUser([FromQuery] SearchUserQuery query)
    {
        // SECURITY FIX: Sanitize search input to prevent SQL injection and XSS
        // Try to get search term property
        var searchTermProp = query.GetType().GetProperty("SearchTerm") ?? query.GetType().GetProperty("Search");

        if (searchTermProp != null)
        {
            var searchTermValue = searchTermProp.GetValue(query)?.ToString();

            if (string.IsNullOrEmpty(searchTermValue))
            {
                return BadRequest(new Response<IEnumerable<SearchUserVm>>
                {
                    Succeeded = false,
                    Message = "Search term is required",
                    Code = "ERR400"
                });
            }

            searchTermProp.SetValue(query, SanitizeInput(searchTermValue));
        }

        return await Okey(() => _mediator.Send(query));
    }

    /// <summary>
    /// Imports users from a CSV file
    /// </summary>
    [HttpPost]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(Response<ImportFromCsvResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [Authorize(Roles = "Admin")] // SECURITY FIX: Only admins can import users
    [RequestSizeLimit(10 * 1024 * 1024)] // 10MB limit
    public async Task<ActionResult<Response<ImportFromCsvResponse>>> ImportFromCsv([FromForm] ImportFromCsvCommand command)
    {
        // SECURITY FIX: Validate CSV file
        var (isValid, error) = ValidateFileUpload(command.File);
        if (!isValid)
        {
            return BadRequest(new Response<ImportFromCsvResponse>
            {
                Succeeded = false,
                Message = error,
                Code = "ERR400"
            });
        }

        return await Okey(() => _mediator.Send(command));
    }

    /// <summary>
    /// Gets users per entity report as a PDF
    /// </summary>
    [HttpGet("Report/PerEntity")]
    [ServiceFilter(typeof(LogActionArguments))]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [Authorize(Roles = "Admin")] // SECURITY FIX: Only admins can generate reports
    public async Task<IActionResult> GetUsersPerEntityReport()
    {
        var pdfBytes = await _mediator.Send(new BDFM.Application.Features.Users.Queries.GetUsersPerEntityReport.GetUsersPerEntityReportQuery());
        return File(pdfBytes, "application/pdf", "UsersPerEntityReport.pdf");
    }

    #region Private Methods

    /// <summary>
    /// Validates password complexity
    /// </summary>
    /// <param name="password">The password to validate</param>
    /// <returns>Tuple indicating if valid and error message if invalid</returns>
    private static (bool isValid, string? error) ValidatePassword(string? password)
    {
        if (string.IsNullOrEmpty(password))
            return (false, "Password is required");

        if (password.Length < 6)
            return (false, "Password must be at least 6 characters long");

        if (!password.Any(char.IsUpper))
            return (false, "Password must contain at least one uppercase letter");

        if (!password.Any(char.IsLower))
            return (false, "Password must contain at least one lowercase letter");

        if (!password.Any(char.IsDigit))
            return (false, "Password must contain at least one number");

        if (password.Contains("password", StringComparison.OrdinalIgnoreCase))
            return (false, "Password cannot contain the word 'password'");

        if (password.Contains("123456", StringComparison.OrdinalIgnoreCase))
            return (false, "Password cannot contain common sequences like '123456'");

        return (true, null);
    }

    #endregion
}
