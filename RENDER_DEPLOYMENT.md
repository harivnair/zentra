# Render Deployment Configuration

## Environment Variables to Set in Render Dashboard:

1. **BACKEND_URL**
   - Value: `https://zentra-backend-zx7t.onrender.com`
   - Description: Backend API base URL

2. **NEXT_PUBLIC_ENCRYPTION_KEY**
   - Value: (Generate a secure random key)
   - Description: Encryption key for securing tokens
   - Command to generate: `openssl rand -base64 32`

3. **NODE_ENV**
   - Value: `production`
   - Description: Node environment

4. **NEXT_TELEMETRY_DISABLED**
   - Value: `1`
   - Description: Disable Next.js telemetry

## Render Service Configuration:

- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Port**: `3000` (automatically detected)
- **Dockerfile Path**: `./Dockerfile`

## Deployment Steps:

1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Select "Docker" as the environment
4. Set the Dockerfile path to `./Dockerfile`
5. Add the environment variables listed above
6. Deploy!

## Notes:

- The Dockerfile is configured as a single-stage build for Render compatibility
- Environment variables will override the defaults in the code
- Make sure your backend API allows CORS from your Render frontend URL
