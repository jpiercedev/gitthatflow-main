# GitHub API Setup Guide

## Why You Need a GitHub Token

GitThatFlow analyzes GitHub repositories by making API calls to fetch repository structure and file contents. Without authentication, GitHub limits you to **60 requests per hour per IP address**, which is quickly exhausted when analyzing repositories.

With a GitHub Personal Access Token, you get **5,000 requests per hour**, which is sufficient for analyzing most repositories.

## Creating a GitHub Personal Access Token

1. **Go to GitHub Settings**
   - Visit [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
   - Or navigate: GitHub Profile → Settings → Developer settings → Personal access tokens → Tokens (classic)

2. **Generate New Token**
   - Click "Generate new token" → "Generate new token (classic)"
   - Give it a descriptive name like "GitThatFlow API Access"

3. **Configure Token Permissions**
   - **For public repositories**: No scopes are required (leave all checkboxes unchecked)
   - **For private repositories**: Check the `repo` scope

4. **Set Expiration**
   - Choose an appropriate expiration date (30 days, 90 days, or no expiration)
   - Note: You'll need to regenerate the token when it expires

5. **Generate and Copy Token**
   - Click "Generate token"
   - **Important**: Copy the token immediately - you won't be able to see it again!

## Adding Token to Your Project

1. **Open your `.env.local` file** in the project root

2. **Add your token**:
   ```env
   GITHUB_TOKEN=your_actual_token_here
   ```

3. **Restart your development server**:
   ```bash
   npm run dev
   ```

## Verifying Setup

After adding your token:

1. Try analyzing a repository through the GitThatFlow interface
2. Check the browser console for any authentication errors
3. If successful, you should see faster analysis and no rate limit errors

## Troubleshooting

### "GitHub authentication failed" Error
- Verify your token is correctly copied (no extra spaces)
- Check that the token hasn't expired
- Ensure the token has appropriate permissions for the repository type

### Still Getting Rate Limit Errors
- Verify the `GITHUB_TOKEN` environment variable is set
- Restart your development server after adding the token
- Check that you're using the correct token format

### Token Security
- Never commit your `.env.local` file to version control
- The `.env.local` file is already in `.gitignore`
- If you accidentally expose your token, revoke it immediately and create a new one

## Rate Limit Monitoring

GitThatFlow now includes automatic rate limit monitoring:
- Checks remaining requests before making API calls
- Automatically waits if rate limit is exceeded
- Provides better error messages when limits are hit

## Alternative: Using GitHub CLI

If you have GitHub CLI installed, you can also use:
```bash
gh auth token
```
This will display your current GitHub token that you can copy to your `.env.local` file.
