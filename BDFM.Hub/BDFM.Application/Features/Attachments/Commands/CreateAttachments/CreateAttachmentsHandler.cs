using BDFM.Application.Exceptions;
using BDFM.Application.Features.Utility.BaseUtility.Command.Create;
using BDFM.Domain.Entities.Core;
using BDFM.Domain.Models;
using Newtonsoft.Json;

namespace BDFM.Application.Features.Attachments.Commands.CreateAttachments
{
    public class CreateAttachmentsHandler : CreateHandler<Attachment, CreateAttachmentsCommand>, IRequestHandler<CreateAttachmentsCommand, Response<bool>>
    {
        private readonly IStorageService _storageService;
        private readonly ILogger<CreateAttachmentsHandler> _logger;
        private readonly Guid _attachmentId;
        private byte[] _key = default!;
        private byte[] _iv = default!;

        public CreateAttachmentsHandler(
            IBaseRepository<Attachment> repositoryAttachments, 
            IStorageService storageService,
            ILogger<CreateAttachmentsHandler> logger) : base(repositoryAttachments)
        {
            _storageService = storageService ?? throw new ArgumentNullException(nameof(storageService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _attachmentId = Guid.NewGuid();
        }

        protected override Expression<Func<Attachment, bool>> ExistencePredicate(CreateAttachmentsCommand request) => null!;

        protected override Attachment MapToEntity(CreateAttachmentsCommand request)
        {
            try
            {
                var originalFileName = request.File?.FileName ?? "unknown";
                var fileExtension = request.File?.GetFileExtension() ?? "";
                var fileSize = request.FileSize ?? request.File?.Length ?? 0;
                var storedFileName = $"{_attachmentId}{fileExtension}";
                var filePath = $"FTPShare/{request.PrimaryTableId}/{storedFileName}";

                return new Attachment
                {
                    Id = _attachmentId,
                    PrimaryTableId = request.PrimaryTableId ?? Guid.Empty,
                    TableName = request.TableName,
                    FileName = originalFileName,
                    FilePath = filePath,
                    FileExtension = fileExtension,
                    FileSize = fileSize,
                    OcrText = request.OcrText,
                    Description = request.Description,
                    Secret = JsonConvert.SerializeObject(new AttachmentSetting { Key = _key, IV = _iv }),
                    CreateBy = request.CreateBy,
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while mapping CreateAttachmentsCommand to Attachment entity. AttachmentId: {AttachmentId}", _attachmentId);
                throw new BadRequestException($"Failed to process attachment data: {ex.Message}");
            }
        }

        public async Task<Response<bool>> Handle(CreateAttachmentsCommand request, CancellationToken cancellationToken)
        {
            if (request.File == null || request.File.Length == 0)
            {
                _logger.LogWarning("CreateAttachmentsHandler: File is null or empty. AttachmentId: {AttachmentId}", _attachmentId);
                return ErrorsMessage.FailOnCreate.ToErrorMessage(false);
            }

            try
            {
                var fileBytes = await request.File.ConvertIFormFileToByteArray();
                var extension = request.File.GetFileExtension();
                var fileName = $"{_attachmentId}{extension}";
                var bucketName = request.PrimaryTableId?.ToString() ?? "General";

                (_key, _iv) = _storageService.UploadFileAsync(fileBytes, fileName, bucketName);

                if (_key == null || _iv == null)
                {
                    _logger.LogError("File upload failed to storage. AttachmentId: {AttachmentId}", _attachmentId);
                    return ErrorsMessage.FailOnCreate.ToErrorMessage(false);
                }

                return await HandleBase(request, cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error in CreateAttachmentsHandler. Handle method. AttachmentId: {AttachmentId}", _attachmentId);
                return ErrorsMessage.FailOnCreate.ToErrorMessage(false);
            }
        }
    }
}
