# 🚀 Campus Assistant - Backend Setup & Testing Guide

## Prerequisites
- Node.js 18+
- PostgreSQL database (Neon or similar)
- Groq API key (free at https://console.groq.com)

## Installation & Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create or update `.env.local`:
```bash
# Database
DATABASE_URL="postgresql://user:password@host/dbname"

# Groq LLM
GROQ_API_KEY="your-groq-api-key-here"
GROQ_MODEL="llama-3.1-8b-instant"
```

### 3. Sync Database Schema
```bash
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
```

### 4. Start Development Server
```bash
npm run dev
```
Server runs on: `http://localhost:3000`

---

## 🧪 API Testing Guide

### **1. Client Registration Endpoint**

#### Request:
```bash
curl -X POST http://localhost:3000/api/client/register \
  -H "Content-Type: application/json" \
  -d '{
    "mobile": "+91 9876543210",
    "email": "student@example.com",
    "userType": "student"
  }'
```

#### Expected Response (201):
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "clty4n5zk0001pc9z8g9z9z9z",
    "mobile": "+91 9876543210",
    "email": "student@example.com",
    "userType": "student",
    "createdAt": "2025-12-08T20:30:00Z"
  }
}
```

---

### **2. Admin: List All Client Users**

#### Request:
```bash
curl http://localhost:3000/api/admin/client-users
```

#### Expected Response:
```json
{
  "success": true,
  "count": 2,
  "users": [
    {
      "id": "clty4n5zk0001pc9z8g9z9z9z",
      "mobile": "+91 9876543210",
      "email": "student@example.com",
      "userType": "student",
      "createdAt": "2025-12-08T20:30:00Z"
    }
  ]
}
```

---

### **3. Admin: Filter by User Type**

#### Request:
```bash
# Get only students
curl "http://localhost:3000/api/admin/client-users?userType=student"

# Get only guests
curl "http://localhost:3000/api/admin/client-users?userType=guest"

# Get only parents
curl "http://localhost:3000/api/admin/client-users?userType=parent"
```

---

### **4. Admin: Download CSV**

#### Request:
```bash
curl http://localhost:3000/api/admin/client-users/download \
  -o client-users.csv
```

#### File Format:
```csv
"id","mobile","email","userType","createdAt"
"clty4n5zk0001pc9z8g9z9z9z","+91 9876543210","student@example.com","student","2025-12-08T20:30:00Z"
```

---

## 🔗 UI Testing Flow

### 1. **Client Registration Page**
- Navigate to: `http://localhost:3000`
- Fill in form:
  - Mobile Number: `+91 9876543210`
  - Email ID: `student@example.com`
  - User Type: Select from dropdown (Student/Guest/Parent)
- Click "Continue"
- ✅ Should see onboarding screen

### 2. **Onboarding Page**
- Shows features: Campus Navigation, Academic Info, Campus Events
- Click "Continue" to go to chatbot
- ✅ Should redirect to `/chat`

### 3. **Chat Page**
- Chatbot interface loads
- Can now interact with Groq LLM-powered assistant
- ✅ Previous registration data is saved in browser localStorage

### 4. **Admin Panel** (if available)
- Navigate to `/admin` (admin login required)
- Go to "Client Users" section
- ✅ See list of registered users
- ✅ Can filter by student/guest/parent
- ✅ Can download CSV file

---

## 📊 Database Schema

### ClientUser Table
```sql
CREATE TABLE client_users (
  id           VARCHAR(255) PRIMARY KEY,
  mobile       VARCHAR(255),
  email        VARCHAR(255),
  userType     VARCHAR(50),     -- 'student' | 'guest' | 'parent'
  created_at   TIMESTAMP DEFAULT NOW()
);
```

---

## 🎯 Key Features Implemented

✅ **Client Login/Registration**
- Mobile, Email, User Type form
- Validation on both frontend and backend
- Beautiful glassmorphic UI design

✅ **Admin APIs**
- List all registrations with filtering
- CSV export functionality
- Proper error handling

✅ **Groq LLM Integration**
- Service: `lib/groqLlmService.ts`
- Type-safe context interface
- Data-driven responses (won't invent information)

✅ **Database**
- Prisma ORM with PostgreSQL
- Automatic migrations
- Schema already synced

---

## 🔧 Troubleshooting

### Database Connection Error
- Check `DATABASE_URL` in `.env.local`
- Verify PostgreSQL is running
- Run: `npm run db:push` again

### Groq API Error
- Verify `GROQ_API_KEY` is set correctly
- Check Groq account at https://console.groq.com/keys
- Ensure API key is active

### Prisma Client Error
- Run: `npm run db:generate`
- Clear `.next` folder: `rm -rf .next`
- Restart dev server: `npm run dev`

---

## 📚 Additional Resources

- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Groq SDK](https://github.com/groq/groq-node-sdk)
- [PostgreSQL Guide](https://www.postgresql.org/docs/)

---

## 📝 Notes

- All APIs return consistent JSON responses with `success` flag
- Error handling includes detailed error messages
- Timestamps use ISO 8601 format
- Email is automatically lowercased in database
- Mobile and email are not required to be unique (by design)
