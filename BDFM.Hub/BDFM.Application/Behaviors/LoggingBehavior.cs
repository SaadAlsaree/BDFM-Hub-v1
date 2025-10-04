
namespace BDFM.Application.Behaviors;

public class LoggingBehavior<TRequestLog, TResponseLog> : IPipelineBehavior<TRequestLog, TResponseLog> where TRequestLog : IRequest<TResponseLog>
{
    private readonly ILogger<LoggingBehavior<TRequestLog, TResponseLog>> _logger;
    public LoggingBehavior(ILogger<LoggingBehavior<TRequestLog, TResponseLog>> logger) => _logger = logger;

    public async Task<TResponseLog> Handle(TRequestLog request, RequestHandlerDelegate<TResponseLog> next, CancellationToken cancellationToken)
    {
        _logger.LogInformation("----- Handling command {CommandName} ({@Command})", request.GetGenericTypeName(), request);
        var response = await next();
        _logger.LogInformation("----- Command {CommandName} handled - response: {@Response}", request.GetGenericTypeName(), response);

        return response;
    }
}
