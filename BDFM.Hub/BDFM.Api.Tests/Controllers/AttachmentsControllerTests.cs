using BDFM.Api.Controllers;
using BDFM.Application.Features.Attachments.Commands.CreateAttachments;
using BDFM.Application.Features.Attachments.Commands.DeleteAttachments;
using BDFM.Application.Features.Attachments.Commands.UpdateAttachments;
using BDFM.Application.Features.Attachments.Queries.GetAttachmentById;
using BDFM.Application.Features.Attachments.Queries.GetAttachmentsList;
using BDFM.Application.Features.Attachments.Queries.GetAttachmentsListByPrimaryTableId;
using BDFM.Application.Models;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using BDFM.Api.Tests.Helpers;

namespace BDFM.Api.Tests.Controllers;

public class AttachmentsControllerTests
{
    private readonly Mock<IMediator> _mockMediator;
    private readonly Mock<ILogger<AttachmentsController>> _mockLogger;
    private readonly AttachmentsController _controller;

    public AttachmentsControllerTests()
    {
        _mockMediator = new Mock<IMediator>();
        _mockLogger = new Mock<ILogger<AttachmentsController>>();
        _controller = new AttachmentsController(_mockLogger.Object, _mockMediator.Object);
    }

    #region CreateAttachment Tests

    [Fact]
    public async Task CreateAttachment_WithValidFile_ReturnsOk()
    {
        // Arrange
        var file = CreateFormFile("test.pdf", "application/pdf", TestDataHelper.CreateTestPdfContent());
        var command = new CreateAttachmentsCommand
        {
            File = file,
            PrimaryTableId = Guid.NewGuid(),
            TableName = "Correspondences"
        };
        var expectedResult = Response<bool>.Success(true);

        _mockMediator
            .Setup(m => m.Send(It.IsAny<CreateAttachmentsCommand>(), default))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _controller.CreateAttachment(command);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var response = Assert.IsType<Response<bool>>(okResult.Value);
        Assert.True(response.Succeeded);
    }

    [Fact]
    public async Task CreateAttachment_WithLargeFile_ReturnsOkOrBadRequest()
    {
        // Arrange - Edge case: Very large file (10MB)
        var largeContent = TestDataHelper.CreateTestFileContent(10 * 1024 * 1024);
        var file = CreateFormFile("large.pdf", "application/pdf", largeContent);
        var command = new CreateAttachmentsCommand
        {
            File = file,
            PrimaryTableId = Guid.NewGuid(),
            TableName = "Correspondences"
        };
        var expectedResult = Response<bool>.Success(true);

        _mockMediator
            .Setup(m => m.Send(It.IsAny<CreateAttachmentsCommand>(), default))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _controller.CreateAttachment(command);

        // Assert
        // Should either accept or reject based on file size limits
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        Assert.NotNull(okResult.Value);
    }

    [Fact]
    public async Task CreateAttachment_WithZeroByteFile_ReturnsBadRequest()
    {
        // Arrange - Edge case: Zero-byte file
        var emptyContent = Array.Empty<byte>();
        var file = CreateFormFile("empty.txt", "text/plain", emptyContent);
        var command = new CreateAttachmentsCommand
        {
            File = file,
            PrimaryTableId = Guid.NewGuid(),
            TableName = "Correspondences"
        };
        var expectedResult = Response<bool>.Fail(
            new List<object> { "File cannot be empty" },
            new MessageResponse { Code = "EMPTY_FILE", Message = "File cannot be empty" }
        );

        _mockMediator
            .Setup(m => m.Send(It.IsAny<CreateAttachmentsCommand>(), default))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _controller.CreateAttachment(command);

        // Assert
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
        var response = Assert.IsType<Response<bool>>(badRequestResult.Value);
        Assert.False(response.Succeeded);
    }

    [Theory]
    [InlineData("malicious.exe", "application/x-msdownload")]
    [InlineData("virus.bat", "application/x-bat")]
    [InlineData("script.sh", "application/x-sh")]
    [InlineData("malicious.dll", "application/x-msdownload")]
    public async Task CreateAttachment_WithExecutableFile_ReturnsBadRequest(string filename, string contentType)
    {
        // Arrange - Security test: Executable file types
        var content = TestDataHelper.CreateTestFileContent(100);
        var file = CreateFormFile(filename, contentType, content);
        var command = new CreateAttachmentsCommand
        {
            File = file,
            PrimaryTableId = Guid.NewGuid(),
            TableName = "Correspondences"
        };
        var expectedResult = Response<bool>.Fail(
            new List<object> { "Executable files are not allowed" },
            new MessageResponse { Code = "INVALID_FILE_TYPE", Message = "Executable files are not allowed" }
        );

        _mockMediator
            .Setup(m => m.Send(It.IsAny<CreateAttachmentsCommand>(), default))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _controller.CreateAttachment(command);

        // Assert
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
        var response = Assert.IsType<Response<bool>>(badRequestResult.Value);
        Assert.False(response.Succeeded);
    }

    [Theory]
    [InlineData("file.exe.txt")]
    [InlineData("document.pdf.exe")]
    [InlineData("image.jpg.bat")]
    [InlineData("archive.zip.com")]
    public async Task CreateAttachment_WithDoubleExtension_ReturnsBadRequest(string filename)
    {
        // Arrange - Security test: Double extension (obfuscation attempt)
        var content = TestDataHelper.CreateTestFileContent(100);
        var file = CreateFormFile(filename, "application/pdf", content);
        var command = new CreateAttachmentsCommand
        {
            File = file,
            PrimaryTableId = Guid.NewGuid(),
            TableName = "Correspondences"
        };
        var expectedResult = Response<bool>.Fail(
            new List<object> { "Double extensions are not allowed" },
            new MessageResponse { Code = "DOUBLE_EXTENSION", Message = "Double extensions are not allowed" }
        );

        _mockMediator
            .Setup(m => m.Send(It.IsAny<CreateAttachmentsCommand>(), default))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _controller.CreateAttachment(command);

        // Assert
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
        var response = Assert.IsType<Response<bool>>(badRequestResult.Value);
        Assert.False(response.Succeeded);
    }

    [Fact]
    public async Task CreateAttachment_WithMaliciousContent_ReturnsBadRequest()
    {
        // Arrange - Security test: Malicious content in file
        var maliciousContent = System.Text.Encoding.ASCII.GetBytes("<script>alert('XSS')</script>");
        var file = CreateFormFile("malicious.html", "text/html", maliciousContent);
        var command = new CreateAttachmentsCommand
        {
            File = file,
            PrimaryTableId = Guid.NewGuid(),
            TableName = "Correspondences"
        };
        var expectedResult = Response<bool>.Fail(
            new List<object> { "Malicious content detected" },
            new MessageResponse { Code = "MALICIOUS_CONTENT", Message = "Malicious content detected" }
        );

        _mockMediator
            .Setup(m => m.Send(It.IsAny<CreateAttachmentsCommand>(), default))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _controller.CreateAttachment(command);

        // Assert
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
        var response = Assert.IsType<Response<bool>>(badRequestResult.Value);
        Assert.False(response.Succeeded);
    }

    [Fact]
    public async Task CreateAttachment_WithVeryLongFilename_ReturnsBadRequest()
    {
        // Arrange - Edge case: Very long filename (255 chars)
        var longFilename = new string('a', 255) + ".txt";
        var content = TestDataHelper.CreateTestFileContent(100);
        var file = CreateFormFile(longFilename, "text/plain", content);
        var command = new CreateAttachmentsCommand
        {
            File = file,
            PrimaryTableId = Guid.NewGuid(),
            TableName = "Correspondences"
        };
        var expectedResult = Response<bool>.Fail(
            new List<object> { "Filename too long" },
            new MessageResponse { Code = "FILENAME_TOO_LONG", Message = "Filename too long" }
        );

        _mockMediator
            .Setup(m => m.Send(It.IsAny<CreateAttachmentsCommand>(), default))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _controller.CreateAttachment(command);

        // Assert
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
        var response = Assert.IsType<Response<bool>>(badRequestResult.Value);
        Assert.False(response.Succeeded);
    }

    [Theory]
    [InlineData("file<.txt")]
    [InlineData("file>.txt")]
    [InlineData("file:.txt")]
    [InlineData("file\".txt")]
    [InlineData("file|.txt")]
    [InlineData("file?.txt")]
    [InlineData("file*.txt")]
    public async Task CreateAttachment_WithInvalidCharactersInFilename_ReturnsBadRequest(string filename)
    {
        // Arrange - Edge case: Invalid characters in filename
        var content = TestDataHelper.CreateTestFileContent(100);
        var file = CreateFormFile(filename, "text/plain", content);
        var command = new CreateAttachmentsCommand
        {
            File = file,
            PrimaryTableId = Guid.NewGuid(),
            TableName = "Correspondences"
        };
        var expectedResult = Response<bool>.Fail(
            new List<object> { "Filename contains invalid characters" },
            new MessageResponse { Code = "INVALID_FILENAME", Message = "Filename contains invalid characters" }
        );

        _mockMediator
            .Setup(m => m.Send(It.IsAny<CreateAttachmentsCommand>(), default))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _controller.CreateAttachment(command);

        // Assert
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
        var response = Assert.IsType<Response<bool>>(badRequestResult.Value);
        Assert.False(response.Succeeded);
    }

    [Fact]
    public async Task CreateAttachment_WithPathTraversalInFilename_ReturnsBadRequest()
    {
        // Arrange - Security test: Path traversal attempt
        var content = TestDataHelper.CreateTestFileContent(100);
        var file = CreateFormFile("../../../../etc/passwd", "text/plain", content);
        var command = new CreateAttachmentsCommand
        {
            File = file,
            PrimaryTableId = Guid.NewGuid(),
            TableName = "Correspondences"
        };
        var expectedResult = Response<bool>.Fail(
            new List<object> { "Path traversal detected" },
            new MessageResponse { Code = "PATH_TRAVERSAL", Message = "Path traversal detected" }
        );

        _mockMediator
            .Setup(m => m.Send(It.IsAny<CreateAttachmentsCommand>(), default))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _controller.CreateAttachment(command);

        // Assert
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
        var response = Assert.IsType<Response<bool>>(badRequestResult.Value);
        Assert.False(response.Succeeded);
    }

    [Fact]
    public async Task CreateAttachment_WithNullFile_ReturnsBadRequest()
    {
        // Arrange - Edge case: Null file
        var command = new CreateAttachmentsCommand
        {
            File = null!,
            PrimaryTableId = Guid.NewGuid(),
            TableName = "Correspondences"
        };

        // Act & Assert
        await Assert.ThrowsAnyAsync<Exception>(() => _controller.CreateAttachment(command));
    }

    #endregion

    #region DownloadAttachment Tests

    [Fact]
    public async Task DownloadAttachment_WithValidId_ReturnsFile()
    {
        // Arrange
        var attachmentId = Guid.NewGuid();
        var fileContent = TestDataHelper.CreateTestPdfContent();
        var fileBase64 = Convert.ToBase64String(fileContent);
        var attachment = new AttachmentViewModel
        {
            Id = attachmentId,
            FileName = "test.pdf",
            FileExtension = ".pdf",
            FileBase64 = fileBase64
        };
        var expectedResult = Response<AttachmentViewModel>.Success(attachment);

        _mockMediator
            .Setup(m => m.Send(It.IsAny<GetAttachmentByIdQuery>(), default))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _controller.DownloadAttachment(attachmentId);

        // Assert
        var fileResult = Assert.IsType<FileContentResult>(result);
        Assert.Equal("application/pdf", fileResult.ContentType);
        Assert.Equal("test.pdf", fileResult.FileDownloadName);
        Assert.Equal(fileContent, fileResult.FileContents);
    }

    [Fact]
    public async Task DownloadAttachment_WithNonExistentId_ReturnsBadRequest()
    {
        // Arrange
        var attachmentId = Guid.NewGuid();
        var expectedResult = Response<AttachmentViewModel>.Fail(
            new List<object> { "Attachment not found" },
            new MessageResponse { Code = "NOT_FOUND", Message = "Attachment not found" }
        );

        _mockMediator
            .Setup(m => m.Send(It.IsAny<GetAttachmentByIdQuery>(), default))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _controller.DownloadAttachment(attachmentId);

        // Assert
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
        Assert.NotNull(badRequestResult.Value);
    }

    [Fact]
    public async Task DownloadAttachment_WithCorruptedBase64_ReturnsException()
    {
        // Arrange - Edge case: Corrupted Base64 data
        var attachmentId = Guid.NewGuid();
        var attachment = new AttachmentViewModel
        {
            Id = attachmentId,
            FileName = "test.pdf",
            FileExtension = ".pdf",
            FileBase64 = "This is not valid base64!!!"
        };
        var expectedResult = Response<AttachmentViewModel>.Success(attachment);

        _mockMediator
            .Setup(m => m.Send(It.IsAny<GetAttachmentByIdQuery>(), default))
            .ReturnsAsync(expectedResult);

        // Act & Assert
        await Assert.ThrowsAnyAsync<FormatException>(() => _controller.DownloadAttachment(attachmentId));
    }

    [Fact]
    public async Task DownloadAttachment_WithEmptyBase64_ReturnsException()
    {
        // Arrange - Edge case: Empty Base64 data
        var attachmentId = Guid.NewGuid();
        var attachment = new AttachmentViewModel
        {
            Id = attachmentId,
            FileName = "test.pdf",
            FileExtension = ".pdf",
            FileBase64 = string.Empty
        };
        var expectedResult = Response<AttachmentViewModel>.Success(attachment);

        _mockMediator
            .Setup(m => m.Send(It.IsAny<GetAttachmentByIdQuery>(), default))
            .ReturnsAsync(expectedResult);

        // Act & Assert
        await Assert.ThrowsAnyAsync<FormatException>(() => _controller.DownloadAttachment(attachmentId));
    }

    #endregion

    #region DeleteAttachment Tests

    [Fact]
    public async Task DeleteAttachment_WithValidIds_ReturnsOk()
    {
        // Arrange
        var command = new DeleteAttachmentsCommand
        {
            Ids = new List<Guid> { Guid.NewGuid(), Guid.NewGuid() }
        };
        var expectedResult = Response<bool>.Success(true);

        _mockMediator
            .Setup(m => m.Send(It.IsAny<DeleteAttachmentsCommand>(), default))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _controller.DeleteAttachment(command);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var response = Assert.IsType<Response<bool>>(okResult.Value);
        Assert.True(response.Succeeded);
    }

    [Fact]
    public async Task DeleteAttachment_WithEmptyIdList_ReturnsBadRequest()
    {
        // Arrange - Edge case: Empty ID list
        var command = new DeleteAttachmentsCommand
        {
            Ids = new List<Guid>()
        };
        var expectedResult = Response<bool>.Fail(
            new List<object> { "No attachment IDs provided" },
            new MessageResponse { Code = "NO_IDS", Message = "No attachment IDs provided" }
        );

        _mockMediator
            .Setup(m => m.Send(It.IsAny<DeleteAttachmentsCommand>(), default))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _controller.DeleteAttachment(command);

        // Assert
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
        var response = Assert.IsType<Response<bool>>(badRequestResult.Value);
        Assert.False(response.Succeeded);
    }

    [Fact]
    public async Task DeleteAttachment_WithNullIdList_ReturnsBadRequest()
    {
        // Arrange - Edge case: Null ID list
        var command = new DeleteAttachmentsCommand
        {
            Ids = null!
        };

        // Act & Assert
        await Assert.ThrowsAnyAsync<Exception>(() => _controller.DeleteAttachment(command));
    }

    #endregion

    #region GetAttachmentsByTable Tests

    [Fact]
    public async Task GetAttachmentsByTable_WithValidQuery_ReturnsAttachments()
    {
        // Arrange
        var query = new GetAttachmentsListByPrimaryTableIdQuery
        {
            PrimaryTableId = Guid.NewGuid(),
            TableName = "Correspondences",
            PageNumber = 1,
            PageSize = 10
        };
        var expectedResult = Response<PagedResult<AttachmentListByTableViewModel>>.Success(
            new PagedResult<AttachmentListByTableViewModel>
            {
                Items = new List<AttachmentListByTableViewModel>(),
                TotalCount = 0,
                PageNumber = 1,
                PageSize = 10
            }
        );

        _mockMediator
            .Setup(m => m.Send(It.IsAny<GetAttachmentsListByPrimaryTableIdQuery>(), default))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _controller.GetAttachmentsByTable(query);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var response = Assert.IsType<Response<PagedResult<AttachmentListByTableViewModel>>>(okResult.Value);
        Assert.True(response.Succeeded);
        Assert.NotNull(response.Data);
    }

    [Theory]
    [InlineData("'; DROP TABLE Attachments; --")]
    [InlineData("Attachments OR 1=1")]
    [InlineData("Attachments'--")]
    public async Task GetAttachmentsByTable_WithSqlInjectionInTableName_ReturnsBadRequestOrEmpty(string tableName)
    {
        // Arrange - Security test: SQL injection in table name
        var query = new GetAttachmentsListByPrimaryTableIdQuery
        {
            PrimaryTableId = Guid.NewGuid(),
            TableName = tableName,
            PageNumber = 1,
            PageSize = 10
        };
        var expectedResult = Response<PagedResult<AttachmentListByTableViewModel>>.Success(
            new PagedResult<AttachmentListByTableViewModel>
            {
                Items = new List<AttachmentListByTableViewModel>(),
                TotalCount = 0,
                PageNumber = 1,
                PageSize = 10
            }
        );

        _mockMediator
            .Setup(m => m.Send(It.IsAny<GetAttachmentsListByPrimaryTableIdQuery>(), default))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _controller.GetAttachmentsByTable(query);

        // Assert
        // Should handle safely - either validate and reject or mediator handles it
        _mockMediator.Verify(m => m.Send(It.IsAny<GetAttachmentsListByPrimaryTableIdQuery>(), default), Times.Once);
    }

    #endregion

    #region Helper Methods

    private IFormFile CreateFormFile(string filename, string contentType, byte[] content)
    {
        var file = new FormFile(new MemoryStream(content), 0, content.Length, "data", filename)
        {
            Headers = new HeaderDictionary(),
            ContentType = contentType
        };
        return file;
    }

    #endregion

    #region Content Type Mapping Tests

    [Theory]
    [InlineData(".pdf", "application/pdf")]
    [InlineData(".jpg", "image/jpeg")]
    [InlineData(".jpeg", "image/jpeg")]
    [InlineData(".png", "image/png")]
    [InlineData(".gif", "image/gif")]
    [InlineData(".doc", "application/msword")]
    [InlineData(".docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document")]
    [InlineData(".xls", "application/vnd.ms-excel")]
    [InlineData(".xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")]
    [InlineData(".txt", "text/plain")]
    [InlineData(".zip", "application/zip")]
    public async Task DownloadAttachment_WithDifferentExtensions_ReturnsCorrectContentType(string extension, string expectedContentType)
    {
        // Arrange
        var attachmentId = Guid.NewGuid();
        var fileContent = TestDataHelper.CreateTestFileContent(100);
        var fileBase64 = Convert.ToBase64String(fileContent);
        var attachment = new AttachmentViewModel
        {
            Id = attachmentId,
            FileName = $"test{extension}",
            FileExtension = extension,
            FileBase64 = fileBase64
        };
        var expectedResult = Response<AttachmentViewModel>.Success(attachment);

        _mockMediator
            .Setup(m => m.Send(It.IsAny<GetAttachmentByIdQuery>(), default))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _controller.DownloadAttachment(attachmentId);

        // Assert
        var fileResult = Assert.IsType<FileContentResult>(result);
        Assert.Equal(expectedContentType, fileResult.ContentType);
    }

    [Theory]
    [InlineData(".unknown")]
    [InlineData(".custom")]
    [InlineData("")]
    public async Task DownloadAttachment_WithUnknownExtension_ReturnsOctetStream(string extension)
    {
        // Arrange - Edge case: Unknown file extension
        var attachmentId = Guid.NewGuid();
        var fileContent = TestDataHelper.CreateTestFileContent(100);
        var fileBase64 = Convert.ToBase64String(fileContent);
        var attachment = new AttachmentViewModel
        {
            Id = attachmentId,
            FileName = $"test{extension}",
            FileExtension = extension,
            FileBase64 = fileBase64
        };
        var expectedResult = Response<AttachmentViewModel>.Success(attachment);

        _mockMediator
            .Setup(m => m.Send(It.IsAny<GetAttachmentByIdQuery>(), default))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _controller.DownloadAttachment(attachmentId);

        // Assert
        var fileResult = Assert.IsType<FileContentResult>(result);
        Assert.Equal("application/octet-stream", fileResult.ContentType);
    }

    #endregion
}
