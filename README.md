# GitThatFlow

GitThatFlow is a powerful tool that analyzes GitHub repositories and visualizes their routing structure using beautiful Mermaid diagrams, plus discovers website navigation flows through intelligent crawling. It automatically detects and parses routing patterns from popular React frameworks and maps user journeys on any website.

## Features

### GitHub Repository Analysis
- 🔍 **Automatic Framework Detection**: Intelligently detects Next.js App Router, Next.js Pages Router, and React Router patterns
- 🔧 **AST Parsing**: Uses Babel AST parsing for accurate component and route extraction

### Website Flow Analysis (NEW!)
- 🌐 **Website Crawling**: Automatically discovers navigation paths and user journeys on any website
- 🚀 **Smart Limits**: Analyzes up to 30 pages with configurable depth for optimal performance
- 🤖 **Respectful Crawling**: Honors robots.txt and implements rate limiting
- 📸 **Screenshot Capture**: Take high-quality screenshots of analyzed websites in desktop and mobile viewports

### Unified Visualization
- 🎯 **Interactive React Flow**: Beautiful, draggable flow diagrams with zoom and pan controls for both analysis types
- 📊 **Consistent Experience**: Same intuitive interface whether analyzing code or websites
- 🎨 **Customizable Layouts**: Auto-layout algorithms with manual repositioning capabilities

### Shared Features
- ⚡ **Real-time Analysis**: Analyzes repositories and websites directly from URLs
- 💾 **Smart Caching**: Results are cached in Supabase for faster subsequent loads
- 🎨 **Modern UI**: Clean, responsive interface built with Tailwind CSS

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

3. Install Playwright browsers (for screenshot functionality):
```bash
npx playwright install chromium
```

4. Set up environment variables:
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

5. Set up Supabase database:

The application requires database tables for both GitHub repository analysis and website flow analysis. Run the SQL from `database-setup.sql` in your Supabase SQL editor, or copy this:

```sql
-- GitHub repository analysis table
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  repo_url TEXT NOT NULL UNIQUE,
  parsed_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Website flow analysis table
CREATE TABLE website_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  website_url TEXT NOT NULL UNIQUE,
  flow_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX idx_projects_repo_url ON projects(repo_url);
CREATE INDEX idx_website_projects_url ON website_projects(website_url);
```

   **Note**: Screenshots are handled in-memory and downloaded directly - no additional storage setup required!

6. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Usage

### GitHub Repository Analysis
1. **Enter a GitHub Repository URL**: Paste any public GitHub repository URL that uses supported routing frameworks
2. **Analyze**: Click "Analyze Repository" to start the parsing process
3. **Visualize**: View the interactive flow chart showing your application's routing structure
4. **Explore**: Use the flow chart controls to zoom, pan, and explore the route relationships

### Website Flow Analysis
1. **Switch to Website Mode**: Click the "Website Flow" toggle at the top
2. **Enter a Website URL**: Paste any website URL you want to analyze
3. **Configure Options**: Set max pages (up to 30) and crawl depth (up to 5)
4. **Analyze**: Click "Analyze Website" to start crawling and mapping the site
5. **Visualize**: View the interactive flow chart showing the website's navigation structure
6. **Capture Screenshots**: Click the "Website Screenshots" panel to take high-quality screenshots of the analyzed pages in both desktop and mobile viewports

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

- **Frontend**: Next.js 15 with React 19, Tailwind CSS, React Flow for unified visualization
- **Backend**: Next.js API routes with GitHub API integration and web crawling
- **Database**: Supabase (PostgreSQL) for caching analysis results and screenshot metadata
- **Analysis**: Babel AST parser for code analysis, Cheerio for website crawling
- **Screenshots**: Playwright for automated browser screenshots with direct download (no storage required)
- **Visualization**: React Flow for interactive, draggable flow diagrams

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
