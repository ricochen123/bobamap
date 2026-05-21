import math

METERS_PER_MILE = 1609.344


def haversine_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    r = 6_371_000
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dlon / 2) ** 2
    return 2 * r * math.asin(math.sqrt(min(1.0, a)))


def meters_to_miles(meters: float) -> float:
    return meters / METERS_PER_MILE


def enrich_shop_distances(shops: list[dict], ref_lat: float, ref_lng: float) -> list[dict]:
    for shop in shops:
        lat, lng = shop.get("latitude"), shop.get("longitude")
        if lat is None or lng is None:
            continue
        meters = haversine_meters(ref_lat, ref_lng, lat, lng)
        shop["distance"] = round(meters)
        shop["distance_miles"] = round(meters_to_miles(meters), 2)
    return shops
