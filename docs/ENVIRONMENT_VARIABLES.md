# Environment Variables

## Overview

The project uses environment variables for server-side configuration, especially the Formula One AI integration. The key requirement is that the API key remains server-side and is not embedded in the client bundle.

The project currently checks for the following variable in the AI route:

- GEMINI_API_KEY

## Required Variables

### GEMINI_API_KEY

Description:

Used to authenticate the Formula One AI assistant and Smart Guide route on the server side.

Used by:

- the Next.js server API route at app/api/ai/chat/route.ts
- the Formula One Smart Guide / AI system in the browser experience

Security:

- Keep the key in a local environment file such as .env.local
- Never commit the file to source control
- Never expose the key in browser code or public configuration
- Use your deployment platform's secret manager in production

Example:

```env
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
```

## Local Development

Create a local environment file if it does not exist:

```bash
cp .env.example .env.local
```

Then add your own Gemini API key:

```env
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
```

After saving the file, restart the development server:

```bash
npm run dev
```

## Production Configuration

In production deployments, configure the same variable through the hosting platform's environment-variable manager instead of hardcoding it into the app.

## Security Notes

- Never commit .env.local
- Never expose secret values in Markdown, screenshots, code comments, or public logs
- Keep AI credentials on the server side only
- Treat the API key as a deployment secret, not as client-visible state

## Not Explicitly Documented

No additional project environment variables are explicitly required by the current source tree beyond the Gemini API key.
