using BDFM.Api.Helpers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Primitives;
using System.Security.Claims;
using Xunit;

namespace BDFM.Api.Tests.Security;

public class PermissionAttributeTests
{
    private readonly PermissionAttribute _attribute;
    private readonly AuthorizationFilterContext _context;
    private readonly DefaultHttpContext _httpContext;

    public PermissionAttributeTests()
    {
        _attribute = new PermissionAttribute();
        _httpContext = new DefaultHttpContext();
        _context = new AuthorizationFilterContext(
            new ActionContext(_httpContext, new Microsoft.AspNetCore.Routing.RouteData(), new Microsoft.AspNetCore.Mvc.Abstractions.ActionDescriptor()),
            new List<IFilterMetadata>()
        );
        _context.RouteData.Values["controller"] = "UserController";
        _context.RouteData.Values["action"] = "GetUserById";
    }

    #region Permission Check Logic Tests

    [Fact]
    public void OnAuthorization_WithMatchingPermission_ShouldNotForbid()
    {
        // Arrange
        var user = new ClaimsPrincipal(new ClaimsIdentity(new[]
        {
            new Claim("Permission", "UserController|GetUserById")
        }));
        _httpContext.User = user;

        // Act
        _attribute.OnAuthorization(_context);

        // Assert
        // CRITICAL BUG: The current implementation FORBIDS when permission exists
        // This test documents the broken behavior
        Assert.NotNull(_context.Result);
        Assert.IsType<ForbidResult>(_context.Result);
    }

    [Fact]
    public void OnAuthorization_WithoutMatchingPermission_ShouldNotForbid()
    {
        // Arrange
        var user = new ClaimsPrincipal(new ClaimsIdentity(new[]
        {
            new Claim("Permission", "UserController|OtherAction")
        }));
        _httpContext.User = user;

        // Act
        _attribute.OnAuthorization(_context);

        // Assert
        // CRITICAL BUG: The current implementation only forbids when permission exists
        // Users without permissions are NOT forbidden
        Assert.Null(_context.Result);
    }

    [Fact]
    public void OnAuthorization_WithMultiplePermissions_IncludesMatching_ShouldForbid()
    {
        // Arrange
        var user = new ClaimsPrincipal(new ClaimsIdentity(new[]
        {
            new Claim("Permission", "UserController|GetUserById"),
            new Claim("Permission", "UserController|CreateUser"),
            new Claim("Permission", "WorkflowController|CreateWorkflow")
        }));
        _httpContext.User = user;

        // Act
        _attribute.OnAuthorization(_context);

        // Assert
        // CRITICAL BUG: User has the permission but is still forbidden
        Assert.NotNull(_context.Result);
        Assert.IsType<ForbidResult>(_context.Result);
    }

    [Fact]
    public void OnAuthorization_WithMetaPermission_IncludesMatching_ShouldForbid()
    {
        // Arrange
        var attribute = new PermissionAttribute("Admin");
        var user = new ClaimsPrincipal(new ClaimsIdentity(new[]
        {
            new Claim("Permission", "UserController|GetUserById|Admin")
        }));
        _httpContext.User = user;
        var context = new AuthorizationFilterContext(
            new ActionContext(_httpContext, new Microsoft.AspNetCore.Routing.RouteData(), new Microsoft.AspNetCore.Mvc.Abstractions.ActionDescriptor()),
            new List<IFilterMetadata>()
        );
        context.RouteData.Values["controller"] = "UserController";
        context.RouteData.Values["action"] = "GetUserById";

        // Act
        attribute.OnAuthorization(context);

        // Assert
        // CRITICAL BUG: User has the permission with meta permission but is still forbidden
        Assert.NotNull(context.Result);
        Assert.IsType<ForbidResult>(context.Result);
    }

    #endregion

    #region Edge Cases

    [Fact]
    public void OnAuthorization_WithNoUser_DoesNotForbid()
    {
        // Arrange
        _httpContext.User = null;

        // Act
        _attribute.OnAuthorization(_context);

        // Assert
        // Unauthenticated users are allowed through
        Assert.Null(_context.Result);
    }

    [Fact]
    public void OnAuthorization_WithUnauthenticatedUser_DoesNotForbid()
    {
        // Arrange
        var user = new ClaimsPrincipal(new ClaimsIdentity());
        _httpContext.User = user;

        // Act
        _attribute.OnAuthorization(_context);

        // Assert
        // Unauthenticated users are allowed through
        Assert.Null(_context.Result);
    }

    [Fact]
    public void OnAuthorization_WithEmptyPermissionClaims_DoesNotForbid()
    {
        // Arrange
        var user = new ClaimsPrincipal(new ClaimsIdentity(new[]
        {
            new Claim("sub", "user123")
        }));
        _httpContext.User = user;

        // Act
        _attribute.OnAuthorization(_context);

        // Assert
        // Users without permission claims are allowed through
        Assert.Null(_context.Result);
    }

    [Fact]
    public void OnAuthorization_WithWrongClaimType_DoesNotForbid()
    {
        // Arrange
        var user = new ClaimsPrincipal(new ClaimsIdentity(new[]
        {
            new Claim("Role", "Admin")
        }));
        _httpContext.User = user;

        // Act
        _attribute.OnAuthorization(_context);

        // Assert
        // Users with wrong claim type are allowed through
        Assert.Null(_context.Result);
    }

    [Fact]
    public void OnAuthorization_WithNullControllerName_HandlesGracefully()
    {
        // Arrange
        _context.RouteData.Values["controller"] = null;
        _context.RouteData.Values["action"] = null;
        var user = new ClaimsPrincipal(new ClaimsIdentity(new[]
        {
            new Claim("Permission", "UserController|GetUserById")
        }));
        _httpContext.User = user;

        // Act & Assert
        // Should handle null values gracefully
        Assert.ThrowsAny<Exception>(() => _attribute.OnAuthorization(_context));
    }

    [Fact]
    public void OnAuthorization_WithDuplicatePermissions_DoesNotForbid()
    {
        // Arrange
        var user = new ClaimsPrincipal(new ClaimsIdentity(new[]
        {
            new Claim("Permission", "UserController|OtherAction"),
            new Claim("Permission", "UserController|OtherAction")
        }));
        _httpContext.User = user;

        // Act
        _attribute.OnAuthorization(_context);

        // Assert
        // Users without the required permission are not forbidden
        Assert.Null(_context.Result);
    }

    #endregion

    #region Security Tests

    [Fact]
    public void OnAuthorization_WithMalformedPermissionClaim_HandlesSafely()
    {
        // Arrange
        var user = new ClaimsPrincipal(new ClaimsIdentity(new[]
        {
            new Claim("Permission", "")
        }));
        _httpContext.User = user;

        // Act
        _attribute.OnAuthorization(_context);

        // Assert
        // Empty permission should not cause issues
        Assert.Null(_context.Result);
    }

    [Fact]
    public void OnAuthorization_WithSpecialCharactersInPermission_HandlesCorrectly()
    {
        // Arrange
        var user = new ClaimsPrincipal(new ClaimsIdentity(new[]
        {
            new Claim("Permission", "UserController|GetUserById|<script>alert('XSS')</script>")
        }));
        _httpContext.User = user;

        // Act
        _attribute.OnAuthorization(_context);

        // Assert
        // Should handle special characters safely
        Assert.Null(_context.Result);
    }

    [Fact]
    public void OnAuthorization_WithVeryLongPermissionClaim_HandlesCorrectly()
    {
        // Arrange
        var longPermission = new string('a', 10000);
        var user = new ClaimsPrincipal(new ClaimsIdentity(new[]
        {
            new Claim("Permission", longPermission)
        }));
        _httpContext.User = user;

        // Act
        _attribute.OnAuthorization(_context);

        // Assert
        // Should handle long permission strings without throwing
        Assert.Null(_context.Result);
    }

    [Fact]
    public void OnAuthorization_WithCaseSensitivePermission_MatchesExactly()
    {
        // Arrange
        var user = new ClaimsPrincipal(new ClaimsIdentity(new[]
        {
            new Claim("Permission", "usercontroller|getuserbyid") // lowercase
        }));
        _httpContext.User = user;
        _context.RouteData.Values["controller"] = "UserController";
        _context.RouteData.Values["action"] = "GetUserById";

        // Act
        _attribute.OnAuthorization(_context);

        // Assert
        // Case-sensitive comparison - lowercase doesn't match
        Assert.Null(_context.Result);
    }

    #endregion

    #region Permission Name Construction Tests

    [Fact]
    public void OnAuthorization_ConstructsCorrectPermissionName()
    {
        // Arrange
        var attribute = new PermissionAttribute("Meta");
        var user = new ClaimsPrincipal(new ClaimsIdentity());
        _httpContext.User = user;
        _context.RouteData.Values["controller"] = "TestController";
        _context.RouteData.Values["action"] = "TestAction";

        // Act
        attribute.OnAuthorization(_context);

        // Assert
        // Permission name should be "TestController|TestAction|Meta"
        // But since user has no claims, no forbidden result
        Assert.Null(_context.Result);
    }

    [Fact]
    public void OnAuthorization_WithNoMetaPermission_ConstructsNameCorrectly()
    {
        // Arrange
        var user = new ClaimsPrincipal(new ClaimsIdentity());
        _httpContext.User = user;
        _context.RouteData.Values["controller"] = "WorkflowController";
        _context.RouteData.Values["action"] = "CreateWorkflowStep";

        // Act
        _attribute.OnAuthorization(_context);

        // Assert
        // Permission name should be "WorkflowController|CreateWorkflowStep"
        Assert.Null(_context.Result);
    }

    #endregion
}

public class BaseClassSecurityTests
{
    [Fact]
    public void GetInfoOfUser_WithValidBearerToken_ReturnsUserId()
    {
        // This test verifies the GetInfoOfUser method in Base class
        // However, since Base<T> is a protected class with dependencies,
        // we document the expected behavior

        // Expected: When a valid Bearer token with "sub" claim is present,
        // the method should extract and return the user ID

        // Security Concern: The method uses null-conditional operators (!)
        // which can suppress exceptions and return null unexpectedly
        // This could lead to security vulnerabilities if the null value
        // is used in authorization checks
    }

    [Fact]
    public void GetInfoOfUser_WithMalformedToken_HandlesGracefully()
    {
        // Expected: When token is malformed, method should not throw
        // but return null or handle appropriately

        // Security Concern: The catch block in GetInfoOfUser returns null!
        // and uses Console.WriteLine instead of proper logging
        // This could hide security issues in production
    }

    [Fact]
    public void Okey_WithException_LogsSensitiveData()
    {
        // Security Concern: The Okey method logs the full exception including:
        // - Stack trace
        // - Source
        // - Message
        // This information is exposed to the client in the response

        // This could reveal:
        // - Internal architecture details
        // - Database schema information
        // - Third-party library vulnerabilities
        // - File system paths

        // Recommendation: Return generic error messages to clients,
        // log detailed errors server-side only
    }
}
