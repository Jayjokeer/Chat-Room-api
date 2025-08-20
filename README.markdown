# Chat Room API

A real-time chat application backend built with Node.js, Express, Socket.IO, TypeScript, Sequelize, and MySQL, with Knex.js for database migrations. This API supports user authentication, chat room creation and management, real-time messaging, user presence tracking, and rate limiting for secure and efficient communication. The application is hosted at [https://chat-room-apif.onrender.com](https://chat-room-apif.onrender.com).

## Table of Contents
- [Features](#features)
- [Technologies](#technologies)
- [Project Structure](#project-structure)
- [Setup](#setup)
  - [Local Development](#local-development)
  - [Production](#production)
- [API Endpoints](#api-endpoints)
- [Socket.IO Events](#socketio-events)
- [Testing](#testing)
  - [Postman Collection](#postman-collection)
  - [Client-Side Testing](#client-side-testing)
- [Contributing](#contributing)
- [License](#license)

## Features
- **User Authentication**: Register and login with JWT-based authentication.
- **Chat Rooms**: Create and join public or private rooms (private rooms require an invite code).
- **Real-Time Messaging**: Send and receive messages instantly using Socket.IO.
- **User Presence Tracking**: Monitor online/offline status with last seen timestamps.
- **Rate Limiting**: Limit message sending to 5 messages per 10 seconds (HTTP and Socket.IO).
- **Security**: JWT token verification, input validation, and CORS configuration.
- **Database**: Persistent storage with MySQL (Clever Cloud), using Sequelize for ORM.

## Technologies
- **Node.js**: Server-side JavaScript runtime.
- **Express**: Web framework for API routes.
- **Socket.IO**: Real-time bidirectional communication.
- **TypeScript**: Type-safe JavaScript superset.
- **Sequelize**: ORM for MySQL database interactions.
- **MySQL**: Relational database for data persistence (hosted on Clever Cloud).
- **JWT**: JSON Web Tokens for authentication.
- **Bcrypt**: Password hashing for secure storage.
- **Express Rate Limit**: Rate limiting for HTTP requests.

## Project Structure
```
Chat-Room-api/
├── src/
│   ├── config/
│   │   └── database.ts          # Sequelize database configuration
│   ├── controller/
│   │   ├── auth.controller.ts    # Authentication routes logic
│   │   └── room.controller.ts    # Chat room routes logic
│   ├── model/
│   │   ├── User.ts              # User model
│   │   ├── Room.ts              # Room model
│   │   ├── RoomMember.ts        # RoomMember model
│   │   ├── Message.ts           # Message model
│   │   └── index.ts             # Model associations
│   ├── service/
│   │   ├── auth.service.ts       # Authentication business logic
│   │   ├── room.service.ts       # Room management business logic
│   │   └── message.service.ts     # message business logic
│   │   └── roomMember.service.ts     #room member business logic
│   ├── middleware/
│   │   ├── authorization.ts    # JWT authentication middleware
│   │   └── rate-limiter.ts       # Rate limiting middleware
│   │   └── validation.ts       # Validation middleware
│   ├── routes/
│   │   ├── auth.routes.ts        # Authentication routes
│   │   └── room.routes.ts        # Room routes
│   │   └── index.routes.ts        # Index routes
│   ├── errors/
│   │   ├── error.ts             # Custom AppError class
│   │   └── error-handler.ts     # Global error handler
│   └── app.ts                # Main application entry point
│   └── socket.ts                # socket.io 
├── .env                         # Environment variables
├── package.json                 # Project dependencies and scripts
├── tsconfig.json                # TypeScript configuration
└── README.md                    # Project documentation
```

## Setup

### Local Development
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Jayjokeer/Chat-Room-api.git
   cd Chat-Room-api
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory with the following:
   ```env
   NODE_ENV=development
   PORT=4000
   DB_HOST=br3czu7auorvqxdsgu9t-mysql.services.clever-cloud.com
   DB_NAME=br3czu7auorvqxdsgu9t
   DB_USER=unj47mj0vxznwvek
   DB_PORT=3306
   DB_PASS=JKMPffsbHyEkSqh0gMeI
   DB_URI=mysql://unj47mj0vxznwvek:JKMPffsbHyEkSqh0gMeI@br3czu7auorvqxdsgu9t-mysql.services.clever-cloud.com:3306/br3czu7auorvqxdsgu9t
   JWT_SECRET=super-secret-long-random-string
   CORS_ORIGIN=http://localhost:4000
   ```
   **Security Note**: Replace `DB_PASS` and `JWT_SECRET` with secure values for your local setup. For production, set these in your hosting platform (e.g., Render) and avoid committing `.env` to version control.

4. **Set Up MySQL**:
   - The database is hosted on Clever Cloud. Ensure credentials match `.env` or use a local MySQL instance for development.
   - For local MySQL, create a database named `chat_app` and update `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`, and `DB_URI` accordingly.


5. **Run the Application**:
   ```bash
   npm run dev
   ```
   Starts the server in development mode with `nodemon` and `ts-node`, listening on `PORT` (default: 4000).

### Production
The application is deployed at [https://chat-room-apif.onrender.com](https://chat-room-apif.onrender.com). For your own deployment:
1. **Build**:
   ```bash
   npm run build
   ```
   Compiles TypeScript to JavaScript in the `dist/` folder.

2. **Start**:
   ```bash
   npm start
   ```
   Runs the compiled JavaScript with a 4GB memory limit (`--max-old-space-size=4024`).


3. **Environment Variables**:
   - Set the provided `.env` variables in your hosting platform (e.g., Render’s environment settings).
   - Use the Clever Cloud MySQL `DB_URI` for database connections.
   - Update `CORS_ORIGIN` to your production frontend URL (e.g., `https://your-frontend.com`).

4. **Database**: Use Clever Cloud’s managed MySQL (`DB_URI`) for production.
5. **Security**: Ensure `JWT_SECRET` is a secure, unique string and avoid exposing `DB_PASS`.

## API Endpoints

### Authentication
- **POST /api/v1/auth/sign-up**
  - **Body**: `{ "displayName": string, "password": string , "email": string}`
  - **Response**: `{ message: "User registered successfully" }` (201)
  - Registers a new user with hashed password.

- **POST /api/v1/auth/login**
  - **Body**: `{ "email": string, "password": string }`
  - **Response**: `{ token: string }` (200)
  - Authenticates a user and returns a JWT token.

### Rooms
- **POST /api/v1/rooms/create-room** (Authenticated)
  - **Headers**: `Authorization: Bearer <token>`
  - **Body**: `{ "name": string, "is_private": boolean }`
  - **Response**: `{ roomId: number, invite_code: string | null }` (201)
  - Creates a public or private room (private rooms generate an `invite_code`).

- **POST /api/v1/rooms/join-room** (Authenticated)
  - **Headers**: `Authorization: Bearer <token>`
  - **Body**: `{ "roomId": number, "invite_code": string | null }`
  - **Response**: `{ message: "Joined room successfully" }` (200)
  - Joins a user to a room (validates `invite_code` for private rooms).

- **GET /api/v1/rooms/user-rooms** (Authenticated)
  - **Headers**: `Authorization: Bearer <token>`
  - **Response**: `[{ id: number, name: string, is_private: boolean, invite_code: string | null, createdAt: string }]` (200)
  - Lists all rooms the authenticated user is a member of.

## Socket.IO Events

### Connection
- **Connect**: `io.connect("https://chat-room-apif.onrender.com", { auth: { token: JWT_TOKEN } })`
  - Authenticates using a JWT token (from `/api/v1/auth/login`) to derive `userId`.
  - Emits `user_status` (`{ userId: number, status: "online" }`) to all clients.

### Events
- **join_room**:
  - **Payload**: `{ roomId: number, invite_code?: string }`
  - **Emits**:
    - `load_messages`: `[{ id: number, roomId: number, userId: number, content: string, user: { id: number, displayName: string }, createdAt: string }]` (last 50 messages).
    - `load_members`: `[{ id: number, displayName: string }]` (room members).
    - `user_status`: `{ userId: number, status: "online" }` (to room members).
  - Joins a room, validating membership and `invite_code` for private rooms.

- **send_message**:
  - **Payload**: `{ roomId: number, content: string }`
  - **Emits**: `receive_message`: `{ id: number, roomId: number, userId: number, content: string, user: { id: number, displayName: string }, createdAt: string }` (to room).
  - Sends a message, with rate limiting (5 messages per 10 seconds).

- **typing**:
  - **Payload**: `{ roomId: number }`
  - **Emits**: `typing`: `{ userId: number }` (to other room members).
  - Broadcasts typing status.

- **disconnect**:
  - **Emits**: `user_status`: `{ userId: number, status: "offline" }` (to all rooms the user was in).
  - Updates user’s `isOnline` and `lastSeen` status.

- **error**:
  - **Emits**: `{ message: string }`
  - Sent for errors (e.g., invalid token, empty message, rate limit exceeded).

## Testing

### Postman Collection
Test the API and Socket.IO endpoints using the Postman collection:  
[Chat Room API Postman Collection](https://www.postman.com/technical-operator-65307819/workspace/chat-workspace/collection/27781003-0c57b896-1e70-4584-b735-1aea2f044f21?action=share&source=copy-link&creator=27781003)

## Contributing
1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature`.
3. Commit changes: `git commit -m "Add your feature"`.
4. Push to the branch: `git push origin feature/your-feature`.
5. Open a pull request.

## License
This project is licensed under the MIT License.