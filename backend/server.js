require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const compression = require('compression');
const helmet = require('helmet');
const sql = require('./db'); // Import the database connection
const axios = require('axios'); // Import axios for making API requests

// Ensure OpenAI API key is loaded from environment variables
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

if (!OPENAI_API_KEY) {
  console.warn('Missing OpenAI API key. The AI insight endpoint will use heuristic fallback responses.');
}

const FIBONACCI_POINTS = [1, 2, 3, 5, 8, 13];

const nearestFibonacciPoint = (value) => {
  const numeric = Number(value);
  const target = Number.isFinite(numeric) ? numeric : 3;

  return FIBONACCI_POINTS.reduce((closest, current) => {
    return Math.abs(current - target) < Math.abs(closest - target) ? current : closest;
  }, FIBONACCI_POINTS[0]);
};

const nextFibonacciPoint = (value) => {
  const numeric = Number(value);
  const base = Number.isFinite(numeric) ? numeric : 3;
  const next = FIBONACCI_POINTS.find(point => point > base);
  return next || FIBONACCI_POINTS[FIBONACCI_POINTS.length - 1];
};

const sanitizeStringArray = (values, maxItems = 6) => {
  if (!Array.isArray(values)) return [];

  return values
    .map(value => (typeof value === 'string' ? value.trim() : ''))
    .filter(Boolean)
    .slice(0, maxItems);
};

const isWeakEscalationCondition = (value) => {
  if (typeof value !== 'string') return true;

  const normalized = value.trim().toLowerCase();
  if (!normalized) return true;

  const weakPhrases = [
    'additional features',
    'more complexity',
    'complex validation',
    'extra complexity',
    'further requirements',
    'etc'
  ];

  const hasWeakPhrase = weakPhrases.some(phrase => normalized.includes(phrase));
  const hasEnoughDetail = normalized.split(',').filter(Boolean).length >= 2;

  return hasWeakPhrase || !hasEnoughDetail;
};

const extractScopeItems = (storyDescription) => {
  const text = String(storyDescription || '').toLowerCase();
  const items = [];

  const addIfMatches = (regex, label) => {
    if (regex.test(text) && !items.includes(label)) {
      items.push(label);
    }
  };

  addIfMatches(/(react|ui|frontend|component)/, 'React UI implementation');
  addIfMatches(/(login|sign ?in|auth|authentication|oauth)/, 'Login/authentication flow');
  addIfMatches(/(admin|role|permission|rbac|access)/, 'User/Admin role selection and access rules');
  addIfMatches(/(form|validation|input|field|error)/, 'Form validation and error handling');
  addIfMatches(/(redirect|dashboard|navigation|routing|route)/, 'Redirect/navigation to the relevant dashboard');
  addIfMatches(/(api|endpoint|backend|integration)/, 'API integration with backend endpoints');
  addIfMatches(/(jwt|token|session|cookie)/, 'JWT/session handling');
  addIfMatches(/(protected route|route guard|authorization)/, 'Protected routes and route guards');
  addIfMatches(/(test|testing|unit test|integration test|e2e)/, 'Automated test coverage');

  if (items.length === 0) {
    return [
      'Core feature implementation',
      'UI and state handling',
      'Validation and error handling',
      'Integration verification'
    ];
  }

  return items.slice(0, 5);
};

const buildEscalationGuidance = (storyDescription, suggestedEstimate) => {
  const text = String(storyDescription || '').toLowerCase();

  const optionalScopes = [
    { regex: /(api|endpoint|backend|integration)/, label: 'API integration' },
    { regex: /(jwt|token|session|oauth|authentication)/, label: 'JWT auth/session handling' },
    { regex: /(protected route|route guard|authorization)/, label: 'protected routes' },
    { regex: /(test|testing|unit test|integration test|e2e)/, label: 'testing' },
    { regex: /(audit|logging|monitoring|observability)/, label: 'audit logging and observability' }
  ];

  const missingScopes = optionalScopes
    .filter(item => !item.regex.test(text))
    .map(item => item.label)
    .slice(0, 4);

  const fallbackScopes = ['API integration', 'JWT auth/session handling', 'protected routes', 'testing'];

  return {
    higherEstimate: String(nextFibonacciPoint(suggestedEstimate)),
    higherEstimateCondition: (missingScopes.length > 0 ? missingScopes : fallbackScopes).join(', ')
  };
};

const safeParseJson = (text) => {
  if (typeof text !== 'string' || !text.trim()) return null;

  try {
    return JSON.parse(text);
  } catch (error) {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;

    try {
      return JSON.parse(match[0]);
    } catch (parseError) {
      return null;
    }
  }
};

const buildFallbackInsight = (storyDescription, extraReason = '') => {
  const text = String(storyDescription || '').toLowerCase();
  let complexityScore = 2;

  const heavySignals = /(integration|third-party|payment|oauth|authentication|authorization|security|encryption|migration|real-time|websocket|concurrency|performance|distributed|database schema)/g;
  const mediumSignals = /(api|endpoint|refactor|state management|analytics|dashboard|permissions|validation|error handling|retry)/g;
  const lightSignals = /(copy change|typo|label|tooltip|css|style|alignment|color)/g;

  complexityScore += (text.match(heavySignals) || []).length * 2;
  complexityScore += (text.match(mediumSignals) || []).length;
  complexityScore -= (text.match(lightSignals) || []).length;

  if (text.length > 240) {
    complexityScore += 2;
  } else if (text.length > 120) {
    complexityScore += 1;
  }

  complexityScore = Math.max(1, complexityScore);

  const suggestedEstimate = String(nearestFibonacciPoint(complexityScore));
  const includes = extractScopeItems(storyDescription);
  const escalationGuidance = buildEscalationGuidance(storyDescription, suggestedEstimate);

  return {
    suggestedEstimate,
    confidence: 68,
    reasoning: `Estimated using local complexity heuristics (scope, risk, and implementation detail).${extraReason ? ` ${extraReason}` : ''}`,
    includes,
    higherEstimate: escalationGuidance.higherEstimate,
    higherEstimateCondition: escalationGuidance.higherEstimateCondition,
    similarStories: []
  };
};

const app = express();
const server = http.createServer(app);

// Normalize CORS origins (include local dev origins only outside production)
const DEFAULT_LOCAL_ORIGINS = process.env.NODE_ENV === 'production'
  ? []
  : ['http://localhost:3000', 'http://127.0.0.1:3000'];
const FRONTEND_ORIGINS = Array.from(new Set(
  [process.env.SOCKET_CORS_ORIGIN, process.env.CORS_ORIGIN, ...DEFAULT_LOCAL_ORIGINS]
    .filter(Boolean)
    .flatMap(value => value.split(','))
    .map(s => s.trim())
    .filter(Boolean)
));

const io = socketIo(server, {
  cors: {
    origin: FRONTEND_ORIGINS,
    methods: ["GET", "POST"],
    credentials: false
  },
  transports: ['websocket'],
  pingTimeout: 20000,
  pingInterval: 25000
});

// Middleware
app.set('trust proxy', true);
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: FRONTEND_ORIGINS,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: false
}));
app.use(express.json());

// In-memory storage
const rooms = new Map();
const analytics = new Map();

// REST API Endpoints

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Create new room
app.post('/api/rooms', (req, res) => {
  try {
    const { roomName, creatorName } = req.body;
    
    if (!roomName || !creatorName) {
      return res.status(400).json({ error: 'Room name and creator name are required' });
    }

    const roomId = uuidv4().substring(0, 8);
    const room = {
      id: roomId,
      name: roomName,
      creator: creatorName,
      members: [],
      estimates: {},
      revealed: false,
      createdAt: new Date().toISOString(),
      messages: [],
      storyDescription: null
    };

    rooms.set(roomId, room);
    
    // Initialize analytics for the room
    analytics.set(roomId, {
      totalStories: 0,
      avgTime: 0,
      consensusRate: 0,
      aiAcceptance: 0,
      accuracyTrend: [],
      velocityTrend: []
    });

    res.json({ roomId, room });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

// Get room details
app.get('/api/rooms/:roomId', (req, res) => {
  try {
    const { roomId } = req.params;
    const room = rooms.get(roomId);

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.json({ room });
  } catch (error) {
    console.error('Error getting room:', error);
    res.status(500).json({ error: 'Failed to get room' });
  }
});

// Admin login endpoint
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Query the admin table in the database
    const [admin] = await sql`SELECT * FROM admin WHERE user_id = ${email}`;

    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    // Validate password
    if (admin.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Successful login
    res.json({ message: 'Login successful', admin: { id: admin.id, userName: admin.user_name } });
  } catch (error) {
    console.error('Error during admin login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get AI insight
app.post('/api/ai-insight', async (req, res) => {
  try {
    const { roomId, storyDescription } = req.body;
    const room = roomId ? rooms.get(roomId) : null;
    const resolvedStoryDescription = (storyDescription || room?.storyDescription || '').trim();

    if (!resolvedStoryDescription) {
      return res.status(400).json({ error: 'Story description is required' });
    }

    const fallbackInsight = buildFallbackInsight(resolvedStoryDescription);

    if (!OPENAI_API_KEY) {
      return res.json({ insight: fallbackInsight });
    }

    // Call OpenAI API
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: OPENAI_MODEL,
      temperature: 0.3,
      max_tokens: 350,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: 'You are a planning poker assistant. Reply with strict JSON containing: suggestedEstimate (one of 1,2,3,5,8,13), confidence (1-100), includes (array of 3-6 short bullet strings), higherEstimate (one of 2,3,5,8,13), higherEstimateCondition (string without leading "If"), reasoning (short sentence), and similarStories (array of up to 3 objects with name, estimate, accuracy).'
        },
        {
          role: 'user',
          content: `Estimate this user story for planning poker: ${resolvedStoryDescription}. Keep includes practical and implementation-focused.`
        }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const content = response.data?.choices?.[0]?.message?.content || '';
    const aiResponse = safeParseJson(content);

    if (!aiResponse) {
      return res.json({
        insight: {
          ...fallbackInsight,
          reasoning: `${fallbackInsight.reasoning} AI response format was invalid, so fallback logic was used.`
        }
      });
    }

    const rawSimilarStories = Array.isArray(aiResponse.similarStories) ? aiResponse.similarStories : [];
    const normalizedSimilarStories = rawSimilarStories.slice(0, 3).map((story, index) => {
      const accuracy = Number(story?.accuracy);
      return {
        name: typeof story?.name === 'string' && story.name.trim() ? story.name.trim() : `Story ${index + 1}`,
        estimate: String(nearestFibonacciPoint(story?.estimate)),
        accuracy: Number.isFinite(accuracy) ? Math.max(1, Math.min(100, Math.round(accuracy))) : 80
      };
    });

    const confidence = Number(aiResponse.confidence);
    const suggestedEstimate = String(nearestFibonacciPoint(aiResponse.suggestedEstimate));
    const includes = sanitizeStringArray(aiResponse.includes);
    const fallbackEscalation = buildEscalationGuidance(resolvedStoryDescription, suggestedEstimate);
    const parsedHigherEstimate = String(nearestFibonacciPoint(aiResponse.higherEstimate));
    const normalizedHigherEstimate = Number(parsedHigherEstimate) > Number(suggestedEstimate)
      ? parsedHigherEstimate
      : String(nextFibonacciPoint(suggestedEstimate));
    const rawHigherEstimateCondition = typeof aiResponse.higherEstimateCondition === 'string'
      ? aiResponse.higherEstimateCondition.trim().replace(/^if\s+it\s+also\s+includes\s*/i, '')
      : '';
    const higherEstimateCondition = isWeakEscalationCondition(rawHigherEstimateCondition)
      ? fallbackEscalation.higherEstimateCondition
      : rawHigherEstimateCondition;

    res.json({
      insight: {
        suggestedEstimate,
        confidence: Number.isFinite(confidence) ? Math.max(1, Math.min(100, Math.round(confidence))) : fallbackInsight.confidence,
        reasoning: typeof aiResponse.reasoning === 'string' && aiResponse.reasoning.trim()
          ? aiResponse.reasoning.trim()
          : fallbackInsight.reasoning,
        includes: includes.length > 0 ? includes : fallbackInsight.includes,
        higherEstimate: normalizedHigherEstimate,
        higherEstimateCondition,
        similarStories: normalizedSimilarStories
      }
    });
  } catch (error) {
    console.error('Error getting AI insight:', error.response?.data || error.message);

    const room = req.body?.roomId ? rooms.get(req.body.roomId) : null;
    const resolvedStoryDescription = (req.body?.storyDescription || room?.storyDescription || '').trim();

    if (!resolvedStoryDescription) {
      return res.status(500).json({ error: 'Failed to get AI insight' });
    }

    res.json({
      insight: buildFallbackInsight(resolvedStoryDescription, 'Live AI service is unavailable right now.')
    });
  }
});

// Get analytics data
app.get('/api/analytics/:roomId', (req, res) => {
  try {
    const { roomId } = req.params;
    const roomAnalytics = analytics.get(roomId);

    if (!roomAnalytics) {
      return res.status(404).json({ error: 'Analytics not found for this room' });
    }

    // Generate realistic analytics data
    const data = {
      metrics: {
        totalStories: roomAnalytics.totalStories || Math.floor(Math.random() * 50) + 20,
        avgTime: roomAnalytics.avgTime || `${Math.floor(Math.random() * 5) + 2}m ${Math.floor(Math.random() * 60)}s`,
        consensusRate: roomAnalytics.consensusRate || Math.floor(Math.random() * 20) + 75,
        aiAcceptance: roomAnalytics.aiAcceptance || Math.floor(Math.random() * 15) + 80
      },
      accuracyTrend: roomAnalytics.accuracyTrend.length > 0 ? roomAnalytics.accuracyTrend : [
        { sprint: 'Sprint 1', accuracy: 72 },
        { sprint: 'Sprint 2', accuracy: 78 },
        { sprint: 'Sprint 3', accuracy: 85 },
        { sprint: 'Sprint 4', accuracy: 88 },
        { sprint: 'Sprint 5', accuracy: 91 }
      ],
      velocityTrend: roomAnalytics.velocityTrend.length > 0 ? roomAnalytics.velocityTrend : [
        { sprint: 'Sprint 1', planned: 34, completed: 28 },
        { sprint: 'Sprint 2', planned: 38, completed: 35 },
        { sprint: 'Sprint 3', planned: 42, completed: 40 },
        { sprint: 'Sprint 4', planned: 45, completed: 44 },
        { sprint: 'Sprint 5', planned: 48, completed: 46 }
      ]
    };

    res.json({ analytics: data });
  } catch (error) {
    console.error('Error getting analytics:', error);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

// Socket.io real-time events
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // User joins a room
  socket.on('join-room', ({ roomId, userName, userId, role }) => {
    try {
      const room = rooms.get(roomId);
      
      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }

      // Join the socket room
      socket.join(roomId);
      
      // Add user to room members if not already present
      const existingMember = room.members.find(m => m.id === userId);
      if (!existingMember) {
        const member = {
          id: userId,
          name: userName,
          socketId: socket.id,
          status: role === 'observer' ? 'Watching' : 'Thinking',
          online: true,
          role: role || 'reviewer'
        };
        room.members.push(member);
      } else {
        existingMember.socketId = socket.id;
        existingMember.online = true;
        existingMember.status = existingMember.role === 'observer' ? 'Watching' : 'Thinking';
      }

      // Broadcast updated room state to all members
      io.to(roomId).emit('room-updated', {
        members: room.members,
        estimates: room.revealed ? room.estimates : {},
        storyDescription: room.storyDescription
      });

      console.log(`User ${userName} joined room ${roomId}`);

      // Send existing chat history to the joining user
      if (room.messages && room.messages.length > 0) {
        socket.emit('chat-history', room.messages.slice(-100));
      }
    } catch (error) {
      console.error('Error joining room:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  // Set story description
  socket.on('set-story-description', ({ roomId, userId, storyDescription }) => {
    try {
      const room = rooms.get(roomId);
      
      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }

      room.storyDescription = storyDescription.trim();

      // Broadcast story description update to all members
      io.to(roomId).emit('story-description-updated', {
        storyDescription: room.storyDescription
      });

      console.log(`Story description set in room ${roomId}`);
    } catch (error) {
      console.error('Error setting story description:', error);
      socket.emit('error', { message: 'Failed to set story description' });
    }
  });

  // User submits estimate
  socket.on('submit-estimate', ({ roomId, userId, estimate }) => {
    try {
      const room = rooms.get(roomId);
      
      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }

      // Store the estimate
      room.estimates[userId] = estimate;

      // Update member status
      const member = room.members.find(m => m.id === userId);
      if (member) {
        member.status = 'Voted';
      }

      // Broadcast updated state (but don't reveal estimates yet)
      io.to(roomId).emit('estimate-submitted', {
        userId,
        members: room.members,
        estimateCount: Object.keys(room.estimates).length
      });

      console.log(`User ${userId} submitted estimate in room ${roomId}`);
    } catch (error) {
      console.error('Error submitting estimate:', error);
      socket.emit('error', { message: 'Failed to submit estimate' });
    }
  });

  // Chat message
  socket.on('chat-message', ({ roomId, userId, userName, text }) => {
    try {
      const room = rooms.get(roomId);

      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }

      const trimmed = (text || '').trim();
      if (!trimmed) return;

      const message = {
        id: uuidv4(),
        userId,
        userName,
        text: trimmed.slice(0, 500),
        createdAt: new Date().toISOString()
      };

      room.messages = room.messages || [];
      room.messages.push(message);
      // cap history
      if (room.messages.length > 200) {
        room.messages = room.messages.slice(-200);
      }

      io.to(roomId).emit('chat-message', message);
    } catch (error) {
      console.error('Error handling chat message:', error);
      socket.emit('error', { message: 'Failed to send chat message' });
    }
  });

  // Chat history on-demand (in case a client mounts after join broadcast)
  socket.on('chat-history-request', ({ roomId }) => {
    try {
      const room = rooms.get(roomId);
      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }
      const history = room.messages ? room.messages.slice(-100) : [];
      socket.emit('chat-history', history);
    } catch (error) {
      console.error('Error handling chat history request:', error);
    }
  });

  // Reveal all estimates
  socket.on('reveal-estimates', ({ roomId }) => {
    try {
      const room = rooms.get(roomId);
      
      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }

      room.revealed = true;

      // Calculate average (excluding non-numeric votes)
      const numericEstimates = Object.values(room.estimates).map(Number).filter(Number.isFinite);
      const average = numericEstimates.length > 0
        ? (numericEstimates.reduce((a, b) => a + b, 0) / numericEstimates.length).toFixed(1)
        : 0;

      // Check for consensus (all same value)
      const uniqueEstimates = new Set(numericEstimates);
      const consensus = uniqueEstimates.size === 1 && numericEstimates.length > 0;

      // Broadcast revealed estimates to all members
      io.to(roomId).emit('estimates-revealed', {
        estimates: room.estimates,
        members: room.members,
        average,
        consensus,
        totalVotes: Object.keys(room.estimates).length
      });

      // Chat notifications: only revealer + optional consensus note
      const revealer = room.members.find(m => m.socketId === socket.id);
      if (revealer) {
        // 1. Who revealed
        const revealMessage = {
          id: uuidv4(),
          userId: revealer.id,
          userName: revealer.name,
          text: `${revealer.name} revealed the estimates`,
          createdAt: new Date().toISOString()
        };
        room.messages = room.messages || [];
        room.messages.push(revealMessage);
        io.to(roomId).emit('chat-message', revealMessage);

        // 2. Consensus celebration (only if consensus)
        if (consensus) {
          const consensusMessage = {
            id: uuidv4(),
            userId: revealer.id,
            userName: revealer.name,
            text: '🎉 Consensus reached! Great job team!',
            createdAt: new Date().toISOString()
          };
          room.messages.push(consensusMessage);
          io.to(roomId).emit('chat-message', consensusMessage);
        }

        // cap history
        if (room.messages.length > 200) {
          room.messages = room.messages.slice(-200);
        }
      }

      // Update analytics
      const roomAnalytics = analytics.get(roomId);
      if (roomAnalytics) {
        roomAnalytics.totalStories += 1;
        roomAnalytics.consensusCount = (roomAnalytics.consensusCount || 0) + (consensus ? 1 : 0);
        roomAnalytics.voteRounds = (roomAnalytics.voteRounds || 0) + 1;
        roomAnalytics.consensusRate = roomAnalytics.voteRounds > 0
          ? Math.round((roomAnalytics.consensusCount / roomAnalytics.voteRounds) * 100)
          : 0;
      }

      console.log(`Estimates revealed in room ${roomId}`);
    } catch (error) {
      console.error('Error revealing estimates:', error);
      socket.emit('error', { message: 'Failed to reveal estimates' });
    }
  });

  // Reset estimates for new round
  socket.on('reset-estimates', ({ roomId }) => {
    try {
      const room = rooms.get(roomId);
      
      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }

      // Clear estimates and reset states
      room.estimates = {};
      room.revealed = false;
      room.storyDescription = null;
      
      // Reset member statuses
      room.members.forEach(member => {
        if (member.online) {
          member.status = member.role === 'observer' ? 'Watching' : 'Thinking';
        }
      });

      // Broadcast reset to all members
      io.to(roomId).emit('estimates-reset', {
        members: room.members
      });

      console.log(`Estimates reset in room ${roomId}`);
    } catch (error) {
      console.error('Error resetting estimates:', error);
      socket.emit('error', { message: 'Failed to reset estimates' });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    try {
      console.log('Client disconnected:', socket.id);

      // Find and update the user in all rooms
      rooms.forEach((room, roomId) => {
        const member = room.members.find(m => m.socketId === socket.id);
        if (member) {
          member.online = false;
          member.status = 'Offline';
          
          // Broadcast updated members list
          io.to(roomId).emit('room-updated', {
            members: room.members,
            estimates: room.revealed ? room.estimates : {}
          });
        }
      });
    } catch (error) {
      console.error('Error handling disconnect:', error);
    }
  });
});

// Start server
const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;

const startServer = (port) => {
  server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`WebSocket server is ready. Allowed origins: ${FRONTEND_ORIGINS.join(', ')}`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${port} is already in use. Trying another port...`);
      startServer(port + 1);
    } else {
      console.error('Failed to start server:', err);
    }
  });
};

startServer(PORT);
