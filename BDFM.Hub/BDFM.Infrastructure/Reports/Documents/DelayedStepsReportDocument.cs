using BDFM.Application.Features.Workflow.Queries.GetDelayedStepsReport;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace BDFM.Infrastructure.Reports.Documents;

public class DelayedStepsReportDocument : IDocument
{
    private readonly List<DelayedStepReportDto> _model;

    public DelayedStepsReportDocument(List<DelayedStepReportDto> model)
    {
        _model = model;
    }

    public DocumentMetadata GetMetadata() => DocumentMetadata.Default;

    public void Compose(IDocumentContainer container)
    {
        container
            .Page(page =>
            {
                page.Margin(1, Unit.Centimetre);
                page.PageColor(Colors.White);

                page.DefaultTextStyle(x => x.FontSize(10).FontFamily("Cairo"));

                // Set layout to Right-To-Left for Arabic
                page.ContentFromRightToLeft();

                page.Header().Element(ComposeHeader);
                page.Content().Element(ComposeContent);
                page.Footer().Element(ComposeFooter);
            });
    }

    private void ComposeHeader(IContainer container)
    {
        container.Row(row =>
        {
            row.RelativeItem().Column(col =>
            {
                col.Item().Text("تقرير المتابعة - الاجرائات المتأخرة")
                    .FontSize(24)
                    .SemiBold()
                    .FontColor(Colors.Blue.Medium);

                col.Item().Text(text =>
                {
                    text.Span("تاريخ التقرير: ").SemiBold();
                    text.Span($"{DateTime.Now:yyyy/MM/dd HH:mm}").DirectionFromLeftToRight();
                });
            });

            // Space for Logo placeholder
            row.ConstantItem(60).Height(60).Background(Colors.Grey.Lighten3).AlignCenter().AlignMiddle().Text("Logo");
        });
    }

    private void ComposeContent(IContainer container)
    {
        container.PaddingVertical(40).Column(column =>
        {
            column.Spacing(20);

            // Summary Statistics
            column.Item().Row(row =>
            {
                var totalDelayed = _model.Sum(x => x.DelayedStepsCount);
                var totalAssignees = _model.Count;

                row.RelativeItem().Element(e => SummaryCard(e, "إجمالي الاجرائات المتأخرة", totalDelayed.ToString(), Colors.Red.Medium));
                row.ConstantItem(20);
                row.RelativeItem().Element(e => SummaryCard(e, "إجمالي المسؤولين المتأخرين", totalAssignees.ToString(), Colors.Orange.Medium));
            });

            // Grouped Reports
            foreach (var assignee in _model)
            {
                column.Item().Column(innerCol =>
                {
                    innerCol.Spacing(5);

                    // Assignee Header
                    innerCol.Item().Background(Colors.Grey.Lighten4).Padding(8).Row(row =>
                    {
                        row.RelativeItem().Text(assignee.AssigneeName).FontSize(14).SemiBold();
                        row.ConstantItem(100).AlignLeft().Text($"{assignee.DelayedStepsCount} اجراء متأخر").FontSize(11).FontColor(Colors.Grey.Medium);
                    });

                    // Steps Table
                    innerCol.Item().Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.ConstantColumn(40); // #
                            columns.ConstantColumn(120); // رقم القيد
                            columns.RelativeColumn(3);   // الموضوع
                            columns.RelativeColumn(2);   // الخطوة
                            columns.ConstantColumn(100); // تاريخ الاستحقاق
                            columns.ConstantColumn(60);  // تأخير
                        });

                        // Header
                        table.Header(header =>
                        {
                            header.Cell().Element(HeaderStyle).Text("#");
                            header.Cell().Element(HeaderStyle).Text("رقم الكتاب");
                            header.Cell().Element(HeaderStyle).Text("الموضوع");
                            header.Cell().Element(HeaderStyle).Text("الخطوة / التعليمات");
                            header.Cell().Element(HeaderStyle).Text("تاريخ الاستحقاق");
                            header.Cell().Element(HeaderStyle).Text("أيام التأخير");

                            static IContainer HeaderStyle(IContainer container)
                            {
                                return container.DefaultTextStyle(x => x.SemiBold()).PaddingVertical(5).BorderBottom(1).BorderColor(Colors.Black);
                            }
                        });

                        // Rows
                        int i = 1;
                        foreach (var step in assignee.DelayedSteps)
                        {
                            table.Cell().Element(CellStyle).Text(i++.ToString());
                            table.Cell().Element(CellStyle).Text(step.CorrespondenceNumber).DirectionFromLeftToRight();
                            table.Cell().Element(CellStyle).Text(step.CorrespondenceSubject);
                            table.Cell().Element(CellStyle).Text(step.StepName);
                            table.Cell().Element(CellStyle).Text(step.DueDate?.ToString("yyyy/MM/dd") ?? "-").DirectionFromLeftToRight();
                            table.Cell().Element(CellStyle).Text(step.DaysLate.ToString()).FontColor(Colors.Red.Medium).SemiBold();

                            static IContainer CellStyle(IContainer container)
                            {
                                return container.PaddingVertical(5).BorderBottom(1).BorderColor(Colors.Grey.Lighten2);
                            }
                        }
                    });
                });
            }
        });
    }

    private void SummaryCard(IContainer container, string title, string value, string color)
    {
        container.Border(1).BorderColor(Colors.Grey.Lighten2).Padding(10).Column(col =>
        {
            col.Item().Text(title).FontSize(12).FontColor(Colors.Grey.Medium);
            col.Item().Text(value).FontSize(24).SemiBold().FontColor(color);
        });
    }

    private void ComposeFooter(IContainer container)
    {
        container.Row(row =>
        {
            row.RelativeItem().Text(x =>
            {
                x.Span("صفحة ");
                x.CurrentPageNumber();
                x.Span(" من ");
                x.TotalPages();
            });

            row.RelativeItem().AlignLeft().Text("نظام إدارة المراسلات الموحد").FontSize(10).FontColor(Colors.Grey.Medium);
        });
    }
}
