# 🚀 Planning Poker Deployment Guide

This guide will help you deploy the Planning Poker application with separate backend and frontend hosting on free tiers.

## 📋 Prerequisites

- GitHub account
- Node.js installed locally for testing

## 🎯 Deployment Options

### Option 1: Vercel (Recommended - Both Frontend & Backend)

#### Backend Deployment
1. Go to [Vercel](https://vercel.com) and sign up/login
2. Click "New Project"
3. Import your GitHub repository
4. Configure project:
   - **Root Directory**: `backend`
   - **Build Settings**: Uses `vercel.json` automatically
5. Add environment variables:
   - `PORT`: `3001`
6. Deploy!

#### Frontend Deployment
1. In Vercel, click "New Project" again
2. Import the same GitHub repository
3. Configure project:
   - **Root Directory**: `frontend`
   - **Build Settings**: Uses `vercel.json` automatically
4. Add environment variables:
   - `REACT_APP_API_URL`: `https://your-backend-url.vercel.app`
   - `REACT_APP_SOCKET_URL`: `https://your-backend-url.vercel.app`
5. Deploy!

### Option 2: Netlify (Frontend) + Railway (Backend)

#### Backend on Railway
1. Go to [Railway](https://railway.app) and sign up
2. Click "Deploy from GitHub"
3. Connect your repository
4. Set root directory to `backend`
5. Add environment variables:
   - `PORT`: `8080`
6. Deploy!

#### Frontend on Netlify
1. Go to [Netlify](https://netlify.com) and sign up
2. Drag & drop the `frontend` folder or connect GitHub
3. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `build`
4. Add environment variables:
   - `REACT_APP_API_URL`: `https://your-railway-backend-url.up.railway.app`
   - `REACT_APP_SOCKET_URL`: `https://your-railway-backend-url.up.railway.app`
5. Deploy!

### Option 3: Netlify (Frontend) + Render (Backend)

#### Backend on Render
1. Go to [Render](https://render.com) and sign up
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add environment variables:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
6. Deploy!

#### Frontend on Netlify (same as Option 2)

## 🔧 Environment Variables Setup

### Backend Environment Variables
```
PORT=3001
NODE_ENV=production
```

### Frontend Environment Variables
```
REACT_APP_API_URL=https://your-backend-url.com
REACT_APP_SOCKET_URL=https://your-backend-url.com
```

## 🌐 CORS Configuration

Update the CORS origin in `backend/server.js` if needed:

```javascript
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? ['https://your-frontend-domain.netlify.app', 'https://your-frontend-domain.vercel.app']
    : 'http://localhost:3000',
  credentials: true
};
```

## ✅ Testing Your Deployment

1. **Backend Health Check**: Visit `https://your-backend-url.com/api/health`
2. **Frontend**: Visit your frontend URL
3. **Socket Connection**: Check browser dev tools for WebSocket connections
4. **Create Room**: Test room creation and joining

## 🛠 Troubleshooting

### Common Issues:

1. **CORS Errors**: Update CORS origins in backend
2. **Socket Connection Failed**: Check `REACT_APP_SOCKET_URL` environment variable
3. **Build Failures**: Ensure all dependencies are in `package.json`
4. **Port Issues**: Some platforms require specific ports (check platform docs)

### Free Tier Limits:
- **Vercel**: 100GB bandwidth/month, unlimited deployments
- **Netlify**: 100GB bandwidth/month, 300 build minutes/month
- **Railway**: $5/month credit, then pay-as-you-go
- **Render**: 750 hours/month free

## 📞 Support

If you encounter issues, check:
- Platform-specific documentation
- Browser console for errors
- Network tab for failed requests

Happy deploying! 🎉