using System;
using System.ComponentModel.DataAnnotations;
using BDFM.Domain.Common;

namespace BDFM.Domain.Entities.Core
{
    /// <summary>
    /// Entity for tracking sequential counters used for generating unique identifiers
    /// </summary>
    public class SequentialCounter : AuditableEntity<Guid>
    {
        /// <summary>
        /// Name of the counter (e.g., "MailFileCounter")
        /// </summary>
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;
        
        /// <summary>
        /// Year associated with this counter (for yearly resets)
        /// </summary>
        public int Year { get; set; }
        
        /// <summary>
        /// Current value of the counter
        /// </summary>
        public int CurrentValue { get; set; }
        
        /// <summary>
        /// When the counter was last updated
        /// </summary>
        public DateTime LastUpdated { get; set; }
    }
}
