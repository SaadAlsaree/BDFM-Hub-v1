using System.IO;
using BDFM.Application.Contracts.Infrastructure;
using BDFM.Application.Features.Workflow.Queries.GetDelayedStepsReport;
using BDFM.Application.Features.Users.Queries.GetUsersPerEntityReport;
using BDFM.Infrastructure.Reports.Documents;
using QuestPDF.Drawing;
using QuestPDF.Fluent;
using QuestPDF.Infrastructure;

namespace BDFM.Infrastructure.Reports;

public class QuestPdfService : IPdfService
{
    static QuestPdfService()
    {
        // Set QuestPDF license
        QuestPDF.Settings.License = LicenseType.Community;

        var fontPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Reports", "Fonts", "Cairo-VariableFont_slnt,wght.ttf");
        if (File.Exists(fontPath))
        {
            using var fontStream = File.OpenRead(fontPath);
            FontManager.RegisterFont(fontStream);
        }
    }

    public byte[] GenerateDelayedStepsReport(List<DelayedStepReportDto> data)
    {
        var document = new DelayedStepsReportDocument(data);
        return document.GeneratePdf();
    }

    public byte[] GenerateUsersPerEntityReport(UsersPerEntityReportResultDto data)
    {
        var document = new UsersPerEntityReportDocument(data);
        return document.GeneratePdf();
    }
}
