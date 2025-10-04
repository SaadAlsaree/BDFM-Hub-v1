namespace BDFM.Application.Features.WorkflowTodo.Commands.CreateWorkflowTodo
{
    internal class CreateWorkflowTodoValidator : AbstractValidator<CreateWorkflowTodoCommand>
    {
        public CreateWorkflowTodoValidator()
        {
            RuleFor(v => v.WorkflowStepId).NotEmpty();
            RuleFor(v => v.Title).NotEmpty();
        }
    }
}
