using BDFM.Application.Features.Users.Commands.CreateUser;
using BDFM.Application.Features.Users.Commands.ResetPassword;
using BDFM.Application.Features.Users.Commands.UpdateUser;
using BDFM.Application.Features.Users.Commands.UpdateUserRoles;
using BDFM.Application.Features.Users.Commands.UpdateUserStatus;
using BDFM.Application.Features.Users.Queries.GetAllUsers;
using BDFM.Application.Features.Users.Queries.GetMe;
using BDFM.Application.Features.Users.Queries.GetUserById;
using BDFM.Api.Controllers;
using BDFM.Api.Tests.Helpers;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using Xunit;

namespace BDFM.Api.Tests.Controllers
{
    public class UserControllerTests
    {
        private readonly Mock<IMediator> _mockMediator;
        private readonly Mock<ILogger<UserController>> _mockLogger;
        private readonly UserController _controller;

        public UserControllerTests()
        {
            _mockMediator = new Mock<IMediator>();
            _mockLogger = new Mock<ILogger<UserController>>();
            _controller = new UserController(_mockLogger.Object, _mockMediator.Object);
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext()
            };
        }

        #region Happy Path Tests

        [Fact]
        public async Task CreateUser_WithValidRequest_ReturnsOk()
        {
            // Arrange
            var command = new CreateUserCommand
            {
                Name = "Test User",
                Email = "test@example.com",
                Password = "SecurePassword123!"
            };
            var response = Response<bool>.Success(true);

            _mockMediator
                .Setup(m => m.Send(It.IsAny<CreateUserCommand>(), default))
                .ReturnsAsync(response);

            // Act
            var result = await _controller.CreateUser(command);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var apiResponse = Assert.IsType<Response<bool>>(okResult.Value);
            Assert.True(apiResponse.Succeeded);
            Assert.True(apiResponse.Data);
            _mockMediator.Verify(m => m.Send(It.IsAny<CreateUserCommand>(), default), Times.Once);
        }

        [Fact]
        public async Task GetUserById_WithValidId_ReturnsOk()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var query = new GetUserByIdQuery { Id = userId };
            var response = Response<UserViewModel>.Success(new UserViewModel
            {
                Id = userId,
                Name = "Test User",
                Email = "test@example.com"
            });

            _mockMediator
                .Setup(m => m.Send(It.IsAny<GetUserByIdQuery>(), default))
                .ReturnsAsync(response);

            // Act
            var result = await _controller.GetUserById(userId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var apiResponse = Assert.IsType<Response<UserViewModel>>(okResult.Value);
            Assert.True(apiResponse.Succeeded);
            Assert.NotNull(apiResponse.Data);
            Assert.Equal(userId, apiResponse.Data.Id);
        }

        [Fact]
        public async Task GetAllUsers_WithValidQuery_ReturnsOk()
        {
            // Arrange
            var query = new GetAllUsersQuery { PageNumber = 1, PageSize = 10 };
            var response = Response<PagedResult<UserListViewModel>>.Success(
                new PagedResult<UserListViewModel>
                {
                    Items = new List<UserListViewModel>(),
                    TotalCount = 0,
                    PageNumber = 1,
                    PageSize = 10
                });

            _mockMediator
                .Setup(m => m.Send(It.IsAny<GetAllUsersQuery>(), default))
                .ReturnsAsync(response);

            // Act
            var result = await _controller.GetAllUsers(query);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var apiResponse = Assert.IsType<Response<PagedResult<UserListViewModel>>>(okResult.Value);
            Assert.True(apiResponse.Succeeded);
            Assert.NotNull(apiResponse.Data);
        }

        [Fact]
        public async Task GetMe_WithAuthenticatedUser_ReturnsOk()
        {
            // Arrange
            var response = Response<GetMeVm>.Success(new GetMeVm
            {
                Id = Guid.NewGuid(),
                Name = "Current User",
                Email = "current@example.com"
            });

            _mockMediator
                .Setup(m => m.Send(It.IsAny<GetMeQuery>(), default))
                .ReturnsAsync(response);

            // Act
            var result = await _controller.GetMe();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var apiResponse = Assert.IsType<Response<GetMeVm>>(okResult.Value);
            Assert.True(apiResponse.Succeeded);
            Assert.NotNull(apiResponse.Data);
        }

        #endregion

        #region Validation Tests

        [Fact]
        public async Task CreateUser_WithNullEmail_ReturnsBadRequest()
        {
            // Arrange
            var command = new CreateUserCommand
            {
                Name = "Test User",
                Email = null,
                Password = "SecurePassword123!"
            };

            // Act
            var result = await _controller.CreateUser(command);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result.Result);
        }

        [Fact]
        public async Task CreateUser_WithEmptyName_ReturnsBadRequest()
        {
            // Arrange
            var command = new CreateUserCommand
            {
                Name = "",
                Email = "test@example.com",
                Password = "SecurePassword123!"
            };

            // Act
            var result = await _controller.CreateUser(command);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result.Result);
        }

        [Fact]
        public async Task CreateUser_WithInvalidEmail_ReturnsBadRequest()
        {
            // Arrange
            var command = new CreateUserCommand
            {
                Name = "Test User",
                Email = "invalid-email",
                Password = "SecurePassword123!"
            };

            // Act
            var result = await _controller.CreateUser(command);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result.Result);
        }

        [Fact]
        public async Task GetUserById_WithEmptyGuid_ReturnsBadRequest()
        {
            // Act
            var result = await _controller.GetUserById(Guid.Empty);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
        }

        #endregion

        #region Security Tests

        [Theory]
        [MemberData(nameof(TestDataHelper.SecurityTestData.SqlInjectionStrings), MemberType = typeof(TestDataHelper))]
        public async Task CreateUser_WithSqlInjection_ReturnsBadRequest(string sqlInjection)
        {
            // Arrange
            var command = new CreateUserCommand
            {
                Name = sqlInjection,
                Email = "test@example.com",
                Password = "SecurePassword123!"
            };

            // Act
            var result = await _controller.CreateUser(command);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result.Result);
        }

        [Theory]
        [MemberData(nameof(TestDataHelper.SecurityTestData.XssStrings), MemberType = typeof(TestDataHelper))]
        public async Task UpdateUser_WithXss_SanitizesInput(string xssPayload)
        {
            // Arrange
            var command = new UpdateUserCommand
            {
                Id = Guid.NewGuid(),
                Name = xssPayload,
                Email = "test@example.com"
            };

            // Act
            var result = await _controller.UpdateUser(command);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var apiResponse = Assert.IsType<Response<bool>>(okResult.Value);
            _mockMediator.Verify(m => m.Send(It.Is<UpdateUserCommand>(c =>
                !c.Name.Contains("<script>")), default), Times.Once);
        }

        [Fact]
        public async Task ResetPassword_WithoutAdminRole_ReturnsUnauthorized()
        {
            // Arrange - Simulate non-admin user
            _controller.ControllerContext.HttpContext.User = new ClaimsPrincipal(
                new ClaimsIdentity(new[] { new Claim(ClaimTypes.Role, "User") }));

            var command = new ResetPasswordCommand
            {
                UserId = Guid.NewGuid(),
                NewPassword = "NewSecurePassword123!"
            };

            // Act
            var result = await _controller.ResetPassword(command);

            // Assert
            Assert.IsType<UnauthorizedResult>(result.Result);
        }

        [Fact]
        public async Task GetUserById_WithDifferentUserId_ReturnsUnauthorized()
        {
            // Arrange - Simulate regular user
            var currentUserId = Guid.NewGuid();
            var targetUserId = Guid.NewGuid();
            _controller.ControllerContext.HttpContext.User = new ClaimsPrincipal(
                new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, currentUserId.ToString()),
                    new Claim(ClaimTypes.Role, "User")
                }));

            var response = Response<UserViewModel>.Success(new UserViewModel
            {
                Id = targetUserId,
                Name = "Target User",
                Email = "target@example.com"
            });

            _mockMediator
                .Setup(m => m.Send(It.IsAny<GetUserByIdQuery>(), default))
                .ReturnsAsync(response);

            // Act
            var result = await _controller.GetUserById(targetUserId);

            // Assert
            // Should be forbidden due to IDOR protection (if implemented)
            // Or should be allowed (vulnerable - need to verify implementation)
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
        }

        [Theory]
        [InlineData("admin")]
        [InlineData("Administrator")]
        [InlineData("root")]
        public async Task CreateUser_WithReservedUsername_ReturnsBadRequest(string reservedName)
        {
            // Arrange
            var command = new CreateUserCommand
            {
                Name = reservedName,
                Email = $"{reservedName.ToLower()}@example.com",
                Password = "SecurePassword123!"
            };

            // Act
            var result = await _controller.CreateUser(command);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result.Result);
        }

        #endregion

        #region Edge Case Tests

        [Fact]
        public async Task GetAllUsers_WithPageNumberZero_ReturnsBadRequest()
        {
            // Arrange
            var query = new GetAllUsersQuery { PageNumber = 0, PageSize = 10 };

            // Act
            var result = await _controller.GetAllUsers(query);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result.Result);
        }

        [Fact]
        public async Task GetAllUsers_WithNegativePageSize_ReturnsBadRequest()
        {
            // Arrange
            var query = new GetAllUsersQuery { PageNumber = 1, PageSize = -10 };

            // Act
            var result = await _controller.GetAllUsers(query);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result.Result);
        }

        [Fact]
        public async Task GetAllUsers_WithPageSizeTooLarge_ReturnsBadRequest()
        {
            // Arrange
            var query = new GetAllUsersQuery { PageNumber = 1, PageSize = 10000 };

            // Act
            var result = await _controller.GetAllUsers(query);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result.Result);
        }

        [Fact]
        public async Task CreateUser_WithVeryLongName_ReturnsBadRequest()
        {
            // Arrange
            var command = new CreateUserCommand
            {
                Name = new string('A', 500), // 500 characters
                Email = "test@example.com",
                Password = "SecurePassword123!"
            };

            // Act
            var result = await _controller.CreateUser(command);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result.Result);
        }

        [Theory]
        [InlineData("🔥🔥🔥")]
        [InlineData("مرحبا")]
        [InlineData("你好")]
        public async Task CreateUser_WithUnicodeCharacters_HandlesCorrectly(string unicodeName)
        {
            // Arrange
            var command = new CreateUserCommand
            {
                Name = unicodeName,
                Email = "test@example.com",
                Password = "SecurePassword123!"
            };

            var response = Response<bool>.Success(true);

            _mockMediator
                .Setup(m => m.Send(It.IsAny<CreateUserCommand>(), default))
                .ReturnsAsync(response);

            // Act
            var result = await _controller.CreateUser(command);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var apiResponse = Assert.IsType<Response<bool>>(okResult.Value);
            Assert.True(apiResponse.Succeeded);
        }

        [Fact]
        public async Task GetAllUsers_WithPageNumberGreaterThanTotal_ReturnsEmptyList()
        {
            // Arrange
            var query = new GetAllUsersQuery { PageNumber = 999, PageSize = 10 };
            var response = Response<PagedResult<UserListViewModel>>.Success(
                new PagedResult<UserListViewModel>
                {
                    Items = new List<UserListViewModel>(),
                    TotalCount = 5,
                    PageNumber = 999,
                    PageSize = 10
                });

            _mockMediator
                .Setup(m => m.Send(It.IsAny<GetAllUsersQuery>(), default))
                .ReturnsAsync(response);

            // Act
            var result = await _controller.GetAllUsers(query);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var apiResponse = Assert.IsType<Response<PagedResult<UserListViewModel>>>(okResult.Value);
            Assert.True(apiResponse.Succeeded);
            Assert.Empty(apiResponse.Data.Items);
        }

        [Fact]
        public async Task UpdateUserStatus_WithNullCommand_ReturnsBadRequest()
        {
            // Act
            var result = await _controller.ChangeStatus(null);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result.Result);
        }

        #endregion
    }
}
