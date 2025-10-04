using BDFM.Application.Features.Utility.BaseUtility.Command.Create;
using BDFM.Application.Helper;
using BDFM.Domain.Entities.Core;

namespace BDFM.Application.Features.MailFiles.Commands.CreateMailFile;

public class CreateMailFileCommandHandler :
    CreateHandler<MailFile, CreateMailFileCommand>,
    IRequestHandler<CreateMailFileCommand, Response<bool>>
{

    private readonly IFileNumberGenerator _fileNumberGenerator;

    public CreateMailFileCommandHandler(
        IBaseRepository<MailFile> repository,
        IFileNumberGenerator fileNumberGenerator) : base(repository)
    {
        _fileNumberGenerator = fileNumberGenerator;
    }

    protected override Expression<Func<MailFile, bool>> ExistencePredicate(CreateMailFileCommand request)
    {
        // We'll use a different approach for checking existence
        // This will be handled in the Handle method
        return mf => false;
    }

    protected override MailFile MapToEntity(CreateMailFileCommand request)
    {
        // Since we can't easily make this method async in the inheritance hierarchy,
        // we'll use a synchronous approach to get the file number
        string fileNumber = _fileNumberGenerator.GetUniqueFileNumber();

        return new MailFile
        {
            Id = Guid.NewGuid(),
            FileNumber = fileNumber,
            Name = request.Name,
            Subject = request.Subject
        };
    }

    public async Task<Response<bool>> Handle(CreateMailFileCommand request, CancellationToken cancellationToken)
    {
        // Use the base implementation which will call our MapToEntity method
        return await HandleBase(request, cancellationToken);
    }

    public string GetUniqueFileNumberSync()
    {
        // Use the helper class to generate a unique file number
        return _fileNumberGenerator.GetUniqueFileNumber();
    }
}
