using BDFM.Domain.Entities.Core;
using BDFM.Domain.Models;
using Newtonsoft.Json;

namespace BDFM.Application.Features.Attachments.Queries.GetAttachmentById
{
    public class GetAttachmentByIdQueryHandler : IRequestHandler<GetAttachmentByIdQuery, Response<AttachmentViewModel>>
    {
        private readonly IBaseRepository<Attachment> _repositoryAttachment;
        private readonly IBaseRepository<User> _userRepository;
        private readonly IStorageService _storageService;
        public GetAttachmentByIdQueryHandler(IBaseRepository<Attachment> repositoryAttachment, IStorageService storageService, IBaseRepository<User> userRepository)
        {
            _storageService = storageService ?? throw new ArgumentNullException(nameof(storageService));
            _repositoryAttachment = repositoryAttachment ?? throw new ArgumentNullException(nameof(repositoryAttachment));
            _userRepository = userRepository ?? throw new ArgumentNullException(nameof(userRepository));
        }

        public async Task<Response<AttachmentViewModel>> Handle(GetAttachmentByIdQuery request, CancellationToken cancellationToken)
        {
            var result = await _repositoryAttachment.Find(z => z.Id == request.Id && z.IsDeleted == false, cancellationToken: cancellationToken);
            if (result == null)
                return ErrorsMessage.NotFoundData.ToErrorMessage<AttachmentViewModel>(null!);

            var secret = JsonConvert.DeserializeObject<AttachmentSetting>(result.Secret!);
            var getFile = _storageService.DownloadFile($"{result.Id}{result.FileExtension}", request.Id.ToString(), secret!.Key, secret.IV);

            return SuccessMessage.Get.ToSuccessMessage(new AttachmentViewModel()
            {
                FileBase64 = getFile.ToBase64(),
                Id = result.Id,
                PrimaryTableId = result.PrimaryTableId,
                TableName = result.TableName,
                TableNameDisplay = result.TableName.GetDisplayName(),
                Description = result.Description,
                FileName = result.FileName,
                FilePath = result.FilePath,
                FileExtension = result.FileExtension,
                FileSize = result.FileSize,
                OcrText = result.OcrText,
                StatusId = (int)result.StatusId,
                StatusName = result.StatusId.GetDisplayName(),
                CreateAt = result.CreateAt,
                CreateBy = result.CreateBy,
                CreateByName = _userRepository.Query().Where(x => x.Id == result.CreateBy).Select(x => x.FullName).FirstOrDefault() ?? string.Empty,
                LastUpdateAt = result.LastUpdateAt,
                LastUpdateBy = result.LastUpdateBy,
                LastUpdateByName = _userRepository.Query().Where(x => x.Id == result.LastUpdateBy).Select(x => x.FullName).FirstOrDefault() ?? string.Empty
            });
        }
    }
}
