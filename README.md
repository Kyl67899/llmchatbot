# AI Chat Application with Prisma

A full-stack chat application with authentication, organization management, credit system, and real-time notifications.

## Features

- **Authentication**: Username/password and Google OAuth (mock)
- **Chat Interface**: ChatGPT-style UI with conversation history
- **Credit System**: Pay-per-message with credit tracking
- **Organization Management**: Multi-organization support with member roles
- **Real-time Notifications**: WebSocket-based notification system
- **Database**: Prisma ORM with PostgreSQL support

## Getting Started

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database (optional - falls back to localStorage)
- OpenAI API key

### Installation

1. Clone the repository
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

### Database Setup (Optional)

The application works with localStorage by default, but you can connect a PostgreSQL database for production use:

1. Create a PostgreSQL database

2. Add your database URL to environment variables:
   \`\`\`bash
   # Create a .env file in the root directory
   DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
   \`\`\`

3. Generate Prisma client:
   \`\`\`bash
   npm run prisma:generate
   \`\`\`

4. Push the schema to your database:
   \`\`\`bash
   npm run prisma:push
   \`\`\`

5. (Optional) Open Prisma Studio to view your data:
   \`\`\`bash
   npm run prisma:studio
   \`\`\`

### Running the Application

1. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

2. Open [http://localhost:3000](http://localhost:3000) in your browser

3. Register a new account or login

4. Add your OpenAI API key in Settings (gear icon in chat header)

5. Start chatting!

## Project Structure

\`\`\`
├── app/                    # Next.js app directory
│   ├── api/chat/          # Chat API route
│   ├── chat/              # Main chat page
│   ├── login/             # Login page
│   └── register/          # Registration page
├── components/            # React components
├── lib/                   # Core logic
│   ├── db/               # Database layer (Prisma)
│   ├── auth.ts           # Authentication
│   ├── chat.ts           # Chat management
│   ├── organizations.ts  # Organization management
│   └── notifications.ts  # Notification system
├── prisma/               # Prisma schema
│   └── schema.prisma     # Database schema
└── scripts/              # SQL scripts (legacy)
\`\`\`

## Environment Variables

- `DATABASE_URL`: PostgreSQL connection string (optional)
- OpenAI API key is stored in browser localStorage via Settings dialog

## Technologies

- **Frontend**: Next.js 15, React 19, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: Prisma ORM with PostgreSQL (with localStorage fallback)
- **AI**: OpenAI GPT-4o-mini via AI SDK
- **Authentication**: Custom auth with localStorage/Prisma

## Notes

- The application automatically falls back to localStorage if no database is connected
- All Prisma operations are wrapped with fallback logic for seamless development
- Google OAuth is currently a mock implementation
- WebSocket notifications use a mock service that can be replaced with real WebSocket server
# llmchatbot
