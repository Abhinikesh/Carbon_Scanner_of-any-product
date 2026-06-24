# CO2 Emission — Climate Lens

> AI-powered carbon footprint tracker. Scan products, receipts, food & flights to get instant CO₂ estimates, sustainability scores, and greener alternatives.

![Climate Lens](https://img.shields.io/badge/Status-Active-brightgreen) ![License](https://img.shields.io/badge/License-MIT-blue) ![Stack](https://img.shields.io/badge/Stack-MERN-green)

---

## 📸 Screenshots

| Home | Dashboard | Upload Center |
|------|-----------|---------------|
| ![Home](./home.png) | ![Dashboard](./dashboard.png) | ![Upload](./upload_center.png) |

| Education Hub | Settings |
|---------------|----------|
| ![Education](./education_hub.png) | ![Settings](./settings.png) |

---

## ✨ Features

- 📸 **Smart Upload** — Upload receipts, flight tickets, product images, barcodes
- 🤖 **AI Recognition** — Google Vision API identifies items with 98.4% OCR accuracy
- 🌿 **CO₂ Calculator** — Real emission data using Climatiq API + EPA/DEFRA/FAO datasets
- ♻️ **Green Alternatives** — AI suggests lower-carbon swaps for every item scanned
- 📊 **Carbon Dashboard** — Track your monthly footprint with real-time charts
- 🏆 **Badges & Streaks** — Gamified sustainability rewards
- 🔐 **Secure Auth** — JWT access + refresh token system
- 🌙 **Dark Mode** — Full dark theme support
- 📱 **Mobile Responsive** — Works on all screen sizes

---

## ⚙️ Environment Variables

Create a `.env` file in `/backend`:

```env
PORT=5000
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/co2lens
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GOOGLE_VISION_API_KEY=your_google_key
CLIMATIQ_API_KEY=your_climatiq_key
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

Create a `.env` in `/client`:
```env
VITE_API_URL=http://localhost:5000/api
```
---


## 📄 License

MIT License © 2026 [Abhinikesh](https://github.com/Abhinikesh)
