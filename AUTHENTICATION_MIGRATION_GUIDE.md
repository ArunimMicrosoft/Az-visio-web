# 🔐 Authentication Migration Guide
## From localStorage to Backend Database

---

## 📊 Current vs. Production Architecture

### **Current (localStorage - Demo)**
```
User Browser
├── localStorage
│   ├── All users + hashed passwords
│   ├── Session tokens
│   └── Login attempts
└── No server needed ✅ (but insecure ❌)
```

### **Production (Backend + Database)**
```
User Browser              Backend API              Database
├── JWT token only    →   ├── User management   →  ├── Users table
├── httpOnly cookie       ├── Password hashing      ├── Sessions table
└── No passwords          ├── Rate limiting         └── Encrypted storage
                         └── Email verification
```

---

## 🚀 Migration Steps (Do Later, When Ready)

### **Phase 1: Add Backend Database (Week 1)**

#### 1. Choose Database Service
```bash
# Option A: Azure SQL Database (Recommended)
az sql server create --name myserver --resource-group myResourceGroup

# Option B: Azure Cosmos DB (MongoDB API)
az cosmosdb create --name myaccount --kind MongoDB

# Option C: Supabase (Free, PostgreSQL)
# Sign up at https://supabase.com
```

#### 2. Create User Schema
```sql
-- PostgreSQL Schema
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'architect',
    subscription_tier VARCHAR(50) DEFAULT 'trial',
    trial_start_date TIMESTAMP,
    trial_expires_at TIMESTAMP,
    trial_exports_used INT DEFAULT 0,
    diagrams_created INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false
);

CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    token VARCHAR(500) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    ip_address VARCHAR(50),
    user_agent TEXT
);

CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
```

---

### **Phase 2: Create Backend API (Week 1-2)**

#### 1. Install Dependencies
```bash
cd api
npm install bcrypt jsonwebtoken pg dotenv
```

#### 2. Create Authentication API
```javascript
// api/auth/signup.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

module.exports = async function (context, req) {
  const { email, password, name } = req.body;

  try {
    // Validate input
    if (!email || !password || password.length < 8) {
      context.res = {
        status: 400,
        body: { error: 'Invalid input' }
      };
      return;
    }

    // Check if user exists
    const existing = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existing.rows.length > 0) {
      context.res = {
        status: 409,
        body: { error: 'User already exists' }
      };
      return;
    }

    // Hash password (bcrypt with 12 rounds)
    const passwordHash = await bcrypt.hash(password, 12);

    // Calculate trial expiry (7 days)
    const trialExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Create user
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, name, trial_expires_at)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, name, role, subscription_tier, trial_expires_at`,
      [email.toLowerCase(), passwordHash, name, trialExpiresAt]
    );

    const user = result.rows[0];

    // Generate JWT token (expires in 30 days)
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Create session in database
    const sessionExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await pool.query(
      `INSERT INTO sessions (user_id, token, expires_at, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5)`,
      [user.id, token, sessionExpiry, req.headers['x-forwarded-for'], req.headers['user-agent']]
    );

    context.res = {
      status: 201,
      body: {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          subscriptionTier: user.subscription_tier,
          trialExpiresAt: user.trial_expires_at
        },
        token // Send JWT token to frontend
      }
    };
  } catch (error) {
    context.log.error('Signup error:', error);
    context.res = {
      status: 500,
      body: { error: 'Internal server error' }
    };
  }
};
```

```javascript
// api/auth/login.js
module.exports = async function (context, req) {
  const { email, password } = req.body;

  try {
    // Get user from database
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND is_active = true',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      context.res = {
        status: 401,
        body: { error: 'Invalid credentials' }
      };
      return;
    }

    const user = result.rows[0];

    // Verify password using bcrypt
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      context.res = {
        status: 401,
        body: { error: 'Invalid credentials' }
      };
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Update last login
    await pool.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );

    // Create session
    const sessionExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await pool.query(
      `INSERT INTO sessions (user_id, token, expires_at, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5)`,
      [user.id, token, sessionExpiry, req.headers['x-forwarded-for'], req.headers['user-agent']]
    );

    context.res = {
      status: 200,
      body: {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          subscriptionTier: user.subscription_tier,
          trialExpiresAt: user.trial_expires_at
        },
        token
      }
    };
  } catch (error) {
    context.log.error('Login error:', error);
    context.res = {
      status: 500,
      body: { error: 'Internal server error' }
    };
  }
};
```

---

### **Phase 3: Update Frontend (Week 2)**

#### 1. Replace authSecurity.js
```javascript
// src/utils/authSecurity.js (NEW - Backend version)

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Signup with backend
export async function secureSignup(email, password, name) {
  try {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error };
    }

    // Store JWT token in httpOnly cookie (more secure)
    // Or in localStorage (less secure but simpler)
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('azureDesigner_user', JSON.stringify(data.user));

    return { success: true, user: data.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Login with backend
export async function secureLogin(email, password) {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error };
    }

    localStorage.setItem('authToken', data.token);
    localStorage.setItem('azureDesigner_user', JSON.stringify(data.user));

    return { success: true, user: data.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Validate session with backend
export async function validateSession() {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) return null;

    const response = await fetch(`${API_URL}/auth/validate`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      secureLogout();
      return null;
    }

    const data = await response.json();
    return data.session;
  } catch (error) {
    secureLogout();
    return null;
  }
}

// Logout
export function secureLogout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('azureDesigner_user');
  window.location.href = '/auth';
}
```

---

### **Phase 4: Enhanced Security Features**

#### 1. Add Email Verification
```javascript
// api/auth/send-verification-email.js
const nodemailer = require('nodemailer');

// Generate verification token
const verificationToken = jwt.sign(
  { userId: user.id, email: user.email },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);

// Send email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

await transporter.sendMail({
  to: user.email,
  subject: 'Verify Your Email - Azure Designer',
  html: `
    <h2>Welcome to Azure Designer!</h2>
    <p>Click the link below to verify your email:</p>
    <a href="${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}">
      Verify Email
    </a>
  `
});
```

#### 2. Add Password Reset
```javascript
// api/auth/forgot-password.js
// Generate reset token
const resetToken = jwt.sign(
  { userId: user.id, email: user.email },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);

// Send reset email
await transporter.sendMail({
  to: user.email,
  subject: 'Reset Your Password',
  html: `
    <h2>Password Reset Request</h2>
    <p>Click the link below to reset your password:</p>
    <a href="${process.env.FRONTEND_URL}/reset-password?token=${resetToken}">
      Reset Password
    </a>
    <p>This link expires in 1 hour.</p>
  `
});
```

#### 3. Add OAuth (Google/Microsoft Login)
```bash
npm install passport passport-google-oauth20 passport-azure-ad
```

---

## 🔒 **Production Security Checklist**

### Must-Have Security Features:
- ✅ **bcrypt/Argon2** for password hashing (not SHA-256)
- ✅ **JWT tokens** with short expiry (15 mins) + refresh tokens
- ✅ **httpOnly cookies** (prevents XSS attacks)
- ✅ **HTTPS only** (encrypt all traffic)
- ✅ **Rate limiting** (prevent brute force)
- ✅ **Email verification** (confirm user identity)
- ✅ **2FA/MFA** (two-factor authentication)
- ✅ **Password reset** via email
- ✅ **Session management** in database
- ✅ **CORS configuration** (prevent unauthorized access)
- ✅ **SQL injection prevention** (parameterized queries)
- ✅ **XSS protection** (sanitize inputs)
- ✅ **CSRF tokens** (prevent cross-site attacks)

---

## 💰 **Cost Comparison**

### Current (localStorage):
- **Cost:** $0
- **Users:** Unlimited (per browser)
- **Security:** Low
- **Scalability:** Low

### Production (Backend + Database):
- **Cost:** ~$5-20/month (Azure/Supabase free tier)
- **Users:** Unlimited (shared across devices)
- **Security:** High
- **Scalability:** High

---

## 🎯 **Recommendation**

### **For Your Current Stage:**
**Keep localStorage** ✅ because:
1. You're in MVP/testing phase
2. No real users yet
3. Razorpay KYC pending (1-7 days)
4. Frontend works perfectly
5. Can migrate later when ready

### **Migrate to Backend When:**
1. ✅ You have 10+ real users
2. ✅ Razorpay KYC approved
3. ✅ Ready to handle payments
4. ✅ Need user data across devices
5. ✅ Want enterprise features (SSO, audit logs)

---

## 📅 **Migration Timeline (Suggested)**

**Now (Week 0):**
- ✅ Deploy current app (localStorage)
- ✅ Test trial system
- ✅ Wait for Razorpay KYC

**Week 1-2:** (After KYC)
- Setup Azure SQL Database
- Create backend auth API
- Test with 5-10 users

**Week 3:**
- Add email verification
- Add password reset
- Test production flow

**Week 4:**
- Migrate existing users (if any)
- Switch to backend auth
- Deploy to production

---

## 🆘 **Need Help?**

I can help you set up the backend when ready! Just say:
- "Set up Azure SQL Database"
- "Create backend auth API"
- "Add email verification"

---

**Bottom Line:** Your current localStorage auth is PERFECT for testing/MVP. Upgrade to backend when you have real users and Razorpay is approved! 🚀
