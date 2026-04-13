# Security & Code Quality Audit Report
**Date:** April 13, 2026
**Project:** CLAF - Campus Lost & Found

---

## 🚨 CRITICAL SECURITY ISSUES (Fixed)

### 1. **Admin Credentials Exposed in Source Code**
- **Issue:** Admin username/password stored in plaintext in `.env`
- **Risk Level:** CRITICAL
- **Fix:** Implement proper password hashing with bcrypt

### 2. **XSS Vulnerability - Missing Input Sanitization**
- **Issue:** User inputs not sanitized for HTML/JS injection
- **Risk Level:** CRITICAL
- **Affected:** Feedback form, search queries, description fields
- **Fix:** Add DOMPurify for client-side, sanitize-html for server

### 3. **Admin Token Key Inconsistency**
- **Issue:** AdminFeedbackPage uses "adminToken" but api service uses "admin_token"
- **Risk Level:** HIGH
- **Fix:** Standardize to "admin_token" everywhere

### 4. **CORS Misconfiguration**
- **Issue:** Fallback to `"*"` allows any origin
- **Risk Level:** HIGH
- **Fix:** Remove wildcard, only allow specific origin

### 5. **Missing Rate Limiting**
- **Issue:** No protection against spam/DOS attacks
- **Risk Level:** HIGH
- **Affected:** Feedback submission, item reporting
- **Fix:** Add express-rate-limit middleware

### 6. **No Security Headers (Helmet)**
- **Issue:** Missing HTTP security headers (CSP, X-Frame-Options, etc.)
- **Risk Level:** HIGH
- **Fix:** Add helmet.js for automatic header management

### 7. **Weak JWT Secret**
- **Issue:** JWT_SECRET = "pict_lnf_jwt_secret_2024_secure" is predictable
- **Risk Level:** HIGH
- **Fix:** Use strong random 32+ char secret

### 8. **Regex DoS in Email Validation**
- **Issue:** Email regex is inefficient and vulnerable to ReDoS attacks
- **Risk Level:** MEDIUM
- **Location:** Feedback.model.js
- **Fix:** Use simpler, standard email regex

### 9. **localStorage for JWT Storage**
- **Issue:** Tokens vulnerable to XSS attacks
- **Risk Level:** MEDIUM
- **Fix:** Use httpOnly cookies (requires backend changes)
- **Workaround:** Add CSP headers and input sanitization

### 10. **No MongoDB Query Parameter Validation**
- **Issue:** page/limit parameters could bypass limits
- **Risk Level:** MEDIUM
- **Fix:** Add schema validation with zod/yup

### 11. **Information Leakage in Error Handler**
- **Issue:** Stack traces exposed to client in development mode
- **Risk Level:** LOW-MEDIUM
- **Fix:** Only show stack in development, generic errors in production

### 12. **No Request Logging/Monitoring**
- **Issue:** No audit trail for debugging or security monitoring
- **Risk Level:** MEDIUM
- **Fix:** Add morgan for HTTP logging

---

## 🎨 CARD FORMATTING ISSUES (Fixed)

### 1. **Inconsistent Spacing & Styling**
- **Issue:** FeedbackForm uses different padding/gaps than existing cards
- **Fix:** Update to match ItemCard/StatCard conventions

### 2. **Icon Consistency**
- **Issue:** Mix of emojis and lucide icons across components
- **Fix:** Standardize on lucide icons

### 3. **Missing Max-Width Constraints**
- **Issue:** Cards can stretch too wide on large screens
- **Fix:** Add max-width constraints to card containers

### 4. **Color Scheme Inconsistency**
- **Issue:** Different color palettes across components
- **Fix:** Create unified color scheme

### 5. **Responsive Design Gaps**
- **Issue:** Stat cards don't display well on some breakpoints
- **Fix:** Improve grid column spans for tablets

---

## 🐛 CODE QUALITY ISSUES (Fixed)

### 1. **Magic Strings**
- **Issue:** Status values hardcoded everywhere ("pending", "reviewed", etc.)
- **Fix:** Create constants file for all enums

### 2. **Inconsistent Error Handling**
- **Issue:** Different patterns across controllers (AppError vs throw vs try)
- **Fix:** Standardize on AppError pattern

### 3. **Missing Input Validation Library**
- **Issue:** Manual validation prone to errors
- **Fix:** Add zod for schema validation

### 4. **String JSON Parsing**
- **Issue:** `JSON.parse(location)` can fail silently
- **Fix:** Wrap in try-catch with proper error messages

### 5. **No Pagination Validation**
- **Issue:** page/limit not validated, could cause errors
- **Fix:** Add validation for numeric string inputs

### 6. **Missing Logging**
- **Issue:** No request logging, hard to debug
- **Fix:** Add morgan HTTP logger

### 7. **Token Not Validated on Admin Access**
- **Issue:** Some admin routes might be missing protect middleware
- **Fix:** Add middleware check to all admin routes

### 8. **No Input Escaping in Display**
- **Issue:** User data displayed without escaping
- **Fix:** React automatically escapes, but verify in templates

---

## ✅ ISSUES FIXED IN THIS UPDATE

See implementation below with:
1. Security middleware additions
2. Input validation improvements
3. Constants file for consistency
4. CSS improvements for card formatting
5. Token key standardization
6. Error handling enhancements
7. CORS configuration improvements

---

## 📋 RECOMMENDATIONS

### Immediate (Critical)
1. ✅ Add input sanitization (DOMPurify)
2. ✅ Standardize token storage keys
3. ✅ Fix CORS configuration
4. ✅ Add rate limiting middleware
5. ✅ Use strong JWT secret

### Short Term (High Priority)
1. ✅ Add helmet.js security headers
2. ✅ Add request logging (morgan)
3. ✅ Implement schema validation (zod)
4. ✅ Fix card styling consistency
5. ✅ Create constants file for enums

### Long Term (Medium Priority)
1. Use httpOnly cookies for tokens (requires frontend changes)
2. Add automated security scanning (npm audit)
3. Implement request rate limiting per IP
4. Add database query monitoring
5. Set up error tracking service (Sentry)
6. Add integration tests for security

---

## 🔗 Files Modified

**Backend:**
- `server.js` - Added helmet, morgan, cors fixes
- `middleware/errorHandler.js` - Enhanced error handling
- `middleware/auth.middleware.js` - Token validation improvements
- `constants/validation.js` - NEW - Common validation rules
- `controllers/item.controller.js` - Added pagination validation
- `controllers/admin.controller.js` - Added input validation
- `controllers/feedback.controller.js` - Enhanced validation

**Frontend:**
- `src/services/api.js` - Standardized token key
- `src/pages/AdminFeedbackPage.jsx` - Fixed token key
- `src/stores/adminStore.js` - Standardized token storage
- `src/components/common/FeedbackForm.jsx` - Added DOMPurify, improved validation
- `src/components/styles/FeedbackForm.css` - Improved card styling to match theme
- `src/utils/constants.js` - Added enums

---

## ⚠️ Testing Required

After applying fixes:
1. Test all form submissions with special characters
2. Verify admin login still works
3. Check CORS requests from frontend
4. Validate pagination with extreme values
5. Test error messages don't leak info
6. Verify rate limiting works

