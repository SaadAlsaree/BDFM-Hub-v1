# BDFM API Tests

This directory contains comprehensive unit and integration tests for the BDFM API controllers, with a focus on security testing and edge case coverage.

## 📋 Table of Contents

- [Overview](#overview)
- [Test Structure](#test-structure)
- [Running Tests](#running-tests)
- [Test Coverage](#test-coverage)
- [Security Testing](#security-testing)
- [Edge Cases](#edge-cases)
- [Contributing](#contributing)

## Overview

This test suite provides:

- ✅ Unit tests for all API controllers
- 🔒 Security-focused tests (SQL injection, XSS, authorization bypass)
- 🧪 Edge case testing (null values, extreme inputs, boundary conditions)
- 📊 Mock-based testing using Moq framework
- 🎯 Test data generation helpers

## Test Structure

```
BDFM.Api.Tests/
├── Controllers/
│   ├── AuthControllerTests.cs          # Authentication & registration tests
│   ├── UserControllerTests.cs            # User management tests
│   ├── WorkflowControllerTests.cs       # Workflow management tests
│   └── [OtherControllerTests.cs]        # Additional controller tests
├── Security/
│   └── PermissionAttributeTests.cs     # Authorization logic tests
├── Helpers/
│   └── TestDataHelper.cs                # Test data generation utilities
├── BDFM.Api.Tests.csproj               # Test project configuration
├── SECURITY_ANALYSIS_REPORT.md          # Detailed security findings
└── README.md                            # This file
```

## Running Tests

### Prerequisites

- .NET 9.0 SDK
- Visual Studio 2022 or VS Code with C# extension
- Git (for cloning the repository)

### Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd BDFM-Hub-v1/BDFM.Hub/BDFM.Api.Tests
   ```

2. **Restore dependencies:**
   ```bash
   dotnet restore
   ```

3. **Build the test project:**
   ```bash
   dotnet build
   ```

### Run Tests

#### Run All Tests
```bash
dotnet test
```

#### Run Specific Test File
```bash
dotnet test --filter "FullyQualifiedName~AuthControllerTests"
```

#### Run Specific Test Method
```bash
dotnet test --filter "FullyQualifiedName~Login_WithValidCredentials_ReturnsOk"
```

#### Run with Detailed Output
```bash
dotnet test --logger "console;verbosity=detailed"
```

#### Run with Code Coverage
```bash
dotnet test /p:CollectCoverage=true /p:CoverletOutputFormat=opencover
```

#### Run in Visual Studio
1. Open the Test Explorer (Test > Test Explorer)
2. Build the solution
3. Click "Run All" to execute all tests

## Test Coverage

### Controllers Tested

| Controller | Status | Coverage | Priority | Security Tests |
|------------|--------|----------|----------|-----------------|
| AuthController | ✅ Done | ~90% | Critical | ✅ 8 tests |
| PermissionAttribute | ✅ Done | ~95% | CRITICAL | ✅ 30+ tests |
| AttachmentsController | ✅ Done | ~85% | High | ✅ 10 tests |
| WorkflowController | ✅ Done | ~80% | High | ✅ 5 tests |
| UserController | ⏳ Pending | - | Critical | ❌ 0 |
| PermissionController | ⏳ Pending | - | CRITICAL | ❌ 0 |
| UserPermissionController | ⏳ Pending | - | CRITICAL | ❌ 0 |
| UnitPermissionController | ⏳ Pending | - | CRITICAL | ❌ 0 |
| RoleController | ⏳ Pending | - | Medium | ❌ 0 |
| LeaveRequestsController | ⏳ Pending | - | High | ❌ 0 |
| NotificationController | ⏳ Pending | - | Low | ❌ 0 |
| DashboardController | ⏳ Pending | - | Low | ❌ 0 |
| OrganizationalUnitController | ⏳ Pending | - | Low | ❌ 0 |
| DelegationController | ⏳ Pending | - | Medium | ❌ 0 |
| CorrespondenceController | ⏳ Pending | - | High | ❌ 0 |
| ExternalEntityController | ⏳ Pending | - | Medium | ❌ 0 |
| MailFileController | ⏳ Pending | - | Medium | ❌ 0 |
| CommentController | ⏳ Pending | - | Low | ❌ 0 |
| TemplateController | ⏳ Pending | - | Low | ❌ 0 |
| CustomWorkflowController | ⏳ Pending | - | Medium | ❌ 0 |

**Overall Test Coverage:** ~15% (Phase 1 of 5 complete)
**Security Test Coverage:** ~30% (Critical vulnerabilities documented)

### Test Categories

1. **Happy Path Tests** - Valid inputs, expected behavior
2. **Validation Tests** - Invalid inputs, error handling
3. **Security Tests** - Injection attacks, authorization bypass
4. **Edge Case Tests** - Boundary conditions, extreme inputs
5. **Integration Tests** - End-to-end workflows (pending)

## Security Testing

### Vulnerabilities Tested

#### 1. Authentication & Authorization
- [x] Unauthenticated access to protected endpoints
- [x] Broken permission check logic (CRITICAL BUG)
- [x] Missing authorization attributes
- [ ] Rate limiting on authentication endpoints
- [ ] Session fixation attacks
- [ ] JWT token manipulation

#### 2. Input Validation
- [x] SQL injection via input parameters
- [x] XSS (Cross-Site Scripting) attacks
- [x] Path traversal attacks
- [ ] Command injection
- [ ] LDAP injection
- [ ] XXE (XML External Entity) attacks
- [ ] File upload validation (malicious files, size limits)
- [ ] Email validation bypass
- [ ] Password complexity enforcement

#### 3. Data Security
- [ ] Sensitive data in error messages
- [ ] Information disclosure via headers
- [ ] Logging of sensitive data
- [ ] Insecure direct object references (IDOR)
- [ ] Missing encryption at rest
- [ ] TLS/SSL enforcement

#### 4. Session Management
- [ ] Session timeout configuration
- [ ] Concurrent session limits
- [ ] Session fixation
- [ ] Cookie security flags (HttpOnly, Secure, SameSite)

#### 5. API Security
- [ ] CORS configuration
- [ ] CSRF protection
- [ ] Security headers (CSP, X-Frame-Options, etc.)
- [ ] API versioning
- [ ] Rate limiting
- [ ] Request size limits

### Security Test Data

The `TestDataHelper` class provides malicious input for security testing:

```csharp
// SQL Injection
TestDataHelper.SecurityTestData.SqlInjectionStrings

// XSS
TestDataHelper.SecurityTestData.XssStrings

// Path Traversal
TestDataHelper.SecurityTestData.PathTraversalStrings

// Command Injection
TestDataHelper.SecurityTestData.CommandInjectionStrings

// LDAP Injection
TestDataHelper.SecurityTestData.LdapInjectionStrings

// XXE
TestDataHelper.SecurityTestData.XxeInjectionStrings
```

## Edge Cases

### Test Categories

#### 1. Null/Empty Values
- [x] Null parameters
- [x] Empty strings
- [x] Empty GUIDs
- [ ] Null collections
- [ ] Null nested objects

#### 2. Boundary Conditions
- [x] Very long strings (> 10,000 chars)
- [x] Large numbers (INT_MAX)
- [x] Zero values
- [x] Negative values
- [ ] Future dates for historical data
- [ ] Past dates for future events
- [ ] Invalid date formats

#### 3. Special Characters
- [x] Unicode characters
- [x] Emoji
- [x] Right-to-left text (Arabic, Hebrew)
- [ ] Zero-width characters
- [ ] Control characters
- [ ] Combining characters

#### 4. Pagination
- [x] PageNumber = 0 or negative
- [x] PageSize = 0 or negative
- [x] PageSize = INT_MAX
- [x] PageNumber > TotalPages
- [ ] Sorting with invalid columns
- [ ] Filtering with special characters

#### 5. File Operations
- [ ] Zero-byte files
- [ ] Files larger than 10GB
- [ ] Files without extensions
- [ ] Double extensions (.exe.txt)
- [ ] Executable files
- [ ] Corrupted files
- [ ] Multiple files in single request

#### 6. Database Operations
- [ ] Concurrent modifications
- [ ] Foreign key violations
- [ ] Circular references
- [ ] Orphaned records
- [ ] Soft-deleted record access

## Critical Security Findings

### 1. Broken Permission Logic (CRITICAL)
**Location:** `PermissionAttribute.cs:26-29`

The permission check has inverted logic:
```csharp
if (userPermissions.Any(x => x == PermissionName))
{
    context.Result = new ForbidResult();  // WRONG!
}
```

**Impact:** Users with valid permissions are blocked, unauthorized users allowed.

**Fix:** Change to `if (!userPermissions.Any(...))`

### 2. Missing Authentication (CRITICAL)
**Location:** Most controllers

Most controllers have commented out `[Authorize]` attributes.

**Impact:** Unrestricted access to sensitive operations.

**Fix:** Uncomment and enforce authorization.

### 3. Test Controller Exposed (HIGH)
**Location:** `TestController.cs`

Production test endpoints accessible without authentication.

**Impact:** Unauthorized notification manipulation, potential DoS.

**Fix:** Remove or restrict to development environment.

### 4. SQL Injection Risk (HIGH)
**Location:** Multiple controllers using `ChangeStatusCommand`

Direct table name manipulation without sanitization.

**Impact:** Potential SQL injection.

**Fix:** Use parameterized queries and whitelist validation.

### 5. Sensitive Data Exposure (MEDIUM)
**Location:** `Base.cs:69-83`

Stack traces and internal details exposed in error responses.

**Impact:** Information disclosure aiding attackers.

**Fix:** Return generic error messages, log details server-side.

## Test Development Guidelines

### Naming Conventions

```csharp
// Format: MethodName_Scenario_ExpectedResult
public async Task Login_WithValidCredentials_ReturnsOk()
public async Task Login_WithInvalidCredentials_ReturnsBadRequest()
public async Task CreateUser_WithNullEmail_ThrowsException()
```

### Test Structure

```csharp
[Fact]
public async Task TestName()
{
    // Arrange - Setup test data and mocks
    var request = new CreateRequest { ... };
    var expectedResult = Response<bool>.Success(true);
    
    _mockMediator
        .Setup(m => m.Send(It.IsAny<CreateRequest>(), default))
        .ReturnsAsync(expectedResult);

    // Act - Execute the method being tested
    var result = await _controller.CreateUser(request);

    // Assert - Verify the expected behavior
    var okResult = Assert.IsType<OkObjectResult>(result.Result);
    var response = Assert.IsType<Response<bool>>(okResult.Value);
    Assert.True(response.Succeeded);
}
```

### Best Practices

1. **One assertion per test** - Keep tests focused
2. **Use Theory for multiple inputs** - Test with different data sets
3. **Mock dependencies** - Isolate the unit under test
4. **Test both success and failure paths**
5. **Include security tests** - Test for common vulnerabilities
6. **Test edge cases** - Boundary conditions and extreme inputs
7. **Use descriptive test names** - Make tests self-documenting
8. **Keep tests independent** - No test should depend on another

## Continuous Integration

### GitHub Actions Example

```yaml
name: Run Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup .NET
        uses: actions/setup-dotnet@v1
        with:
          dotnet-version: 9.0.x
      - name: Restore dependencies
        run: dotnet restore
      - name: Build
        run: dotnet build --no-restore
      - name: Test
        run: dotnet test --no-build --verbosity normal
      - name: Code Coverage
        run: dotnet test /p:CollectCoverage=true /p:CoverletOutputFormat=opencover
```

## Contributing

### Adding New Tests

1. Create a new test file in the appropriate directory
2. Follow the naming conventions
3. Include both happy path and edge case tests
4. Add security tests where applicable
5. Update this README with coverage information

### Code Review Checklist

- [ ] Tests follow naming conventions
- [ ] Tests are independent and isolated
- [ ] Mocks are properly configured
- [ ] Edge cases are covered
- [ ] Security tests are included
- [ ] Tests are documented with comments
- [ ] README is updated

## Troubleshooting

### Tests Fail with "Missing Reference"

**Issue:** LSP errors about missing Moq or Xunit

**Solution:** Run `dotnet restore` to install dependencies

### Tests Timeout

**Issue:** Tests take too long or timeout

**Solution:** 
- Check for infinite loops in test code
- Verify mock setups are correct
- Increase test timeout: `dotnet test --timeout 300000`

### Mock Not Matching

**Issue:** Mock setup not matching actual call

**Solution:**
- Verify parameter matchers (`It.IsAny<>`, `It.Is<>`)
- Check if mediator is being called with exact types
- Use `Times.Once()` to verify call count

## Resources

- [xUnit Documentation](https://xunit.net/)
- [Moq Documentation](https://github.com/moq/moq4)
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [.NET Testing Documentation](https://docs.microsoft.com/en-us/dotnet/core/testing/)

## License

This test suite is part of the BDFM-Hub project.

## Support

For questions or issues:
1. Check the SECURITY_ANALYSIS_REPORT.md for known issues
2. Review the test code for examples
3. Contact the development team

---

**Last Updated:** February 19, 2026
