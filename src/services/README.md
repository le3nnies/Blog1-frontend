# InsightPress - Advanced Blogging & Analytics Platform

![Analytics Dashboard Screenshot](https://via.placeholder.com/1200x600.png?text=InsightPress+Analytics+Dashboard)

**InsightPress** is a modern, full-stack blogging platform designed for content creators who are serious about data. It combines a sleek and performant frontend with a powerful backend, offering an in-depth analytics suite, an advertising management system, and AI-powered insights to drive content strategy.

## ✨ Key Features

### Admin & Content Management
- **Secure Admin Dashboard**: Central hub for managing all site content and settings.
- **Rich Article Editor**: Create, edit, and publish articles with a modern interface.
- **Content Management**: Full CRUD (Create, Read, Update, Delete) functionality for articles.
- **Trending Content Control**: Manually toggle articles as "trending" to boost their visibility.

### 🚀 Advanced Analytics
- **Real-time Dashboard**: Live metrics banner showing active users, current views, and top pages, updated every 30 seconds.
- **Comprehensive Analytics Suite**:
  - **Traffic Overview**: Visualize views, visitors, and engagement over custom date ranges.
  - **Audience Insights**: Understand user demographics, geographic distribution, and new vs. returning visitors.
  - **Content Performance**: Track top-performing articles and categories.
  - **Engagement Metrics**: Monitor likes, comments, shares, and user behavior funnels.
- **Interactive Charts**: Rich data visualizations powered by Recharts, including area, line, bar, pie, and radar charts.
- **Data Export**: Download analytics reports in CSV, Excel, and PDF formats.

### 🤖 AI & Monetization
- **AI-Powered Insights**: Integrates with **OpenAI** and **Google Gemini** to generate automated analytics summaries, insights, and strategic recommendations.
- **Advertising System**: Built-in service for managing and displaying ad campaigns in various positions (sidebar, inline, header).
- **Stripe Integration**: Securely process payments for advertising campaigns or other services.

### 🔐 Security & Architecture
- **JWT Authentication**: Secure authentication flow with JSON Web Tokens, including token refresh logic.
- **Role-Based Access Control**: Protected routes and middleware ensure only authorized admins can access sensitive data and management features.
- **Full-Stack TypeScript**: Type safety across both the frontend and backend for improved reliability and maintainability.

## 🛠️ Tech Stack

| Area         | Technologies                                                              |
|--------------|---------------------------------------------------------------------------|
| **Frontend** | React, TypeScript, Vite, Tailwind CSS, shadcn/ui, Recharts, Axios, date-fns |
| **Backend**  | Node.js, Express.js, MongoDB, Mongoose, JWT, date-fns                     |
| **Services** | Stripe (Payments), OpenAI (AI Reports), Google Gemini (AI Reports)        |

## 📂 Project Structure

The project is organized into two main directories:

```
/
├── backend/      # Node.js & Express API
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   └── routes/
└── frontend/     # React & Vite client application
    ├── public/
    └── src/
        ├── components/
        ├── hooks/
        ├── pages/
        └── services/
```

## 🚀 Getting Started

Follow these instructions to get the project running on your local machine.

### Prerequisites

- Node.js (v18.x or later)
- npm or yarn
- MongoDB (local instance or a cloud service like MongoDB Atlas)

### 1. Backend Setup

```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Create a .env file in the backend directory and add the following variables:
touch .env
```

**`backend/.env`**
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=1d
```

```bash
# Start the backend server
npm run dev
```
The backend API will be running at `http://localhost:5000`.

### 2. Frontend Setup

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Create a .env file in the frontend directory and add the following variables:
touch .env
```

**`frontend/.env`**
```env
VITE_API_URL=http://localhost:5000
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_GEMINI_API_KEY=your_google_gemini_api_key
```

```bash
# Start the frontend development server
npm run dev
```
The frontend application will be accessible at `http://localhost:5173` (or another port if 5173 is in use).

## 🌐 API Endpoints

The backend exposes several RESTful API endpoints. All admin-related endpoints are protected.

- **Authentication**: `/api/auth/` (login, register)
- **Articles**: `/api/articles/` (CRUD, trending, related)
- **Analytics**: `/api/analytics/` (main analytics, real-time, reports)
- **Ads**: `/api/ads/` (campaigns, creatives, tracking)
- **Stripe**: `/api/ads/stripe/` (payment intents, webhooks)

## 🤝 Contributing

Contributions are welcome! If you have suggestions for improvements or want to fix a bug, please feel free to:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/YourFeature`).
3.  Make your changes.
4.  Commit your changes (`git commit -m 'Add some feature'`).
5.  Push to the branch (`git push origin feature/YourFeature`).
6.  Open a Pull Request.

## 📄 License

This project is licensed under the Apache License 2.0. See the LICENSE.txt file for details.