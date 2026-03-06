namespace BDFM.Api.Helpers
{
    /// <summary>
    /// Table name whitelist for secure status change operations
    /// Prevents SQL injection via table name manipulation
    /// </summary>
    public static class ValidTableNames
    {
        /// <summary>
        /// Allowed table names for status change operations
        /// </summary>
        public static readonly System.Collections.Generic.HashSet<string> AllowedTableNames = new()
        {
            "Users",
            "Roles",
            "Attachments",
            "Correspondences",
            "WorkflowSteps",
            "CorrespondenceComment",
            "Announcements",
            "Delegations",
            "CustomWorkflows",
            "CustomWorkflowSteps",
            "Tags",
            "CorrespondenceTag"
        };

        /// <summary>
        /// Validates if a table name is in the allowed list
        /// </summary>
        /// <param name="tableName">The table name to validate</param>
        /// <returns>True if the table name is allowed, false otherwise</returns>
        public static bool IsValid(string tableName)
        {
            if (string.IsNullOrWhiteSpace(tableName))
                return false;

            return AllowedTableNames.Contains(tableName);
        }
    }
}
