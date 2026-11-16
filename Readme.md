# Modern AI-Powered Hotel Booking Platform

MERN hotel booking project for the capstone. The current version includes the public booking flow, MongoDB seed data, authentication, hotel search/detail, inventory-aware booking, mock payment, wishlist, notifications, offers, destinations, and a foundation for Admin/Hotel Owner CRUD + AI modules.

## 1. Install

```bash
cd server
npm install
cd ../client
npm install
```

## 2. Environment

Create `server/.env` from `.env.example`:

```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_uri/hotel_booking
JWT_SECRET=your_long_secret
CLIENT_URL=http://localhost:5173
GOOGLE_CLIENT_ID=
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
MAIL_FROM=
STRIPE_SECRET_KEY=
```

`client/.env`:

```env
VITE_GOOGLE_CLIENT_ID=
VITE_FACEBOOK_APP_ID=
```

- `GOOGLE_CLIENT_ID` / `VITE_GOOGLE_CLIENT_ID`: same OAuth client ID (Web) from Google Cloud Console. Add `http://localhost:5173` to *Authorized JavaScript origins*. No client secret is needed.
- `FACEBOOK_APP_ID` / `VITE_FACEBOOK_APP_ID`: same App ID; `FACEBOOK_APP_SECRET` is only used on the server.
- `SMTP_*`: used to email the 6-digit login code. For Gmail use an App Password (requires 2-step verification). If SMTP is empty the code is printed in the server terminal (development only; in production the API returns 503).

Never commit `.env` or database credentials.

## 3. Seed the database

The seed resets the development database and creates users, hotel types, destinations, amenities, hotels, room types, rooms, 120-day inventory, offers, demo booking/payment/review/wishlist/notifications and AI demo documents.

```bash
cd server
npm run db:reset
npm run db:test
```

Demo accounts (there are no passwords: log in with the email OTP; when SMTP is not configured the code is printed in the server terminal):

- `admin@123.com`
- `owner@123.com`
- `customer@123.com`

## 4. Run

Terminal 1:

```bash
cd server
npm run dev
```

Terminal 2:

```bash
cd client
npm run dev
```

Frontend: `http://localhost:5173`  
Backend: `http://localhost:5000`

## Main API groups

- `/api/auth` — email OTP (`/otp/request`, `/otp/verify`), Google, Facebook, `/me`
- `/api/homepage` — homepage aggregation
- `/api/hotels` — search, detail, owner/admin management
- `/api/destinations` — destinations
- `/api/hotel-types` — accommodation types
- `/api/offers` — active offers
- `/api/bookings` — booking, payment demo, cancellation
- `/api/users` — `GET /me`, `PATCH /me` (personal info: full name, phone, date of birth, gender, nationality, address)
- `/api/wishlist` — `GET /` (saved hotels), `GET /ids`, `PUT /:hotelId` (save), `DELETE /:hotelId` (remove)
- `/api/profile` — notifications, stats

The UI/animation structure is intentionally kept close to the existing project. New work focuses on connecting real data and business logic rather than redesigning the existing pages.
