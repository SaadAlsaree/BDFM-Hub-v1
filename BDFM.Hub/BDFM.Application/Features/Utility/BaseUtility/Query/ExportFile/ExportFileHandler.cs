namespace BDFM.Application.Features.Utility.BaseUtility.Query.ExportFile;
public abstract class ExportFileHandler<TEntity, TQuery>
    where TQuery : class
    where TEntity : class
{
    protected readonly IBaseRepository<TEntity> _repository;
    public abstract string[] Headers { get; set; }
    public abstract string Title { get; set; }
    public abstract string TitleSheet { get; set; }
    protected ExportFileHandler(IBaseRepository<TEntity> repository)
    {
        _repository = repository ?? throw new ArgumentNullException(nameof(repository));
    }
    public abstract Expression<Func<TEntity, List<object>>> Selector { get; }
    public abstract Func<IQueryable<TEntity>, IIncludableQueryable<TEntity, object>> Include { get; }

    public async Task<byte[]> HandleBase(TQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var query = _repository.Query();
            var result = await query
                .ApplyIncludes(Include)
                .ApplyFilter(request)
                .Select(Selector)
                .ToListAsync(cancellationToken: cancellationToken);
            if (!result.Any())
                return null!;

            var file = Utilities.GetFileExcel(new List<SheetSetting>()
        {
            new SheetSetting()
            {
                ComlumHeadrs = Headers,
                Data = result,
                Title = Title,
                TitleSheet = TitleSheet,
            }
        });
            return file!;
        }
        catch (Exception)
        {
            return null!;
        }
    }
}
