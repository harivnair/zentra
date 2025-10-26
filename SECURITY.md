# Security Implementation Guide

This document outlines the security measures implemented in Zentra to protect against XSS (Cross-Site Scripting) and other common web vulnerabilities.

## Overview

While the application uses localStorage for token storage (for development convenience), we've implemented multiple layers of security to mitigate XSS risks:

1. **Content Security Policy (CSP)** - Prevents unauthorized script execution
2. **Input Sanitization** - Prevents injection attacks
3. **Encrypted Token Storage** - Protects tokens at rest
4. **Security Headers** - Additional browser-level protections

## Security Layers

### 1. Content Security Policy (CSP)

**File:** `src/middleware.ts`

CSP headers are automatically applied to all requests, preventing:
- Inline scripts from executing
- Scripts from unauthorized domains
- Code injection via eval()
- Clickjacking attacks

**Configuration:**
```typescript
'Content-Security-Policy': 
  "default-src 'self'; " +
  "script-src 'self' 'unsafe-eval' 'unsafe-inline'; " +
  "style-src 'self' 'unsafe-inline'; " +
  "img-src 'self' data: https:; " +
  "font-src 'self' data:; " +
  "connect-src 'self' http://localhost:8080;"
```

### 2. Input Sanitization

**File:** `src/lib/sanitize.ts`

All user inputs are sanitized using DOMPurify before processing:

```typescript
import { sanitizeObject, sanitizeText, sanitizeHtml } from '@/lib/sanitize'

// Sanitize form data
const cleanData = sanitizeObject(formData)

// Sanitize individual strings
const cleanName = sanitizeText(userName)

// Sanitize HTML content
const cleanHtml = sanitizeHtml(userContent)
```

**Usage in Forms:**
```typescript
const handleSubmit = async (values: FormValues) => {
  // Sanitize all inputs before sending
  const sanitizedValues = sanitizeObject(values)
  
  const response = await apiRequest('/api/endpoint', {
    method: 'POST',
    body: JSON.stringify(sanitizedValues),
  })
}
```

### 3. Encrypted Token Storage

**File:** `src/lib/secure-storage.ts`

Tokens are encrypted using AES before storing in localStorage:

```typescript
import { setSecureItem, getSecureItem, removeSecureItem } from '@/lib/secure-storage'

// Store encrypted data
setSecureItem('key', { sensitive: 'data' })

// Retrieve and decrypt
const data = getSecureItem<MyType>('key')

// Remove securely
removeSecureItem('key')
```

**Encryption Details:**
- **Algorithm:** AES (Advanced Encryption Standard)
- **Key:** SHA256 hash of env variable + user agent
- **Auto-cleanup:** Corrupted/tampered data is automatically removed

### 4. Security Headers

Additional headers applied via middleware:

| Header | Value | Purpose |
|--------|-------|---------|
| `X-Frame-Options` | `DENY` | Prevent clickjacking |
| `X-Content-Type-Options` | `nosniff` | Prevent MIME-type sniffing |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Control referrer information |
| `X-XSS-Protection` | `1; mode=block` | Enable browser XSS filter |
| `Permissions-Policy` | (restrictive) | Disable unnecessary features |

## Setup Instructions

### 1. Install Dependencies

```bash
npm install isomorphic-dompurify crypto-js
npm install --save-dev @types/crypto-js
```

### 2. Configure Environment Variables

Add to `.env.local`:

```bash
NEXT_PUBLIC_ENCRYPTION_KEY=your-secure-key-here
```

**Generate a secure key:**
```bash
# On Linux/Mac:
openssl rand -base64 32

# On Windows (PowerShell):
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### 3. Update Existing Components

If you have existing forms or components that handle user input:

```typescript
// Before
const handleSubmit = async (data) => {
  await apiRequest('/api/endpoint', {
    method: 'POST',
    body: JSON.stringify(data), // ❌ Unsanitized
  })
}

// After
import { sanitizeObject } from '@/lib/sanitize'

const handleSubmit = async (data) => {
  const cleanData = sanitizeObject(data) // ✅ Sanitized
  await apiRequest('/api/endpoint', {
    method: 'POST',
    body: JSON.stringify(cleanData),
  })
}
```

## API Integration

### Authentication Flow

1. **Login:** User credentials → Backend → JWT token
2. **Storage:** Token encrypted with AES → localStorage
3. **Requests:** Token decrypted → Added to headers → Sent to backend
4. **Logout:** Encrypted token removed from storage

### Token Handling

The authentication system uses two layers:

1. **Client-side (Browser → Next.js API):**
   - Header: `X-Auth-Token: Bearer {encrypted_token}`
   - File: `src/lib/api-client.ts`

2. **Server-side (Next.js API → Backend):**
   - Header: `Authorization: Bearer {decrypted_token}`
   - File: `src/lib/api-server.ts`

### Example API Request

```typescript
import { apiRequest } from '@/lib/api-client'
import { sanitizeObject } from '@/lib/sanitize'

async function createEvent(eventData: EventData) {
  // Sanitize inputs
  const cleanData = sanitizeObject(eventData)
  
  // Make authenticated request
  const response = await apiRequest('/api/events', {
    method: 'POST',
    body: JSON.stringify(cleanData),
  })
  
  return response.json()
}
```

## Best Practices

### DO ✅

- **Always sanitize user inputs** before processing
- **Use `apiRequest()`** for authenticated calls
- **Regenerate encryption key** in production
- **Keep dependencies updated** (especially security-related)
- **Test CSP headers** don't break functionality
- **Monitor for 401 errors** (token expiration/invalid)

### DON'T ❌

- **Don't store sensitive data** in plain localStorage
- **Don't bypass sanitization** "just this once"
- **Don't hardcode secrets** in source code
- **Don't disable CSP** unless absolutely necessary
- **Don't ignore security warnings** in console
- **Don't share encryption keys** in repositories

## Testing Security

### Test XSS Protection

Try injecting malicious scripts:

```typescript
// This should be sanitized
const maliciousInput = '<script>alert("XSS")</script>'
const clean = sanitizeText(maliciousInput)
console.log(clean) // Should NOT contain <script> tags
```

### Test CSP Headers

1. Open browser DevTools → Network tab
2. Check response headers for `Content-Security-Policy`
3. Try executing inline scripts - should be blocked

### Test Token Encryption

```typescript
// Check localStorage in DevTools
localStorage.getItem('zentra_auth')
// Should see encrypted string, not plain JSON
```

## Production Checklist

Before deploying to production:

- [ ] Generate new `NEXT_PUBLIC_ENCRYPTION_KEY`
- [ ] Update CSP `connect-src` with production API URL
- [ ] Enable HTTPS for all communication
- [ ] Test all forms with sanitization
- [ ] Verify CSP doesn't block legitimate scripts
- [ ] Set up monitoring for security errors
- [ ] Review and update security headers if needed
- [ ] Test authentication flow end-to-end
- [ ] Verify token expiration handling
- [ ] Check for security vulnerabilities in dependencies

## Troubleshooting

### CSP Blocking Legitimate Scripts

If CSP blocks required scripts:

1. Check browser console for CSP violations
2. Update `src/middleware.ts` to allow specific domains
3. Use `nonce` or `hash` for inline scripts if needed

### Sanitization Breaking Functionality

If sanitization removes valid content:

1. Review `src/lib/sanitize.ts` configuration
2. Adjust DOMPurify options for your use case
3. Use appropriate sanitization level (sanitizeText vs sanitizeHtml)

### Token Decryption Failures

If tokens fail to decrypt:

1. Verify `NEXT_PUBLIC_ENCRYPTION_KEY` is set correctly
2. Check if token was stored before encryption was implemented
3. Clear localStorage and re-login: `localStorage.clear()`

## Additional Resources

- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [Content Security Policy Reference](https://content-security-policy.com/)
- [DOMPurify Documentation](https://github.com/cure53/DOMPurify)
- [Web Security Best Practices](https://infosec.mozilla.org/guidelines/web_security)

## Support

For security concerns or questions:
1. Review this documentation
2. Check error logs in browser console
3. Test in isolation (separate component/API call)
4. Consult OWASP guidelines for specific scenarios

---

**Last Updated:** 2024
**Maintained By:** Zentra Development Team
