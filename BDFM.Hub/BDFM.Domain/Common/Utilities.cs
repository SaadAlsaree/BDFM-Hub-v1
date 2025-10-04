using Microsoft.AspNetCore.Http;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;
using NPOI.SS.UserModel;
using NPOI.XSSF.UserModel;
using System.IdentityModel.Tokens.Jwt;
using System.Linq.Expressions;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace BDFM.Domain.Common;

public static class Utilities
{
    public static Expression<Func<T, bool>> BuildFilterExpression<T>(string columnName, string searchTerm)
    {
        var parameter = Expression.Parameter(typeof(T), "e");
        var property = Expression.Property(parameter, columnName);
        var searchExpression = Expression.Constant(searchTerm);
        var containsMethod = typeof(string).GetMethod("Contains", new[] { typeof(string) });

        var body = Expression.Call(property, containsMethod!, searchExpression);

        return Expression.Lambda<Func<T, bool>>(body, parameter);
    }
    /// <summary>
    /// Converts a byte array to a Base64 string.
    /// </summary>
    /// <param name="imageBytes">The byte array to convert.</param>
    /// <returns>A Base64 encoded string representing the image.</returns>
    public static string ConvertImageToBase64(byte[] imageBytes)
    {
        return Convert.ToBase64String(imageBytes);
    }
    public static bool ReplaceStatus(int status)
    {
        if (status == 1)
            return true;
        else if (status == 2)
            return false;
        else
            throw new Exception("المدخل غير صحيح , يرجى التاكد من مدخل الحالة");
    }
    public static int GenerateRandomNo()
    {
        int _min = 1000000;
        int _max = 9999999;
        Random _rdm = new Random();
        return _rdm.Next(_min, _max);
    }
    public static async Task<byte[]> ConvertIFormFileToByteArray(this IFormFile file)
    {
        using (var memoryStream = new MemoryStream())
        {
            await file.CopyToAsync(memoryStream);
            return memoryStream.ToArray();
        }
    }
    public static string GetFileExtension(this IFormFile file)
    {
        if (file == null)
            return string.Empty;
        return Path.GetExtension(file.FileName);
    }
    public static string ToBase64(this byte[] byteArray)
    {
        return Convert.ToBase64String(byteArray);
    }
    public static string Generate256BitSecret()
    {
        var randomNumber = new byte[32];

        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }
    }

    public static string CreateToken(List<Claim> claims, string secretValue)
    {
        var token = new JwtSecurityToken
        (
            claims: claims,
            expires: DateTime.Now.AddMonths(1),
            notBefore: DateTime.Now,

            signingCredentials: new SigningCredentials(new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretValue)),
                SecurityAlgorithms.HmacSha256)
        );
        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public static byte[] GetFileExcel(List<SheetSetting> sheets)
    {
        IRow row;
        var memory = new MemoryStream();
        string fileName = Guid.NewGuid().ToString();
        IWorkbook workbook;
        workbook = new XSSFWorkbook();
        foreach (var sheet in sheets)
        {
            ISheet excelSheet = workbook.CreateSheet(string.IsNullOrEmpty(sheet.TitleSheet) ? Guid.NewGuid().ToString() : sheet.TitleSheet);
            var startIndex = 0;

            //Header Style
            var cellStyleBorder = workbook.CreateCellStyle();
            cellStyleBorder.BorderBottom = BorderStyle.Thin;
            cellStyleBorder.BorderLeft = BorderStyle.Thin;
            cellStyleBorder.BorderRight = BorderStyle.Thin;
            cellStyleBorder.BorderTop = BorderStyle.Thin;
            cellStyleBorder.Alignment = HorizontalAlignment.Center;
            cellStyleBorder.VerticalAlignment = VerticalAlignment.Center;

            var cellStyleBorderAndColorGreen = workbook.CreateCellStyle();
            cellStyleBorderAndColorGreen.CloneStyleFrom(cellStyleBorder);
            cellStyleBorderAndColorGreen.FillPattern = FillPattern.SolidForeground;
            ((XSSFCellStyle)cellStyleBorderAndColorGreen).SetFillForegroundColor(new XSSFColor(new byte[] { 198, 239, 206 }));

            var cellStyleBorderAndColorYellow = workbook.CreateCellStyle();
            cellStyleBorderAndColorYellow.CloneStyleFrom(cellStyleBorder);
            cellStyleBorderAndColorYellow.FillPattern = FillPattern.SolidForeground;
            ((XSSFCellStyle)cellStyleBorderAndColorYellow).SetFillForegroundColor(new XSSFColor(new byte[] { 255, 235, 156 }));

            var cellStyleBorderAndColorYellowHeader = workbook.CreateCellStyle();
            cellStyleBorderAndColorYellowHeader.CloneStyleFrom(cellStyleBorder);
            cellStyleBorderAndColorYellowHeader.FillPattern = FillPattern.SolidForeground;
            ((XSSFCellStyle)cellStyleBorderAndColorYellowHeader).SetFillForegroundColor(new XSSFColor(new byte[] { 255, 255, 0 }));

            var cellStyleBorderAndColorOrgenal = workbook.CreateCellStyle();
            cellStyleBorderAndColorOrgenal.CloneStyleFrom(cellStyleBorder);
            cellStyleBorderAndColorOrgenal.FillPattern = FillPattern.SolidForeground;
            ((XSSFCellStyle)cellStyleBorderAndColorOrgenal).SetFillForegroundColor(new XSSFColor(new byte[] { 255, 255, 255 }));


            if (sheet.Sum != null)
            {
                var rowHeader = excelSheet.CreateRow(0);
                startIndex += 1;
                for (int i = 0; i < sheet.ComlumHeadrs.Length; i++)
                {
                    rowHeader.CreateCell(i);
                }
                var cra = new NPOI.SS.Util.CellRangeAddress(0, 0, 0, sheet.ComlumHeadrs.Length - 1);
                excelSheet.AddMergedRegion(cra);

                ICell cell = excelSheet.GetRow(0).GetCell(0);
                cell.SetCellType(NPOI.SS.UserModel.CellType.String);
                cell.SetCellValue(sheet.Title);
                for (int cellStyle = 0; cellStyle < sheet.ComlumHeadrs.Length; cellStyle++)
                    excelSheet.GetRow(0).GetCell(cellStyle).CellStyle = cellStyleBorderAndColorYellowHeader;

                var indexTitel = sheet.ComlumHeadrs.Length / 2;

                for (int i = 1; i <= sheet.ComlumHeadrsSum.Length; i++)
                {
                    var rowsum = excelSheet.CreateRow(i);

                    startIndex += 1;
                    for (int cellSum = 0; cellSum < sheet.ComlumHeadrs.Length; cellSum++)
                        rowsum.CreateCell(cellSum);
                    var titleCell = new NPOI.SS.Util.CellRangeAddress(i, i, 0, indexTitel - 1);
                    var valueCell = new NPOI.SS.Util.CellRangeAddress(i, i, indexTitel, sheet.ComlumHeadrs.Length - 1);
                    excelSheet.AddMergedRegion(titleCell);
                    excelSheet.AddMergedRegion(valueCell);

                    ICell cell1 = excelSheet.GetRow(i).GetCell(0);
                    cell1.SetCellType(NPOI.SS.UserModel.CellType.String);
                    cell1.SetCellValue(sheet.ComlumHeadrsSum[i - 1].ToString());

                    for (int cellStyle = 0; cellStyle < indexTitel; cellStyle++)
                        excelSheet.GetRow(i).GetCell(cellStyle).CellStyle = cellStyleBorderAndColorGreen;


                    ICell cell2 = excelSheet.GetRow(i).GetCell(indexTitel);
                    cell2.SetCellType(NPOI.SS.UserModel.CellType.String);
                    cell2.SetCellValue(sheet.Sum[i - 1].ToString());

                    for (int cellStyle = indexTitel; cellStyle < sheet.ComlumHeadrs.Length; cellStyle++)
                        excelSheet.GetRow(i).GetCell(cellStyle).CellStyle = cellStyleBorderAndColorYellow;
                }

            }
            if (startIndex == 0 && !string.IsNullOrEmpty(sheet.Title))
            {
                var rowHeader = excelSheet.CreateRow(0);
                startIndex += 1;
                for (int i = 0; i < sheet.ComlumHeadrs.Length; i++)
                {
                    rowHeader.CreateCell(i);
                }
                var cra = new NPOI.SS.Util.CellRangeAddress(0, 0, 0, sheet.ComlumHeadrs.Length - 1);
                excelSheet.AddMergedRegion(cra);

                ICell cell = excelSheet.GetRow(0).GetCell(0);
                cell.SetCellType(NPOI.SS.UserModel.CellType.String);
                cell.SetCellValue(sheet.Title);
                for (int cellStyle = 0; cellStyle < sheet.ComlumHeadrs.Length; cellStyle++)
                    excelSheet.GetRow(0).GetCell(cellStyle).CellStyle = cellStyleBorderAndColorYellowHeader;
            }
            row = excelSheet.CreateRow(startIndex);
            for (int i = 0; i < sheet.ComlumHeadrs.Length; i++)
            {
                row.CreateCell(i);
                var currentCell = excelSheet.GetRow(startIndex).GetCell(i);
                currentCell.SetCellValue(sheet.ComlumHeadrs[i]);
                excelSheet.SetColumnWidth(i, (int)((15 + 0.72) * 256));
                currentCell.CellStyle = cellStyleBorderAndColorYellowHeader;
            }
            int j = startIndex + 1, k = 0;
            sheet.Data.ForEach(line =>
            {
                k = 0;
                row = excelSheet.CreateRow(j);
                foreach (var item in line)
                {
                    row.CreateCell(k);
                    var currentCell = excelSheet.GetRow(j).GetCell(k);
                    currentCell.SetCellType(NPOI.SS.UserModel.CellType.String);
                    currentCell.SetCellValue(item == null ? string.Empty : item.ToString());
                    currentCell.CellStyle = cellStyleBorderAndColorOrgenal;
                    k++;
                }
                j++;
            });
            for (int cellnum = 0; cellnum < sheet.ComlumHeadrs.Length; cellnum++)
            {
                excelSheet.AutoSizeColumn(cellnum);
            }
        }
        workbook.Write(memory);
        return memory.ToArray();
    }
    public static string RemoveCountryCode(string phoneNumber)
    {
        if (string.IsNullOrEmpty(phoneNumber))
            return "7000000000";
        if (phoneNumber.Length < 10)
            return "7000000000";
        return phoneNumber.Substring(phoneNumber.Length - 10, 10);
    }
    public static MemoryStream ConvertFromBase64(string base64)
    {
        byte[] bytes = Convert.FromBase64String(base64);
        using (MemoryStream ms = new MemoryStream(bytes))
        {
            return ms;
        }
    }
    public static StringContent JsonContent(object obj) => new(JsonConvert.SerializeObject(obj), Encoding.UTF8, "application/json");
}

