# BobaMap

Discover bubble tea shops on an interactive map with Yelp data, saved favorites, and distance-based search.

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, Vite, TailwindCSS, Mapbox GL JS, Axios |
| Backend | Django REST Framework, JWT |
| Database | PostgreSQL (SQLite supported for local dev) |
| Data | Yelp Fusion API |

## Structure

```
Boba/
├── backend/          # Django API
├── frontend/         # React app
├── docs/             # API reference
└── scripts/          # Setup script (Windows)
```

## Requirements

- Python 3.11+
- Node.js 18+
- PostgreSQL 14+ (or `USE_SQLITE=true`)
- [Yelp Fusion API key](https://www.yelp.com/developers/v3/manage_app)
- [Mapbox access token](https://account.mapbox.com/access-tokens/)

## Setup

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux
pip install -r requirements.txt
cp .env.example .env           # add YELP_API_KEY, SECRET_KEY, DB_*
```

For local dev without PostgreSQL, set `USE_SQLITE=true` in `.env`.

```bash
python manage.py migrate
python manage.py runserver
```

API: `http://127.0.0.1:8000/api/`

### Frontend

```bash
cd frontend
npm install
cp .env.example .env           # VITE_MAPBOX_TOKEN, VITE_API_BASE_URL
npm run dev
```

App: `http://localhost:5173`

### Windows quick setup

```powershell
cd scripts
.\setup.ps1
```

## API

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/shops/` | No | Search shops |
| GET | `/api/shops/<id>/` | No | Shop detail |
| POST | `/api/auth/register/` | No | Register |
| POST | `/api/auth/login/` | No | Login |
| POST | `/api/auth/refresh/` | No | Refresh token |
| GET | `/api/auth/me/` | Yes | Current user |
| GET | `/api/favorites/` | Yes | List favorites |
| POST | `/api/favorites/` | Yes | Add favorite |
| DELETE | `/api/favorites/yelp/<yelp_id>/` | Yes | Remove favorite |

### Shop search

```http
GET /api/shops/?lat=39.0840&lng=-77.1528&radius=8047&sort=distance
GET /api/shops/?location=Rockville,MD&min_rating=4
GET /api/shops/?name=Kung+Fu+Tea&lat=39.0840&lng=-77.1528
```

See [docs/YELP_API.md](docs/YELP_API.md) and [docs/AUTH.md](docs/AUTH.md) for more detail.

## Environment variables

**Backend (`backend/.env`)**

| Variable | Description |
|----------|-------------|
| `YELP_API_KEY` | Yelp Fusion key (server only) |
| `SECRET_KEY` | Django secret |
| `DB_*` | PostgreSQL connection |
| `USE_SQLITE` | `true` for SQLite |
| `YELP_CACHE_TTL` | Cache TTL in seconds |

**Frontend (`frontend/.env`)**

| Variable | Description |
|----------|-------------|
| `VITE_MAPBOX_TOKEN` | Mapbox public token |
| `VITE_API_BASE_URL` | API base URL |

## Features

- Map with clustered pins and shop previews
- Near me, city/ZIP search, and sidebar name filter
- Sort by best match, distance, or rating (miles)
- JWT auth, favorites, shop detail with reviews
- Dark mode, mobile drawer, Yelp response caching

## License

MIT
