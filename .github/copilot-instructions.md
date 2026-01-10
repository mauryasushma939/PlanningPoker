# Copilot instructions for Planning Poker (repo-specific)

Purpose: Help AI coding agents be immediately productive working on this codebase.

- **Big picture**: This repo has a React frontend in `frontend/` and an Express + Socket.io backend in `backend/`.
  - Real-time collaboration is implemented with Socket.io events in `backend/server.js` and consumed in `frontend/src/contexts/SocketContext.js` and `frontend/src/components/PlanningPokerBoard.js`.
  - Room and analytics state is stored in-memory (`Map` instances in `backend/server.js`) — there is no persistence layer.

- **Run & dev commands** (use these exact commands):
  - Backend (dev): `cd backend && npm install && npm run dev` (uses `nodemon`)
  - Backend (prod/simple): `cd backend && npm start`
  - Frontend: `cd frontend && npm install && npm start`
  - Frontend build: `cd frontend && npm run build`

- **Important environment variables / ports**:
  - Backend `PORT` (default `5000`) — set in environment to change server port.
  - Backend CORS origin: `SOCKET_CORS_ORIGIN` (used in `backend/server.js`).
  - Frontend socket URL: `REACT_APP_SOCKET_URL` (used in `frontend/src/contexts/SocketContext.js`).
    - NOTE: default in `SocketContext.js` is `http://localhost:5001` but the backend listens on `5000` by default — ensure `REACT_APP_SOCKET_URL` matches backend `PORT`.

- **Socket / REST contract (do not change event names lightly)**:
  - Socket events the client emits: `join-room`, `submit-estimate`, `reveal-estimates`, `reset-estimates`, `chat-message`, `chat-history-request`.
  - Socket events server emits: `room-updated`, `estimate-submitted`, `estimates-revealed`, `estimates-reset`, `chat-history`, `chat-message`, `error`.
  - REST endpoints: `POST /api/rooms` (create room), `GET /api/rooms/:roomId`, `POST /api/ai-insight`, `GET /api/analytics/:roomId`, `GET /api/health`.
  - Example payload (join): `{ roomId, userName, userId }` — see `PlanningPokerBoard` usage.

- **Project-specific patterns & conventions**:
  - Socket-driven UI updates: the frontend subscribes to server events inside `useEffect` in `PlanningPokerBoard` and relies on server to broadcast authoritative room state.
  - Keep server-side state authoritative: modify `rooms`/`analytics` in `backend/server.js` rather than trying to derive it on the client.
  - No DB present: any change that implies persistence should also add a persistence layer (DB + migrations) and update `backend/server.js` accordingly.
  - UI toggles of AI/Analytics are in `PlanningPokerBoard` — new side-panels should follow `showAIPanel` / `showAnalytics` patterns.

- **Where to look for related code** (quick links):
  - Room logic & socket handlers: `backend/server.js`
  - Socket wrapper & env config: `frontend/src/contexts/SocketContext.js`
  - Main board & event handling: `frontend/src/components/PlanningPokerBoard.js`
  - Entry points: `frontend/src/App.js`, `frontend/src/index.js`
  - AI panel / analytics / chat components: `frontend/src/components/AIInsightPanel.js`, `AnalyticsDashboard.js`, `ChatPanel.js`

- **When changing socket/REST contracts**:
  - Update server handlers in `backend/server.js`, then update all `socket.on` listeners in frontend components (search for the event name).
  - Add API changes to README's API section and update any front-end calls (e.g., `axios` usages in AI panel).

- **Testing / debugging tips specific to this repo**:
  - Use `npm run dev` in `backend/` to enable automatic restart on server changes.
  - If the frontend does not show connection, confirm `REACT_APP_SOCKET_URL` matches the backend `PORT` and CORS origin.
  - Inspect socket traffic in browser devtools (Network → WS) or add `console.log` in `SocketContext` connect handlers.

- **Safe editing guidance for AI agents**:
  - Preserve socket event names and REST routes unless updating both server and all client usages.
  - Avoid adding persistent assumptions (DB code) without updating README and tests; call out persistence work as a separate PR.
  - Keep UI state mutations confined to React components/hooks (follow `useState` / `useEffect` patterns already present).

If anything here is unclear or you want more detail (CI, preferred linting/formatting, persistency plan), tell me which area to expand and I will iterate.
