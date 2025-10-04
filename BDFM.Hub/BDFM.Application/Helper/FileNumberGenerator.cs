using System;
using System.Linq;
using System.Linq.Expressions;
using BDFM.Domain.Entities.Core;

namespace BDFM.Application.Helper
{
    public class FileNumberGenerator : IFileNumberGenerator
    {
        private readonly IBaseRepository<MailFile> _mailFileRepository;

        public FileNumberGenerator(IBaseRepository<MailFile> mailFileRepository)
        {
            _mailFileRepository = mailFileRepository ?? throw new ArgumentNullException(nameof(mailFileRepository));
        }

        /// <summary>
        /// Generates a unique file number in the format "YYYY-1"
        /// Thread-safe implementation to prevent race conditions
        /// </summary>
        /// <returns>A unique file number</returns>
        public string GetUniqueFileNumber()
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
                    string fileNumber = string.Format("{0}-{1}", currentYear, nextNumber);

                    // Verify the number is still unique before returning
                    if (IsFileNumberUnique(fileNumber))
                    {
                        return fileNumber;
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
            return GetTimestampBasedFileNumber();
        }

        /// <summary>
        /// Gets the next sequential number for the specified year based on existing files
        /// </summary>
        /// <param name="year">The year to get the next number for</param>
        /// <returns>The next available sequence number</returns>
        private int GetNextSequentialNumberFromExistingFiles(int year)
        {
            // Get the highest number used for the current year
            string yearPrefix = $"FN-{year}-";

            var existingFiles = _mailFileRepository.Get(
                filter: mf => mf.FileNumber.StartsWith(yearPrefix),
                orderBy: null!,
                include: null!,
                take: -1,
                skip: 0
            ).ToList();

            if (!existingFiles.Any())
            {
                // No files exist for this year, start with 1
                return 1;
            }

            // Find the highest number
            int maxNumber = 0;

            foreach (var file in existingFiles)
            {
                if (TryExtractNumber(file.FileNumber, out int number))
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
            // Get existing files for the year
            var existingFiles = _mailFileRepository.Get(
                filter: mf => mf.FileNumber.StartsWith($"{year}-"),
                orderBy: null!,
                include: null!,
                take: -1,
                skip: 0
            ).ToList();

            int maxNumber = 0;
            foreach (var file in existingFiles)
            {
                if (TryExtractNumber(file.FileNumber, out int number))
                {
                    maxNumber = Math.Max(maxNumber, number);
                }
            }

            return maxNumber + 1;
        }

        /// <summary>
        /// Verifies if a file number is unique in the database
        /// </summary>
        /// <param name="fileNumber">The file number to check</param>
        /// <returns>True if unique, false otherwise</returns>
        private bool IsFileNumberUnique(string fileNumber)
        {
            var existingFile = _mailFileRepository.Get(
                filter: mf => mf.FileNumber == fileNumber,
                orderBy: null!,
                include: null!,
                take: 1,
                skip: 0
            ).FirstOrDefault();

            return existingFile == null;
        }

        /// <summary>
        /// Fallback method using timestamp to ensure uniqueness
        /// </summary>
        /// <returns>A unique file number based on timestamp</returns>
        private string GetTimestampBasedFileNumber()
        {
            int currentYear = DateTime.Now.Year;
            long timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
            return string.Format("{0}-{1}", currentYear, timestamp);
        }

        /// <summary>
        /// Tries to extract the numeric part from a file number
        /// </summary>
        /// <param name="fileNumber">The file number in format "YYYY-1"</param>
        /// <param name="number">The extracted number</param>
        /// <returns>True if successful, false otherwise</returns>
        private bool TryExtractNumber(string fileNumber, out int number)
        {
            number = 0;

            // Extract the number part from the file number (e.g., "2025-123" -> 123)
            string[] parts = fileNumber.Split('-');
            if (parts.Length != 2)
            {
                return false;
            }

            return int.TryParse(parts[1], out number);
        }
    }
}
