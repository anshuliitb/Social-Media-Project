# 📱 Social Media Backend REST API

Fully featured **Social Media Backend REST API** built with **Node.js**, **Express.js**, and **MongoDB**. Implements robust authentication, post/comment/like systems, friend requests, OTP-based password reset, file uploads, and real-world deployment using **AWS EC2**, **Nginx** reverse proxy, and **Let's Encrypt SSL**.

**🌐 Live API:** 👉 https://www.anshulsocialmedia.xyz

---

## 🌟 Key Features

- 🔐 **User Registration & Authentication**: User signup with avatar upload, login, logout, and logout from all devices (JWT authentication with TTL-based storage)
- 🖼️ **Avatar and Post Image Upload**: Users can upload a profile picture during signup and attach images to posts (handled via Multer).
- 📝 **Post Management (CRUD)**: Create, update, and delete posts with automatic file cleanup
- 💬 **Comment System**: Add, edit, or delete comments; only the commenter or the post owner can delete
- ❤️ **Like Functionality**: Like/unlike both posts and comments; view like count and details
- 🤝 **Friendship Management**: Send/accept/reject friend requests; toggle friendships; retrieve friends and pending requests
- 🔁 **Password Reset via OTP**: Secure OTP-based password reset via email, including OTP generation, verification, and expiry handling
- 🛠️ **Custom Middleware**: JWT authentication, file upload handling, and centralized error management
- 🧩 **Modular Architecture**: Follows MVC and repository pattern using ES6 modules for clean, scalable code
- ☁️ **Deployment**: Fully deployed on AWS EC2 (Ubuntu) with Nginx reverse proxy and HTTPS via Certbot (Let's Encrypt)

---

## 📂 Project Structure

```bash
src/
├── config/
│   └── mongoose.js                       # MongoDB connection
├── errorHandlers/
│   ├── customErrorClass.js               # Custom Error class
│   └── appErrorHandler.middleware.js     # Error handling middleware
├── middlewares/
│   ├── jwtAuth.middleware.js             # JWT auth token verifier
│   └── fileUpload.middleware.js          # Multer upload handlers
├── utils/
│   └── users.passwordHashing.js          # bcrypt hash/verify logic
├── features/
│   ├── users/
│   │   ├── users.model.js
│   │   ├── users.repository.js           # DB logic for users, token, friends
│   │   ├── users.controller.js           # Signup/login/logout/profile logic
│   │   ├── users.routes.js               # Auth + profile routes
│   │   └── users.token.model.js          # Token model (TTL-based)
│   ├── posts/
│   │   ├── posts.model.js
│   │   ├── posts.repository.js
│   │   ├── posts.controller.js
│   │   └── posts.routes.js
│   ├── comments/
│   │   ├── comments.model.js
│   │   ├── comments.repository.js
│   │   ├── comments.controller.js
│   │   └── comments.routes.js
│   ├── likes/
│   │   ├── likes.model.js
│   │   ├── likes.repository.js
│   │   ├── likes.controller.js
│   │   └── likes.routes.js
│   ├── friendship/
│   │   ├── friendship.model.js
│   │   ├── friendship.repository.js
│   │   ├── friendship.controller.js
│   │   └── friendship.routes.js
│   └── otp/
│       ├── otp.repository.js
│       ├── otp.controller.js
│       ├── utils/otpGenerator.util.js    # OTP generator via node-cache
│       └── utils/otpMailer.util.js       # Sends OTP via Nodemailer
├── app.js                                # Express setup, route binding, error handling
├── index.js                              # Entry point: connects DB & starts server
├── .env                                  # Environment variables (API keys, DB, JWT)
└── uploads/
    ├── userAvatars/                      # Avatar uploads
    └── postImages/                       # Post image uploads
```

---

## 🧩 Detailed Route Summary

### 1. **User Routes** (`/api/users`)

| Method | Path                      | Auth | Description                               |
| ------ | ------------------------- | ---- | ----------------------------------------- |
| POST   | `/signup`                 | ❌   | Register new user with `avatarImage`      |
| POST   | `/signin`                 | ❌   | Login, returns JWT token                  |
| POST   | `/logout`                 | ✅   | Logout current session (remove one token) |
| POST   | `/logout-all-devices`     | ✅   | Invalidate all tokens for user            |
| GET    | `/get-details/:userId`    | ✅   | Get user info + like/friend stats         |
| GET    | `/get-all-details`        | ✅   | List all users                            |
| PUT    | `/update-details/:userId` | ✅   | Update name, gender, avatar, password     |

**Imports & Logic**:

- `hashingPassword()` for secure hash
- `CustomError` for controlled errors
- File deletion logic on avatar save failures
- JWT creation + `TokenModel.create()` with TTL

### 2. **Post Routes** (`/api/posts`)

| Method | Path            | Auth | Description                               |
| ------ | --------------- | ---- | ----------------------------------------- |
| POST   | `/`             | ✅   | Create post with `postImage`, title, body |
| GET    | `/all`          | ✅   | Get all posts (populates user)            |
| GET    | `/:postId`      | ✅   | Get post + comment/like counts            |
| PUT    | `/:postId`      | ✅   | Update own post                           |
| DELETE | `/:postId`      | ✅   | Delete own post + image file              |
| GET    | `/user/:userId` | ✅   | Fetch all posts by one user               |

**Imports & Logic**:

- `fs.promises.unlink()` to clean images on failure
- `mongoose.Types.ObjectId.isValid()`
- Counts via `LikeModel.countDocuments()` and `CommentsModel.countDocuments()`

### 3. **Comment Routes** (`/api/comments`)

| Method | Path          | Auth | Description                          |
| ------ | ------------- | ---- | ------------------------------------ |
| POST   | `/:postId`    | ✅   | Add comment to post                  |
| GET    | `/:postId`    | ✅   | Fetch all comments with like counts  |
| PUT    | `/:commentId` | ✅   | Update comment (owner or post owner) |
| DELETE | `/:commentId` | ✅   | Delete comment (owner or post owner) |

**Imports & Logic**:

- Uses `CommentsRepository` with `.populate("userId", "name email")`
- Validates ownership of comment/post before updates

### 4. **Like Routes** (`/api/likes`)

| Method | Path                               | Auth | Description                     |
| ------ | ---------------------------------- | ---- | ------------------------------- |
| POST   | `/toggle/:id?type=Post \| Comment` | ✅   | Toggle like/unlike              |
| GET    | `/:id`                             | ✅   | Fetch all likes on post/comment |

**Imports & Logic**:

- Ensures `type` query param is either `Post` or `Comment`
- Duplicate like check using `LikesRepository.findLike`
- Returns populated like via `.populate("userId", "name email")`

### 5. **Friendship Routes** (`/api/friends`)

| Method | Path                             | Auth | Description                                     |
| ------ | -------------------------------- | ---- | ----------------------------------------------- |
| POST   | `/toggle-friendship/:friendId`   | ✅   | Send or cancel request                          |
| POST   | `/response-to-request/:friendId` | ✅   | Accept or reject with `action=accept \| reject` |
| GET    | `/get-friends/:userId`           | ✅   | List accepted friends                           |
| GET    | `/get-pending-requests`          | ✅   | List incoming pending requests                  |

**Imports & Logic**:

- `FriendshipRepository` handles DB calls:
  - `getExistingFriendship`, `createFriendRequest`, `deleteFriendship`
  - `updateFriendRequestStatus(...)` based on `action`

### 6. **OTP Routes** (`/api/otp`)

| Method | Path              | Auth | Description                 |
| ------ | ----------------- | ---- | --------------------------- |
| POST   | `/send`           | ❌   | Send email OTP for reset    |
| POST   | `/verify`         | ❌   | Check OTP validity          |
| POST   | `/reset-password` | ❌   | OTP + new password → update |

**Imports & Logic**:

- OTP generation via `otp-generator`, stored in memory with **NodeCache (TTL 5m)**
- Mailer using **Nodemailer** with Gmail credentials
- On OTP verify → hash new password & update using `OtpRepository`

---

## 🛡️ Middlewares

- **jwtAuth.middleware.js**: Validates JWT & existence in `TokenModel`
- **fileUpload.middleware.js**: Multer diskStorage for avatars & posts
- **appErrorHandler.middleware.js**: Centralized express error handler
- **CustomError**: Structured control flow for known errors

---

## 🧠 Utilities

- **users.passwordHashing.js**: `hashingPassword()` and `verifyHashedPassword()` using bcrypt (saltRounds=12)
- **otpGenerator/util.js**: OTP gen + `node-cache` store and verify (TTL 300s)
- **otpMailer.util.js**: Sends OTP email via `nodemailer`

---

## 🚀 AWS Deployment

1. **Ubuntu EC2**: Instance running Node.js backend
2. **Nginx**: Reverse proxy redirects `80 → 4000`
3. **Certbot / Let’s Encrypt**:

```bash
   sudo certbot --nginx -d anshulsocialmedia.xyz -d www.anshulsocialmedia.xyz
```

PM2: Keeps app running continuously

HTTPS Live: 🎉 https://www.anshulsocialmedia.xyz

---

## 🧠 Process Management: PM2

This project uses [PM2](https://pm2.keymetrics.io/) to keep the Node.js application running continuously in the background, even after crashes or restarts.

### PM2 Commands:

```bash
pm2 start server.js           # Start the server
pm2 restart server            # Restart the server
pm2 stop server               # Stop the server
pm2 delete server             # Delete the server process
pm2 list                      # List all PM2 processes
pm2 logs                      # Show logs
```

---

## 🌐 HTTPS Live Deployment

🎉 Live App: https://www.anshulsocialmedia.xyz

Hosted on AWS EC2 (Ubuntu) using:

Nginx (as reverse proxy)

PM2 (for Node.js process management)

Let's Encrypt Certbot (for free HTTPS SSL certificate)

All requests to HTTP are automatically redirected to HTTPS.

---

## 🔧 Setup Guide

1. Clone the Repository & Install Dependencies

```bash
git clone https://github.com/anshuliitb/Social-Media-Project.git
cd Social-Media-Project
npm install
```

2. Environment Variables
   Create a .env file at the root:

```bash
PORT=3000
MONGO_URL=your_mongo_connection_string
JWT_SECRET=your_jwt_secret
EMAIL=your_email@gmail.com
EMAIL_PASSWORD=your_email_app_password
```

3. Start the App (Locally or via PM2)

```bash
npm start # or node index.js
```

On AWS, use pm2 and configure nginx + certbot (Let’s Encrypt) for production-ready deployment.

---

## 🚧 Testing & API Documentation

🔍 **Postman Collection**:  
A complete Postman collection is available to test all REST API endpoints of this project.

👉 [Click here to open in Postman](https://www.postman.com/supply-astronaut-3411330/social-media-project/collection/qsf14w4/anshul-s-social-media-project?action=share&creator=38256946)

You can import or fork this collection into your Postman workspace to:

- Register, authenticate, and update user details
- Upload avatars and post images
- Create, read, update, and delete posts and comments
- Like posts and comments
- Manage friend requests (accept, reject, or leave them pending)
- Reset passwords via OTP
- And more...

📌 **Note**: Fork this collection to your own workspace and proceed to test the application.  
Refer to the `README.md` sections above for authentication instructions and required headers before testing protected routes.

---

## 📐 Future Enhancements

✅ Features planned for future iterations:

- Swagger annotations on every route

- Role-based access control (Admin vs User)

- Rate limiting & request sanitization

- Pagination & sorting for posts/comments

- Frontend integration using React or Next.js

---

## 👨‍💻 Author

Anshul Mahor

🔗 GitHub: https://www.github.com/anshuliitb

---

## 📝 License

Licensed under the **MIT License** © 2025 Anshul Mahor

---
