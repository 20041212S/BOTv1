# Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set up Environment Variables**
   Create a `.env` file in the root directory:
   ```env
DATABASE_URL="postgresql://user:password@localhost:5432/campus_assistant"
JWT_SECRET="your-secret-key-change-in-production"
GROQ_API_KEY="your-groq-api-key"
   ```
  
**Important**: Get your Groq API key from https://console.groq.com/

3. **Set up Database**
   ```bash
   # Generate Prisma Client
   npm run db:generate

   # Push schema to database (creates tables)
   npm run db:push

   # Seed with sample data
   npm run db:seed
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Access the Application**
   - Student App: http://localhost:3000
   - Admin Portal: http://localhost:3000/admin/login
   - Admin Credentials: admin@pce.edu / admin123

## Database Setup

### PostgreSQL Installation

**macOS (using Homebrew):**
```bash
brew install postgresql@14
brew services start postgresql@14
createdb campus_assistant
```

**Linux:**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo -u postgres createdb campus_assistant
```

**Windows:**
Download and install from https://www.postgresql.org/download/windows/

### Update DATABASE_URL

Update the `.env` file with your PostgreSQL credentials:
```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/campus_assistant"
```

## Project Structure Overview

- `/app` - Next.js app directory with pages and API routes
- `/lib` - Utility functions (Prisma, Auth, LLM service)
- `/prisma` - Database schema and migrations
- `/public` - Static assets

## Key Features Implemented

✅ Client login page (mobile, email, user type: student/guest/parent)
✅ Client registration & database persistence
✅ Admin client-users portal (view, filter, download CSV)
✅ Student onboarding screen
✅ Chat interface with conversations sidebar
✅ RAG sources display
✅ Admin authentication
✅ Staff management (CRUD)
✅ Fee management (CRUD)
✅ Room management (CRUD)
✅ Audit logs with filtering
✅ Role management (stub)
✅ Settings page

## Next Steps

1. **Get Groq API Key**: Sign up at https://console.groq.com/ and add your API key to `.env`
2. **Add Charts**: Connect a charting library (e.g., Recharts, Chart.js) to the dashboard
3. **Implement 2FA**: Add actual two-factor authentication
4. **Role Permissions**: Implement role-based access control
5. **File Uploads**: Add avatar uploads for staff members
6. **Email Notifications**: Add email functionality for password resets
7. **RAG Pipeline**: Enhance with vector database for document retrieval (optional)

## Troubleshooting

**Prisma Client not found:**
```bash
npm run db:generate
```

**Database connection errors:**
- Check PostgreSQL is running
- Verify DATABASE_URL in .env
- Ensure database exists

**Port already in use:**
- Change port: `npm run dev -- -p 3001`

