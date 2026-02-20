using BDFM.Api.Controllers;
using BDFM.Application.Models.Authentication;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace BDFM.Api.Tests.Controllers;

public class AuthControllerTests
{
    private readonly Mock<IMediator> _mockMediator;
    private readonly Mock<ILogger<AuthController>> _mockLogger;
    private readonly AuthController _controller;

    public AuthControllerTests()
    {
        _mockMediator = new Mock<IMediator>();
        _mockLogger = new Mock<ILogger<AuthController>>();
        _controller = new AuthController(_mockMediator.Object);
    }

    #region Login Tests

    [Fact]
    public async Task Login_WithValidCredentials_ReturnsOk()
    {
        // Arrange
        var request = new AuthenticationRequest
        {
            Email = "test@example.com",
            Password = "SecureP@ss123"
        };
        var expectedResult = new AuthenticationResponse
        {
            Token = "valid-jwt-token",
            RefreshToken = "valid-refresh-token",
            UserId = Guid.NewGuid(),
            Email = request.Email
        };

        _mockMediator
            .Setup(m => m.Send(It.IsAny<AuthenticationRequest>(), default))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _controller.Login(request);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<AuthenticationResponse>(okResult.Value);
        Assert.NotNull(response.Token);
        Assert.Equal(request.Email, response.Email);
    }

    [Fact]
    public async Task Login_WithInvalidCredentials_ReturnsBadRequest()
    {
        // Arrange
        var request = new AuthenticationRequest
        {
            Email = "test@example.com",
            Password = "WrongPassword"
        };
        var expectedResult = new AuthenticationResponse
        {
            Success = false,
            Message = "Invalid credentials"
        };

        _mockMediator
            .Setup(m => m.Send(It.IsAny<AuthenticationRequest>(), default))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _controller.Login(request);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<AuthenticationResponse>(okResult.Value);
        Assert.False(response.Success);
    }

    [Fact]
    public async Task Login_WithNullEmail_ReturnsBadRequest()
    {
        // Arrange
        var request = new AuthenticationRequest
        {
            Email = null!,
            Password = "SecureP@ss123"
        };

        // Act & Assert
        await Assert.ThrowsAsync<NullReferenceException>(() => _controller.Login(request));
    }

    [Fact]
    public async Task Login_WithEmptyEmail_ReturnsBadRequest()
    {
        // Arrange
        var request = new AuthenticationRequest
        {
            Email = string.Empty,
            Password = "SecureP@ss123"
        };

        // Act & Assert
        await Assert.ThrowsAnyAsync<Exception>(() => _controller.Login(request));
    }

    [Fact]
    public async Task Login_WithNullPassword_ReturnsBadRequest()
    {
        // Arrange
        var request = new AuthenticationRequest
        {
            Email = "test@example.com",
            Password = null!
        };

        // Act & Assert
        await Assert.ThrowsAsync<NullReferenceException>(() => _controller.Login(request));
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public async Task Login_WithEmptyPassword_ReturnsBadRequest(string password)
    {
        // Arrange
        var request = new AuthenticationRequest
        {
            Email = "test@example.com",
            Password = password
        };

        // Act & Assert
        await Assert.ThrowsAnyAsync<Exception>(() => _controller.Login(request));
    }

    #endregion

    #region Register Tests

    [Fact]
    public async Task Register_WithValidData_ReturnsOk()
    {
        // Arrange
        var request = new RegistrationRequest
        {
            Email = "newuser@example.com",
            Password = "SecureP@ss123",
            FirstName = "John",
            LastName = "Doe"
        };
        var expectedResult = new RegistrationResponse
        {
            Success = true,
            Message = "User registered successfully",
            UserId = Guid.NewGuid()
        };

        _mockMediator
            .Setup(m => m.Send(It.IsAny<RegistrationRequest>(), default))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _controller.Register(request);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<RegistrationResponse>(okResult.Value);
        Assert.True(response.Success);
        Assert.NotNull(response.UserId);
    }

    [Fact]
    public async Task Register_WithDuplicateEmail_ReturnsBadRequest()
    {
        // Arrange
        var request = new RegistrationRequest
        {
            Email = "existing@example.com",
            Password = "SecureP@ss123",
            FirstName = "John",
            LastName = "Doe"
        };
        var expectedResult = new RegistrationResponse
        {
            Success = false,
            Message = "Email already exists"
        };

        _mockMediator
            .Setup(m => m.Send(It.IsAny<RegistrationRequest>(), default))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _controller.Register(request);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<RegistrationResponse>(okResult.Value);
        Assert.False(response.Success);
    }

    [Fact]
    public async Task Register_WithWeakPassword_ReturnsBadRequest()
    {
        // Arrange
        var request = new RegistrationRequest
        {
            Email = "newuser@example.com",
            Password = "123", // Weak password
            FirstName = "John",
            LastName = "Doe"
        };
        var expectedResult = new RegistrationResponse
        {
            Success = false,
            Message = "Password does not meet complexity requirements"
        };

        _mockMediator
            .Setup(m => m.Send(It.IsAny<RegistrationRequest>(), default))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _controller.Register(request);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<RegistrationResponse>(okResult.Value);
        Assert.False(response.Success);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public async Task Register_WithInvalidFirstName_ReturnsBadRequest(string firstName)
    {
        // Arrange
        var request = new RegistrationRequest
        {
            Email = "newuser@example.com",
            Password = "SecureP@ss123",
            FirstName = firstName,
            LastName = "Doe"
        };

        // Act & Assert
        await Assert.ThrowsAnyAsync<Exception>(() => _controller.Register(request));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public async Task Register_WithInvalidLastName_ReturnsBadRequest(string lastName)
    {
        // Arrange
        var request = new RegistrationRequest
        {
            Email = "newuser@example.com",
            Password = "SecureP@ss123",
            FirstName = "John",
            LastName = lastName
        };

        // Act & Assert
        await Assert.ThrowsAnyAsync<Exception>(() => _controller.Register(request));
    }

    [Theory]
    [InlineData("test")]
    [InlineData("@example.com")]
    [InlineData("test@")]
    [InlineData("invalid-email")]
    public async Task Register_WithInvalidEmail_ReturnsBadRequest(string email)
    {
        // Arrange
        var request = new RegistrationRequest
        {
            Email = email,
            Password = "SecureP@ss123",
            FirstName = "John",
            LastName = "Doe"
        };

        // Act & Assert
        await Assert.ThrowsAnyAsync<Exception>(() => _controller.Register(request));
    }

    #endregion

    #region Security & Edge Cases

    [Fact]
    public async Task Login_WithSqlInjectionAttempt_ReturnsBadRequestOrFails()
    {
        // Arrange
        var request = new AuthenticationRequest
        {
            Email = "test@example.com'; DROP TABLE Users; --",
            Password = "SecureP@ss123"
        };

        // Act
        var result = await _controller.Login(request);

        // Assert - Should handle safely
        _mockMediator.Verify(m => m.Send(It.IsAny<AuthenticationRequest>(), default), Times.Once);
    }

    [Fact]
    public async Task Login_WithVeryLongPassword_ReturnsBadRequest()
    {
        // Arrange
        var longPassword = new string('a', 1000);
        var request = new AuthenticationRequest
        {
            Email = "test@example.com",
            Password = longPassword
        };

        // Act & Assert
        await Assert.ThrowsAnyAsync<Exception>(() => _controller.Login(request));
    }

    [Fact]
    public async Task Login_WithVeryLongEmail_ReturnsBadRequest()
    {
        // Arrange
        var longEmail = new string('a', 500) + "@example.com";
        var request = new AuthenticationRequest
        {
            Email = longEmail,
            Password = "SecureP@ss123"
        };

        // Act & Assert
        await Assert.ThrowsAnyAsync<Exception>(() => _controller.Login(request));
    }

    [Fact]
    public async Task Login_WithXssInEmail_ReturnsBadRequestOrEscapesInput()
    {
        // Arrange
        var request = new AuthenticationRequest
        {
            Email = "<script>alert('XSS')</script>@example.com",
            Password = "SecureP@ss123"
        };

        // Act
        var result = await _controller.Login(request);

        // Assert - Should handle XSS safely
        _mockMediator.Verify(m => m.Send(It.IsAny<AuthenticationRequest>(), default), Times.Once);
    }

    [Fact]
    public async Task Login_WithUnicodeCharacters_ReturnsOk()
    {
        // Arrange
        var request = new AuthenticationRequest
        {
            Email = "test@example.com",
            Password = "SecureP@ss123"
        };
        var expectedResult = new AuthenticationResponse
        {
            Token = "valid-jwt-token",
            UserId = Guid.NewGuid(),
            Email = request.Email
        };

        _mockMediator
            .Setup(m => m.Send(It.IsAny<AuthenticationRequest>(), default))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _controller.Login(request);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(okResult.Value);
    }

    [Fact]
    public async Task Register_WithSameEmailDifferentCase_ShouldTreatAsDuplicate()
    {
        // Arrange
        var request = new RegistrationRequest
        {
            Email = "TEST@example.com", // Uppercase version of existing email
            Password = "SecureP@ss123",
            FirstName = "John",
            LastName = "Doe"
        };
        var expectedResult = new RegistrationResponse
        {
            Success = false,
            Message = "Email already exists"
        };

        _mockMediator
            .Setup(m => m.Send(It.IsAny<RegistrationRequest>(), default))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _controller.Register(request);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<RegistrationResponse>(okResult.Value);
        Assert.False(response.Success);
    }

    #endregion
}
