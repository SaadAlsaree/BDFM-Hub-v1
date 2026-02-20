namespace BDFM.Api.Tests.Helpers;

/// <summary>
/// Helper methods for creating test data
/// </summary>
public static class TestDataHelper
{
    private static readonly Random _random = new Random();

    /// <summary>
    /// Generates a random valid email address
    /// </summary>
    public static string GenerateRandomEmail()
    {
        const string chars = "abcdefghijklmnopqrstuvwxyz";
        var randomString = new string(Enumerable.Repeat(chars, 10)
            .Select(s => s[_random.Next(s.Length)]).ToArray());
        return $"{randomString}@example.com";
    }

    /// <summary>
    /// Generates a random GUID
    /// </summary>
    public static Guid GenerateRandomGuid()
    {
        return Guid.NewGuid();
    }

    /// <summary>
    /// Generates a random valid password
    /// </summary>
    public static string GenerateRandomPassword()
    {
        const string lowerChars = "abcdefghijklmnopqrstuvwxyz";
        const string upperChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const string numberChars = "0123456789";
        const string specialChars = "!@#$%^&*()";

        var password = new char[12];
        password[0] = lowerChars[_random.Next(lowerChars.Length)];
        password[1] = upperChars[_random.Next(upperChars.Length)];
        password[2] = numberChars[_random.Next(numberChars.Length)];
        password[3] = specialChars[_random.Next(specialChars.Length)];

        for (int i = 4; i < password.Length; i++)
        {
            var allChars = lowerChars + upperChars + numberChars + specialChars;
            password[i] = allChars[_random.Next(allChars.Length)];
        }

        return new string(password.OrderBy(_ => _random.Next()).ToArray());
    }

    /// <summary>
    /// Generates a random string of specified length
    /// </summary>
    public static string GenerateRandomString(int length)
    {
        const string chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        return new string(Enumerable.Repeat(chars, length)
            .Select(s => s[_random.Next(s.Length)]).ToArray());
    }

    /// <summary>
    /// Generates a list of random GUIDs
    /// </summary>
    public static List<Guid> GenerateRandomGuids(int count)
    {
        return Enumerable.Range(0, count)
            .Select(_ => Guid.NewGuid())
            .ToList();
    }

    /// <summary>
    /// Generates a random date within a range
    /// </summary>
    public static DateTime GenerateRandomDate(DateTime start, DateTime end)
    {
        var range = end - start;
        var randTimeSpan = new TimeSpan((long)(_random.NextDouble() * range.Ticks));
        return start + randTimeSpan;
    }

    /// <summary>
    /// Generates a random future date
    /// </summary>
    public static DateTime GenerateFutureDate(int daysAhead = 30)
    {
        return DateTime.Now.AddDays(_random.Next(1, daysAhead));
    }

    /// <summary>
    /// Generates a random past date
    /// </summary>
    public static DateTime GeneratePastDate(int daysBack = 30)
    {
        return DateTime.Now.AddDays(-_random.Next(1, daysBack));
    }

    /// <summary>
    /// Creates a test file content as byte array
    /// </summary>
    public static byte[] CreateTestFileContent(int sizeInBytes)
    {
        var content = new byte[sizeInBytes];
        _random.NextBytes(content);
        return content;
    }

    /// <summary>
    /// Creates a test PDF file content
    /// </summary>
    public static byte[] CreateTestPdfContent()
    {
        // Simple PDF header
        var pdfHeader = new byte[] { 0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34 };
        var content = new byte[100];
        pdfHeader.CopyTo(content, 0);
        _random.NextBytes(content, 8, content.Length - 8);
        return content;
    }

    /// <summary>
    /// Creates a test image content
    /// </summary>
    public static byte[] CreateTestImageContent()
    {
        // Simple PNG header
        var pngHeader = new byte[] { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A };
        var content = new byte[100];
        pngHeader.CopyTo(content, 0);
        _random.NextBytes(content, 8, content.Length - 8);
        return content;
    }

    /// <summary>
    /// Generates malicious input for security testing
    /// </summary>
    public static class SecurityTestData
    {
        /// <summary>
        /// SQL injection test strings
        /// </summary>
        public static readonly string[] SqlInjectionStrings = new[]
        {
            "' OR '1'='1",
            "' OR '1'='1'--",
            "' OR '1'='1'/*",
            "'; DROP TABLE Users; --",
            "1' UNION SELECT NULL, NULL, NULL--",
            "admin'--",
            "' OR 1=1#",
            "' OR 'a'='a"
        };

        /// <summary>
        /// XSS test strings
        /// </summary>
        public static readonly string[] XssStrings = new[]
        {
            "<script>alert('XSS')</script>",
            "<img src=x onerror=alert('XSS')>",
            "<svg onload=alert('XSS')>",
            "<iframe src='javascript:alert(\"XSS\")'>",
            "<body onload=alert('XSS')>",
            "<input autofocus onfocus=alert('XSS')>",
            "<select onfocus=alert('XSS')><option>XSS</option></select>",
            "<textarea onfocus=alert('XSS')>XSS</textarea>",
            "<keygen onfocus=alert('XSS')>",
            "<video><source onerror=alert('XSS')>"
        };

        /// <summary>
        /// Path traversal test strings
        /// </summary>
        public static readonly string[] PathTraversalStrings = new[]
        {
            "../../../etc/passwd",
            "..\\..\\..\\windows\\system32\\drivers\\etc\\hosts",
            "....//....//....//etc/passwd",
            "%2e%2e%2fetc%2fpasswd",
            "..%252f..%252f..%252fetc%2fpasswd",
            "..%c0%af..%c0%af..%c0%afetc/passwd",
            "..%5c..%5c..%5cboot.ini",
            "..%u2215..%u2215..%u2215etc/passwd"
        };

        /// <summary>
        /// Command injection test strings
        /// </summary>
        public static readonly string[] CommandInjectionStrings = new[]
        {
            "; cat /etc/passwd",
            "| cat /etc/passwd",
            "&& cat /etc/passwd",
            "|| cat /etc/passwd",
            "; cat /etc/passwd #",
            "`cat /etc/passwd`",
            "$(cat /etc/passwd)",
            "; ls -la",
            "| dir",
            "&& whoami"
        };

        /// <summary>
        /// LDAP injection test strings
        /// </summary>
        public static readonly string[] LdapInjectionStrings = new[]
        {
            "*)(uid=*",
            "*)(|(password=*))",
            "*))(|(password=*))",
            "*)(&",
            "*)(|(objectClass=*)(uid=*))",
            "*)(&(objectClass=*)",
            "*)(|(cn=*",
            "*))%00"
        };

        /// <summary>
        /// XXE (XML External Entity) injection test strings
        /// </summary>
        public static readonly string[] XxeInjectionStrings = new[]
        {
            "<?xml version=\"1.0\"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM \"file:///etc/passwd\">]><foo>&xxe;</foo>",
            "<?xml version=\"1.0\"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM \"http://example.com/evil.dtd\">]><foo>&xxe;</foo>",
            "<?xml version=\"1.0\"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM \"file:///c:/windows/win.ini\">]><foo>&xxe;</foo>"
        };

        /// <summary>
        /// Very long string for DoS testing
        /// </summary>
        public static string GenerateVeryLongString(int length = 100000)
        {
            return new string('A', length);
        }

        /// <summary>
        /// Special unicode characters for testing
        /// </summary>
        public static readonly string[] UnicodeTestStrings = new[]
        {
            "😀🎉",
            "こんにちは",
            "مرحبا",
            "العربية",
            "\u0000", // Null byte
            "\u0001", // Start of heading
            "\u001F", // Unit separator
            "\u007F", // Delete
            "\uFEFF", // Zero-width no-break space
            "\u200B", // Zero-width space
            "\u202E", // Right-to-left override
            "𝔘𝔫𝔦𝔠𝔬𝔡𝔢 𝔗𝔢𝔵𝔱"
        };

        /// <summary>
        /// Format string injection test strings
        /// </summary>
        public static readonly string[] FormatStringInjectionStrings = new[]
        {
            "%s%s%s%s%s%s%s%s%s%s",
            "%x%x%x%x%x%x%x%x%x%x",
            "%n%n%n%n%n%n%n%n%n%n",
            "%p%p%p%p%p%p%p%p%p%p",
            "{0}{0}{0}{0}{0}",
            "%1$*1$s",
            "%99999999999s",
            "%99999999999d"
        };
    }
}
