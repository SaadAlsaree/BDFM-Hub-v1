using BDFM.Application.Features.Correspondences.Commands.ChangeCorrespondenceStatus;
using BDFM.Application.Features.Correspondences.Commands.CreateIncomingInternal;
using BDFM.Application.Features.Correspondences.Commands.CreateMailDraft;
using BDFM.Application.Features.Correspondences.Commands.CreateOutgoingInternal;
using BDFM.Application.Features.Correspondences.Commands.CreatePublicMail;
using BDFM.Application.Features.Correspondences.Commands.LinkCorrespondences;
using BDFM.Application.Features.Correspondences.Commands.MoveCorrespondenceToTrash;
using BDFM.Application.Features.Correspondences.Commands.PermanentlyDeleteCorrespondence;
using BDFM.Application.Features.Correspondences.Commands.PostponeCorrespondence;
using BDFM.Application.Features.Correspondences.Commands.RegisterIncomingExternalMail;
using BDFM.Application.Features.Correspondences.Commands.RegisterOutgoingExternalMail;
using BDFM.Application.Features.Correspondences.Commands.RemoveAttachment;
using BDFM.Application.Features.Correspondences.Commands.RestoreCorrespondenceFromTrash;
using BDFM.Application.Features.Correspondences.Commands.ToggleStarCorrespondence;
using BDFM.Application.Features.Correspondences.Commands.UnpostponeCorrespondence;
using BDFM.Application.Features.Correspondences.Commands.UpdateCorrespondenceContent;
using BDFM.Application.Features.Correspondences.Queries.GetCorrespondenceById;
using BDFM.Application.Features.Correspondences.Queries.GetCorrespondenceIncoming;
using BDFM.Application.Features.Correspondences.Queries.GetCorrespondenceOutgoing;
using BDFM.Application.Features.Correspondences.Queries.GetIncomingInternal;
using BDFM.Application.Features.Correspondences.Queries.GetLateBooks;
using BDFM.Application.Features.Correspondences.Queries.GetLinkedCorrespondences;
using BDFM.Application.Features.Correspondences.Queries.GetOutgoingInternal;
using BDFM.Application.Features.Correspondences.Queries.GetPostponedCorrespondences;
using BDFM.Application.Features.Correspondences.Queries.GetPublicCorrespondences;
using BDFM.Application.Features.Correspondences.Queries.GetSigningList;
using BDFM.Application.Features.Correspondences.Queries.GetStarredCorrespondences;
using BDFM.Application.Features.Correspondences.Queries.GetTrashItems;
using BDFM.Application.Features.Correspondences.Queries.GetUrgentBooks;
using BDFM.Application.Features.Correspondences.Queries.GetUserDrafts;
using BDFM.Application.Features.Correspondences.Queries.GetUserInbox;
using BDFM.Application.Features.Correspondences.Queries.SearchCorrespondences;
using BDFM.Application.Features.Correspondences.Queries.GetCorrespondencesSummary;
using BDFM.Application.Features.Correspondences.Queries.CorrespondencesSummary;
using BDFM.Application.Features.Correspondences.Queries.GetPending;
using BDFM.Application.Features.Correspondences.Queries.GetProcessing;
using BDFM.Application.Features.Correspondences.Queries.GetReturnForEditing;
using BDFM.Application.Features.Correspondences.Queries.GetCompleted;
using BDFM.Application.Features.Correspondences.Queries.GetForwardedCorrespondence;
using BDFM.Application.Features.Correspondences.Queries.GetCorrespondenceAnyWorkflowNotCompleted;
using BDFM.Application.Features.Correspondences.Queries.GetCorrespondenceNotCompleted;
using BDFM.Application.Features.Correspondences.Queries.GetMyPendingOrInProgressCorrespondences;

namespace BDFM.API.Controllers.Correspondence
{
    [Route("BDFM/v1/api/[controller]/[action]")]
    [ApiController]
    [Produces("application/json")]
    [Tags("Correspondence")]
    public class CorrespondenceController : Base<CorrespondenceController>
    {
        private readonly IMediator _mediator;

        public CorrespondenceController(IMediator mediator, ILogger<CorrespondenceController> logger)
            : base(logger)
        {
            _mediator = mediator;
        }

        #region Command Endpoints

        // [HttpPost]
        // [ServiceFilter(typeof(LogActionArguments))]
        // [ProducesResponseType(typeof(Response<Guid>), StatusCodes.Status200OK)]
        // [ProducesResponseType(typeof(Response<Guid>), StatusCodes.Status400BadRequest)]
        // [Permission("Correspondence|CreateInternalMail")]
        // public async Task<ObjectResult> CreateInternalMail([FromBody] CreateInternalMailCommand command)
        // {
        //     return await Okey(() => _mediator.Send(command));
        // }

        [HttpPost]
        [ServiceFilter(typeof(LogActionArguments))]
        [ProducesResponseType(typeof(Response<Guid>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Response<Guid>), StatusCodes.Status400BadRequest)]
        [Permission("Correspondence|CreateOutgoingInternalMail")]
        public async Task<ObjectResult> CreateOutgoingInternalMail([FromBody] CreateOutgoingInternalCommand command)
        {
            return await Okey(() => _mediator.Send(command));
        }

        [HttpPost]
        [ServiceFilter(typeof(LogActionArguments))]
        [ProducesResponseType(typeof(Response<Guid>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Response<Guid>), StatusCodes.Status400BadRequest)]
        [Permission("Correspondence|CreateIncomingInternalMail")]
        public async Task<ObjectResult> CreateIncomingInternalMail([FromBody] CreateIncomingInternalCommand command)
        {
            return await Okey(() => _mediator.Send(command));
        }


        [HttpPost]
        [ServiceFilter(typeof(LogActionArguments))]
        [ProducesResponseType(typeof(Response<Guid>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Response<Guid>), StatusCodes.Status400BadRequest)]
        [Permission("Correspondence|RegisterIncomingExternalMail")]
        public async Task<ObjectResult> RegisterIncomingExternalMail([FromBody] RegisterIncomingExternalMailCommand command)
        {
            return await Okey(() => _mediator.Send(command));
        }

        [HttpPost]
        [ServiceFilter(typeof(LogActionArguments))]
        [ProducesResponseType(typeof(Response<Guid>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Response<Guid>), StatusCodes.Status400BadRequest)]
        [Permission("Correspondence|RegisterOutgoingExternalMail")]
        public async Task<ObjectResult> RegisterOutgoingExternalMail([FromBody] RegisterOutgoingExternalMailCommand command)
        {
            return await Okey(() => _mediator.Send(command));
        }

        [HttpPost]
        [ServiceFilter(typeof(LogActionArguments))]
        [ProducesResponseType(typeof(Response<Guid>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Response<Guid>), StatusCodes.Status400BadRequest)]
        [Permission("Correspondence|CreateOutgoingExternalMailDraft")]
        public async Task<ObjectResult> CreateMailDraft([FromBody] CreateMailDraftCommand command)
        {
            return await Okey(() => _mediator.Send(command));
        }

        [HttpPut]
        [ServiceFilter(typeof(LogActionArguments))]
        [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status400BadRequest)]
        [Permission("Correspondence|UpdateCorrespondenceContent")]
        public async Task<ObjectResult> UpdateCorrespondenceContent([FromBody] UpdateCorrespondenceContentCommand command)
        {
            return await Okey(() => _mediator.Send(command));
        }



        [HttpDelete]
        [ServiceFilter(typeof(LogActionArguments))]
        [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status400BadRequest)]
        [Permission("Correspondence|RemoveAttachment")]
        public async Task<ObjectResult> RemoveAttachment([FromBody] RemoveAttachmentCommand command)
        {
            return await Okey(() => _mediator.Send(command));
        }

        [HttpPost]
        [ServiceFilter(typeof(LogActionArguments))]
        [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status400BadRequest)]
        [Permission("Correspondence|LinkCorrespondences")]
        public async Task<ObjectResult> LinkCorrespondences([FromBody] LinkCorrespondencesCommand command)
        {
            return await Okey(() => _mediator.Send(command));
        }



        [HttpPut]
        [ServiceFilter(typeof(LogActionArguments))]
        [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status400BadRequest)]
        [Permission("Correspondence|ChangeCorrespondenceStatus")]
        public async Task<ObjectResult> ChangeCorrespondenceStatus([FromBody] ChangeCorrespondenceStatusCommand command)
        {
            return await Okey(() => _mediator.Send(command));
        }

        [HttpPut]
        [ServiceFilter(typeof(LogActionArguments))]
        [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status400BadRequest)]
        [Permission("Correspondence|ToggleStar")]
        public async Task<ObjectResult> ToggleStarCorrespondence([FromBody] ToggleStarCorrespondenceCommand command)
        {
            return await Okey(() => _mediator.Send(command));
        }

        [HttpPut]
        [ServiceFilter(typeof(LogActionArguments))]
        [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status400BadRequest)]
        [Permission("Correspondence|PostponeCorrespondence")]
        public async Task<ObjectResult> PostponeCorrespondence([FromBody] PostponeCorrespondenceCommand command)
        {
            return await Okey(() => _mediator.Send(command));
        }

        [HttpPut]
        [ServiceFilter(typeof(LogActionArguments))]
        [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status400BadRequest)]
        [Permission("Correspondence|UnpostponeCorrespondence")]
        public async Task<ObjectResult> UnpostponeCorrespondence([FromBody] UnpostponeCorrespondenceCommand command)
        {
            return await Okey(() => _mediator.Send(command));
        }

        [HttpPut]
        [ServiceFilter(typeof(LogActionArguments))]
        [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status400BadRequest)]
        [Permission("Correspondence|MoveToTrash")]
        public async Task<ObjectResult> MoveToTrash([FromBody] MoveCorrespondenceToTrashCommand command)
        {
            return await Okey(() => _mediator.Send(command));
        }

        [HttpPut]
        [ServiceFilter(typeof(LogActionArguments))]
        [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status400BadRequest)]
        [Permission("Correspondence|RestoreFromTrash")]
        public async Task<ObjectResult> RestoreFromTrash([FromBody] RestoreCorrespondenceFromTrashCommand command)
        {
            return await Okey(() => _mediator.Send(command));
        }

        [HttpDelete]
        [ServiceFilter(typeof(LogActionArguments))]
        [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status400BadRequest)]
        [Permission("Correspondence|PermanentlyDelete")]
        public async Task<ObjectResult> PermanentlyDelete([FromBody] PermanentlyDeleteCorrespondenceCommand command)
        {
            return await Okey(() => _mediator.Send(command));
        }

        [HttpPost]
        [ServiceFilter(typeof(LogActionArguments))]
        [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status400BadRequest)]
        [Permission("Correspondence|CreatePublicMail")]
        public async Task<ObjectResult> CreatePublicCorrespondence([FromBody] CreatePublicMailCommand command)
        {
            return await Okey(() => _mediator.Send(command));
        }






        #endregion

        #region Query Endpoints

        // Get User Inbox
        [HttpGet]
        [ServiceFilter(typeof(LogActionArguments))]
        [ProducesResponseType(typeof(Response<PagedResult<InboxItemVm>>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Response<PagedResult<InboxItemVm>>), StatusCodes.Status400BadRequest)]
        [Permission("Correspondence|GetUserInbox")]
        public async Task<ObjectResult> GetUserInbox([FromQuery] GetUserInboxQuery query)
        {
            return await Okey(() => _mediator.Send(query));
        }

        [HttpGet]
        [ServiceFilter(typeof(LogActionArguments))]
        [ProducesResponseType(typeof(Response<PagedResult<OutgoingInternalVm>>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Response<PagedResult<OutgoingInternalVm>>), StatusCodes.Status400BadRequest)]
        [Permission("Correspondence|GetUserInbox")]
        public async Task<ObjectResult> GetOutgoingInternal([FromQuery] GetOutgoingInternalQuery query)
        {
            return await Okey(() => _mediator.Send(query));
        }

        [HttpGet]
        [ServiceFilter(typeof(LogActionArguments))]
        [ProducesResponseType(typeof(Response<PagedResult<IncomingInternalVm>>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Response<PagedResult<IncomingInternalVm>>), StatusCodes.Status400BadRequest)]
        [Permission("Correspondence|GetUserInbox")]
        public async Task<ObjectResult> GetIncomingInternal([FromQuery] GetIncomingInternalQuery query)
        {
            return await Okey(() => _mediator.Send(query));
        }


        // get correspondence is trash
        [HttpGet]
        [ServiceFilter(typeof(LogActionArguments))]
        [ProducesResponseType(typeof(Response<PagedResult<TrashItemVm>>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Response<PagedResult<TrashItemVm>>), StatusCodes.Status400BadRequest)]
        [Permission("Correspondence|GetUserInbox")]
        public async Task<ObjectResult> GetTrashItems([FromQuery] GetTrashItemsQuery query)
        {
            return await Okey(() => _mediator.Send(query));
        }

        // get correspondence is starred
        [HttpGet]
        [ServiceFilter(typeof(LogActionArguments))]
        [ProducesResponseType(typeof(Response<PagedResult<StarredItemVm>>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Response<PagedResult<StarredItemVm>>), StatusCodes.Status400BadRequest)]
        [Permission("Correspondence|View")]
        public async Task<ObjectResult> GetStarredItems([FromQuery] GetUserIsStarredQuery query)
        {
            return await Okey(() => _mediator.Send(query));
        }

        // get correspondence is outgoing
        [HttpGet]
        [ServiceFilter(typeof(LogActionArguments))]
        [ProducesResponseType(typeof(Response<PagedResult<GetCorrespondenceOutgoingVm>>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Response<PagedResult<GetCorrespondenceOutgoingVm>>), StatusCodes.Status400BadRequest)]
        [Permission("Correspondence|View")]
        public async Task<ObjectResult> GetCorrespondenceOutgoing([FromQuery] GetCorrespondenceOutgoingQuery query)
        {
            return await Okey(() => _mediator.Send(query));
        }

        // get correspondence is incoming
        [HttpGet]
        [ServiceFilter(typeof(LogActionArguments))]
        [ProducesResponseType(typeof(Response<PagedResult<GetCorrespondenceIncomingVm>>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Response<PagedResult<GetCorrespondenceIncomingVm>>), StatusCodes.Status400BadRequest)]
        [Permission("Correspondence|View")]
        public async Task<ObjectResult> GetCorrespondenceIncming([FromQuery] GetCorrespondenceIncomingQuery query)
        {
            return await Okey(() => _mediator.Send(query));
        }

        [HttpGet]
        [ServiceFilter(typeof(LogActionArguments))]
        [ProducesResponseType(typeof(Response<PagedResult<GetSigningListVm>>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Response<PagedResult<GetSigningListVm>>), StatusCodes.Status400BadRequest)]
        [Permission("Correspondence|View")]
        public async Task<ObjectResult> GetSigningList([FromQuery] GetSigningListQuery query)
        {
            return await Okey(() => _mediator.Send(query));
        }

        // get correspondence is postponed
        [HttpGet]
        [ServiceFilter(typeof(LogActionArguments))]
        [ProducesResponseType(typeof(Response<PagedResult<GetPostponedCorrespondencesVm>>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Response<PagedResult<GetPostponedCorrespondencesVm>>), StatusCodes.Status400BadRequest)]
        [Permission("Correspondence|View")]
        public async Task<ObjectResult> GetPostponedCorrespondences([FromQuery] GetPostponedCorrespondencesQuery query)
        {
            return await Okey(() => _mediator.Send(query));
        }

        [HttpGet]
        [ServiceFilter(typeof(LogActionArguments))]
        [ProducesResponseType(typeof(Response<CorrespondenceDetailVm>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Response<CorrespondenceDetailVm>), StatusCodes.Status400BadRequest)]
        [Permission("Correspondence|View")]
        public async Task<ObjectResult> GetById([FromQuery] Guid id)
        {
            return await Okey(() => _mediator.Send(new GetCorrespondenceByIdQuery { Id = id }));
        }


        [HttpGet]
        [ServiceFilter(typeof(LogActionArguments))]
        [ProducesResponseType(typeof(Response<List<LinkedCorrespondenceVm>>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Response<List<LinkedCorrespondenceVm>>), StatusCodes.Status400BadRequest)]
        [Permission("Correspondence|ViewLinkedItems")]
        public async Task<ObjectResult> GetLinkedCorrespondences([FromQuery] Guid correspondenceId)
        {
            return await Okey(() => _mediator.Send(new GetLinkedCorrespondencesQuery { CorrespondenceId = correspondenceId }));
        }
        /// <summary>
        /// Get Drafts
        /// </summary>
        [HttpGet]
        [ServiceFilter(typeof(LogActionArguments))]
        [ProducesResponseType(typeof(Response<List<DraftItemVm>>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Response<List<DraftItemVm>>), StatusCodes.Status400BadRequest)]
        [Permission("Correspondence|View")]
        public async Task<ObjectResult> GetUserDrafts([FromQuery] GetUserDraftsQuery query)
        {
            return await Okey(() => _mediator.Send(query));
        }


        /// <summary>
        /// Search correspondences
        /// </summary>
        [HttpGet]
        [ServiceFilter(typeof(LogActionArguments))]
        [ProducesResponseType(typeof(Response<IEnumerable<SearchCorrespondencesVm>>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<Response<IEnumerable<SearchCorrespondencesVm>>>> SearchCorrespondences([FromQuery] SearchCorrespondencesQuery query)
        {
            return await Okey(() => _mediator.Send(query));
        }

        [HttpGet]
        [ServiceFilter(typeof(LogActionArguments))]
        [ProducesResponseType(typeof(Response<PagedResult<GetLateBooksVm>>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Response<PagedResult<GetLateBooksVm>>), StatusCodes.Status400BadRequest)]
        [Permission("Correspondence|View")]
        public async Task<ObjectResult> GetLateBooks([FromQuery] GetLateBooksQuery query)
        {
            return await Okey(() => _mediator.Send(query));
        }

        [HttpGet]
        [ServiceFilter(typeof(LogActionArguments))]
        [ProducesResponseType(typeof(Response<PagedResult<UrgentBooksVm>>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Response<PagedResult<UrgentBooksVm>>), StatusCodes.Status400BadRequest)]
        [Permission("Correspondence|View")]
        public async Task<ObjectResult> GetUrgentBooks([FromQuery] GetUrgentBooksQuery query)
        {
            return await Okey(() => _mediator.Send(query));
        }

        [HttpGet]
        [ServiceFilter(typeof(LogActionArguments))]
        [ProducesResponseType(typeof(Response<PagedResult<GetPublicCorrespondencesVm>>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Response<PagedResult<GetPublicCorrespondencesVm>>), StatusCodes.Status400BadRequest)]
        [Permission("Correspondence|View")]
        public async Task<ObjectResult> GetPublicMails([FromQuery] GetPublicCorrespondencesQuery query)
        {
            return await Okey(() => _mediator.Send(query));
        }

        // Get Correspondences Summary / Dashboard metrics
        [HttpGet]
        [ServiceFilter(typeof(LogActionArguments))]
        [ProducesResponseType(typeof(Response<GetCorrespondencesSummaryVm>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Response<GetCorrespondencesSummaryVm>), StatusCodes.Status400BadRequest)]
        [Permission("Correspondence|GetSummary")]
        public async Task<ObjectResult> GetCorrespondencesSummary([FromQuery] GetCorrespondencesSummaryCommand query)
        {
            return await Okey(() => _mediator.Send(query));
        }

        /// <summary>
        /// Gets correspondences summary for units of type DEPARTMENT (1) and DIRECTORATE (2) with their sub-units
        /// </summary>
        [HttpGet]
        [ServiceFilter(typeof(LogActionArguments))]
        [ProducesResponseType(typeof(Response<CorrespondencesSummaryAllVm>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Response<CorrespondencesSummaryAllVm>), StatusCodes.Status400BadRequest)]
        [Permission("Correspondence|GetSummary")]
        public async Task<ObjectResult> GetCorrespondencesSummaryByUnits([FromQuery] CorrespondencesSummaryQuery query)
        {
            return await Okey(() => _mediator.Send(query));
        }


        [HttpGet]
        [ServiceFilter(typeof(LogActionArguments))]
        [ProducesResponseType(typeof(Response<PagedResult<PendingItemVm>>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [Permission("Correspondence|View")]
        public async Task<IActionResult> GetPending([FromQuery] GetPendingQuery query)
        {
            return await Okey(() => _mediator.Send(query));
        }

        /// <summary>
        /// Gets correspondences under processing
        /// </summary>
        [HttpGet]
        [ServiceFilter(typeof(LogActionArguments))]
        [ProducesResponseType(typeof(Response<PagedResult<ProcessingItemVm>>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [Permission("Correspondence|View")]
        public async Task<IActionResult> GetProcessing([FromQuery] GetProcessingQuery query)
        {
            return await Okey(() => _mediator.Send(query));
        }

        /// <summary>
        /// Gets correspondences returned for editing
        /// </summary>
        [HttpGet]
        [ServiceFilter(typeof(LogActionArguments))]
        [ProducesResponseType(typeof(Response<PagedResult<ReturnForEditingItemVm>>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [Permission("Correspondence|View")]
        public async Task<IActionResult> GetReturnForEditing([FromQuery] GetReturnForEditingQuery query)
        {
            return await Okey(() => _mediator.Send(query));
        }

        /// <summary>
        /// Gets completed correspondences
        /// </summary>
        [HttpGet]
        [ServiceFilter(typeof(LogActionArguments))]
        [ProducesResponseType(typeof(Response<PagedResult<CompletedItemVm>>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [Permission("Correspondence|View")]
        public async Task<IActionResult> GetCompleted([FromQuery] GetCompletedQuery query)
        {
            return await Okey(() => _mediator.Send(query));
        }

        /// <summary>
        /// Gets correspondences with WorkflowSteps directed to the current user or their unit
        /// </summary>
        [HttpGet]
        [ServiceFilter(typeof(LogActionArguments))]
        [ProducesResponseType(typeof(Response<PagedResult<GetForwardedCorrespondenceVm>>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Response<PagedResult<GetForwardedCorrespondenceVm>>), StatusCodes.Status400BadRequest)]
        [Permission("Correspondence|GetForwardedCorrespondence")]
        public async Task<ObjectResult> GetForwardedCorrespondence([FromQuery] GetForwardedCorrespondenceQuery query)
        {
            return await Okey(() => _mediator.Send(query));
        }

        /// <summary>
        /// Gets correspondences that contain WorkflowSteps with Status = Pending or InProgress
        /// </summary>
        [HttpGet]
        [ServiceFilter(typeof(LogActionArguments))]
        [ProducesResponseType(typeof(Response<PagedResult<CorrespondenceWorkflowNotCompletedVm>>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Response<PagedResult<CorrespondenceWorkflowNotCompletedVm>>), StatusCodes.Status400BadRequest)]
        [Permission("Correspondence|View")]
        public async Task<ObjectResult> GetPendingOrInProgressCorrespondences([FromQuery] GetCorrespondenceAnyWorkflowNotCompletedQuery query)
        {
            return await Okey(() => _mediator.Send(query));
        }

        /// <summary>
        /// Gets correspondences with Status = PendingReferral or UnderProcessing
        /// </summary>
        [HttpGet]
        [ServiceFilter(typeof(LogActionArguments))]
        [ProducesResponseType(typeof(Response<PagedResult<CorrespondenceNotCompletedVm>>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Response<PagedResult<CorrespondenceNotCompletedVm>>), StatusCodes.Status400BadRequest)]
        [Permission("Correspondence|View")]
        public async Task<ObjectResult> GetNotCompletedCorrespondences([FromQuery] GetCorrespondenceNotCompletedQuery query)
        {
            return await Okey(() => _mediator.Send(query));
        }

        /// <summary>
        /// Gets correspondences that contain WorkflowSteps directed to the current user or their unit with Status = Pending or InProgress
        /// </summary>
        [HttpGet]
        [ServiceFilter(typeof(LogActionArguments))]
        [ProducesResponseType(typeof(Response<PagedResult<MyPendingOrInProgressCorrespondencesVm>>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Response<PagedResult<MyPendingOrInProgressCorrespondencesVm>>), StatusCodes.Status400BadRequest)]
        [Permission("Correspondence|GetUserInbox")]
        public async Task<ObjectResult> GetMyPendingOrInProgressCorrespondences([FromQuery] GetMyPendingOrInProgressCorrespondencesQuery query)
        {
            return await Okey(() => _mediator.Send(query));
        }



        #endregion
    }
}
