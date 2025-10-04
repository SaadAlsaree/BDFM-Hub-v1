namespace BDFM.Application.Extensions;

public static class FilterExtensions
{
    public static IQueryable<TEntity> ApplyFilter<TEntity, TFilter>(this IQueryable<TEntity> query, TFilter filter)
        where TEntity : class
        where TFilter : class
    {
        foreach (var property in typeof(TFilter).GetProperties())
        {
            var value = property.GetValue(filter);
            if (value != null)
            {
                var entityProperties = typeof(TEntity).GetProperty(property.Name);
                if (entityProperties != null && entityProperties.PropertyType.IsEnum)
                {
                    var enumType = entityProperties.PropertyType;
                    var enumValue = Enum.Parse(enumType, value.ToString()!);
                    query = query.Where(GenerateEqualityExpression<TEntity, object>(property.Name, enumValue));
                }

                if (property.PropertyType == typeof(Guid) && value is Guid guidValue)
                {
                    if (guidValue != default)
                    {
                        var entityProperty = typeof(TEntity).GetProperty(property.Name);
                        if (entityProperty != null && entityProperty.PropertyType == typeof(Guid))
                        {
                            query = query.Where(GenerateEqualityExpression<TEntity, Guid>(property.Name, guidValue));
                        }
                    }
                }

                if (property.PropertyType == typeof(string) && !string.IsNullOrWhiteSpace((string)value))
                {
                    // Handle special "SearchTerm" logic
                    if (property.Name == "SearchTerm")
                    {
                        var searchExpression = GenerateSearchExpression<TEntity>((string)value);
                        if (searchExpression != null)
                        {
                            query = query.Where(searchExpression);
                        }
                    }

                    if (property.Name.EndsWith("Term") && property.PropertyType == typeof(string))
                    {
                        var searchTerm = (string)value;
                        var searchExpression =
                            GenerateSearchExpressionForProperty<TEntity>(searchTerm, property.Name.Replace("Term", ""));
                        if (searchExpression != null)
                        {
                            query = query.Where(searchExpression);
                        }
                    }
                    else
                    {
                        var entityProperty = typeof(TEntity).GetProperty(property.Name);
                        if (entityProperty != null && entityProperty.PropertyType == typeof(string))
                        {
                            query = query.Where(
                                GenerateEqualityExpression<TEntity, string>(property.Name, (string)value));
                        }

                        // Additional condition to handle enum properties
                    }
                }
                else if (property.PropertyType == typeof(DateTime?) && value is DateTime dateValue)
                {
                    var entityProperty =
                        typeof(TEntity).GetProperty(property.Name.Replace("From", "").Replace("To", ""));
                    if (entityProperty != null)
                    {
                        query = property.Name.EndsWith("From")
                            ? query.Where(
                                GenerateComparisonExpression<TEntity, DateTime>(entityProperty.Name, dateValue, true))
                            : query.Where(
                                GenerateComparisonExpression<TEntity, DateTime>(entityProperty.Name, dateValue, false));
                    }
                }
                else if (property.PropertyType == typeof(DateOnly?) && value is DateOnly dateOnlyValue)
                {
                    var entityProperty =
                        typeof(TEntity).GetProperty(property.Name.Replace("From", "").Replace("To", ""));
                    if (entityProperty != null)
                    {
                        query = property.Name.EndsWith("From")
                            ? query.Where(
                                GenerateComparisonExpression<TEntity, DateOnly>(entityProperty.Name, dateOnlyValue, true))
                            : query.Where(
                                GenerateComparisonExpression<TEntity, DateOnly>(entityProperty.Name, dateOnlyValue, false));
                    }
                }
                else if (property.PropertyType == typeof(decimal?) && value is decimal decimalValue)
                {
                    var entityProperty =
                        typeof(TEntity).GetProperty(property.Name.Replace("From", "").Replace("To", ""));
                    if (entityProperty != null)
                    {
                        query = property.Name.EndsWith("From")
                            ? query.Where(
                                GenerateComparisonExpression<TEntity, decimal>(entityProperty.Name, decimalValue, true))
                            : query.Where(
                                GenerateComparisonExpression<TEntity, decimal>(entityProperty.Name, decimalValue,
                                    false));
                    }
                }
                else if (property.PropertyType == typeof(int) && value is int intValue and > 0)
                {
                    var entityProperty = typeof(TEntity).GetProperty(property.Name);
                    if (entityProperty != null && entityProperty.PropertyType == typeof(int))
                    {
                        query = query.Where(GenerateEqualityExpression<TEntity, int>(property.Name, intValue));
                    }
                }
            }
        }

        return query;
    }

    private static Expression<Func<TEntity, bool>> GenerateSearchExpression<TEntity>(string searchTerm)
        where TEntity : class
    {
        var properties = typeof(TEntity).GetProperties().Where(p => p.PropertyType == typeof(string));
        Expression searchExpr = null!;
        var parameter = Expression.Parameter(typeof(TEntity), "x");

        foreach (var property in properties)
        {
            var propertyExpr = Expression.Property(parameter, property.Name);
            var searchTermExpr = Expression.Constant(searchTerm);
            var containsMethod = typeof(string).GetMethod("Contains", new[] { typeof(string) });
            var currentSearchExpr = Expression.Call(propertyExpr, containsMethod!, searchTermExpr);

            searchExpr = searchExpr == null ? currentSearchExpr : Expression.OrElse(searchExpr, currentSearchExpr);
        }

        return searchExpr == null ? null : Expression.Lambda<Func<TEntity, bool>>(searchExpr, parameter);
    }

    private static Expression<Func<TEntity, bool>> GenerateSearchExpressionForProperty<TEntity>(string searchTerm,
        string Name)
        where TEntity : class
    {
        var parameter = Expression.Parameter(typeof(TEntity), "x");
        var propertyExpr = Expression.Property(parameter, Name);

        if (propertyExpr.Type != typeof(string))
            return null!; // We only handle string properties here.

        var searchTermExpr = Expression.Constant(searchTerm);
        var containsMethod = typeof(string).GetMethod("Contains", new[] { typeof(string) });
        var searchExpr = Expression.Call(propertyExpr, containsMethod!, searchTermExpr);

        return Expression.Lambda<Func<TEntity, bool>>(searchExpr, parameter);
    }


    private static Expression<Func<TEntity, bool>> GenerateEqualityExpression<TEntity, TValue>(string Name,
        TValue value)
        where TEntity : class
    {
        var parameter = Expression.Parameter(typeof(TEntity), "x");
        var property = Expression.Property(parameter, Name);
        var constant = Expression.Constant(value);
        var equality = Expression.Equal(property, constant);
        return Expression.Lambda<Func<TEntity, bool>>(equality, parameter);
    }

    private static Expression<Func<TEntity, bool>> GenerateComparisonExpression<TEntity, TValue>(string Name,
        TValue value, bool isGreaterThanOrEqual)
        where TEntity : class
    {
        var parameter = Expression.Parameter(typeof(TEntity), "x");
        var property = Expression.Property(parameter, Name);
        var constant = Expression.Constant(value);
        var comparison = isGreaterThanOrEqual
            ? Expression.GreaterThanOrEqual(property, constant)
            : Expression.LessThanOrEqual(property, constant);
        return Expression.Lambda<Func<TEntity, bool>>(comparison, parameter);
    }
}
