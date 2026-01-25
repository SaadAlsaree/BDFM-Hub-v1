using BDFM.Application.Contracts.Infrastructure;
using BDFM.Application.Features.Workflow.Queries.GetDelayedStepsReport;
using BDFM.Infrastructure.Reports.Documents;
using QuestPDF.Fluent;
using QuestPDF.Infrastructure;

namespace BDFM.Infrastructure.Reports;

public class QuestPdfService : IPdfService
{
    static QuestPdfService()
    {
        // Set QuestPDF license
        QuestPDF.Settings.License = LicenseType.Community;
    }

    public byte[] GenerateDelayedStepsReport(List<DelayedStepReportDto> data)
    {
        var document = new DelayedStepsReportDocument(data);
        return document.GeneratePdf();
    }
}
