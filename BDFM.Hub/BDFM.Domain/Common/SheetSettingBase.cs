namespace BDFM.Domain.Common
{
    public class SheetSetting
    {
        public string[] ComlumHeadrs { get; set; } = default!;
        public string[] ComlumHeadrsSum { get; set; } = default!;
        public List<List<object>> Data { get; set; } = default!;
        public List<object> Sum { get; set; } = default!;
        public string Title { get; set; } = default!;
        public string TitleSheet { get; set; } = default!;
    }
}