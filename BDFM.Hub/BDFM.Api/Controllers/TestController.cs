using BDFM.Api.Attributes;
using BDFM.Application.Contracts.SignalR;

namespace BDFM.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [DisableRateLimit] // Disable rate limiting for testing endpoints
    public class TestController : ControllerBase
    {
        private readonly ICorrespondenceNotificationService _notificationService;
        private readonly ILogger<TestController> _logger;

        public TestController(
            ICorrespondenceNotificationService notificationService,
            ILogger<TestController> logger)
        {
            _notificationService = notificationService;
            _logger = logger;
        }

        [HttpPost("correspondence-assignment")]
        public async Task<IActionResult> TestCorrespondenceAssignment(
            [FromQuery] Guid correspondenceId,
            [FromQuery] Guid organizationalUnitId,
            [FromQuery] string moduleName = "Test Module")
        {
            try
            {
                _logger.LogInformation("Manual test: Triggering correspondence assignment notification for correspondence {CorrespondenceId} to module {ModuleName} ({OrganizationalUnitId})",
                    correspondenceId, moduleName, organizationalUnitId);

                await _notificationService.NotifyCorrespondenceAssignedToModuleAsync(
                    correspondenceId,
                    organizationalUnitId,
                    moduleName);

                return Ok(new
                {
                    success = true,
                    message = $"Notification sent for correspondence {correspondenceId} to module {moduleName}",
                    correspondenceId,
                    organizationalUnitId,
                    moduleName
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in test correspondence assignment notification");
                return StatusCode(500, new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }

        [HttpPost("workflow-step")]
        public async Task<IActionResult> TestWorkflowStepCreated(
            [FromQuery] Guid workflowStepId,
            [FromQuery] Guid correspondenceId,
            [FromQuery] Guid? organizationalUnitId = null)
        {
            try
            {
                _logger.LogInformation("Manual test: Triggering workflow step created notification for step {WorkflowStepId}, correspondence {CorrespondenceId}, unit {OrganizationalUnitId}",
                    workflowStepId, correspondenceId, organizationalUnitId);

                await _notificationService.NotifyWorkflowStepCreatedAsync(
                    workflowStepId,
                    correspondenceId,
                    organizationalUnitId);

                return Ok(new
                {
                    success = true,
                    message = "Workflow step notification sent",
                    workflowStepId,
                    correspondenceId,
                    organizationalUnitId
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in test workflow step notification");
                return StatusCode(500, new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }

        [HttpPost("inbox-update")]
        public async Task<IActionResult> TestInboxUpdate([FromQuery] Guid? userId = null)
        {
            try
            {
                _logger.LogInformation("Manual test: Triggering inbox update notification for user {UserId}", userId);

                await _notificationService.NotifyInboxUpdateAsync(userId);

                return Ok(new
                {
                    success = true,
                    message = "Inbox update notification sent",
                    userId
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in test inbox update notification");
                return StatusCode(500, new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }

        [HttpPost("debug-signalr-groups")]
        public async Task<IActionResult> DebugSignalRGroups(
            [FromQuery] Guid? testUserId = null,
            [FromQuery] Guid? testOrgUnitId = null)
        {
            try
            {
                _logger.LogInformation("🔔 [TestController] Debug SignalR Groups - TestUserId: {TestUserId}, TestOrgUnitId: {TestOrgUnitId}",
                    testUserId, testOrgUnitId);

                var testResults = new List<object>();

                // Test 1: General inbox update (should reach everyone)
                try
                {
                    await _notificationService.NotifyInboxUpdateAsync();
                    testResults.Add(new { Test = "InboxUpdate", Status = "Sent", Target = "All users in CorrespondenceUpdates group" });
                    _logger.LogInformation("✅ Test 1: General inbox update sent");
                }
                catch (Exception ex)
                {
                    testResults.Add(new { Test = "InboxUpdate", Status = "Failed", Error = ex.Message });
                    _logger.LogError(ex, "❌ Test 1: General inbox update failed");
                }

                // Test 2: User-specific notification (if testUserId provided)
                if (testUserId.HasValue)
                {
                    try
                    {
                        await _notificationService.NotifyCorrespondenceStatusChangedAsync(
                            Guid.NewGuid(), // Dummy correspondence ID
                            "Test Status",
                            "New Test Status",
                            testUserId,
                            testUserId // Send to specific user
                        );
                        testResults.Add(new { Test = "UserSpecific", Status = "Sent", Target = $"User_{testUserId}", UserId = testUserId });
                        _logger.LogInformation("✅ Test 2: User-specific notification sent to User_{TestUserId}", testUserId);
                    }
                    catch (Exception ex)
                    {
                        testResults.Add(new { Test = "UserSpecific", Status = "Failed", Error = ex.Message, UserId = testUserId });
                        _logger.LogError(ex, "❌ Test 2: User-specific notification failed for User_{TestUserId}", testUserId);
                    }
                }

                // Test 3: Module-specific notification (if testOrgUnitId provided)
                if (testOrgUnitId.HasValue)
                {
                    try
                    {
                        await _notificationService.NotifyCorrespondenceAssignedToModuleAsync(
                            Guid.NewGuid(), // Dummy correspondence ID
                            testOrgUnitId.Value,
                            $"Test Module {testOrgUnitId}"
                        );
                        testResults.Add(new { Test = "ModuleSpecific", Status = "Sent", Target = $"Module_{testOrgUnitId}", OrgUnitId = testOrgUnitId });
                        _logger.LogInformation("✅ Test 3: Module-specific notification sent to Module_{TestOrgUnitId}", testOrgUnitId);
                    }
                    catch (Exception ex)
                    {
                        testResults.Add(new { Test = "ModuleSpecific", Status = "Failed", Error = ex.Message, OrgUnitId = testOrgUnitId });
                        _logger.LogError(ex, "❌ Test 3: Module-specific notification failed for Module_{TestOrgUnitId}", testOrgUnitId);
                    }
                }

                // Test 4: Status change with notification
                if (testUserId.HasValue)
                {
                    try
                    {
                        await _notificationService.NotifyCorrespondenceStatusChangedToUsersWithNotificationsAsync(
                            Guid.NewGuid(), // Dummy correspondence ID
                            "Debug Test Status"
                        );
                        testResults.Add(new { Test = "StatusChangeWithNotification", Status = "Sent", Target = "Users with notifications enabled" });
                        _logger.LogInformation("✅ Test 4: Status change with notification sent");
                    }
                    catch (Exception ex)
                    {
                        testResults.Add(new { Test = "StatusChangeWithNotification", Status = "Failed", Error = ex.Message });
                        _logger.LogError(ex, "❌ Test 4: Status change with notification failed");
                    }
                }

                return Ok(new
                {
                    success = true,
                    message = "SignalR debug tests completed",
                    testResults,
                    instructions = new
                    {
                        frontend = "Check browser console for '�� [useNotifications] Received' messages",
                        backend = "Check server logs for SignalR group membership and notification sending",
                        connectionInfo = "Use GetConnectionInfo() in browser console to check group membership"
                    },
                    debugTips = new[]
                    {
                        "Ensure user is authenticated and in correct groups",
                        "Check that OrganizationalUnitId is properly set",
                        "Verify SignalR connection is established before testing",
                        "Look for ✅ and ❌ emojis in server logs for group membership"
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error in SignalR debug test");
                return StatusCode(500, new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }
    }
}