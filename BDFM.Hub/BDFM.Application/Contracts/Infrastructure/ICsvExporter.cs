//using GloboTicket.TicketManagement.Application.Features.Events.Queries.GetEventsExport;


namespace BDFM.Application.Contracts.Infrastructure;

public interface ICsvExporter
{
    byte[] ExportEventsToCsv(List<Type> eventExportDtos);
}
