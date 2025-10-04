using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;

namespace BDFM.Application.Features.WorkflowStepSecondary.Queries.GetWorkflowStepSecondaryByStepId
{
    public class GetWorkflowStepSecondaryByStepIdQuery : IRequest<Response<PagedResult<WorkflowStepSecondaryRecipientVM>>>, IPaginationQuery
    {
        public Guid StepId { get; set; } // ???? ?????? ???? ???? ?????? ??? ????????? ????????? ???
        public int Page { get; set; }
        public byte PageSize { get; set; }

        public RecipientTypeEnum? RecipientType { get; set; }
        public Guid? RecipientId { get; set; }
    }

}
