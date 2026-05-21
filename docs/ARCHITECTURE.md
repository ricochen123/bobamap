# Architecture

## Data flow

```
Browser (React)
  → Axios → Django REST API
              → YelpService (cache)
              → Yelp Fusion API
              → PostgreSQL
```

The Yelp API key is server-side only. Mapbox runs in the browser with a public token restricted by URL in the Mapbox dashboard.

## Backend

| Module | Role |
|--------|------|
| `views.py` | HTTP handlers, pagination, auth |
| `serializers.py` | Validation |
| `services/yelp.py` | Yelp client, normalization, cache |
| `models.py` | Favorites and Yelp cache |

## Frontend

| Module | Role |
|--------|------|
| `pages/` | Routes |
| `components/` | Map, cards, search |
| `hooks/` | Geolocation, shop fetching |
| `services/` | API client |
| `context/` | Auth and theme |

Yelp business IDs are the canonical shop identifier across features.
