# 🔔 Real-Time Notifications Testing Guide

## ✅ **Problem Fixed**

The issue where notifications were only received on the notifications page has been resolved! Here's what was fixed:

### **Root Cause**

- SignalR event listeners were only active when `useNotifications` hook was called
- Each page/component using `useNotifications` created separate event listeners
- This caused notifications to only work when on specific pages

### **Solution Implemented**

1. **Global Notification Listener**: Created `useGlobalNotifications` hook that runs in the header on all pages
2. **Separated Concerns**: NotificationBell now only handles display, not event listening
3. **Avoided Duplicates**: Notifications page now skips setting up its own listeners
4. **Always Active**: Real-time notifications now work across ALL pages

## 🧪 **How to Test**

### **Method 1: Using the Testing Component**

1. **Add the test component to any page** (temporarily):

   ```tsx
   import { NotificationTester } from '@/components/NotificationTester';

   // Add this to any page component
   <NotificationTester visible={process.env.NODE_ENV === 'development'} />;
   ```

2. **Get your User ID**:

   - Open browser console
   - Look for logs like `🔔 [Header] Global notifications active`
   - Or check the SignalR connection info

3. **Test the notifications**:
   - Enter your User ID in the tester
   - Click "Test Notifications"
   - Watch for toast notifications and console logs

### **Method 2: Backend Testing Endpoint**

You can test directly by calling the backend endpoint:

```bash
POST /api/test/debug-signalr-groups?testUserId=YOUR_USER_ID&testOrgUnitId=YOUR_ORG_ID
```

### **Method 3: Real User Actions**

1. **Change Correspondence Status**:

   - Navigate to any correspondence
   - Change its status
   - Switch to a different page
   - You should see the notification immediately

2. **Transfer Correspondence**:
   - Transfer a correspondence to another unit
   - The assigned user should receive notification
   - Notification should appear on any page they're on

## 🔍 **What to Look For**

### **Console Logs**

Look for these logs in the browser console:

```
🔔 [Header] Global notifications active - SignalR available: true, Connected: true
🔔 [GlobalNotifications] Setting up global SignalR notification listeners
🔔 [GlobalNotifications] Received CorrespondenceStatusChangedWithNotification event:
🔔 [NotificationBell] Render - Connected: true, Unread: 5, Notifications: 8
```

### **Visual Indicators**

- ✅ **Notification Bell**: Should show updated count immediately
- ✅ **Toast Notifications**: Should appear on any page
- ✅ **Green WiFi Icon**: Shows SignalR is connected
- ✅ **Real-time Updates**: No need to refresh page

### **Test Results**

When testing, you should see:

1. **Immediate notifications** on any page (not just notifications page)
2. **Bell icon updates** in real-time
3. **Toast messages** appearing
4. **Browser notifications** (if enabled)
5. **Sound notifications** (if enabled)

## 🔧 **Debugging**

### **If Notifications Still Don't Work**

1. **Check Console for Errors**:

   ```javascript
   // Check if global notifications are active
   console.log('Global notifications active:', window.location.href);
   ```

2. **Verify SignalR Connection**:

   - Look for green WiFi icon in notification bell
   - Check console for connection logs

3. **Test Authentication**:

   - Ensure you're properly logged in
   - Check that SignalR hub has `[Authorize]` attribute enabled

4. **Verify User Groups**:
   - Check console for group membership logs
   - Ensure user is added to correct SignalR groups

### **Common Issues**

| Issue                                         | Solution                                              |
| --------------------------------------------- | ----------------------------------------------------- |
| No notifications on any page                  | Check if `useGlobalNotifications` is called in header |
| Notifications only work on notifications page | Ensure other pages don't set up duplicate listeners   |
| SignalR not connecting                        | Check authentication and hub authorization            |
| Duplicate notifications                       | Ensure only global listeners are active               |

## 📝 **Testing Checklist**

- [ ] Notifications work on homepage
- [ ] Notifications work on correspondence pages
- [ ] Notifications work on other admin pages
- [ ] Bell icon updates in real-time
- [ ] Toast notifications appear
- [ ] Console shows proper SignalR events
- [ ] No duplicate notifications
- [ ] Unread count updates immediately
- [ ] Marking as read works correctly

## 🚀 **Next Steps**

Once testing is complete:

1. **Remove test components** from production pages
2. **Clean up development logs** if needed
3. **Monitor production** for any issues
4. **Consider adding user preference** for notification types

## 💡 **How It Works Now**

```
Page Load
    ↓
Header Renders
    ↓
useGlobalNotifications Hook Activated
    ↓
SignalR Event Listeners Set Up Globally
    ↓
User Action Triggers Notification
    ↓
Backend Sends SignalR Event
    ↓
Global Listener Receives Event
    ↓
Notification Appears on ANY Page!
```

The system now ensures that **SignalR notifications work across all pages**, not just the notifications page!
