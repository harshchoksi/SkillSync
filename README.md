# SkillSync — Student Skill Exchange Platform
### A Full-Stack MERN Peer-to-Peer Freelance Marketplace

---

## 📁 Project Structure

```
skillsync/
├── backend/
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   └── cloudinary.js      # Cloudinary + Multer setup
│   ├── controllers/
│   │   ├── authController.js  # Register, Login, GetMe
│   │   ├── userController.js  # Profile CRUD, Admin user mgmt
│   │   ├── serviceController.js # Service CRUD + search/filter
│   │   ├── orderController.js # Order lifecycle management
│   │   ├── reviewController.js # Reviews + rating aggregation
│   │   └── chatController.js  # Chat history & conversations
│   ├── middleware/
│   │   ├── auth.js            # JWT protect + role authorize
│   │   └── error.js           # Global error handler
│   ├── models/
│   │   ├── User.js            # User schema (bcrypt, JWT)
│   │   ├── Service.js         # Gig/service schema
│   │   ├── Order.js           # Order schema
│   │   ├── Review.js          # Review schema + rating aggregation
│   │   └── Message.js         # Chat message schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── serviceRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── reviewRoutes.js
│   │   └── chatRoutes.js
│   ├── .env.example
│   ├── package.json
│   └── server.js              # Express + Socket.io entry point
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── common/
    │   │   │   ├── ProtectedRoute.js
    │   │   │   ├── ServiceCard.js
    │   │   │   ├── StarRating.js
    │   │   │   └── Loading.js
    │   │   └── layout/
    │   │       ├── Navbar.js
    │   │       └── Footer.js
    │   ├── context/
    │   │   ├── AuthContext.js   # Global auth state + JWT
    │   │   └── SocketContext.js # Socket.io connection
    │   ├── pages/
    │   │   ├── HomePage.js
    │   │   ├── LoginPage.js
    │   │   ├── RegisterPage.js
    │   │   ├── ServicesPage.js
    │   │   ├── ServiceDetailPage.js
    │   │   ├── CreateServicePage.js
    │   │   ├── ProfilePage.js
    │   │   ├── DashboardPage.js
    │   │   ├── ChatPage.js
    │   │   ├── AdminPage.js
    │   │   └── NotFoundPage.js
    │   ├── services/
    │   │   └── api.js           # Axios instance + all API calls
    │   ├── App.js
    │   ├── index.js
    │   └── index.css
    ├── .env.example
    ├── package.json
    └── tailwind.config.js
```

---

## ⚙️ Prerequisites

Make sure you have these installed:

- **Node.js** v18+ → https://nodejs.org
- **MongoDB** (local) → https://www.mongodb.com/try/download/community  
  OR use **MongoDB Atlas** (free cloud) → https://www.mongodb.com/atlas
- **Cloudinary account** (free tier) → https://cloudinary.com

---

## 🚀 Step-by-Step Setup

### Step 1 — Clone / Download the project

```bash
# If using git
git clone <your-repo-url>
cd skillsync
```

---

### Step 2 — Set up the Backend

```bash
cd backend
npm install
```

Create the `.env` file:

```bash
cp .env.example .env
```

Open `backend/.env` and fill in:

```env
PORT=5000
NODE_ENV=development

# Option A: Local MongoDB
MONGO_URI=mongodb://localhost:27017/skillsync

# Option B: MongoDB Atlas (replace with your connection string)
# MONGO_URI=mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net/skillsync

JWT_SECRET=mysupersecretkey_changethis_inproduction
JWT_EXPIRE=30d

# From your Cloudinary Dashboard → Settings → API Keys
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

FRONTEND_URL=http://localhost:3000
```

#### Getting Cloudinary Credentials:
1. Sign up at https://cloudinary.com (free)
2. Go to Dashboard → API Keys
3. Copy Cloud Name, API Key, and API Secret into `.env`

Start the backend:

```bash
# Development (with auto-reload)
npm run dev

# OR Production
npm start
```

✅ You should see:
```
✅ MongoDB Connected: localhost
🚀 SkillSync server running on port 5000 in development mode
📡 API: http://localhost:5000/api
```

---

### Step 3 — Set up the Frontend

Open a **new terminal**:

```bash
cd frontend
npm install
```

Create the `.env` file:

```bash
cp .env.example .env
```

`frontend/.env` should contain:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

Start the frontend:

```bash
npm start
```

✅ React app opens at **http://localhost:3000**

---

### Step 4 — Create an Admin Account (Optional)

After registering a normal account, update the role in MongoDB:

**Using MongoDB Compass:**
1. Open Compass → connect to your DB
2. Open `skillsync` → `users` collection
3. Find your user → Edit → change `role` to `"admin"`

**Using MongoDB Shell:**
```bash
mongosh
use skillsync
db.users.updateOne({ email: "your@email.com" }, { $set: { role: "admin" } })
```

---

## 🌐 API Endpoints Reference

### Authentication
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register user |
| POST | `/api/auth/login` | Public | Login, get JWT |
| GET | `/api/auth/me` | Private | Get current user |

### Users
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/users/:id` | Public | Get user profile |
| PUT | `/api/users/profile` | Private | Update own profile |
| PUT | `/api/users/password` | Private | Change password |
| GET | `/api/users` | Admin | Get all users |
| DELETE | `/api/users/:id` | Admin | Delete a user |

### Services
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/services` | Public | List all (search/filter) |
| GET | `/api/services/:id` | Public | Get one service |
| GET | `/api/services/categories` | Public | Get all categories |
| GET | `/api/services/seller/my-services` | Seller | My services |
| POST | `/api/services` | Seller | Create service |
| PUT | `/api/services/:id` | Owner/Admin | Update service |
| DELETE | `/api/services/:id` | Owner/Admin | Delete service |

### Orders
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/orders` | Private | Place an order |
| GET | `/api/orders` | Private | Get my orders |
| GET | `/api/orders/:id` | Private | Single order |
| PUT | `/api/orders/:id/status` | Private | Update status |
| GET | `/api/orders/admin/all` | Admin | All orders |

### Reviews
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/reviews` | Private | Submit review |
| GET | `/api/reviews/service/:id` | Public | Service reviews |
| GET | `/api/reviews/seller/:id` | Public | Seller reviews |

### Chat
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/chat/conversations` | Private | My conversations |
| GET | `/api/chat/:userId` | Private | Chat history |
| POST | `/api/chat/message` | Private | Send message |

---

## 🔌 Socket.io Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `user_online` | Client → Server | Register user socket |
| `join_room` | Client → Server | Join a chat room |
| `send_message` | Client → Server | Send a message |
| `receive_message` | Server → Client | Incoming message |
| `typing` | Client → Server | Typing indicator |
| `stop_typing` | Client → Server | Stop typing |
| `user_typing` | Server → Client | Show typing bubble |
| `online_users` | Server → Client | Online users list |

---

## 🧑‍💻 User Roles & Features

### Buyer
- Browse and search services
- Place orders
- Track order status
- Chat with seller
- Leave reviews on completed orders

### Seller
- All Buyer features
- Create/edit/delete services
- Accept, start, and complete orders
- View earnings in dashboard

### Admin
- All Seller features
- View all users
- Delete users
- View all orders

---

## 🎨 Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Tailwind CSS |
| State | React Context API + Hooks |
| HTTP Client | Axios (with interceptors) |
| Real-time | Socket.io-client |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| File Upload | Multer + Cloudinary |
| Real-time | Socket.io |

---

## 🐛 Common Issues & Fixes

**MongoDB connection fails:**
- Make sure MongoDB service is running: `sudo service mongod start` (Linux) or start from MongoDB Compass
- For Atlas: whitelist your IP address in Atlas → Network Access

**Cloudinary upload fails:**
- Double-check all 3 Cloudinary values in `.env`
- Make sure the Cloudinary account is active

**CORS errors:**
- Make sure `FRONTEND_URL=http://localhost:3000` is set in backend `.env`
- Restart the backend after changing `.env`

**"Not authorized, no token provided":**
- Log out and log back in to get a fresh token
- Check browser localStorage for `skillsync_token`

**Socket.io not connecting:**
- Check `REACT_APP_SOCKET_URL` in frontend `.env`
- Ensure backend is running on the correct port

---

## 📝 .gitignore

Add to both `backend/` and `frontend/`:

```
node_modules/
.env
build/
dist/
```

---

## 📦 Production Build

```bash
# Build frontend
cd frontend
npm run build

# Serve from backend (add this to server.js):
# app.use(express.static(path.join(__dirname, '../frontend/build')));
# app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../frontend/build/index.html')));
```

---

**Built with ❤️ for students, by students.**  
*SkillSync — Trade Skills, Build Careers*
