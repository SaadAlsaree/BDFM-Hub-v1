namespace BDFM.Web.Helpers
{
    public class IOC
    {
        public static IServiceProvider CurrentProvider { get; internal set; } = null!;

        public static T Resolve<T>()
        {
            return CurrentProvider.GetService<T>()!;
        }
    }
}
