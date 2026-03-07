# 🧪 QUICK SECURITY TEST GUIDE

## ✅ Test the Enterprise Authentication

### **Test 1: Weak Password (Should FAIL)**
```
1. Go to Sign Up page
2. Enter:
   Email: test@example.com
   Password: password
3. Click Sign Up
4. ❌ Expected: "Password must contain uppercase, lowercase, number, and special character"
```

### **Test 2: Strong Password (Should SUCCEED)**
```
1. Go to Sign Up page
2. Enter:
   Email: test@example.com
   Password: Test@1234
3. Click Sign Up
4. ✅ Expected: Account created, logged in
```

### **Test 3: Duplicate Email (Should FAIL)**
```
1. Try signing up with same email again
2. ❌ Expected: "User with this email already exists"
```

### **Test 4: Invalid Email (Should FAIL)**
```
1. Go to Sign Up page
2. Enter:
   Email: notanemail
   Password: Test@1234
3. Click Sign Up
4. ❌ Expected: "Invalid email format"
```

### **Test 5: Account Lockout (Should LOCK)**
```
1. Go to Login page
2. Enter:
   Email: test@example.com
   Password: WrongPassword1!
3. Click Login 5 times
4. After 5 attempts:
   ❌ Expected: "Account locked due to too many failed attempts"
5. Try logging in again:
   ❌ Expected: "Account temporarily locked. Try again in 15 minutes"
```

### **Test 6: Correct Login (Should SUCCEED)**
```
1. Wait 15 minutes (or clear localStorage to reset lockout)
2. Enter correct credentials:
   Email: test@example.com
   Password: Test@1234
3. Click Login
4. ✅ Expected: Logged in successfully
```

### **Test 7: Rate Limiting (Should BLOCK)**
```
1. Try logging in 6 times rapidly (within 1 minute)
2. On 6th attempt:
   ❌ Expected: "Too many requests. Please try again later"
```

---

## 🔧 Reset Security Settings (For Testing)

### **Clear All Data**:
```javascript
// Open browser console (F12) and run:
localStorage.removeItem('azureDesigner_login_attempts');
localStorage.removeItem('azureDesigner_users_secure');
localStorage.removeItem('azureDesigner_session');
localStorage.removeItem('azureDesigner_user');
localStorage.removeItem('azureDesigner_token');
location.reload();
```

### **Reset Lockout Only**:
```javascript
// Open browser console (F12) and run:
localStorage.removeItem('azureDesigner_login_attempts');
location.reload();
```

---

## 📊 Check Security Status

### **View Login Attempts**:
```javascript
// Open console (F12):
const attempts = JSON.parse(localStorage.getItem('azureDesigner_login_attempts') || '{}');
console.table(attempts);
```

### **View All Users**:
```javascript
// Open console (F12):
const users = JSON.parse(localStorage.getItem('azureDesigner_users_secure') || '[]');
console.table(users.map(u => ({ email: u.email, role: u.role, created: u.createdAt })));
```

### **View Current Session**:
```javascript
// Open console (F12):
const session = JSON.parse(localStorage.getItem('azureDesigner_session') || 'null');
console.log('Session:', session);
```

---

## ✅ SUCCESS CRITERIA

All tests should work as expected:
- ✅ Weak passwords rejected
- ✅ Invalid emails rejected
- ✅ Duplicate emails rejected
- ✅ Account locks after 5 failed attempts
- ✅ Rate limiting blocks excessive requests
- ✅ Strong passwords accepted
- ✅ Valid credentials allow login

---

**Ready to Test!** 🚀
