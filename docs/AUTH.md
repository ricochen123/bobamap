# Authentication

BobaMap uses JWT via `djangorestframework-simplejwt`.

## Register

`POST /api/auth/register/`

```json
{
  "username": "jane",
  "email": "jane@mail.com",
  "password": "securepass123",
  "password_confirm": "securepass123"
}
```

Returns `access`, `refresh`, and `user`.

## Login

`POST /api/auth/login/`

```json
{
  "username": "jane",
  "password": "securepass123"
}
```

## Token refresh

On `401`, the frontend calls `POST /api/auth/refresh/` with the stored refresh token, then retries the request.

## Access control

| Endpoint | Auth required |
|----------|---------------|
| `/api/shops/` | No |
| `/api/favorites/` | Yes |
| `/api/auth/me/` | Yes |

Unauthenticated users can browse the map. Saving favorites requires login.
