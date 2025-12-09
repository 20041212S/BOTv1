# Providence College of Engineering – Campus Assistant

A production-ready full-stack web application consisting of a Student Client App and an Admin Portal for managing campus information, staff, fees, rooms, and chatbot interactions.

## Features

### Student Client App
- **Onboarding Screen**: Welcome experience with feature highlights
- **Chat Interface**: Three-column layout with conversations sidebar, chat area, and sources view
- **RAG Sources Display**: Shows document sources for chatbot answers
- **Quick Links**: Easy access to Academics, Timetable, Fees, Library, Campus Map, Contacts
- **Mobile Responsive**: Bottom navigation bar for mobile devices

### Admin Portal
- **Authentication**: Secure login with JWT stored in HttpOnly cookies
- **Dashboard**: Overview with stats, charts, and recent activity
- **Staff Management**: CRUD operations for faculty and staff members
- **Fee Management**: Manage fee structures by program and academic year
- **Room Management**: Manage classrooms and buildings with location data
- **Audit Logs**: Track all admin actions with filtering
- **Role Management**: Manage user roles and permissions (stub)
- **Settings**: Security settings including 2FA configuration

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with HttpOnly cookies
- **LLM Integration**: OpenAI API (GPT-4o-mini by default)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database

### Installation

1. Clone the repository and navigate to the project:
```bash
cd campus-assistant
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/campus_assistant"
JWT_SECRET="your-secret-key-change-in-production"
OPENAI_API_KEY="your-openai-api-key"
OPENAI_MODEL="gpt-4o-mini"  # Optional, defaults to gpt-4o-mini
```

4. Set up the database:
```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# Seed the database with sample data
npm run db:seed
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Default Credentials

After seeding, you can login to the admin portal with:
- **Email**: `admin@pce.edu`
- **Password**: `admin123`

## Project Structure

```
campus-assistant/
├── app/
│   ├── admin/              # Admin portal pages
│   │   ├── login/          # Admin login
│   │   ├── page.tsx        # Dashboard
│   │   ├── staff/          # Staff management
│   │   ├── fees/           # Fee management
│   │   ├── rooms/          # Room management
│   │   ├── logs/           # Audit logs
│   │   ├── roles/          # Role management
│   │   └── settings/       # Settings
│   ├── chat/               # Student chat interface
│   ├── api/                # API routes
│   │   ├── chat/           # Chat endpoint
│   │   ├── conversations/  # Conversation endpoints
│   │   └── admin/          # Admin API endpoints
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Onboarding page
├── lib/
│   ├── prisma.ts           # Prisma client
│   ├── auth.ts             # Authentication utilities
│   ├── chatHelpers.ts      # Chat intent detection & DB queries
│   └── groqLlmService.ts   # Groq LLM integration
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Database seed script
└── public/                 # Static assets
```

## Database Schema

The application uses the following main models:

- **User**: Admin users with authentication
- **Staff**: Faculty and staff members
- **Fee**: Fee structures by program and year
- **Room**: Classrooms and buildings with location data
- **Conversation**: Chat conversations
- **Message**: Individual chat messages
- **AuditLog**: Admin action logs

## API Endpoints

### Student Endpoints
- `POST /api/chat` - Send chat message
- `GET /api/conversations` - List conversations
- `GET /api/conversations/[id]` - Get conversation with messages

### Admin Endpoints
- `POST /api/admin/auth/login` - Admin login
- `POST /api/admin/auth/logout` - Admin logout
- `GET /api/admin/auth/verify` - Verify authentication
- `GET/POST /api/admin/staff` - Staff CRUD
- `GET/POST /api/admin/fees` - Fee CRUD
- `GET/POST /api/admin/rooms` - Room CRUD
- `GET /api/admin/logs` - Audit logs

## LLM Integration

The Groq integration lives in `lib/groqLlmService.ts`:
- Uses Groq Llama 3.1 8B Instant to generate responses
- Prioritizes knowledge-base content and admin-provided data
- Includes tone, formatting, and greeting-handling rules
- Requires `GROQ_API_KEY` in your `.env`

## Intent Detection

The chatbot uses simple keyword-based intent detection in `lib/chatHelpers.ts`:
- `FEES_INFO` - Questions about fees
- `STAFF_INFO` - Questions about faculty/staff
- `DIRECTIONS` - Questions about locations
- `EVENTS_INFO` - Questions about events
- `GENERAL_INFO` - General questions

**TODO**: Replace with ML-based intent classification if needed.

## Styling

The application uses Tailwind CSS with custom colors matching the design:
- Primary: `#0A2463` (Dark Blue)
- Accent: `#3D99A2` (Teal)
- Background: `#F4F7F9` (Light Gray)
- Cards: Rounded corners, soft shadows
- Filters: Pill-shaped buttons

## Development

### Database Migrations
```bash
# Create a new migration
npm run db:migrate

# Apply migrations
npm run db:push
```

### Building for Production
```bash
npm run build
npm start
```

## Notes

- All admin routes are protected and require authentication
- JWT tokens are stored in HttpOnly cookies for security
- Groq API integration is configured - ensure `GROQ_API_KEY` is set in `.env`
- Role-based access control is stubbed - implement as needed
- Chart components in dashboard are placeholders - connect a charting library

## License

Private project for Providence College of Engineering.
