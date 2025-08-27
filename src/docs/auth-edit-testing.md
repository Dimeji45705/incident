# Authentication-Based Incident Editing: Manual Testing Guide

This document outlines the steps to manually test the authentication-based incident editing functionality implemented in the Incident Management System.

## Prerequisites

1. The Angular application is running
2. The backend API is available
3. You have access to the following accounts:
   - **Supervisor/Admin account**: Has edit permissions for incidents
   - **Regular user account**: Does not have edit permissions for incidents

## Test Cases

### Test Case 1: Unauthenticated User Access

1. Ensure you are logged out (clear local storage or use incognito mode)
2. Navigate to an incident detail page (e.g., `/incidents/1`)
3. **Expected Result**: 
   - No edit button should be visible
   - No "View-only mode" badge should be displayed (as you're not authenticated)
   - All form fields should be read-only/non-editable

### Test Case 2: Regular User Access

1. Log in with a regular user account (non-supervisor, non-admin)
2. Navigate to an incident detail page
3. **Expected Result**:
   - No edit button should be visible
   - "View-only mode" badge should be displayed
   - All form fields should be read-only/non-editable

### Test Case 3: Supervisor Access

1. Log in with a supervisor or admin account
2. Navigate to an incident detail page
3. **Expected Result**:
   - Edit button should be visible
   - No "View-only mode" badge
   - All form fields are initially read-only, but can be switched to edit mode

### Test Case 4: Edit and Save Functionality

1. Log in with a supervisor or admin account
2. Navigate to an incident detail page
3. Click the "Edit Incident" button
4. Make changes to the incident details
5. Click "Save Changes"
6. **Expected Result**:
   - The edit form should become visible when clicking Edit
   - Changes should be saved successfully
   - The UI should revert to view mode after saving
   - The updated information should be displayed

### Test Case 5: Authorization Header

To verify the authorization header is properly sent:

1. Open browser developer tools (F12)
2. Go to the Network tab
3. Log in with a supervisor account
4. Navigate to an incident detail page
5. Click Edit and make changes
6. Save the changes
7. In the Network tab, find the PUT request to the incidents endpoint
8. **Expected Result**:
   - The request should include an `Authorization` header
   - The header should have format: `Bearer [your-token]`

### Test Case 6: Token Expiration

1. Log in with a supervisor account
2. Manually modify the token expiration time in localStorage to make it expired
3. Try to edit and save an incident
4. **Expected Result**:
   - The edit operation should fail
   - The user should be prompted to log in again

## Debugging Tools

### Auth Debug Page

The application now includes a dedicated debugging page for authentication issues:

1. Log in with your account credentials
2. Navigate to `/auth-debug` (you'll be automatically redirected here after login)
3. This page displays:
   - Authentication status
   - Current user details
   - Token validity and expiration time
   - Role information

### Debug Mode in Incident Detail

The incident detail page now includes a debug information panel that shows:
- Authentication status
- Supervisor role status
- Edit permission status
- Edit button visibility condition evaluation

### Debug Console Logs

Additional console logs have been added to help diagnose issues:
- API role mapping information
- Token validation details
- Authentication header composition

## Running in Debug Mode

Use the development script to run the application with enhanced debugging:

```bash
./run_dev.sh
```

## Troubleshooting

If tests fail, check the following:

1. Browser console for JavaScript errors and debug logs
2. Network tab for API errors (401, 403 responses)
3. Local storage to ensure tokens are properly saved and formatted correctly
4. Check the `/auth-debug` page to verify your current authentication state
5. On the incident detail page, examine the debug info panel to see why the edit button might not be visible

---

## Automated Tests

The test file at `/src/tests/incident-auth.test.ts` contains automated tests that verify:

1. Authentication + incident editing works properly with valid tokens
2. Editing is blocked for unauthenticated users
3. Role checking prevents non-supervisor users from editing

Run the tests using the Angular testing command to validate these scenarios programmatically.

## Fix Verification Test

To verify that our recent fixes correctly resolved the edit button visibility issue:

1. Run the application in debug mode using `./run_dev.sh`
2. Clear your browser cache and local storage
3. Log in with a supervisor/admin account
4. Check the `/auth-debug` page to verify:
   - Your user has the correct role (supervisor or admin)
   - The token is valid and properly formatted
   - The authentication status shows as authenticated
5. Navigate to an incident detail page
6. In the debug panel, verify:
   - Is Authenticated: **true**
   - Is Supervisor: **true**
   - Can Edit: **true**
   - Edit Condition: **true**
7. Confirm the Edit button is now visible

If any of these checks fail, the console logs will provide detailed information about which component of the authentication chain is failing.
