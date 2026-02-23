using System;
using System.Collections.Generic;

namespace BDFM.Application.Features.Users.Queries.GetUsersPerEntityReport
{
    public class UsersPerEntityReportDto
    {
        public string EntityName { get; set; } = string.Empty;
        public int UsersCount { get; set; }
        public List<UserReportItemDto> Users { get; set; } = new List<UserReportItemDto>();
    }

    public class UserReportItemDto
    {
        public string FullName { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}
