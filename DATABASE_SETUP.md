# Database Setup Guide

## Quick Setup Options

### Option 1: Free Cloud PostgreSQL (Recommended - No Installation Needed)

**Supabase (Easiest):**
1. Go to https://supabase.com and sign up (free)
2. Create a new project
3. Go to **Settings** → **Database**
4. Find **Connection string** → **URI**
5. Copy the connection string
6. Update your `.env` file:
   ```env
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT].supabase.co:5432/postgres"
   ```
7. Run:
   ```bash
   npm run db:push
   npm run db:seed
   ```

**Neon (Alternative):**
1. Go to https://neon.tech and sign up (free)
2. Create a project
3. Copy the connection string
4. Update `.env` and run the commands above

### Option 2: Install PostgreSQL Locally

**macOS (without Homebrew):**
1. Download PostgreSQL from: https://www.postgresql.org/download/macosx/
2. Install the app
3. Create database:
   ```bash
   createdb campus_assistant
   ```
4. Update `.env`:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/campus_assistant"
   ```

## After Database Setup

1. **Push schema:**
   ```bash
   npm run db:push
   ```

2. **Seed database:**
   ```bash
   npm run db:seed
   ```

3. **Restart server:**
   ```bash
   npm run dev
   ```

4. **Login credentials:**
   - Email: `admin@pce.edu`
   - Password: `admin123`

## Troubleshooting

- **Connection errors**: Check your DATABASE_URL format
- **"Can't reach database"**: Ensure database is running/accessible
- **Login errors**: Make sure database is seeded (`npm run db:seed`)

