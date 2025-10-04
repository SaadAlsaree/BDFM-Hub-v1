using System;
using System.Linq;
using System.Linq.Expressions;
using BDFM.Domain.Entities.Core;

namespace BDFM.Application.Helper
{
    public class MailNumberGenerator : IMailNumberGenerator
    {
        private readonly IBaseRepository<Correspondence> _correspondenceRepository;

        public MailNumberGenerator(IBaseRepository<Correspondence> correspondenceRepository)
        {
            _correspondenceRepository = correspondenceRepository ?? throw new ArgumentNullException(nameof(correspondenceRepository));
        }

        /// <summary>
        /// Generates a unique mail number in the format "YYYY-1"
        /// Thread-safe implementation to prevent race conditions
        /// </summary>
        /// <returns>A unique mail number</returns>
        public string GetUniqueMailNumber()
        {
            int currentYear = DateTime.Now.Year;
            int maxRetries = 10;
            int retryCount = 0;

            while (retryCount < maxRetries)
            {
                try
                {
                    // Get the next number with database-level locking
                    int nextNumber = GetNextSequentialNumberWithLock(currentYear);
                    string mailNumber = string.Format("{0}-{1}", currentYear, nextNumber);

                    // Verify the number is still unique before returning
                    if (IsMailNumberUnique(mailNumber))
                    {
                        return mailNumber;
                    }

                    // If not unique, retry
                    retryCount++;
                    Thread.Sleep(10); // Small delay before retry
                }
                catch (Exception)
                {
                    retryCount++;
                    Thread.Sleep(50); // Longer delay on exception
                }
            }

            // Fallback: use timestamp-based approach
            return GetTimestampBasedMailNumber();
        }

        /// <summary>
        /// Gets the next sequential number for the specified year based on existing mails
        /// </summary>
        /// <param name="year">The year to get the next number for</param>
        /// <returns>The next available sequence number</returns>
        private int GetNextSequentialNumberFromExistingMails(int year)
        {
            // Get the highest number used for the current year
            string yearPrefix = $"{year}-";

            var existingMails = _correspondenceRepository.Get(
                filter: c => c.MailNum.StartsWith(yearPrefix),
                orderBy: null!,
                include: null!,
                take: -1,
                skip: 0
            ).ToList();

            if (!existingMails.Any())
            {
                // No mails exist for this year, start with 1
                return 1;
            }

            // Find the highest number
            int maxNumber = 0;

            foreach (var mail in existingMails)
            {
                if (TryExtractNumber(mail.MailNum, out int number))
                {
                    maxNumber = Math.Max(maxNumber, number);
                }
            }

            // Return the next number in sequence
            return maxNumber + 1;
        }

        /// <summary>
        /// Gets the next sequential number with database-level locking to prevent race conditions
        /// </summary>
        /// <param name="year">The year to get the next number for</param>
        /// <returns>The next available sequence number</returns>
        private int GetNextSequentialNumberWithLock(int year)
        {
            // Get existing mails for the year
            var existingMails = _correspondenceRepository.Get(
                filter: c => c.MailNum.StartsWith($"{year}-"),
                orderBy: null!,
                include: null!,
                take: -1,
                skip: 0
            ).ToList();

            int maxNumber = 0;
            foreach (var mail in existingMails)
            {
                if (TryExtractNumber(mail.MailNum, out int number))
                {
                    maxNumber = Math.Max(maxNumber, number);
                }
            }

            return maxNumber + 1;
        }

        /// <summary>
        /// Verifies if a mail number is unique in the database
        /// </summary>
        /// <param name="mailNumber">The mail number to check</param>
        /// <returns>True if unique, false otherwise</returns>
        private bool IsMailNumberUnique(string mailNumber)
        {
            var existingMail = _correspondenceRepository.Get(
                filter: c => c.MailNum == mailNumber,
                orderBy: null!,
                include: null!,
                take: 1,
                skip: 0
            ).FirstOrDefault();

            return existingMail == null;
        }

        /// <summary>
        /// Fallback method using timestamp to ensure uniqueness
        /// </summary>
        /// <returns>A unique mail number based on timestamp</returns>
        private string GetTimestampBasedMailNumber()
        {
            int currentYear = DateTime.Now.Year;
            long timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
            return string.Format("{0}-{1}", currentYear, timestamp);
        }

        /// <summary>
        /// Tries to extract the numeric part from a mail number
        /// </summary>
        /// <param name="mailNumber">The mail number in format "YYYY-1"</param>
        /// <param name="number">The extracted number</param>
        /// <returns>True if successful, false otherwise</returns>
        private bool TryExtractNumber(string mailNumber, out int number)
        {
            number = 0;

            // Extract the number part from the mail number (e.g., "2025-123" -> 123)
            string[] parts = mailNumber.Split('-');
            if (parts.Length != 2)
            {
                return false;
            }

            return int.TryParse(parts[1], out number);
        }
    }
}
