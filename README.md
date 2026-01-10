# 🎯 Planning Poker App

> **Estimate Smarter. Deliver Better.** - A modern, AI-powered Planning Poker application for Agile teams

![Hackathon Winner Badge](https://img.shields.io/badge/🏆-Hackathon%20Winner-gold?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.2.0-blue?style=flat-square&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?style=flat-square&logo=node.js)
![Socket.io](https://img.shields.io/badge/Socket.io-Real--time-black?style=flat-square&logo=socket.io)

## ✨ Features

- **🚀 Real-time Collaboration** - Synchronize estimates instantly across all team members using WebSocket technology
- **🤖 AI-Powered Insights** - Get intelligent estimation suggestions with confidence scores based on historical data
- **📊 Advanced Analytics** - Track team performance, velocity trends, and estimation accuracy over time
- **🎮 Gamified Experience** - Earn achievement badges while maintaining engagement and motivation
- **🎨 Modern UI/UX** - Beautiful, cinematic interface with smooth animations and responsive design
- **🔒 Bias-Free Estimation** - Hidden estimates until reveal to prevent anchoring bias
- **📱 Mobile Responsive** - Works seamlessly on desktop, tablet, and mobile devices
- **⚡ Lightning Fast** - Optimized performance with minimal latency

## 🛠 Tech Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **Framer Motion** - Smooth animations and transitions
- **Recharts** - Beautiful data visualization
- **Socket.io Client** - Real-time WebSocket communication
- **Axios** - HTTP client for API requests
- **React Router DOM** - Client-side routing

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Fast, minimalist web framework
- **Socket.io** - Real-time bidirectional event-based communication
- **CORS** - Cross-origin resource sharing
- **UUID** - Unique identifier generation

## 📸 Screenshots

> *Screenshots will be added here showing the Landing Page, Planning Poker Board, AI Insights Panel, and Analytics Dashboard*

## 🚀 Installation

### Prerequisites
- **Node.js** (version 14 or higher)
- **npm** or **yarn**

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the backend server:
```bash
npm start
```

The backend server will start on `http://localhost:5000`

For development with auto-reload:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the frontend application:
```bash
npm start
```

The frontend will start on `http://localhost:3000` and automatically open in your browser.

## 📖 Usage Guide

### Starting a Planning Session

1. **Launch the App** - Open `http://localhost:3000` in your browser
2. **Create a Room** - Click "Start Planning Session" on the landing page
3. **Enter Details** - Provide a room name (e.g., "Sprint 24 Planning") and your name
4. **Share Room ID** - Share the generated Room ID with your team members
5. **Start Estimating** - Team members can join using the Room ID and begin estimating

### Using the Poker Board

1. **Select Your Card** - Choose a Fibonacci number (1, 2, 3, 5, 8, 13, 21, or ?) that represents your estimate
2. **Wait for Team** - All team members select their estimates (estimates remain hidden)
3. **Reveal Estimates** - Once everyone has voted, click "Reveal Estimates" to show all cards
4. **Review Results** - View average, consensus status, and individual estimates
5. **Discuss & Decide** - Team discusses discrepancies and agrees on final estimate
6. **Start New Round** - Click "Start New Round" to estimate the next story

### AI Insights Panel

- **Suggested Estimate** - AI recommends an estimate based on similar past stories
- **Confidence Score** - Visual indicator showing AI's confidence in the suggestion
- **Reasoning** - Explanation of why the AI suggests this estimate
- **Similar Stories** - List of past stories with their estimates and accuracy
- **Achievement Badges** - Team achievements and milestones

### Analytics Dashboard

- **Metrics Overview** - Total stories, average time, consensus rate, AI acceptance
- **Accuracy Trend** - Line chart showing estimation accuracy over sprints
- **Velocity Trends** - Bar chart comparing planned vs completed story points
- **Team Achievements** - Gold, silver, and bronze badges earned by the team

## 🔌 API Documentation

### REST Endpoints

#### Health Check
```
GET /api/health
Response: { status: 'ok', timestamp: '2024-01-01T00:00:00.000Z' }
```

#### Create Room
```
POST /api/rooms
Body: { roomName: string, creatorName: string }
Response: { roomId: string, room: Room }
```

#### Get Room Details
```
GET /api/rooms/:roomId
Response: { room: Room }
```

#### Get AI Insight
```
POST /api/ai-insight
Body: { roomId: string, storyDescription: string }
Response: { insight: AIInsight }
```

#### Get Analytics
```
GET /api/analytics/:roomId
Response: { analytics: Analytics }
```

## 🔄 Socket.io Events

### Client → Server

| Event | Parameters | Description |
|-------|-----------|-------------|
| `join-room` | `{ roomId, userName, userId }` | User joins a room |
| `submit-estimate` | `{ roomId, userId, estimate }` | User submits their estimate |
| `reveal-estimates` | `{ roomId }` | Request to reveal all estimates |
| `reset-estimates` | `{ roomId }` | Request to reset for new round |

### Server → Client

| Event | Parameters | Description |
|-------|-----------|-------------|
| `room-updated` | `{ members, estimates }` | Room state updated |
| `estimate-submitted` | `{ userId, members, estimateCount }` | Estimate submitted by user |
| `estimates-revealed` | `{ estimates, members, average, consensus, totalVotes }` | All estimates revealed |
| `estimates-reset` | `{ members }` | Estimates reset for new round |
| `error` | `{ message }` | Error occurred |

## 🎨 Design System

### Color Palette
- **Primary Blue**: `#00d9ff` - Neon blue for accents and highlights
- **Purple**: `#b794f6` - Secondary color for gradients
- **Gold**: `#ffd93d` - Achievement badges and special highlights
- **Dark Background**: `#0a0a1a` to `#16213e` - Gradient dark theme
- **Success Green**: `#00ff88` - Positive indicators
- **Error Red**: `#ff6b6b` - Warnings and errors

### Typography
- **Font Family**: Inter (Google Fonts)
- **Weights**: 300 (Light), 400 (Regular), 600 (Semi-Bold), 700 (Bold), 900 (Black)

### Effects
- **Glassmorphism**: Backdrop blur with transparency
- **Gradients**: Linear gradients for modern look
- **Glow Effects**: Box shadows with color for depth
- **Animations**: Smooth transitions and micro-interactions

## 🔮 Future Enhancements

- [ ] **User Authentication** - Secure login and user profiles
- [ ] **Persistent Storage** - Database integration for room history
- [ ] **Story Management** - Add, edit, and organize stories within sessions
- [ ] **Timer Feature** - Time-boxed estimation rounds
- [ ] **Team Insights** - Individual team member statistics
- [ ] **Export Reports** - Download session reports as PDF/CSV
- [ ] **Custom Card Decks** - T-shirt sizes, hours, custom values
- [ ] **Video Integration** - Built-in video conferencing
- [ ] **Dark/Light Theme** - Theme toggle option
- [ ] **Multi-language Support** - Internationalization (i18n)
- [ ] **Spectator Mode** - Non-voting observers
- [ ] **Jira Integration** - Import stories from Jira
- [ ] **Advanced AI** - Machine learning model training on team data

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style
- Follow existing code patterns
- Use meaningful variable and function names
- Add comments for complex logic
- Test your changes thoroughly

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**Planning Poker Team**

Built with ❤️ for Agile teams worldwide

---

⭐ **Star this repo** if you find it useful!

🐛 **Found a bug?** [Open an issue](https://github.com/virennitkkr/planning-poker-app/issues)

💡 **Have a feature request?** [Start a discussion](https://github.com/virennitkkr/planning-poker-app/discussions)
