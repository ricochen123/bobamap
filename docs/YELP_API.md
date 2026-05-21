# Yelp integration

BobaMap calls Yelp from the Django backend only. The API key stays on the server.

## Default search

Nearby and city searches use the term `bubble tea`. Override with `?term=boba` on `GET /api/shops/`.

## BobaMap endpoints

```bash
curl "http://127.0.0.1:8000/api/shops/?lat=39.0840&lng=-77.1528&radius=8047"
curl "http://127.0.0.1:8000/api/shops/?location=20850"
curl "http://127.0.0.1:8000/api/shops/?lat=39.08&lng=-77.15&open_now=true&min_rating=4&sort=rating"
curl "http://127.0.0.1:8000/api/shops/<business_id>/"
```

## Response fields

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | Yelp business ID |
| `name` | string | |
| `rating` | number | |
| `review_count` | number | |
| `price` | string | `$`–`$$$$` |
| `address` | string | |
| `latitude` / `longitude` | number | |
| `distance` | number | Meters from ref point |
| `distance_miles` | number | Miles from ref point |
| `reviews` | array | Detail endpoint only |

## Caching

Responses are stored in `CachedShopData` for `YELP_CACHE_TTL` seconds (default 3600).
