using BDFM.Application.Features.Users.Queries.GetUsersPerEntityReport;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using System;
using System.Collections.Generic;

namespace BDFM.Infrastructure.Reports.Documents;

public class UsersPerEntityReportDocument : IDocument
{
    private readonly UsersPerEntityReportResultDto _model;

    public UsersPerEntityReportDocument(UsersPerEntityReportResultDto model)
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
                page.ContentFromRightToLeft(); // Arabic Layout

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
                col.Item().Text("تقرير مستخدمي الجهات")
                    .FontSize(24)
                    .SemiBold()
                    .FontColor(Colors.Blue.Medium);

                col.Item().Text(text =>
                {
                    text.Span("تاريخ التقرير: ").SemiBold();
                    text.Span($"{DateTime.Now:yyyy/MM/dd HH:mm}").DirectionFromLeftToRight();
                });
            });

            // Logo placeholder
            row.ConstantItem(60).Height(60).Background(Colors.Grey.Lighten3).AlignCenter().AlignMiddle().Text("Logo");
        });
    }

    private void ComposeContent(IContainer container)
    {
        container.PaddingVertical(40).Column(column =>
        {
            column.Spacing(20);

            // Summary
            column.Item().Row(row =>
            {
                row.RelativeItem().Element(e => SummaryCard(e, "إجمالي عدد المستخدمين", _model.TotalUniqueUsersCount.ToString(), Colors.Blue.Darken2));
            });

            // Grouped by Entity
            foreach (var entity in _model.Entities)
            {
                column.Item().Column(innerCol =>
                {
                    innerCol.Spacing(5);

                    // Entity Header
                    innerCol.Item().Background(Colors.Grey.Lighten4).Padding(8).Row(row =>
                    {
                        row.RelativeItem().Text(entity.EntityName).FontSize(14).SemiBold();
                        row.ConstantItem(100).AlignLeft().Text($"{entity.UsersCount} مستخدم").FontSize(11).FontColor(Colors.Grey.Darken2);
                    });

                    // Users Table
                    if (entity.Users != null && entity.Users.Count > 0)
                    {
                        innerCol.Item().Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.ConstantColumn(40); // #
                                columns.RelativeColumn(3); // Full Name
                                columns.RelativeColumn(2); // Username
                                columns.ConstantColumn(120); // Creation Date
                            });

                            // Table Header
                            table.Header(header =>
                            {
                                header.Cell().Element(HeaderStyle).Text("#");
                                header.Cell().Element(HeaderStyle).Text("الاسم الكامل");
                                header.Cell().Element(HeaderStyle).Text("اسم المستخدم");
                                header.Cell().Element(HeaderStyle).Text("تاريخ الإنشاء");

                                static IContainer HeaderStyle(IContainer container) =>
                                    container.DefaultTextStyle(x => x.SemiBold()).PaddingVertical(5).BorderBottom(1).BorderColor(Colors.Black);
                            });

                            // Table Rows
                            int i = 1;
                            foreach (var user in entity.Users)
                            {
                                table.Cell().Element(CellStyle).Text(i++.ToString());
                                table.Cell().Element(CellStyle).Text(user.FullName);
                                table.Cell().Element(CellStyle).Text(user.Username).DirectionFromLeftToRight();
                                table.Cell().Element(CellStyle).Text(user.CreatedAt.ToString("yyyy/MM/dd")).DirectionFromLeftToRight();

                                static IContainer CellStyle(IContainer container) =>
                                    container.PaddingVertical(5).BorderBottom(1).BorderColor(Colors.Grey.Lighten2);
                            }
                        });
                    }
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
