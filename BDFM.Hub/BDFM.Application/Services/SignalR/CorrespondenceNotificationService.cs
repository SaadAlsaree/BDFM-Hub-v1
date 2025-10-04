using BDFM.Application.Contracts.SignalR;
using BDFM.Application.Hubs;
using BDFM.Domain.Entities.Supporting;
using BDFM.Domain.Entities.Core;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace BDFM.Application.Services.SignalR
{
    public class CorrespondenceNotificationService : ICorrespondenceNotificationService
    {
        private readonly IHubContext<CorrespondenceHub> _hubContext;
        private readonly ILogger<CorrespondenceNotificationService> _logger;
        private readonly IBaseRepository<UserCorrespondenceInteraction> _userCorrespondenceInteractionRepository;
        private readonly IBaseRepository<User> _userRepository;
        private readonly IBaseRepository<Correspondence> _correspondenceRepository;

        public CorrespondenceNotificationService(
            IHubContext<CorrespondenceHub> hubContext,
            ILogger<CorrespondenceNotificationService> logger,
            IBaseRepository<UserCorrespondenceInteraction> userCorrespondenceInteractionRepository,
            IBaseRepository<User> userRepository,
            IBaseRepository<Correspondence> correspondenceRepository)
        {
            _hubContext = hubContext;
            _logger = logger;
            _userCorrespondenceInteractionRepository = userCorrespondenceInteractionRepository;
            _userRepository = userRepository;
            _correspondenceRepository = correspondenceRepository;
        }

        public async Task NotifyInboxUpdateAsync(Guid? userId = null)
        {
            try
            {
                var message = new
                {
                    userId = userId?.ToString(),
                    moduleId = (string?)null,
                    correspondenceCount = 0, // This should be calculated based on actual inbox
                    unreadCount = 0, // This should be calculated based on actual unread count
                    timestamp = DateTime.UtcNow.ToString("O") // ISO format
                };

                if (userId.HasValue)
                {
                    // Send to specific user
                    await _hubContext.Clients.Group($"User_{userId.Value}")
                        .SendAsync("InboxUpdated", message);

                    _logger.LogInformation("Inbox update notification sent to user {UserId}", userId.Value);
                }
                else
                {
                    // Send to all connected users
                    await _hubContext.Clients.Group("CorrespondenceUpdates")
                        .SendAsync("InboxUpdated", message);

                    _logger.LogInformation("Inbox update notification sent to all users");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending inbox update notification");
                throw;
            }
        }

        public async Task NotifyCorrespondenceCreatedAsync(Guid correspondenceId, Guid? userId = null)
        {
            try
            {
                // Get correspondence details
                var correspondence = await _correspondenceRepository.Find(c => c.Id == correspondenceId);
                if (correspondence == null)
                {
                    _logger.LogWarning("Correspondence {CorrespondenceId} not found for notification", correspondenceId);
                    return;
                }

                var message = new
                {
                    correspondenceId = correspondenceId.ToString(),
                    subject = correspondence.Subject ?? "New Correspondence",
                    correspondenceType = correspondence.CorrespondenceType.ToString(),
                    createdBy = "System", // Use actual created by field when available
                    createdAt = correspondence.CreateAt.ToString("O")
                };

                if (userId.HasValue)
                {
                    await _hubContext.Clients.Group($"User_{userId.Value}")
                        .SendAsync("CorrespondenceCreated", message);

                    _logger.LogInformation("Correspondence created notification sent to user {UserId} for correspondence {CorrespondenceId}",
                        userId.Value, correspondenceId);
                }
                else
                {
                    await _hubContext.Clients.Group("CorrespondenceUpdates")
                        .SendAsync("CorrespondenceCreated", message);

                    _logger.LogInformation("Correspondence created notification sent to all users for correspondence {CorrespondenceId}",
                        correspondenceId);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending correspondence created notification for correspondence {CorrespondenceId}",
                    correspondenceId);
                throw;
            }
        }

        public async Task NotifyCorrespondenceUpdatedAsync(Guid correspondenceId, Guid? userId = null)
        {
            try
            {
                // Get correspondence details
                var correspondence = await _correspondenceRepository.Find(c => c.Id == correspondenceId);
                if (correspondence == null)
                {
                    _logger.LogWarning("Correspondence {CorrespondenceId} not found for update notification", correspondenceId);
                    return;
                }

                var message = new
                {
                    correspondenceId = correspondenceId.ToString(),
                    subject = correspondence.Subject ?? "Updated Correspondence",
                    updatedFields = new[] { "General Update" }, // This could be more specific based on what changed
                    updatedBy = "System", // Use actual updated by field when available
                    updatedAt = correspondence.LastUpdateAt?.ToString("O") ?? DateTime.UtcNow.ToString("O")
                };

                if (userId.HasValue)
                {
                    await _hubContext.Clients.Group($"User_{userId.Value}")
                        .SendAsync("CorrespondenceUpdated", message);

                    _logger.LogInformation("Correspondence updated notification sent to user {UserId} for correspondence {CorrespondenceId}",
                        userId.Value, correspondenceId);
                }
                else
                {
                    await _hubContext.Clients.Group("CorrespondenceUpdates")
                        .SendAsync("CorrespondenceUpdated", message);

                    _logger.LogInformation("Correspondence updated notification sent to all users for correspondence {CorrespondenceId}",
                        correspondenceId);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending correspondence updated notification for correspondence {CorrespondenceId}",
                    correspondenceId);
                throw;
            }
        }

        public async Task NotifyCorrespondenceDeletedAsync(Guid correspondenceId, string? subject = null, Guid? deletedBy = null, Guid? userId = null)
        {
            try
            {
                var message = new
                {
                    correspondenceId = correspondenceId.ToString(),
                    subject = subject ?? "Deleted Correspondence",
                    deletedBy = deletedBy?.ToString() ?? "System",
                    deletedAt = DateTime.UtcNow.ToString("O")
                };

                if (userId.HasValue)
                {
                    await _hubContext.Clients.Group($"User_{userId.Value}")
                        .SendAsync("CorrespondenceDeleted", message);

                    _logger.LogInformation("Correspondence deleted notification sent to user {UserId} for correspondence {CorrespondenceId}",
                        userId.Value, correspondenceId);
                }
                else
                {
                    await _hubContext.Clients.Group("CorrespondenceUpdates")
                        .SendAsync("CorrespondenceDeleted", message);

                    _logger.LogInformation("Correspondence deleted notification sent to all users for correspondence {CorrespondenceId}",
                        correspondenceId);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending correspondence deleted notification for correspondence {CorrespondenceId}",
                    correspondenceId);
                throw;
            }
        }

        public async Task NotifyCorrespondenceStatusChangedAsync(Guid correspondenceId, string oldStatus, string newStatus, Guid? changedBy = null, Guid? userId = null)
        {
            try
            {
                var message = new
                {
                    correspondenceId = correspondenceId.ToString(),
                    oldStatus = oldStatus,
                    newStatus = newStatus,
                    changedBy = changedBy?.ToString() ?? "System",
                    changedAt = DateTime.UtcNow.ToString("O")
                };

                if (userId.HasValue)
                {
                    await _hubContext.Clients.Group($"User_{userId.Value}")
                        .SendAsync("CorrespondenceStatusChanged", message);

                    _logger.LogInformation("Correspondence status changed notification sent to user {UserId} for correspondence {CorrespondenceId}",
                        userId.Value, correspondenceId);
                }
                else
                {
                    await _hubContext.Clients.Group("CorrespondenceUpdates")
                        .SendAsync("CorrespondenceStatusChanged", message);

                    _logger.LogInformation("Correspondence status changed notification sent to all users for correspondence {CorrespondenceId}",
                        correspondenceId);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending correspondence status changed notification for correspondence {CorrespondenceId}",
                    correspondenceId);
                throw;
            }
        }

        public async Task NotifyCorrespondenceAssignedToModuleAsync(Guid correspondenceId, Guid organizationalUnitId, string moduleName)
        {
            try
            {
                _logger.LogInformation("Starting notification for correspondence {CorrespondenceId} assigned to module {ModuleName} ({OrganizationalUnitId})",
                    correspondenceId, moduleName, organizationalUnitId);

                // Get correspondence details
                var correspondence = await _correspondenceRepository.Find(c => c.Id == correspondenceId);

                // Get all users in the organizational unit (module)
                var usersInModule = await _userRepository.Query()
                    .Where(u => u.OrganizationalUnitId == organizationalUnitId && !u.IsDeleted)
                    .Select(u => new { u.Id, u.Username })
                    .ToListAsync();

                _logger.LogInformation("Found {UserCount} users in module {ModuleName}: {UserNames}",
                    usersInModule.Count, moduleName,
                    string.Join(", ", usersInModule.Select(u => $"{u.Username} ({u.Id})")));

                if (!usersInModule.Any())
                {
                    _logger.LogWarning("No users found in module {ModuleName} ({OrganizationalUnitId}) for correspondence {CorrespondenceId}",
                        moduleName, organizationalUnitId, correspondenceId);
                    return;
                }

                var message = new
                {
                    correspondenceId = correspondenceId.ToString(),
                    moduleId = organizationalUnitId.ToString(),
                    moduleName = moduleName,
                    subject = correspondence?.Subject ?? "New Assignment",
                    message = $"تم تحويل الكتاب لوحدتك: {moduleName}",
                    timestamp = DateTime.UtcNow.ToString("O")
                };

                _logger.LogInformation("Sending notification message: {Message}",
                    JsonSerializer.Serialize(message));

                // Send notifications to all users in the module using batch operations
                var notificationTasks = usersInModule.Select(async user =>
                {
                    try
                    {
                        _logger.LogDebug("Sending notification to user {Username} ({UserId}) in group User_{UserId}",
                            user.Username, user.Id, user.Id);

                        await _hubContext.Clients.Group($"User_{user.Id}")
                            .SendAsync("CorrespondenceAssignedToModule", message);

                        _logger.LogDebug("Successfully sent notification to user {Username} ({UserId})",
                            user.Username, user.Id);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error sending notification to user {Username} ({UserId})",
                            user.Username, user.Id);
                    }
                });

                await Task.WhenAll(notificationTasks);

                // Also send to module group if it exists
                try
                {
                    _logger.LogDebug("Sending notification to module group Module_{OrganizationalUnitId}", organizationalUnitId);
                    await _hubContext.Clients.Group($"Module_{organizationalUnitId}")
                        .SendAsync("CorrespondenceAssignedToModule", message);
                    _logger.LogDebug("Successfully sent notification to module group Module_{OrganizationalUnitId}", organizationalUnitId);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error sending notification to module group Module_{OrganizationalUnitId}", organizationalUnitId);
                }

                _logger.LogInformation("Correspondence assignment notification completed for {UserCount} users in module {ModuleName} for correspondence {CorrespondenceId}",
                    usersInModule.Count, moduleName, correspondenceId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending correspondence assignment notification for correspondence {CorrespondenceId} to module {OrganizationalUnitId}",
                    correspondenceId, organizationalUnitId);
                throw;
            }
        }

        public async Task NotifyCorrespondenceStatusChangedToUsersWithNotificationsAsync(Guid correspondenceId, string newStatus)
        {
            try
            {
                // Get users who have enabled notifications for this correspondence
                var usersWithNotifications = await _userCorrespondenceInteractionRepository.Query()
                    .Where(uci => uci.CorrespondenceId == correspondenceId && uci.ReceiveNotifications == true && !uci.IsDeleted)
                    .Include(uci => uci.User)
                    .Select(uci => new { uci.UserId, uci.User.Username })
                    .ToListAsync();

                if (!usersWithNotifications.Any())
                {
                    _logger.LogInformation("No users with notifications enabled found for correspondence {CorrespondenceId}", correspondenceId);
                    return;
                }

                var message = new
                {
                    correspondenceId = correspondenceId.ToString(),
                    newStatus = newStatus,
                    message = $"تم تحديث حالة الكتاب إلى {newStatus}",
                    userId = "" // This will be set for each user
                };

                // Send notifications to users who have enabled notifications
                var notificationTasks = usersWithNotifications.Select(async user =>
                {
                    try
                    {
                        var userMessage = new
                        {
                            correspondenceId = correspondenceId.ToString(),
                            newStatus = newStatus,
                            message = $"تم تحديث حالة الكتاب إلى {newStatus}",
                            userId = user.UserId.ToString()
                        };

                        await _hubContext.Clients.Group($"User_{user.UserId}")
                            .SendAsync("CorrespondenceStatusChangedWithNotification", userMessage);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error sending notification to user {UserId}", user.UserId);
                    }
                });

                await Task.WhenAll(notificationTasks);

                _logger.LogInformation("Correspondence status notification sent to {UserCount} users with notifications enabled for correspondence {CorrespondenceId}",
                    usersWithNotifications.Count, correspondenceId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending correspondence status notification to users with notifications enabled for correspondence {CorrespondenceId}",
                    correspondenceId);
                throw;
            }
        }

        public async Task NotifyWorkflowStepCreatedAsync(Guid workflowStepId, Guid correspondenceId, Guid? organizationalUnitId = null)
        {
            try
            {
                var message = new
                {
                    workflowStepId = workflowStepId.ToString(),
                    correspondenceId = correspondenceId.ToString(),
                    recipientType = organizationalUnitId.HasValue ? "Module" : "General",
                    message = "تم إنشاء خطوة عمل جديدة"
                };

                if (organizationalUnitId.HasValue)
                {
                    // Send to module group
                    await _hubContext.Clients.Group($"Module_{organizationalUnitId.Value}")
                        .SendAsync("WorkflowStepCreated", message);

                    // Also send to users in the module
                    var usersInModule = await _userRepository.Query()
                        .Where(u => u.OrganizationalUnitId == organizationalUnitId.Value && !u.IsDeleted)
                        .Select(u => u.Id)
                        .ToListAsync();

                    var notificationTasks = usersInModule.Select(async userId =>
                    {
                        try
                        {
                            await _hubContext.Clients.Group($"User_{userId}")
                                .SendAsync("WorkflowStepCreated", message);
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex, "Error sending workflow step notification to user {UserId}", userId);
                        }
                    });

                    await Task.WhenAll(notificationTasks);

                    _logger.LogInformation("Workflow step created notification sent to module {OrganizationalUnitId} for workflow step {WorkflowStepId}",
                        organizationalUnitId.Value, workflowStepId);
                }
                else
                {
                    // Send to general correspondence updates group
                    await _hubContext.Clients.Group("CorrespondenceUpdates")
                        .SendAsync("WorkflowStepCreated", message);

                    _logger.LogInformation("Workflow step created notification sent to all users for workflow step {WorkflowStepId}", workflowStepId);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending workflow step created notification for workflow step {WorkflowStepId}", workflowStepId);
                throw;
            }
        }

        public async Task NotifyWorkflowStepCompletedAsync(Guid workflowStepId, Guid correspondenceId, Guid completedBy, Guid? nextStepId = null)
        {
            try
            {
                var message = new
                {
                    workflowStepId = workflowStepId.ToString(),
                    correspondenceId = correspondenceId.ToString(),
                    completedBy = completedBy.ToString(),
                    completedAt = DateTime.UtcNow.ToString("O"),
                    nextStepId = nextStepId?.ToString()
                };

                // Send to general correspondence updates group
                await _hubContext.Clients.Group("CorrespondenceUpdates")
                    .SendAsync("WorkflowStepCompleted", message);

                _logger.LogInformation("Workflow step completed notification sent for workflow step {WorkflowStepId}", workflowStepId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending workflow step completed notification for workflow step {WorkflowStepId}", workflowStepId);
                throw;
            }
        }

        public async Task NotifyWorkflowStepAssignedAsync(Guid workflowStepId, Guid correspondenceId, Guid assignedTo, Guid assignedBy, DateTime? dueDate = null)
        {
            try
            {
                var message = new
                {
                    workflowStepId = workflowStepId.ToString(),
                    correspondenceId = correspondenceId.ToString(),
                    assignedTo = assignedTo.ToString(),
                    assignedBy = assignedBy.ToString(),
                    dueDate = dueDate?.ToString("O")
                };

                // Send to the assigned user
                await _hubContext.Clients.Group($"User_{assignedTo}")
                    .SendAsync("WorkflowStepAssigned", message);

                _logger.LogInformation("Workflow step assigned notification sent to user {AssignedTo} for workflow step {WorkflowStepId}",
                    assignedTo, workflowStepId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending workflow step assigned notification for workflow step {WorkflowStepId}", workflowStepId);
                throw;
            }
        }
    }
}
