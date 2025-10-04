using System.Reflection;

namespace BDFM.Application.Features.Dashboard.Extensions;

public static class DashboardExtensions
{
    /// <summary>
    /// Gets the display name from the Display attribute or returns the enum name
    /// </summary>
    public static string GetDisplayName(this Enum enumValue)
    {
        return enumValue.GetType()
            .GetMember(enumValue.ToString())
            .First()
            .GetCustomAttribute<DisplayAttribute>()?
            .GetName() ?? enumValue.ToString();
    }

    /// <summary>
    /// Calculates efficiency score based on completion rate and processing time
    /// </summary>
    public static double CalculateEfficiencyScore(double completionRate, double averageProcessingTimeDays, double maxProcessingTimeDays = 30)
    {
        if (maxProcessingTimeDays <= 0) maxProcessingTimeDays = 30;

        // Normalize processing time (inverse relationship - faster is better)
        var timeScore = Math.Max(0, (maxProcessingTimeDays - averageProcessingTimeDays) / maxProcessingTimeDays) * 100;

        // Combine completion rate (0-100) and time score (0-100) with equal weights
        return Math.Round((completionRate + timeScore) / 2, 2);
    }

    /// <summary>
    /// Converts days to a human-readable format
    /// </summary>
    public static string ToReadableDuration(this double days)
    {
        if (days < 1)
        {
            var hours = Math.Round(days * 24, 1);
            return $"{hours} hours";
        }
        else if (days < 7)
        {
            return $"{Math.Round(days, 1)} days";
        }
        else if (days < 30)
        {
            var weeks = Math.Round(days / 7, 1);
            return $"{weeks} weeks";
        }
        else
        {
            var months = Math.Round(days / 30, 1);
            return $"{months} months";
        }
    }

    /// <summary>
    /// Gets the month name in Arabic
    /// </summary>
    public static string GetMonthNameArabic(this int month)
    {
        return month switch
        {
            1 => "يناير",
            2 => "فبراير",
            3 => "مارس",
            4 => "أبريل",
            5 => "مايو",
            6 => "يونيو",
            7 => "يوليو",
            8 => "أغسطس",
            9 => "سبتمبر",
            10 => "أكتوبر",
            11 => "نوفمبر",
            12 => "ديسمبر",
            _ => month.ToString()
        };
    }

    /// <summary>
    /// Calculates percentage with proper rounding
    /// </summary>
    public static double CalculatePercentage(int part, int total, int decimalPlaces = 2)
    {
        if (total == 0) return 0;
        return Math.Round((double)part / total * 100, decimalPlaces);
    }

    /// <summary>
    /// Determines the priority color based on correspondence priority level
    /// </summary>
    public static string GetPriorityColor(this PriorityLevelEnum priority)
    {
        return priority switch
        {
            PriorityLevelEnum.VeryUrgent => "#dc2626", // Red
            PriorityLevelEnum.Urgent => "#ea580c", // Orange
            PriorityLevelEnum.Normal => "#0ea5e9", // Blue
            PriorityLevelEnum.Immediate => "#65a30d", // Green
            _ => "#6b7280" // Gray
        };
    }

    /// <summary>
    /// Determines the status color based on correspondence status
    /// </summary>
    public static string GetStatusColor(this CorrespondenceStatusEnum status)
    {
        return status switch
        {
            CorrespondenceStatusEnum.Registered => "#0ea5e9", // Blue
            CorrespondenceStatusEnum.PendingReferral => "#f59e0b", // Amber
            CorrespondenceStatusEnum.UnderProcessing => "#8b5cf6", // Purple
            CorrespondenceStatusEnum.PendingApproval => "#f59e0b", // Amber
            CorrespondenceStatusEnum.Approved => "#10b981", // Green
            CorrespondenceStatusEnum.InSignatureAgenda => "#f59e0b", // Amber
            CorrespondenceStatusEnum.Signed => "#10b981", // Green
            CorrespondenceStatusEnum.SentOrOutgoing => "#059669", // Emerald
            CorrespondenceStatusEnum.Completed => "#059669", // Emerald
            CorrespondenceStatusEnum.Rejected => "#dc2626", // Red
            CorrespondenceStatusEnum.ReturnedForModification => "#f59e0b", // Amber
            CorrespondenceStatusEnum.Postponed => "#6b7280", // Gray
            CorrespondenceStatusEnum.Cancelled => "#dc2626", // Red
            _ => "#6b7280" // Gray
        };
    }

    /// <summary>
    /// Determines if a status is considered "active" (not final)
    /// </summary>
    public static bool IsActiveStatus(this CorrespondenceStatusEnum status)
    {
        return status switch
        {
            CorrespondenceStatusEnum.Registered or
            CorrespondenceStatusEnum.PendingReferral or
            CorrespondenceStatusEnum.UnderProcessing or
            CorrespondenceStatusEnum.PendingApproval or
            CorrespondenceStatusEnum.InSignatureAgenda => true,
            _ => false
        };
    }

    /// <summary>
    /// Groups correspondence by urgency based on due dates
    /// </summary>
    public static string GetUrgencyLevel(DateTime? dueDate)
    {
        if (!dueDate.HasValue) return "No Due Date";

        var daysTodue = (dueDate.Value - DateTime.UtcNow).TotalDays;

        return daysTodue switch
        {
            < 0 => "Overdue",
            < 1 => "Due Today",
            < 3 => "Due Soon",
            < 7 => "Due This Week",
            _ => "Due Later"
        };
    }
}
