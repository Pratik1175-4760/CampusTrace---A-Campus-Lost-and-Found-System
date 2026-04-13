# PICT Campus Lost & Found Portal

A full-stack web application for Pune Institute of Computer Technology (PICT) to manage lost and found items on campus, with AI-powered image analysis and smart search via Google Gemini 2.0 Flash.

---

## 📁 Project Structure

```
campus-lnf/
├── backend/                  # Node.js + Express API
│   ├── config/
│   │   ├── db.js             # MongoDB Atlas connection
│   │   └── cloudinary.js     # Cloudinary + Multer config
│   ├── controllers/
│   │   ├── item.controller.js
│   │   ├── admin.controller.js
│   │   └── ai.controller.js  # Gemini AI
│   ├── middleware/
│   │   ├── auth.middleware.js # JWT
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── LostItem.model.js
│   │   └── TransactionLog.model.js
│   ├── routes/
│   │   ├── item.routes.js
│   │   ├── admin.routes.js
│   │   └── ai.routes.js
│   ├── server.js
│   ├── .env                  # ← your real credentials
│   └── package.json
│
└── frontend/                 # Vite + React + Tailwind v4
    ├── src/
    │   ├── components/
    │   │   ├── common/       # Navbar, Modal, Skeleton, StatusBadge
    │   │   ├── finder/       # ItemCard, ItemDetailModal, ReportForm,
    │   │   │                 #   CollectForm, FilterBar
    │   │   └── admin/        # AdminLayout
    │   ├── pages/
    │   │   ├── HomePage.jsx
    │   │   ├── AdminLoginPage.jsx
    │   │   ├── AdminDashboardPage.jsx
    │   │   ├── AdminItemsPage.jsx
    │   │   └── AdminTransactionsPage.jsx
    │   ├── services/api.js   # Axios service layer
    │   ├── store/
    │   │   ├── adminStore.js # Zustand
    │   │   └── itemsStore.js
    │   ├── utils/
    │   │   ├── constants.js
    │   │   └── helpers.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css         # @import "tailwindcss"
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## ⚙️ Prerequisites

- Node.js v18+
- npm v9+
- MongoDB Atlas account (already configured)
- Cloudinary account (already configured)
- Google Gemini API key — **free at https://aistudio.google.com**

---

## 🚀 LOCAL SETUP

### Step 1 — Clone / enter project

```bash
cd campus-lnf
```

### Step 2 — Backend setup

```bash
cd backend
npm install
```

Open `.env` and add your Gemini API key:

```
GEMINI_API_KEY=AIzaSy...your_key_here
```

Start the backend:

```bash
npm run dev
# Server runs on http://localhost:8000
```

### Step 3 — Frontend setup

Open a **new terminal**:

```bash
cd frontend
npm install
```

> ⚠️ Tailwind v4 install command (new syntax):
> ```bash
> npm install tailwindcss @tailwindcss/vite
> ```
> No `tailwind.config.js` needed. CSS only needs `@import "tailwindcss";`

Start the frontend:

```bash
npm run dev
# App runs on http://localhost:5173
```

### Step 4 — Open in browser

- **Public app:** http://localhost:5173
- **Admin login:** http://localhost:5173/admin/login
  - Username: `admin89`
  - Password: `admin789`

---

## 🔑 Getting the Gemini API Key (FREE)

1. Go to https://aistudio.google.com
2. Click **"Get API Key"** → **"Create API key in new project"**
3. Copy the key
4. Paste into `backend/.env` as `GEMINI_API_KEY=...`

**Free tier:** 1,500 requests/day — more than enough for testing and presentation.

---

## 🌐 DEPLOYMENT

### Backend → Render (Free tier)

1. Push `backend/` folder to a GitHub repo
2. Go to https://render.com → New → **Web Service**
3. Connect repo → Set:
   - **Build command:** `npm install`
   - **Start command:** `npm start`
   - **Environment:** Node
4. Add all environment variables from `.env` (except `NODE_ENV` — set it to `production`)
5. Set `CORS_ORIGIN` to your Vercel frontend URL: `https://your-app.vercel.app`
6. Deploy → copy the Render URL (e.g. `https://pict-lnf.onrender.com`)

### Frontend → Vercel

1. Push `frontend/` folder to a GitHub repo
2. Go to https://vercel.com → New Project → Import repo
3. Add environment variable:
   - `VITE_API_BASE_URL` = `https://pict-lnf.onrender.com/api`
4. Deploy

Done! Your app is live.

---

## 📡 API Reference

### Public Endpoints

| Method | Endpoint                 | Description              |
|--------|--------------------------|--------------------------|
| GET    | `/api/items`             | Get items (with filters) |
| GET    | `/api/items/:id`         | Get single item          |
| POST   | `/api/items/report`      | Report found item        |
| POST   | `/api/items/:id/collect` | Collect item             |
| POST   | `/api/ai/analyze-image`  | AI image analysis        |
| POST   | `/api/ai/smart-search`   | AI natural language search|

### Admin Endpoints (JWT required)

| Method | Endpoint                    | Description         |
|--------|-----------------------------|---------------------|
| POST   | `/api/admin/login`          | Admin login         |
| GET    | `/api/admin/items`          | All items           |
| GET    | `/api/admin/transactions`   | Transaction log     |
| GET    | `/api/admin/stats`          | Dashboard stats     |
| PATCH  | `/api/items/:id/verify`     | Verify item         |
| PATCH  | `/api/items/:id/status`     | Update status       |

### Filter params for GET /api/items

| Param       | Values                                    |
|-------------|-------------------------------------------|
| category    | ID Card, Bottle, Calculator, Accessory, Other |
| area        | Library, Playground, Classroom, Building Block, Seminar Hall, Campus |
| seminarHall | E&TC, COMP, IT                           |
| status      | reported, verified, collected             |
| dateFilter  | today, yesterday, custom                  |
| startDate   | YYYY-MM-DD                               |
| endDate     | YYYY-MM-DD                               |
| search      | any text string                           |
| page        | number                                    |
| limit       | number                                    |

---

## 🤖 AI Features

### Image Auto-Fill (Finder Flow)
When a finder uploads a photo, it is sent to **Gemini 2.0 Flash** which returns:
- Detected category (ID Card / Bottle / Calculator / Accessory / Other)
- Auto-generated description
- Search tags (stored in DB for smart search)
- Confidence level

The form auto-fills the category and description fields instantly.

### Smart Search (Seeker Flow)
The search bar on the homepage accepts natural language like:
> *"blue water bottle found near library yesterday"*

Gemini extracts:
- Category → Bottle
- Area → Library
- Date hint → yesterday

And applies all filters automatically.

---

## 🔒 Security Notes

- JWT tokens expire in 24 hours
- Admin credentials stored in `.env` only
- No user passwords stored in DB
- Finder contact is optional — never required
- Cloudinary images are size-limited (5MB, 900×900px max)
- CORS is restricted to `CORS_ORIGIN` in production

---

## 📋 Flow Summary

### Finder Reports Item
1. Upload photo → AI auto-fills category + description
2. Confirm/edit category, description, location, date
3. Choose: **Keep With Me** or **Submit to Center**
4. If keeping: optionally share phone/email (displayed publicly)
5. Submit → item appears on homepage immediately

### Seeker Finds Their Item
1. Browse homepage or use AI smart search
2. Click item to view details
3. If **With Finder**: contact info shown → contact directly
4. If **At Center** (verified): click "I Found My Item" → fill collection form

### Admin Workflow
1. Login at `/admin/login`
2. Dashboard shows stats + recent items
3. Items page: see all items by status/type
4. For **Submitted to Center** items: click **Verify** to confirm center received it
5. Once collected by owner: status auto-updates to **Collected**
6. Transactions page: full audit trail of every action

---

## 🛠️ Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | Vite + React 18 + Tailwind CSS v4 |
| State     | Zustand                           |
| HTTP      | Axios                             |
| Backend   | Node.js + Express.js              |
| Database  | MongoDB Atlas + Mongoose          |
| Images    | Cloudinary                        |
| Auth      | JWT                               |
| AI        | Google Gemini 2.0 Flash (free)    |
| Deploy FE | Vercel                            |
| Deploy BE | Render                            |
