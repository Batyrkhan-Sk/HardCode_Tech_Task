#  HardCode Tech Task

## Live Demo

**Live Application:** https://usermngmnt.netlify.app/

**Credentials:**
- Username: `admin`
- Password: `admin`

---

## Features Checklist

### **Required Features**
- [x] **Authentication**
  - Local login with credentials (admin/admin)
  - Session persistence (survives page refresh)
  - Protected routes with guards
  
- [x] **User Management**
  - Display list of users from JSONPlaceholder API
  - Real-time search with 300ms debounce
  - Sorting by Name, Email, and City (ascending/descending)
  - Create new users with validation
  - Delete users with confirmation modal
  
- [x] **Data Persistence**
  - LocalStorage integration
  - Users persist after page refresh
  - Auth state maintained across sessions
  
- [x] **UI/UX**
  - Responsive design (mobile, tablet, desktop)
  - Loading states with spinners
  - Error handling with retry

### **Technical Requirements**
- [x] Angular 18 
- [x] TypeScript
- [x] Standalone components
- [x] RxJS state management
- [x] Reactive forms with validation
- [x] Route guards (authGuard, loginGuard)
- [ ] 
---

## How to Start

### **Prerequisites**
- Node.js 18+ 
- npm 9+

### **Installation**
```bash
# Clone repository
git clone [your-repo-url]
cd user-management-app

# Install dependencies
npm install

# Start development server
npm start
```

Navigate to `http://localhost:4200/`

### **Login**
Use these credentials:
- **Username:** admin
- **Password:** admin

---

## Testing Scenarios

### **1. Authentication Flow**
1. Open application → Redirects to `/login`
2. Try wrong credentials → Shows error message
3. Login with admin/admin → Redirects to `/users`
4. Refresh page → Still authenticated
5. Logout → Returns to login page
6. Try accessing `/users` directly → Redirects to `/login`

### **2. User List**
1. After login - Users load from API 
2. Check loading spinner - Shows during fetch
3. Check responsive grid - Cards display properly
4. Refresh page - Users persist (from localStorage)

### **3. Search Functionality**
1. Type "Leanne" - Filters to 1 user (Leanne Graham)
2. Clear search - All users return
3. Type partial name - Real-time filtering
4. Notice debounce - Search waits 300ms after typing stops

### **4. Sorting**
1. Click "Name" → Users sort A-Z
2. Click "Name" again → Users sort Z-A (arrow flips)
3. Click "Email" → Sorts by email, resets to ascending
4. Click "City" → Sorts by city
5. Sort persists with search active

### **5. Create User**
1. Click "Add User" button → Modal opens
2. Try submitting empty → Shows validation errors
3. Fill all fields:
   - Name: "Test User"
   - Email: "test@example.com"
   - Phone: "123-456-7890"
   - Website: "test.com"
   - City: "Test City"
4. Submit → User appears at top of list
5. Refresh page → New user still there (localStorage)

### **6. Delete User**
1. Click trash icon on any card → Confirmation modal opens
2. Click "Cancel" → Modal closes, user remains
3. Click trash icon again → Modal opens
4. Click "Delete" → User removed from list
5. Refresh page → Deletion persists

### **7. User Card Expansion**
1. Click on any user card → Expands smoothly
2. Shows additional details (username, phone, website, company, address)
3. Click again → Collapses smoothly
4. No page jumping or dancing
5. Arrow icon rotates

### **8. Responsive Design**
1. Resize browser to mobile size
2. Check header → Stacks vertically
3. Check search/sort/add → Full width buttons
4. Check user cards → Single column grid
5. Check modals → Adapt to mobile view

### **9. Error Handling**
1. Disconnect internet
2. Clear localStorage
3. Reload page → Error state shows
4. Click "Retry" → Attempts to reload

---

## Architecture Overview
```
src/app/
├── core/                      # Business logic layer
│   ├── models/               # TypeScript interfaces
│   ├── services/             # Data & auth services
│   └── guards/               # Route protection
├── features/                 # Feature modules
│   ├── auth/login/          # Login page
│   └── users/               # User management
│       ├── users.component.*
│       ├── user-card/
│       ├── create-user-modal/
│       └── delete-confirmation-modal/
└── )
```

### **State Management**
- **AuthService:** BehaviorSubject for auth state
- **UserService:** BehaviorSubject for users list, loading, errors
- **RxJS Patterns:** debounceTime, distinctUntilChanged, combineLatest, takeUntil

### **Data Flow**
1. User actions → Component methods
2. Component → Service methods
3. Service → HTTP/localStorage
4. Service updates BehaviorSubject
5. Component subscribes to Observable
6. UI updates reactively

---

## Bonus Features Implemented

Beyond requirements:
- ✅ **Sorting** - Multiple fields with direction toggle
- ✅ **Delete Modal** - Beautiful confirmation instead of browser alert
- ✅ **Empty States** - User-friendly messages
- ✅ **Expandable Cards** - Click to see more details
- ✅ **Form Validation** - Real-time feedback
---
