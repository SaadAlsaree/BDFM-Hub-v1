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
        private readonly Guid _attachmentId;
        private byte[] _key;
        private byte[] _iv;
        private readonly ILogger<CreateAttachmentsHandler> _logger;
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
                // Extract file information from IFormFile
                var originalFileName = request.File?.FileName ?? "unknown";
                var fileExtension = request.File?.GetFileExtension() ?? "";
                var fileSize = request.FileSize ?? request.File?.Length ?? 0;
                var storedFileName = $"{_attachmentId}{fileExtension}";
                var filePath = $"FTPShare/{request.PrimaryTableId}/{storedFileName}";

                return new Attachment
                {
                    Id = _attachmentId,
                    PrimaryTableId = request.PrimaryTableId ?? Guid.Empty, // Handle required field
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

            (_key, _iv) = _storageService.UploadFileAsync(await request.File.ConvertIFormFileToByteArray(),
         $"{_attachmentId}{request.File.GetFileExtension()}", _attachmentId.ToString());
            return await HandleBase(request, cancellationToken);
        }
    }
}
