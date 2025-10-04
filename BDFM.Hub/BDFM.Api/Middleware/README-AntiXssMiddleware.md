# Anti-XSS Middleware Enhancement

## Problem

The Anti-XSS middleware was blocking legitimate file upload requests due to detecting patterns in Base64 encoded content and multipart form data that resembled potential XSS attacks.

## Solution

Enhanced the `AntiXssMiddleware` with multiple layers of protection while allowing legitimate file uploads:

### 1. Content Type Detection

-  Automatically skips XSS validation for `multipart/form-data` content type
-  Recognizes file upload endpoints based on URL patterns (`/attachment`, `/upload`, `/file`)

### 2. Attribute-Based Bypass

Created `SkipAntiXssValidationAttribute` that can be applied to:

-  Controllers (affects all actions)
-  Individual action methods

Usage:

```csharp
[SkipAntiXssValidation]
public class AttachmentsController : Base<AttachmentsController>
{
    // All actions in this controller skip XSS validation
}

// Or on individual actions:
[SkipAntiXssValidation]
public async Task<ActionResult<Response<bool>>> UploadFile([FromForm] FileUploadCommand command)
{
    // This specific action skips XSS validation
}
```

### 3. Smart Content Detection

Enhanced the XSS detection logic to be smarter about:

-  **Base64 Content**: Recognizes Base64 encoded data and skips validation
-  **Multipart Boundaries**: Recognizes multipart form data structure and skips validation

### 4. Applied to AttachmentsController

The `AttachmentsController` is now marked with `[SkipAntiXssValidation]` to ensure all file upload operations work correctly.

## Benefits

-  ✅ File uploads now work without XSS false positives
-  ✅ Maintains security for regular form submissions
-  ✅ Flexible attribute-based control for specific endpoints
-  ✅ Smart detection prevents false positives for legitimate content
-  ✅ Backward compatible with existing functionality

## Security Notes

-  XSS validation is still active for regular form submissions and JSON payloads
-  File content should still be validated at the application level for malicious content
-  Consider implementing additional file type and size validation in your upload handlers
