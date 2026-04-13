# Feedback System Documentation

## Overview
The feedback system allows users to submit feedback about the Campus Trace Lost & Found application while providing administrators with tools to view, manage, and respond to feedback.

## Features

### User Features
- **Easy Feedback Submission**: Simple form for users to submit feedback
- **Category Selection**: Choose from multiple feedback categories:
  - Bug Report
  - Feature Request
  - Improvement Suggestion
  - Other
- **Star Rating**: Rate the application from 1 to 5 stars
- **Anonymous or Identifiable**: Users can provide their name and email
- **Real-time Validation**: Form validates input before submission
- **Success Confirmation**: Users receive feedback on submission status

### Admin Features
- **Feedback Dashboard**: View all submitted feedback in one place
- **Status Management**: Track feedback status:
  - **Pending**: New feedback awaiting review
  - **Reviewed**: Feedback reviewed but not yet resolved
  - **Resolved**: Feedback that has been addressed
- **Statistics**: View analytics including:
  - Total feedback count
  - Average rating
  - Feedback by category
  - Feedback by status
- **Filter & Sort**: Filter feedback by status and sort by newest first
- **Delete Feedback**: Remove feedback entries as needed

## Backend API Endpoints

### Public Endpoints

#### Submit Feedback
```
POST /api/feedback
Content-Type: application/json

Request Body:
{
  "name": "John Doe",
  "email": "john@example.com",
  "category": "Feature Request",
  "rating": 4,
  "message": "It would be great to have an email notification when items are found..."
}

Response:
{
  "success": true,
  "message": "Thank you for your feedback!",
  "feedback": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "category": "Feature Request",
    "rating": 4,
    "message": "...",
    "status": "pending",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

#### Get All Feedback
```
GET /api/feedback?status=pending&sort=-createdAt

Query Parameters:
- status (optional): Filter by status (pending, reviewed, resolved)
- sort (optional): Sort order (default: -createdAt for newest first)

Response:
{
  "success": true,
  "count": 45,
  "feedback": [...]
}
```

#### Get Single Feedback
```
GET /api/feedback/:id

Response:
{
  "success": true,
  "feedback": {...}
}
```

### Protected Admin Endpoints

All admin endpoints require Bearer token authorization.

#### Update Feedback Status
```
PATCH /api/feedback/:id/status
Authorization: Bearer {admin_token}
Content-Type: application/json

Request Body:
{
  "status": "reviewed" | "resolved"
}

Response:
{
  "success": true,
  "message": "Feedback status updated successfully",
  "feedback": {...}
}
```

#### Delete Feedback
```
DELETE /api/feedback/:id
Authorization: Bearer {admin_token}

Response:
{
  "success": true,
  "message": "Feedback deleted successfully"
}
```

#### Get Feedback Statistics
```
GET /api/feedback/stats/overview
Authorization: Bearer {admin_token}

Response:
{
  "success": true,
  "stats": {
    "totalFeedback": 42,
    "averageRating": 4.2,
    "byCategory": [
      { "_id": "Feature Request", "count": 15 },
      { "_id": "Bug Report", "count": 8 },
      ...
    ],
    "byStatus": [
      { "_id": "pending", "count": 10 },
      { "_id": "reviewed", "count": 20 },
      { "_id": "resolved", "count": 12 }
    ]
  }
}
```

## Frontend Components

### 1. FeedbackForm Component
**Location**: `src/components/common/FeedbackForm.jsx`

A comprehensive form component for users to submit feedback.

**Props**:
- `onSubmitSuccess` (optional): Callback function called when feedback is successfully submitted

**Features**:
- Real-time character count for message field
- Star rating selector
- Category dropdown
- Input validation
- Success and error messages
- Disabled submit button when form is invalid

**Styling**: `src/components/styles/FeedbackForm.css`

### 2. FeedbackPage Component
**Location**: `src/pages/FeedbackPage.jsx`

Public page where users can access the feedback form.

**Route**: `/feedback`

### 3. AdminFeedbackPage Component
**Location**: `src/pages/AdminFeedbackPage.jsx`

Admin dashboard for managing feedback submissions.

**Route**: `/admin/feedback` (Protected - requires admin authentication)

**Features**:
- Statistics cards showing total feedback, average rating, pending, and resolved counts
- Filter buttons for different status tabs
- List of feedback entries with ability to:
  - View full feedback details
  - Update status
  - Delete feedback
- Responsive design for mobile and desktop

**Styling**: `src/components/styles/AdminFeedbackPage.css`

## Database Model

### Feedback Model
**Location**: `backend/models/Feedback.model.js`

**Fields**:
- `name` (String, required): User's name
- `email` (String, required): User's email - must be valid format
- `category` (String, required): One of:
  - "Bug Report"
  - "Feature Request"
  - "improvement"
  - "Other"
- `rating` (Number, required): Rating from 1-5
- `message` (String, required): Feedback message (10-1000 characters)
- `status` (String, default: "pending"): One of:
  - "pending"
  - "reviewed"
  - "resolved"
- `createdAt` (Date): Timestamp when feedback was submitted
- `updatedAt` (Date): Timestamp of last update

**Indexes**:
- `category`: Indexed for filtering
- `foundDate`: Indexed for sorting
- `status`: Used in admin queries

## Frontend API Service

**Location**: `src/services/api.js`

```javascript
export const feedbackAPI = {
  submit: (data) => api.post('/feedback', data),
  getAll: (params) => api.get('/feedback', { params }),
  getById: (id) => api.get(`/feedback/${id}`),
  updateStatus: (id, data) => api.patch(`/feedback/${id}/status`, data),
  delete: (id) => api.delete(`/feedback/${id}`),
  getStats: () => api.get('/feedback/stats/overview'),
}
```

## Form Validation

### Client-Side Validation
- Name: Required, non-empty
- Email: Required, valid email format
- Category: Required, must be one of the predefined categories
- Rating: Required, integer between 1-5
- Message: Required, minimum 10 characters, maximum 1000 characters

### Server-Side Validation
All fields are validated again on the server to ensure data integrity and security.

## Styling

Both components include responsive designs that work well on:
- Mobile devices (320px and up)
- Tablets (768px and up)
- Desktop (1200px and up)

### Color Scheme
- Primary: Purple gradient (#667eea to #764ba2)
- Success: Green (#d4edda / #155724)
- Error: Red (#f8d7da / #721c24)
- Warning: Yellow (#fff3cd / #856404)
- Info: Blue (#d1ecf1 / #0c5460)

## Usage Examples

### Submitting Feedback (User)
1. Navigate to `/feedback` from the home page
2. Fill in the feedback form:
   - Enter name and email
   - Select feedback category
   - Rate the application (1-5 stars)
   - Write feedback message (minimum 10 characters)
3. Click "Submit Feedback"
4. Receive confirmation message

### Viewing & Managing Feedback (Admin)
1. Log in to admin dashboard
2. Navigate to "Feedback" from the admin menu
3. View statistics and feedback list
4. Filter by status (All, Pending, Reviewed, Resolved)
5. For each feedback entry:
   - View complete details
   - Mark as "Reviewed" or "Resolved"
   - Delete if necessary

## Error Handling

The system provides clear error messages for:
- Invalid email format
- Missing required fields
- Message too short or too long
- Server errors
- Network issues

## Security Considerations

1. **Input Validation**: All inputs are validated on both client and server
2. **Rate Limiting**: Consider implementing rate limiting on feedback submission endpoint
3. **Admin Authentication**: Feedback management features require admin authentication
4. **Error Messages**: Server returns generic error messages to prevent information leakage
5. **Email Validation**: Ensures email format is correct

## Future Enhancements

Potential features to add:
1. Email notifications to admins when feedback is submitted
2. Attachment support for screenshots with bug reports
3. Feedback categories specific to features (lost items, finding items, etc.)
4. Analytics dashboard with charts and graphs
5. Feedback search and advanced filtering
6. Automated reply templates for feedback responses
7. Feedback sentiment analysis
8. Export feedback to CSV/Excel
9. User follow-up system for responses
10. Feedback tags and categorization system

## Troubleshooting

### Feedback not submitting
- Check browser console for errors
- Verify all required fields are filled
- Ensure message is at least 10 characters
- Check network connectivity

### Admin can't see feedback
- Verify admin is logged in
- Check browser developer tools for API errors
- Ensure backend server is running
- Check MongoDB connection

### Stats not updating
- Refresh the page
- Check MongoDB for data
- Verify admin token is valid
- Check backend console for errors

## Files Modified/Created

**Backend**:
- `models/Feedback.model.js` (NEW)
- `controllers/feedback.controller.js` (NEW)
- `routes/feedback.routes.js` (NEW)
- `server.js` (MODIFIED - added feedback routes)

**Frontend**:
- `components/common/FeedbackForm.jsx` (NEW)
- `components/styles/FeedbackForm.css` (NEW)
- `pages/FeedbackPage.jsx` (NEW)
- `pages/AdminFeedbackPage.jsx` (NEW)
- `components/styles/AdminFeedbackPage.css` (NEW)
- `services/api.js` (MODIFIED - added feedbackAPI)
- `App.jsx` (MODIFIED - added feedback routes)
- `components/common/Navbar.jsx` (MODIFIED - added feedback link)
- `components/admin/AdminLayout.jsx` (MODIFIED - added feedback menu item)
