# Project Audit: Climate Lens

This document outlines the architectural map, routes, and data flow validation of the Climate Lens project.

## Folder Structure

The project directory layout is structured as a full-stack JavaScript application with the Node/Express backend at the root level and a Vite-based React frontend under the `frontend` subdirectory:

```
climate-lens/
├── .env.example
├── .gitignore
├── .vscode/
│   └── settings.json
├── README.md
├── server.js
├── package.json
├── package-lock.json
├── config/
│   ├── db.js
│   └── cloudinary.js
├── controllers/
│   ├── authController.js
│   ├── carbonController.js
│   ├── scanController.js
│   └── userController.js
├── middleware/
│   ├── authMiddleware.js
│   ├── errorHandler.js
│   ├── rateLimiter.js
│   └── uploadMiddleware.js
├── models/
│   ├── CarbonFactor.js
│   ├── Scan.js
│   └── User.js
├── routes/
│   ├── authRoutes.js
│   ├── carbonRoutes.js
│   ├── scanRoutes.js
│   └── userRoutes.js
├── services/
│   ├── aiService.js
│   ├── alternativesService.js
│   ├── carbonService.js
│   └── sustainabilityService.js
├── utils/
│   ├── carbonCalculator.js
│   ├── responseHelper.js
│   └── tokenHelper.js
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   ├── eslint.config.js
│   ├── .gitignore
│   ├── public/
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── api.js
│       ├── assets/
│       └── pages/
│           ├── Dashboard.jsx
│           ├── EducationHub.jsx
│           ├── Home.jsx
│           ├── Login.jsx
│           ├── Settings.jsx
│           └── UploadCenter.jsx
```

## Frontend Pages & Routes

The client application defines the following routes inside `frontend/src/App.jsx`:

- **`/`**: Home Page (`Home.jsx`) — General introduction, stats strip, and high-level feature list.
- **`/upload`**: Upload Center (`UploadCenter.jsx`) — File drag-and-drop/browser picker to upload products, receipts, flights, or barcodes.
- **`/dashboard`**: Carbon Dashboard (`Dashboard.jsx`) — Analytics overview, emissions chart, and list of recent scans.
- **`/education`**: Education Hub (`EducationHub.jsx`) — Explainer cards detailing carbon footprint concepts (CO₂e, targets, transport, etc.).
- **`/settings`**: Settings Page (`Settings.jsx`) — Profile fields and application preferences.
- **`/login`**: Sign In Screen (`Login.jsx`) — Form to sign in.
- **`*` (Wildcard)**: Fallback route rendering the Home Page layout.

## Backend Routes

The Express application registers routes under `/api` inside `server.js`:

### Authentication (`/api/auth` -> `routes/authRoutes.js`)
- **`POST /register`**: Register a new user account.
- **`POST /login`**: Login user with password verification and token issue.
- **`POST /refresh-token`**: Issue new access/refresh token pair using a valid refresh token.
- **`POST /logout`**: Invalidate the user's refresh token in the database (Protected).
- **`GET /me`**: Retrieve active user profile data (Protected).

### Scanning (`/api/scan` -> `routes/scanRoutes.js`)
- **`POST /upload`**: Process an image or PDF file via Multer, send to Cloudinary, run Google Vision OCR or product identification, compute carbon emissions, and save the result (Protected).
- **`GET /history`**: Retrieve paginated scan history for the logged-in user (Protected).
- **`GET /:id`**: Fetch a single scan by ID (Protected).
- **`DELETE /:id`**: Delete a scan by ID (Protected).

### User Profiles & Leaderboards (`/api/user` -> `routes/userRoutes.js`)
- **`GET /dashboard`**: Calculate daily carbon trends, monthly consumption totals, and category breakdowns (Protected).
- **`PUT /profile`**: Update profile display name and avatar (Protected).
- **`GET /leaderboard`**: Retrieve the top 10 users ranked by total scan activity.

### Carbon Calculations (`/api/carbon` -> `routes/carbonRoutes.js`)
- **`GET /factors`**: Fetch all local fallback carbon emission factors.
- **`GET /compare`**: Compare the carbon footprint of two items within a category.

### Utility & Health Routes (`server.js`)
- **`GET /api/health`**: Simple health-check endpoint.
- **`GET /api/test`**: Simple connection smoke-test.

## Real vs Mock Data (page by page)

### Home (`Home.jsx`)
- **Monthly CO2e (Sidebar)**: `Monthly CO2e: 42kg` -> **MOCK / HARDCODED** (Static text in `App.jsx` sidebar layout).
- **Stats Strip**: `98.4% OCR Accuracy`, `42kg Your CO2 This Month`, `12 Scans Analysed` -> **MOCK / HARDCODED** (Static values defined in local array).
- **Neural Engine Description**: `98.4 % OCR accuracy...` -> **MOCK / HARDCODED** (Static text).

### Upload Center (`UploadCenter.jsx`)
- **File Upload Trigger**: `api.post('/api/scan', formData)` -> **REAL API CALL (BUT BROKEN)**. The frontend makes an HTTP request. However, the payload and endpoint target are incorrect:
  - Frontend calls `/api/scan` but backend expects `/api/scan/upload`.
  - Frontend appends multiple files under `files` key, but backend expects a single file under the `image` key.
- **AI Processing Panel**: `98.4% Extraction Accuracy` and progress bar (96%) -> **MOCK / HARDCODED** (Static values in UI component).
- **Live Activity**: `WholeFoods_09_22.jpg`, `UPC_8849201.jpg`, `LHR_NYC_Flight.pdf` along with active status badges -> **MOCK / HARDCODED** (Hardcoded state array that never updates).

### Dashboard (`Dashboard.jsx`)
- **Stats Cards**: `12 Total Scans`, `127 kg Total CO2 Tracked`, `42 kg This Month`, `64/100 Sustainability Score` -> **MOCK / HARDCODED** (Static values).
- **Carbon Over Time Chart**: Recharts `AreaChart` mapping data from a local variable `carbonData` -> **MOCK / HARDCODED** (Static array of 6 months).
- **Recent Scans Table**: Scans with categories, CO2 weights, eco scores, and dates -> **MOCK / HARDCODED** (Static `recentScans` array).

### Education Hub (`EducationHub.jsx`)
- **Topic Cards**: Carbon explainers (CO₂e, 1.5°C target, etc.) -> **MOCK / HARDCODED** (Static text array).

### Settings (`Settings.jsx`)
- **Profile Fields**: Name ("Felix Green") and Email ("felix@climatelens.io") -> **MOCK / HARDCODED** (Initial state is hardcoded in local React state and never fetched from or saved to `/api/user/profile` or `/api/auth/me`).
- **Preferences Toggles**: Push notifications (true) and Dark mode (false) -> **MOCK / HARDCODED** (Changes local React state only).

### Login (`Login.jsx`)
- **Sign In Submission**: `api.post('/api/auth/login', { email, password })` -> **REAL API CALL**. Hits backend, returns token, and saves to `localStorage` as `cl_token`.
- **Continue as Guest**: -> **MOCK / HARDCODED** (Simply routes to `/` with no auth).

## Backend Reality Check

### Database Connection
- **REAL**: Configured in `config/db.js` using Mongoose to connect to MongoDB. It requires `process.env.MONGO_URI`.

### OCR Integration
- **REAL**: Real Google Cloud Vision API integration exists in `services/aiService.js`. It issues a POST request to `https://vision.googleapis.com/v1/images:annotate` using `process.env.GOOGLE_VISION_API_KEY`. If the key is missing, it fails gracefully (catches error, sets `aiFailed: true`) and forwards defaults to the carbon calculator. The accuracy value "98.4%" in the UI is, however, hardcoded.

### CO2 Calculation Engine
- **REAL**: A hybrid carbon calculation engine is implemented in `services/carbonService.js` and `utils/carbonCalculator.js`. If `process.env.CLIMATIQ_API_KEY` is present, it calls the Climatiq API. Otherwise, it falls back to a local estimation engine matching parsed text to hardcoded emission factors (`EMISSION_FACTORS`) derived from EPA, DEFRA, and FAO datasets.

### Auth System
- **REAL**: Robust user authentication and session management is implemented (`controllers/authController.js` and `middleware/authMiddleware.js`). User passwords are securely hashed using `bcryptjs` (salt rounds: 12) on save and verified on login. It issues dual JWT tokens (Access token and Refresh token) and validates requests using a `protect` middleware.

### Frontend-Backend Integration Gap
- **CRITICAL**: Although the backend contains fully realized controllers and models for a complete database-driven lifecycle, the frontend is almost entirely mock-based. The pages display static data, and the React HTTP client (`frontend/src/api.js`) is missing the logic to inject the JWT (`cl_token`) into the `Authorization` header, meaning any actual requests to protected backend routes fail with a `401 Unauthorized` response.

## Missing Pieces

1. **New User Registration Screen**: The frontend only implements a Sign In form; there is no interface or route for registration/signup, despite the backend having `/api/auth/register`.
2. **Environment Configuration File (`.env`)**: No `.env` file is present in the repository root (only `.env.example`).
3. **Frontend Token Injection**: The API helper `frontend/src/api.js` does not pull the stored token from `localStorage` to include as an `Authorization` header, leaving all auth-protected API routes unreachable by the UI.
4. **Dynamic Data Binding on Frontend Pages**: The Home, Dashboard, Upload Center, and Settings pages lack React hooks (`useEffect`, `useState`) to retrieve data from `/api/user/dashboard`, `/api/scan/history`, and `/api/user/profile`.

## Installed Packages — Used vs Unused

### Backend (`package.json`)
- **`axios`**: **USED** (Used in `services/aiService.js` for Google Vision and `services/carbonService.js` for Climatiq).
- **`bcryptjs`**: **USED** (Used in `models/User.js` for password hashing and comparison).
- **`cloudinary`**: **USED** (Used in `config/cloudinary.js` to configure media storage).
- **`cors`**: **USED** (Used in `server.js` to configure CORS policies).
- **`dotenv`**: **USED** (Used in `server.js` to read `.env` configurations).
- **`express`**: **USED** (Used in `server.js` to run the HTTP server).
- **`express-rate-limit`**: **USED** (Used in `middleware/rateLimiter.js` for rate-limiting incoming requests).
- **`express-validator`**: **UNUSED** (Listed in `package.json` dependencies but never imported or referenced in any file).
- **`helmet`**: **USED** (Used in `server.js` to set secure HTTP headers).
- **`jsonwebtoken`**: **USED** (Used in `utils/tokenHelper.js` to sign and verify tokens).
- **`mongoose`**: **USED** (Used in `config/db.js` and all model files to connect to MongoDB and query schemas).
- **`morgan`**: **USED** (Used in `server.js` for request logging).
- **`multer`**: **USED** (Used in `middleware/uploadMiddleware.js` for multi-part file uploads).
- **`multer-storage-cloudinary`**: **USED** (Used in `middleware/uploadMiddleware.js` to save uploads directly to Cloudinary).
- **`nodemon`** (devDependency): **USED** (Used for automatic server reload in dev script).

### Frontend (`frontend/package.json`)
- **`lucide-react`**: **USED** (Renders page and navigation icons).
- **`react`** & **`react-dom`**: **USED** (Application framework).
- **`react-router-dom`**: **USED** (Client routing).
- **`recharts`**: **USED** (Renders charts on the Dashboard page).
- **`@tailwindcss/vite`** & **`tailwindcss`**: **USED** (App styling framework).
- **`vite`**: **USED** (Build tool and dev server).

## Errors Encountered During Install/Boot

### Installation Phase
- **Backend Install (`npm install`)**: Successfully installed 176 packages. No errors occurred. Warnings were raised regarding deprecated packages (`q@1.5.1` and `multer@1.4.5-lts.2`).
- **Frontend Install (`npm install`)**: Successfully installed 216 packages. No errors occurred.

### Boot Phase
- **Backend Server (`npm run dev`)**: Crashed immediately on start.
  - *Command*: `nodemon server.js`
  - *Error*: `MongoDB Connection Error: The uri parameter to openUri() must be a string, got "undefined"`
  - *Reason*: The server attempts to read `process.env.MONGO_URI` to connect to MongoDB. Since the `.env` file does not exist (only `.env.example` is present), this environment variable evaluates to `undefined`, which crashes the Mongoose connection lifecycle.
- **Frontend Server (`npm run dev`)**: Started successfully.
  - *Command*: `vite`
  - *Output*: `VITE v8.0.3 ready in 1467 ms. Local: http://localhost:5173/`
