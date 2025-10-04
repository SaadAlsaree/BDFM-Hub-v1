using BDFM.Application.Contracts.Identity;
using BDFM.Application.Features.Utility.BaseUtility.Command.Create;
using BDFM.Domain.Entities.Core;
using BDFM.Domain.Entities.Supporting;

namespace BDFM.Application.Features.Comments.Commands.CreateComment;

public class CreateCommentCommandHandler :
    CreateHandler<CorrespondenceComment, CreateCommentCommand>,
    IRequestHandler<CreateCommentCommand, Response<bool>>
{
    private readonly ICurrentUserService _currentUserService;
    private readonly IBaseRepository<User> _userRepository;
    private User? _currentUser;

    public CreateCommentCommandHandler(IBaseRepository<CorrespondenceComment> repository, ICurrentUserService currentUserService, IBaseRepository<User> userRepository) : base(repository)
    {
        _currentUserService = currentUserService;
        _userRepository = userRepository;
    }

    protected override Expression<Func<CorrespondenceComment, bool>> ExistencePredicate(CreateCommentCommand request)
    {
        // Comments don't need existence check as multiple comments are allowed
        return cc => false;
    }

    protected override CorrespondenceComment MapToEntity(CreateCommentCommand request)
    {
        if (_currentUser == null)
        {
            throw new UnauthorizedAccessException("User is not authenticated or user not found.");
        }

        return new CorrespondenceComment
        {
            Id = Guid.NewGuid(),
            CorrespondenceId = request.CorrespondenceId,
            Text = request.Text,
            WorkflowStepId = request.WorkflowStepId,
            ParentCommentId = request.ParentCommentId,
            Visibility = request.Visibility,
            UserId = _currentUser.Id,
            EmployeeName = _currentUser.FullName,
            UserLogin = _currentUser.UserLogin,
            IsEdited = true,
            IsDeleted = false, // Assuming new comments are not deleted
            CreateBy = _currentUser.Id,
            EmployeeUnitName = _currentUser.OrganizationalUnit?.UnitName ?? string.Empty,
            EmployeeUnitCode = _currentUser.OrganizationalUnit?.UnitCode ?? string.Empty,
        };
    }

    public async Task<Response<bool>> Handle(CreateCommentCommand request, CancellationToken cancellationToken)
    {
        // First, get current user details from database


        _currentUser = await _userRepository.Find(
            u => u.Id == _currentUserService.UserId,
            cancellationToken: cancellationToken,
            include: query => query.Include(u => u.OrganizationalUnit)!
        );


        Console.WriteLine($"Current User: {_currentUser?.FullName} ({_currentUser?.Id})");

        if (_currentUser == null)
        {
            return ErrorsMessage.NotFoundData.ToErrorMessage(false);
        }

        // Now call the base handler which will use our MapToEntity method
        return await HandleBase(request, cancellationToken);
    }
}
