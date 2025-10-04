using BDFM.Application.Features.Utility.BaseUtility.Command.Update;
using BDFM.Domain.Entities.Core;
using BDFM.Domain.Models;
using Newtonsoft.Json;

namespace BDFM.Application.Features.Attachments.Commands.UpdateAttachments
{
    public class UpdateAttachmentsCommandHandler : UpdateHandler<Attachment, UpdateAttachmentsCommand>, IRequestHandler<UpdateAttachmentsCommand, Response<bool>>
    {
        private readonly IStorageService _storageService;
        private byte[] _key;
        private byte[] _iv;

        public UpdateAttachmentsCommandHandler(IBaseRepository<Attachment> repository, IStorageService storageService) : base(repository)
        {
            _storageService = storageService ?? throw new ArgumentNullException(nameof(storageService));
            _key = new byte[32];
            _iv = new byte[16];
        }

        public override Expression<Func<Attachment, bool>> EntityPredicate(UpdateAttachmentsCommand request)
        {
            return x => x.Id == request.Id && !x.IsDeleted;
        }

        public async Task<Response<bool>> Handle(UpdateAttachmentsCommand request, CancellationToken cancellationToken)
        {
            // Check if attachment exists
            var existingAttachment = await _repository.Find(
                EntityPredicate(request),
                cancellationToken: cancellationToken);

            if (existingAttachment == null)
                return ErrorsMessage.NotFoundData.ToErrorMessage(false);

            // If a new file is provided, upload it and generate new encryption keys
            if (request.File != null)
            {
                (_key, _iv) = _storageService.UploadFileAsync(
                    await request.File.ConvertIFormFileToByteArray(),
                    $"{request.Id}{request.File.GetFileExtension()}",
                    request.LastUpdateBy.ToString());

                // Update file-related properties in the command
                request.FileName = request.File.Name;
                request.FileExtension = request.File.GetFileExtension();
                request.FileSize = request.File.Length;

                // Update Secret with new encryption keys
                request.Secret = JsonConvert.SerializeObject(new AttachmentSetting { Key = _key, IV = _iv });
            }
            else
            {
                // If no new file provided, keep existing encryption keys and other file properties
                if (!string.IsNullOrEmpty(existingAttachment.Secret))
                {
                    try
                    {
                        var existingSettings = JsonConvert.DeserializeObject<AttachmentSetting>(existingAttachment.Secret);
                        if (existingSettings != null)
                        {
                            _key = existingSettings.Key;
                            _iv = existingSettings.IV;
                            request.Secret = existingAttachment.Secret; // Keep existing secret
                        }
                    }
                    catch
                    {
                        // If deserialization fails, generate new keys
                        _key = new byte[32];
                        _iv = new byte[16];
                        request.Secret = JsonConvert.SerializeObject(new AttachmentSetting { Key = _key, IV = _iv });
                    }
                }
                else
                {
                    // Generate new secret if it doesn't exist
                    request.Secret = JsonConvert.SerializeObject(new AttachmentSetting { Key = _key, IV = _iv });
                }

                // Keep existing file properties if not provided
                if (string.IsNullOrEmpty(request.FileName))
                    request.FileName = existingAttachment.FileName;
                if (string.IsNullOrEmpty(request.FileExtension))
                    request.FileExtension = existingAttachment.FileExtension;
                if (string.IsNullOrEmpty(request.FilePath))
                    request.FilePath = existingAttachment.FilePath;
                if (!request.FileSize.HasValue)
                    request.FileSize = existingAttachment.FileSize;
            }

            return await HandleBase(request, cancellationToken);
        }
    }
}
