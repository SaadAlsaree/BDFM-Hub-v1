namespace BDFM.Api.Attributes;

/// <summary>
/// Attribute to mark controllers or actions that should skip Anti-XSS validation.
/// Use this for file upload endpoints or other scenarios where XSS validation might interfere.
/// </summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class SkipAntiXssValidationAttribute : Attribute
{
}