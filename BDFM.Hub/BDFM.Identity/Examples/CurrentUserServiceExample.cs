using BDFM.Application.Contracts.Identity;
using BDFM.Application.Contracts.Persistence;
using BDFM.Application.Features.Utility.BaseUtility.Query.GetById;
using BDFM.Domain.Common;
using BDFM.Domain.Entities.Core;
using MediatR;
using Microsoft.Extensions.Logging;
using System.Linq.Expressions;

namespace BDFM.Identity.Examples
{
    // This is an example class to demonstrate how to use the CurrentUserService
    // in your application handlers
    public class GetUserByIdQuery : IRequest<Response<UserViewModel>>
    {
        public Guid Id { get; set; }
    }

    public class UserViewModel
    {
        public Guid Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public bool IsCurrentUser { get; set; }
        public IEnumerable<string> Roles { get; set; } = default!;
    }

    public class GetUserByIdHandler : GetByIdHandler<User, UserViewModel, GetUserByIdQuery>,
        IRequestHandler<GetUserByIdQuery, Response<UserViewModel>>
    {
        private readonly ICurrentUserService _currentUserService;
        private readonly ILogger<GetUserByIdHandler> _logger;

        public GetUserByIdHandler(
            IBaseRepository<User> repository,
            ICurrentUserService currentUserService,
            ILogger<GetUserByIdHandler> logger)
            : base(repository)
        {
            _currentUserService = currentUserService ?? throw new ArgumentNullException(nameof(currentUserService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public override Expression<Func<User, bool>> IdPredicate(GetUserByIdQuery request)
        {
            return e => e.Id == request.Id;
        }

        public override Expression<Func<User, UserViewModel>> Selector => entity => new UserViewModel
        {
            Id = entity.Id,
            Username = entity.Username,
            Email = entity.Email!,
            // These properties will be set after mapping
            IsCurrentUser = false,
            Roles = new List<string>()
        };

        // Handle the request by using the base implementation and extending it
        public async Task<Response<UserViewModel>> Handle(GetUserByIdQuery request, CancellationToken cancellationToken)
        {
            // Get the base result
            var response = await HandleBase(request, cancellationToken);

            if (response.Succeeded && response.Data != null)
            {
                // Enrich the view model with additional data
                response.Data.IsCurrentUser = response.Data.Id == _currentUserService.UserId;
                response.Data.Roles = _currentUserService.GetRoles();

                // Log who is accessing this user's information
                _logger.LogInformation(
                    "User {CurrentUserId} ({CurrentUserName}) accessed information for User {RequestedUserId}",
                    _currentUserService.UserId,
                    _currentUserService.UserName,
                    response.Data.Id.ToString());

                // Check if current user has permission to view other users
                if (!response.Data.IsCurrentUser && !_currentUserService.HasPermission("User|GetById|ViewOthers"))
                {
                    _logger.LogWarning(
                        "User {CurrentUserId} attempted to access user {RequestedUserId} information without permission",
                        _currentUserService.UserId,
                        response.Data.Id.ToString());

                    return Response<UserViewModel>.Fail(
                        new List<object> { "Unauthorized access" },
                        new MessageResponse { Code = "Error4003", Message = "You do not have permission to view other users' information" });
                }
            }

            return response;
        }
    }
}
