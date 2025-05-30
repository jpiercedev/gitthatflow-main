# GitThatFlow

GitThatFlow is a powerful tool that analyzes GitHub repositories and visualizes their routing structure using beautiful Mermaid diagrams. It automatically detects and parses routing patterns from popular React frameworks including Next.js (App Router & Pages Router) and React Router.

## Features

- 🔍 **Automatic Framework Detection**: Intelligently detects Next.js App Router, Next.js Pages Router, and React Router patterns
- 📊 **Interactive Flow Visualization**: Beautiful, customizable diagrams powered by Mermaid.js
- ⚡ **Real-time Analysis**: Analyzes repositories directly from GitHub URLs
- 💾 **Smart Caching**: Results are cached in Supabase for faster subsequent loads
- 🎨 **Modern UI**: Clean, responsive interface built with Tailwind CSS
- 🔧 **AST Parsing**: Uses Babel AST parsing for accurate component and route extraction

## Supported Frameworks

- **Next.js App Router** (`app/` directory structure)
- **Next.js Pages Router** (`pages/` directory structure)
- **React Router** (component-based routing)

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project
- GitHub Personal Access Token (optional but recommended)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/gitthatflow.git
cd gitthatflow
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# GitHub API Token (Optional but recommended)
GITHUB_TOKEN=your_github_personal_access_token
```

4. Set up Supabase database:

The application requires a `projects` table in your Supabase database. Run this SQL in your Supabase SQL editor:

```sql
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  repo_url TEXT NOT NULL UNIQUE,
  parsed_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_projects_repo_url ON projects(repo_url);
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Usage

1. **Enter a GitHub Repository URL**: Paste any public GitHub repository URL that uses supported routing frameworks
2. **Analyze**: Click "Analyze Repository" to start the parsing process
3. **Visualize**: View the interactive flow chart showing your application's routing structure
4. **Explore**: Use the flow chart controls to zoom, pan, and explore the route relationships

### Example Repositories to Try

- Next.js App Router: `https://github.com/vercel/next.js/tree/canary/examples/app-dir-mdx`
- Next.js Pages Router: `https://github.com/vercel/next.js/tree/canary/examples/blog-starter`
- React Router: `https://github.com/remix-run/react-router/tree/main/examples/basic`

## Configuration

### GitHub API Token (Highly Recommended)

**Important**: Without a GitHub token, you'll quickly hit rate limits (60 requests/hour). With a token, you get 5,000 requests/hour.

**Quick Setup**:
1. Go to [GitHub Settings > Personal access tokens](https://github.com/settings/tokens)
2. Generate a new token (classic) - no scopes needed for public repos
3. Add to your `.env.local`: `GITHUB_TOKEN=your_token_here`
4. Restart your dev server

📖 **Detailed instructions**: See [GITHUB_SETUP.md](./GITHUB_SETUP.md) for complete setup guide.

### Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from the project settings
3. Run the database setup SQL provided above
4. Add the credentials to your `.env.local` file

## Architecture

- **Frontend**: Next.js 15 with React 19, Tailwind CSS, Mermaid.js
- **Backend**: Next.js API routes with GitHub API integration
- **Database**: Supabase (PostgreSQL) for caching analysis results
- **Parsing**: Babel AST parser for accurate code analysis

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
