# Backend Setup Guide

## 🚀 Quick Setup (3 Steps)

### Step 1: Setup Backend Data
This will migrate traders to Firebase and initialize settings.

```bash
npm run setup-backend
```

**What it does:**
- ✅ Migrates 9 traders to Firestore
- ✅ Creates platform settings
- ✅ Verifies all collections

**Expected output:**
```
✅ 9 traders migrated successfully!
✅ Platform settings initialized
✅ BACKEND SETUP COMPLETE!
```

---

### Step 2: Create Admin User
This creates your first admin user for accessing /admin panel.

```bash
npm run create-admin
```

**You'll be prompted for:**
- Admin email
- Admin password (min 6 characters)
- Display name

**Expected output:**
```
✅ Admin user created in Firebase Auth
✅ Admin profile created in Firestore
🎉 SUCCESS! Admin user created successfully!
```

---

### Step 3: Deploy Firestore Rules (Optional but Recommended)
Secure your database with proper access rules.

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase (if not done)
firebase init firestore

# Deploy rules
firebase deploy --only firestore:rules
```

---

## 🧪 Testing Your Setup

### 1. Test Traders Migration
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `jay-shree-shyam0back`
3. Go to **Firestore Database**
4. Check `traders` collection - should have 9 documents

### 2. Test Admin Access
1. Run your app: `npm run dev`
2. Go to `/login`
3. Login with admin credentials
4. Navigate to `/admin`
5. You should see the admin dashboard

### 3. Test Trader CRUD
In admin panel:
- ✅ View all traders
- ✅ Add new trader
- ✅ Edit existing trader
- ✅ Delete trader

---

## 📊 What's in Firebase Now

### Collections Created

#### `traders` (9 documents)
- Crypto traders: Anas Ali, Rayner Teo, Thomas Kralow, P4 Provider
- Binary traders: Binary Edge Pro, Pocket Master
- Gold trader: Traders Paradise Live
- Forex traders: Trader Nick, Tani Forex

#### `settings` (1 document)
- Platform configuration
- Withdrawal limits
- Admin wallet address
- Maintenance mode flag

#### `users` (created when users sign up)
- User profiles
- Balances
- Roles (user/admin)

#### `withdrawals` (created when users request withdrawals)
- Withdrawal requests
- Status tracking
- Admin approval workflow

---

## 🔧 Troubleshooting

### Error: "Firebase not initialized"
**Solution:** Check your `.env` file has all Firebase credentials:
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### Error: "Email already in use"
**Solution:** This email is already registered. Either:
1. Use a different email
2. Manually update the user's role in Firestore to 'admin'

### Error: "Permission denied"
**Solution:** Deploy Firestore rules:
```bash
firebase deploy --only firestore:rules
```

### Traders not showing in app
**Solution:** 
1. Check Firebase Console - are traders there?
2. Check browser console for errors
3. Verify Firebase config in app

---

## 🎯 Next Steps After Setup

### 1. Customize Platform Settings
Go to Firebase Console > Firestore > `settings` > `platformSettings`

Update:
- `adminWalletAddress` - Your USDT TRC20 wallet
- `minWithdrawal` - Minimum withdrawal amount
- `maxWithdrawal` - Maximum withdrawal amount
- `platformFee` - Fee percentage

### 2. Add More Traders
Use the admin panel at `/admin` to:
- Add new traders
- Update trader info
- Remove inactive traders

### 3. Test User Flows
- Sign up as a regular user
- Try copying a trader
- Request a withdrawal
- Approve withdrawal as admin

### 4. Deploy to Production
Once everything works locally:
1. Deploy to Netlify (see NETLIFY_SETUP.md)
2. Add Firebase credentials to Netlify env vars
3. Test on live site

---

## 📝 Backend Architecture

```
Firebase Project: jay-shree-shyam0back
│
├── Authentication
│   ├── Email/Password provider
│   └── User management
│
├── Firestore Database
│   ├── traders (9 docs)
│   ├── users (grows with signups)
│   ├── withdrawals (grows with requests)
│   └── settings (1 doc)
│
└── Security Rules
    ├── Admin-only write access
    ├── User read access
    └── Role-based permissions
```

---

## 🔒 Security Best Practices

### ✅ Already Implemented
- Firestore security rules
- Role-based access control
- Admin-only write permissions
- User data isolation

### 🔜 Recommended
- Enable Firebase App Check
- Set up Firebase Functions for sensitive operations
- Add rate limiting
- Enable audit logging

---

## 💡 Tips

1. **Backup Your Data**
   - Export Firestore data regularly
   - Use Firebase Console > Firestore > Import/Export

2. **Monitor Usage**
   - Check Firebase Console > Usage
   - Stay within free tier limits
   - Upgrade to Blaze plan when needed

3. **Test Before Production**
   - Always test locally first
   - Use Firebase emulators for development
   - Have a staging environment

---

## 🆘 Need Help?

### Firebase Console
https://console.firebase.google.com/project/jay-shree-shyam0back

### Firebase Documentation
https://firebase.google.com/docs

### Project Issues
Check your code or contact support

---

**Your backend is now ready for production! 🚀**
