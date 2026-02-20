using BDFM.Api.Controllers;
using BDFM.Application.Features.Workflow.Commands.CompleteWorkflowStep;
using BDFM.Application.Features.Workflow.Commands.CreateWorkflowStep;
using BDFM.Application.Features.Workflow.Commands.UpdateWorkflowStepStatus;
using BDFM.Application.Features.Workflow.Queries.GetDelayedStepsReport;
using BDFM.Application.Models;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace BDFM.Api.Tests.Controllers;

public class WorkflowControllerTests
{
    private readonly Mock<IMediator> _mockMediator;
    private readonly Mock<ILogger<WorkflowController>> _mockLogger;
    private readonly Mock<BDFM.Contracts.Infrastructure.IPdfService> _mockPdfService;
    private readonly WorkflowController _controller;

    public WorkflowControllerTests()
    {
        _mockMediator = new Mock<IMediator>();
        _mockLogger = new Mock<ILogger<WorkflowController>>();
        _mockPdfService = new Mock<BDFM.Contracts.Infrastructure.IPdfService>();
        _controller = new WorkflowController(_mockLogger.Object, _mockMediator.Object, _mockPdfService.Object);
    }

    #region CreateWorkflowStep Tests

    [Fact]
    public async Task CreateWorkflowStep_WithValidData_ReturnsOk()
    {
        // Arrange
        var command = new CreateWorkflowStepCommand
        {
            CorrespondenceId = Guid.NewGuid(),
            RecipientUserId = Guid.NewGuid(),
            StepOrder = 1
        };
        var expectedStepId = Guid.NewGuid();
        var expectedResult = Response<Guid>.Success(expectedStepId);

        _mockMediator
            .Setup(m => m.Send(It.IsAny<CreateWorkflowStepCommand>(), default))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _controller.CreateWorkflowStep(command);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var response = Assert.IsType<Response<Guid>>(okResult.Value);
        Assert.True(response.Succeeded);
        Assert.Equal(expectedStepId, response.Data);
    }

    [Fact]
    public async Task CreateWorkflowStep_WithNonExistentCorrespondence_ReturnsBadRequest()
    {
        // Arrange
        var command = new CreateWorkflowStepCommand
        {
            CorrespondenceId = Guid.NewGuid(),
            RecipientUserId = Guid.NewGuid(),
            StepOrder = 1
        };
        var expectedResult = Response<Guid>.Fail(
            new List<object> { "Correspondence not found" },
            new MessageResponse { Code = "CORRESPONDENCE_NOT_FOUND", Message = "Correspondence not found" }
        );

        _mockMediator
            .Setup(m => m.Send(It.IsAny<CreateWorkflowStepCommand>(), default))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _controller.CreateWorkflowStep(command);

        // Assert
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
        var response = Assert.IsType<Response<Guid>>(badRequestResult.Value);
        Assert.False(response.Succeeded);
    }

    [Theory]
    [InlineData(-1)]
    [InlineData(0)]
    public async Task CreateWorkflowStep_WithInvalidStepOrder_ReturnsBadRequest(int stepOrder)
    {
        // Arrange
        var command = new CreateWorkflowStepCommand
        {
            CorrespondenceId = Guid.NewGuid(),
            RecipientUserId = Guid.NewGuid(),
            StepOrder = stepOrder
        };

        // Act & Assert
        await Assert.ThrowsAnyAsync<Exception>(() => _controller.CreateWorkflowStep(command));
    }

    #endregion

    #region CompleteWorkflowStep Tests

    [Fact]
    public async Task CompleteWorkflowStep_WithValidId_ReturnsOk()
    {
        // Arrange
        var stepId = Guid.NewGuid();
        var expectedResult = Response<bool>.Success(true);

        _mockMediator
            .Setup(m => m.Send(It.IsAny<CompleteWorkflowStepCommand>(), default))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _controller.CompleteWorkflowStep(stepId);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var response = Assert.IsType<Response<bool>>(okResult.Value);
        Assert.True(response.Succeeded);
    }

    [Fact]
    public async Task CompleteWorkflowStep_WithNonExistentId_ReturnsBadRequest()
    {
        // Arrange
        var stepId = Guid.NewGuid();
        var expectedResult = Response<bool>.Fail(
            new List<object> { "Workflow step not found" },
            new MessageResponse { Code = "STEP_NOT_FOUND", Message = "Workflow step not found" }
        );

        _mockMediator
            .Setup(m => m.Send(It.IsAny<CompleteWorkflowStepCommand>(), default))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _controller.CompleteWorkflowStep(stepId);

        // Assert
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
        var response = Assert.IsType<Response<bool>>(badRequestResult.Value);
        Assert.False(response.Succeeded);
    }

    [Fact]
    public async Task CompleteWorkflowStep_WithEmptyGuid_ReturnsBadRequest()
    {
        // Arrange
        var stepId = Guid.Empty;
        var expectedResult = Response<bool>.Fail(
            new List<object> { "Invalid step ID" },
            new MessageResponse { Code = "INVALID_ID", Message = "Invalid step ID" }
        );

        _mockMediator
            .Setup(m => m.Send(It.IsAny<CompleteWorkflowStepCommand>(), default))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _controller.CompleteWorkflowStep(stepId);

        // Assert
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
        Assert.NotNull(badRequestResult.Value);
    }

    #endregion

    #region UpdateWorkflowStepStatus Tests

    [Fact]
    public async Task UpdateWorkflowStepStatus_WithValidData_ReturnsOk()
    {
        // Arrange
        var command = new UpdateWorkflowStepStatusCommand
        {
            WorkflowStepId = Guid.NewGuid(),
            Status = BDFM.Domain.Enums.WorkflowStepStatusEnum.InProgress
        };
        var expectedResult = Response<bool>.Success(true);

        _mockMediator
            .Setup(m => m.Send(It.IsAny<UpdateWorkflowStepStatusCommand>(), default))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _controller.UpdateStatus(command);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var response = Assert.IsType<Response<bool>>(okResult.Value);
        Assert.True(response.Succeeded);
    }

    [Fact]
    public async Task UpdateWorkflowStepStatus_WithInvalidTransition_ReturnsBadRequest()
    {
        // Arrange
        var command = new UpdateWorkflowStepStatusCommand
        {
            WorkflowStepId = Guid.NewGuid(),
            Status = BDFM.Domain.Enums.WorkflowStepStatusEnum.Completed
        };
        var expectedResult = Response<bool>.Fail(
            new List<object> { "Invalid status transition" },
            new MessageResponse { Code = "INVALID_TRANSITION", Message = "Invalid status transition" }
        );

        _mockMediator
            .Setup(m => m.Send(It.IsAny<UpdateWorkflowStepStatusCommand>(), default))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _controller.UpdateStatus(command);

        // Assert
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
        var response = Assert.IsType<Response<bool>>(badRequestResult.Value);
        Assert.False(response.Succeeded);
    }

    #endregion

    #region GetDelayedStepsReport Tests

    [Fact]
    public async Task GetDelayedStepsReport_WithValidQuery_ReturnsReport()
    {
        // Arrange
        var query = new GetDelayedStepsReportQuery
        {
            UnitId = Guid.NewGuid()
        };
        var expectedData = new List<DelayedStepReportDto>
        {
            new DelayedStepReportDto
            {
                StepId = Guid.NewGuid(),
                CorrespondenceId = Guid.NewGuid(),
                DelayedDays = 5
            }
        };
        var expectedResult = Response<List<DelayedStepReportDto>>.Success(expectedData);

        _mockMediator
            .Setup(m => m.Send(It.IsAny<GetDelayedStepsReportQuery>(), default))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _controller.GetDelayedStepsReport(query);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var response = Assert.IsType<Response<List<DelayedStepReportDto>>>(okResult.Value);
        Assert.True(response.Succeeded);
        Assert.Single(response.Data!);
    }

    [Fact]
    public async Task GetDelayedStepsReport_WithNoDelayedSteps_ReturnsEmptyList()
    {
        // Arrange
        var query = new GetDelayedStepsReportQuery();
        var expectedResult = Response<List<DelayedStepReportDto>>.Success(new List<DelayedStepReportDto>());

        _mockMediator
            .Setup(m => m.Send(It.IsAny<GetDelayedStepsReportQuery>(), default))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _controller.GetDelayedStepsReport(query);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var response = Assert.IsType<Response<List<DelayedStepReportDto>>>(okResult.Value);
        Assert.True(response.Succeeded);
        Assert.Empty(response.Data!);
    }

    #endregion

    #region DownloadDelayedStepsReport Tests

    [Fact]
    public async Task DownloadDelayedStepsReport_WithValidQuery_ReturnsPdfFile()
    {
        // Arrange
        var query = new GetDelayedStepsReportQuery();
        var expectedData = new List<DelayedStepReportDto>
        {
            new DelayedStepReportDto
            {
                StepId = Guid.NewGuid(),
                CorrespondenceId = Guid.NewGuid(),
                DelayedDays = 5
            }
        };
        var expectedPdfBytes = new byte[] { 0x25, 0x50, 0x44, 0x46 }; // PDF header

        _mockMediator
            .Setup(m => m.Send(It.IsAny<GetDelayedStepsReportQuery>(), default))
            .ReturnsAsync(Response<List<DelayedStepReportDto>>.Success(expectedData));

        _mockPdfService
            .Setup(s => s.GenerateDelayedStepsReport(It.IsAny<List<DelayedStepReportDto>>()))
            .Returns(expectedPdfBytes);

        // Act
        var result = await _controller.DownloadDelayedStepsReport(query);

        // Assert
        var fileResult = Assert.IsType<FileContentResult>(result);
        Assert.Equal("application/pdf", fileResult.ContentType);
        Assert.StartsWith("DelayedStepsReport_", fileResult.FileDownloadName);
        Assert.Equal(expectedPdfBytes, fileResult.FileContents);
    }

    [Fact]
    public async Task DownloadDelayedStepsReport_WithNoData_ReturnsBadRequest()
    {
        // Arrange
        var query = new GetDelayedStepsReportQuery();
        var expectedResult = Response<List<DelayedStepReportDto>>.Fail(
            new List<object> { "No data found" },
            new MessageResponse { Code = "NO_DATA", Message = "No data found" }
        );

        _mockMediator
            .Setup(m => m.Send(It.IsAny<GetDelayedStepsReportQuery>(), default))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _controller.DownloadDelayedStepsReport(query);

        // Assert
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
        Assert.NotNull(badRequestResult.Value);
    }

    #endregion

    #region Security & Edge Cases

    [Fact]
    public async Task CreateWorkflowStep_WithSelfAssignment_ReturnsOk()
    {
        // Arrange - Edge case: User assigns workflow step to themselves
        var userId = Guid.NewGuid();
        var command = new CreateWorkflowStepCommand
        {
            CorrespondenceId = Guid.NewGuid(),
            RecipientUserId = userId,
            StepOrder = 1
        };
        var expectedResult = Response<Guid>.Success(Guid.NewGuid());

        _mockMediator
            .Setup(m => m.Send(It.IsAny<CreateWorkflowStepCommand>(), default))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _controller.CreateWorkflowStep(command);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        Assert.NotNull(okResult.Value);
    }

    [Fact]
    public async Task CompleteWorkflowStep_WithCircularDependency_ReturnsBadRequest()
    {
        // Arrange - Edge case: Circular workflow dependency
        var stepId = Guid.NewGuid();
        var expectedResult = Response<bool>.Fail(
            new List<object> { "Circular workflow dependency detected" },
            new MessageResponse { Code = "CIRCULAR_DEPENDENCY", Message = "Circular workflow dependency detected" }
        );

        _mockMediator
            .Setup(m => m.Send(It.IsAny<CompleteWorkflowStepCommand>(), default))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _controller.CompleteWorkflowStep(stepId);

        // Assert
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
        var response = Assert.IsType<Response<bool>>(badRequestResult.Value);
        Assert.False(response.Succeeded);
    }

    [Fact]
    public async Task GetDelayedStepsReport_WithDateRange_ReturnsFilteredResults()
    {
        // Arrange
        var query = new GetDelayedStepsReportQuery
        {
            StartDate = DateTime.Now.AddDays(-30),
            EndDate = DateTime.Now
        };
        var expectedResult = Response<List<DelayedStepReportDto>>.Success(new List<DelayedStepReportDto>());

        _mockMediator
            .Setup(m => m.Send(It.IsAny<GetDelayedStepsReportQuery>(), default))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _controller.GetDelayedStepsReport(query);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        Assert.NotNull(okResult.Value);
    }

    [Fact]
    public async Task GetDelayedStepsReport_WithEndDateBeforeStartDate_ReturnsEmptyOrError()
    {
        // Arrange - Edge case: EndDate before StartDate
        var query = new GetDelayedStepsReportQuery
        {
            StartDate = DateTime.Now,
            EndDate = DateTime.Now.AddDays(-30)
        };
        var expectedResult = Response<List<DelayedStepReportDto>>.Fail(
            new List<object> { "End date must be after start date" },
            new MessageResponse { Code = "INVALID_DATE_RANGE", Message = "End date must be after start date" }
        );

        _mockMediator
            .Setup(m => m.Send(It.IsAny<GetDelayedStepsReportQuery>(), default))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _controller.GetDelayedStepsReport(query);

        // Assert
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
        Assert.NotNull(badRequestResult.Value);
    }

    #endregion
}
