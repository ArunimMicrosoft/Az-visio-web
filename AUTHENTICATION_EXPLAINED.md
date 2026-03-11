# 🔐 Authentication System Explained

## 📍 **WHERE** is User Data Saved?

### 100% CLIENT-SIDE (Your Browser's localStorage)

```
Your Browser (Chrome/Firefox/Edge)
└── localStorage
    ├── azureDesigner_users_secure       ← All user accounts (email, hashed password, name)
    ├── azureDesigner_session            ← Current login session (userId, token, expiry)
    ├── azureDesigner_user               ← Current logged-in user data (name, email, subscription)
    └── azureDesigner_login_attempts     ← Failed login tracking (security)
```

**❌ NO SERVER NEEDED!** Everything is stored locally in your browser.

---

## 🔄 **HOW** Authentication Happens

### **1️⃣ Sign Up Flow** (New User)

```
User clicks "Create Account"
     ↓
User enters:
  • Email: john@company.com
  • Password: MyPass@123
  • Name: John Doe
     ↓
Frontend validates:
  ✓ Email format (john@company.com)
  ✓ Password strength (8+ chars, uppercase, lowercase, digit, special)
  ✓ Name provided
     ↓
Password is HASHED (one-way encryption):
  "MyPass@123" → SHA-256 → "a7f3b2c8d9e1..."
     ↓
User object created:
  {
    id: "user_1234567890_abc123",
    email: "john@company.com",
    name: "John Doe",
    passwordHash: "a7f3b2c8d9e1...",  ← Hashed password (secure)
    role: "architect",
    subscriptionTier: "trial",         ← Auto-starts 7-day trial
    trialStartDate: "2026-03-08T...",
    trialExpiresAt: "2026-03-15T...",  ← 7 days from now
    trialExportsUsed: 0,
    diagramsCreated: 0,
    createdAt: "2026-03-08T10:30:00Z",
    lastLogin: null,
    isActive: true
  }
     ↓
Saved to localStorage:
  localStorage.setItem('azureDesigner_users_secure', JSON.stringify([user]))
     ↓
Session created:
  {
    sessionId: "session_xyz789",
    userId: "user_1234567890_abc123",
    token: "random_secure_token",
    createdAt: 1709896200000,
    expiresAt: 1712574200000,  ← 30 days from now
    userAgent: "Chrome",
    ipAddress: null
  }
     ↓
Saved to localStorage:
  localStorage.setItem('azureDesigner_session', JSON.stringify(session))
     ↓
User data saved (without password):
  localStorage.setItem('azureDesigner_user', JSON.stringify({
    id: "user_1234567890_abc123",
    email: "john@company.com",
    name: "John Doe",
    role: "architect",
    subscriptionTier: "trial",
    trialExportsUsed: 0,
    diagramsCreated: 0
    // NO passwordHash here (security)
  }))
     ↓
✅ User is logged in and redirected to app
```

---

### **2️⃣ Login Flow** (Existing User)

```
User clicks "Sign In"
     ↓
User enters:
  • Email: john@company.com
  • Password: MyPass@123
     ↓
Frontend checks rate limiting:
  ✓ Max 5 login attempts per minute
  ✓ Max 5 failed attempts before 15-min lockout
     ↓
Frontend retrieves user from localStorage:
  users = JSON.parse(localStorage.getItem('azureDesigner_users_secure'))
  user = users.find(u => u.email === 'john@company.com')
     ↓
Password is HASHED and compared:
  Input: "MyPass@123" → SHA-256 → "a7f3b2c8d9e1..."
  Stored: user.passwordHash = "a7f3b2c8d9e1..."
  
  if (inputHash === storedHash) → ✅ Login successful
  else → ❌ "Invalid credentials"
     ↓
If successful:
  • Update lastLogin timestamp
  • Create new session (expires in 30 days)
  • Save user data to localStorage
     ↓
✅ User is logged in and redirected to app
```

---

### **3️⃣ Session Validation** (When you refresh/reopen app)

```
User opens app (or refreshes page)
     ↓
Frontend checks for existing session:
  session = JSON.parse(localStorage.getItem('azureDesigner_session'))
     ↓
Validates session:
  ✓ Session exists?
  ✓ Session not expired? (< 30 days old)
  ✓ Browser fingerprint matches? (Chrome/Firefox/etc)
     ↓
If valid:
  • Load user data from localStorage
  • User stays logged in ✅
     ↓
If invalid/expired:
  • Clear session
  • Redirect to login page ❌
```

---

## 🗂️ **File Structure**

### **Where the Code Lives:**

1. **Authentication Logic:**
   - **File:** `src/utils/authSecurity.js`
   - **Functions:**
     - `secureSignup()` - Creates new user
     - `secureLogin()` - Verifies credentials
     - `validateSession()` - Checks if user is logged in
     - `secureLogout()` - Clears session
     - `hashPassword()` - Encrypts passwords

2. **Authentication Context:**
   - **File:** `src/contexts/AuthContext.jsx`
   - **Provides:**
     - `user` - Current logged-in user
     - `login()` - Login function
     - `signup()` - Signup function
     - `logout()` - Logout function
     - `isLoading` - Loading state

3. **Auth Pages:**
   - **File:** `src/pages/AuthPage.jsx`
   - Login/Signup forms
   - Password validation UI
   - Error handling

---

## 🔒 **Security Features**

### **What Makes It Secure?**

1. **Password Hashing** 🔐
   - Passwords NEVER stored in plain text
   - SHA-256 hash with salt
   - One-way encryption (can't reverse)

2. **Rate Limiting** ⏱️
   - Max 5 login attempts per minute
   - Max 5 failed attempts = 15-min lockout

3. **Session Management** 🎫
   - Sessions expire after 30 days
   - Browser fingerprinting
   - Automatic logout on expiry

4. **Password Strength Requirements** 💪
   - Minimum 8 characters
   - Uppercase + Lowercase
   - Numbers + Special characters

5. **Email Validation** ✉️
   - RFC 5322 compliant
   - Prevents invalid emails

6. **Protected Routes** 🛡️
   - Unauthenticated users redirected to login
   - Trial limitations enforced

---

## 📊 **localStorage Structure**

### **Example of Stored Data:**

```javascript
// azureDesigner_users_secure (ALL users in browser)
[
  {
    "id": "user_1709896200_abc123",
    "email": "john@company.com",
    "name": "John Doe",
    "passwordHash": "a7f3b2c8d9e1f4a5b6c7d8e9f0...", // HASHED
    "role": "architect",
    "subscriptionTier": "trial",
    "trialStartDate": "2026-03-08T10:30:00Z",
    "trialExpiresAt": "2026-03-15T10:30:00Z",
    "trialExportsUsed": 2,
    "diagramsCreated": 1,
    "createdAt": "2026-03-08T10:30:00Z",
    "lastLogin": "2026-03-08T14:45:00Z",
    "isActive": true
  },
  {
    "id": "user_demo_001",
    "email": "demo@azuredesigner.com",
    "name": "Demo User",
    "passwordHash": "b2fdba2bd6db23d6d5145a0bcb...",
    "role": "architect",
    "subscriptionTier": "trial",
    // ... more fields
  }
]

// azureDesigner_session (Current session)
{
  "sessionId": "session_1709896300_xyz789",
  "userId": "user_1709896200_abc123",
  "token": "secure_random_token_here",
  "createdAt": 1709896300000,
  "expiresAt": 1712574300000,
  "userAgent": "Chrome",
  "ipAddress": null
}

// azureDesigner_user (Current user data - NO password)
{
  "id": "user_1709896200_abc123",
  "email": "john@company.com",
  "name": "John Doe",
  "role": "architect",
  "subscriptionTier": "trial",
  "trialStartDate": "2026-03-08T10:30:00Z",
  "trialExpiresAt": "2026-03-15T10:30:00Z",
  "trialExportsUsed": 2,
  "diagramsCreated": 1
}

// azureDesigner_login_attempts (Failed login tracking)
{
  "john@company.com": {
    "count": 1,
    "firstAttempt": 1709896100000,
    "lastAttempt": 1709896150000,
    "lockedUntil": null
  }
}
```

---

## 🚀 **Production Upgrade Path**

### **Current (Demo/MVP):**
- ✅ Client-side authentication (localStorage)
- ✅ Password hashing (SHA-256)
- ✅ Session management
- ✅ Trial system
- ✅ Perfect for testing!

### **Future (Production with Real Server):**
- 🔄 Move to backend database (PostgreSQL/MongoDB)
- 🔄 Use bcrypt for password hashing (stronger)
- 🔄 JWT tokens instead of localStorage
- 🔄 OAuth/SSO (Google, Microsoft login)
- 🔄 2FA (Two-Factor Authentication)
- 🔄 Email verification
- 🔄 Password reset via email

---

## ❓ **Common Questions**

### **Q: Is it safe to store passwords in localStorage?**
**A:** Passwords are **HASHED** (encrypted), not plain text. The actual password "MyPass@123" is converted to "a7f3b2c8..." which can't be reversed.

### **Q: Can users see other users' data?**
**A:** No, each browser has its own localStorage. John's data on his computer is completely separate from Sarah's data on her computer.

### **Q: What happens if user clears browser data?**
**A:** All users and sessions are deleted. They need to sign up again. (This is why production apps use backend databases!)

### **Q: Is this production-ready?**
**A:** For MVP/demo: YES ✅  
For enterprise with 1000+ users: Need backend database 🔄

### **Q: How do I migrate to real backend later?**
**A:** Easy! We already have the Azure Functions structure ready. Just:
1. Set up PostgreSQL/MongoDB database
2. Move user storage from localStorage to database
3. Add JWT token generation
4. Update API calls to use backend

---

## 🎯 **Summary**

| Feature | Current Implementation | Location |
|---------|----------------------|----------|
| **User Storage** | localStorage (browser) | `azureDesigner_users_secure` |
| **Password Security** | SHA-256 hashing | `authSecurity.js` |
| **Session Length** | 30 days | `SESSION_TIMEOUT` |
| **Trial System** | Automatic 7-day trial | `secureSignup()` |
| **Rate Limiting** | 5 attempts/minute | `RateLimiter` class |
| **Lockout** | 15 minutes after 5 failures | `LoginAttemptTracker` |

---

**🎉 Your app is fully functional without ANY server! Perfect for demo/MVP!** ✨

**When ready for production scale, we'll migrate to backend database - but current system works great for testing and small teams!**
