import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { US_MAP_CENTER, US_MAP_ZOOM, WHEEL_ZOOM_RATE } from "../../constants/map";

const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const CLUSTER_LAYERS = ["clusters", "cluster-count"];
const SHOP_LAYERS = ["shop-pin", "shop-label"];
const SELECTED_LAYERS = ["selected-pin-glow", "selected-pin", "selected-label"];
const CLICKABLE_SHOP_LAYERS = [...SHOP_LAYERS, ...SELECTED_LAYERS];

export default function BobaMap({
  shops = [],
  center,
  userPosition,
  flyZoom,
  centerKey = 0,
  selectedShop,
  onSelectShop,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const userMarkerRef = useRef(null);
  const handlersBoundRef = useRef(false);
  const skipNextPanRef = useRef(false);
  const shopsRef = useRef(shops);
  const selectedShopRef = useRef(selectedShop);
  const onSelectRef = useRef(onSelectShop);
  onSelectRef.current = onSelectShop;
  shopsRef.current = shops;
  selectedShopRef.current = selectedShop;

  const applyShopLayers = () => {
    const map = mapRef.current;
    if (!map?.getSource("shops")) return false;
    updateShops(map, shopsRef.current, selectedShopRef.current?.id);
    updateSelectedShop(map, selectedShopRef.current);
    return true;
  };

  useEffect(() => {
    if (!containerRef.current || mapRef.current || !TOKEN) return;

    const start = center || US_MAP_CENTER;

    mapboxgl.accessToken = TOKEN;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [start.lng, start.lat],
      zoom: flyZoom ?? US_MAP_ZOOM,
    });
    skipNextPanRef.current = true;

    map.scrollZoom.setWheelZoomRate(WHEEL_ZOOM_RATE);

    map.addControl(new mapboxgl.NavigationControl(), "bottom-right");

    const bindInteractions = () => {
      if (handlersBoundRef.current) return;
      handlersBoundRef.current = true;

      map.on("click", (e) => {
        const clusterFeatures = map.queryRenderedFeatures(e.point, { layers: CLUSTER_LAYERS });
        if (clusterFeatures.length) {
          expandCluster(map, clusterFeatures[0]);
          return;
        }

        const shopFeatures = map.queryRenderedFeatures(e.point, { layers: CLICKABLE_SHOP_LAYERS });
        if (!shopFeatures.length) return;

        const withShop = shopFeatures.find((f) => f.properties?.shop);
        if (!withShop?.properties?.shop) return;

        try {
          const shop = JSON.parse(withShop.properties.shop);
          onSelectRef.current?.(shop);
        } catch {
          /* ignore malformed */
        }
      });

      [...CLUSTER_LAYERS, ...CLICKABLE_SHOP_LAYERS].forEach((layer) => {
        map.on("mouseenter", layer, () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", layer, () => {
          map.getCanvas().style.cursor = "";
        });
      });
    };

    const setupLayers = () => {
      if (map.getSource("shops")) return;

      map.addSource("shops", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 55,
      });

      map.addSource("selected-shop", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      map.addLayer({
        id: "clusters",
        type: "circle",
        source: "shops",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": ["step", ["get", "point_count"], "#f2d5c9", 10, "#e8b4a0", 25, "#c96b4f"],
          "circle-radius": ["step", ["get", "point_count"], 20, 10, 26, 25, 32],
        },
      });

      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "shops",
        filter: ["has", "point_count"],
        layout: {
          "text-field": ["get", "point_count_abbreviated"],
          "text-size": 13,
        },
        paint: { "text-color": "#ffffff" },
      });

      map.addLayer({
        id: "shop-pin",
        type: "circle",
        source: "shops",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": "#c96b4f",
          "circle-radius": 8,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        },
      });

      map.addLayer({
        id: "shop-label",
        type: "symbol",
        source: "shops",
        filter: ["!", ["has", "point_count"]],
        layout: {
          "text-field": ["get", "name"],
          "text-size": 12,
          "text-offset": [0, -1.9],
          "text-anchor": "bottom",
          "text-max-width": 16,
          "text-allow-overlap": true,
          "text-ignore-placement": true,
        },
        paint: {
          "text-color": "#4a3728",
          "text-halo-color": "#ffffff",
          "text-halo-width": 1.5,
        },
      });

      // Selected shop: separate source (never clusters) — stays visible at any zoom
      map.addLayer({
        id: "selected-pin-glow",
        type: "circle",
        source: "selected-shop",
        paint: {
          "circle-color": "#c96b4f",
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            8,
            18,
            12,
            22,
            16,
            24,
          ],
          "circle-opacity": 0.3,
          "circle-stroke-width": 0,
        },
      });

      map.addLayer({
        id: "selected-pin",
        type: "circle",
        source: "selected-shop",
        paint: {
          "circle-color": "#c96b4f",
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            8,
            10,
            12,
            14,
            16,
            14,
          ],
          "circle-stroke-width": 3,
          "circle-stroke-color": "#ffffff",
        },
      });

      map.addLayer({
        id: "selected-label",
        type: "symbol",
        source: "selected-shop",
        layout: {
          "text-field": ["get", "name"],
          "text-size": [
            "interpolate",
            ["linear"],
            ["zoom"],
            8,
            12,
            12,
            14,
            16,
            15,
          ],
          "text-offset": [0, -2.4],
          "text-anchor": "bottom",
          "text-max-width": 18,
          "text-allow-overlap": true,
          "text-ignore-placement": true,
        },
        paint: {
          "text-color": "#4a3728",
          "text-halo-color": "#ffffff",
          "text-halo-width": 2.5,
        },
      });

      bindInteractions();
      applyShopLayers();
    };

    if (map.isStyleLoaded()) {
      setupLayers();
    } else {
      map.on("load", setupLayers);
    }

    mapRef.current = map;

    return () => {
      handlersBoundRef.current = false;
      skipNextPanRef.current = false;
      userMarkerRef.current?.remove();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    userMarkerRef.current?.remove();
    userMarkerRef.current = null;

    if (userPosition) {
      userMarkerRef.current = new mapboxgl.Marker({ color: "#3b82f6" })
        .setLngLat([userPosition.lng, userPosition.lat])
        .setPopup(new mapboxgl.Popup({ offset: 20 }).setHTML("<strong>You are here</strong>"))
        .addTo(map);
    }
  }, [userPosition?.lat, userPosition?.lng]);

  useEffect(() => {
    const map = mapRef.current;
    const target = center || US_MAP_CENTER;
    if (!map) return;
    if (skipNextPanRef.current) {
      skipNextPanRef.current = false;
      return;
    }
    map.jumpTo({
      center: [target.lng, target.lat],
      zoom: flyZoom ?? map.getZoom(),
    });
  }, [center?.lat, center?.lng, flyZoom, centerKey]);

  useEffect(() => {
    shopsRef.current = shops;
    selectedShopRef.current = selectedShop;

    if (applyShopLayers()) return;

    const map = mapRef.current;
    if (!map) return;

    const sync = () => applyShopLayers();
    if (map.loaded()) {
      sync();
    }
    map.once("load", sync);
    map.once("idle", sync);
  }, [shops, selectedShop?.id]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedShop?.longitude || !selectedShop?.latitude) return;
    map.jumpTo({
      center: [selectedShop.longitude, selectedShop.latitude],
      zoom: Math.max(map.getZoom(), 16),
    });
  }, [selectedShop?.id]);

  if (!TOKEN) {
    return (
      <div className="flex h-full items-center justify-center bg-boba-100 p-8 text-center dark:bg-gray-900">
        <div>
          <p className="mb-4 font-semibold">Mapbox token not configured</p>
          <p className="mt-2 text-sm text-gray-500">Set VITE_MAPBOX_TOKEN in .env</p>
        </div>
      </div>
    );
  }

  return <div ref={containerRef} className="h-full w-full" />;
}

function expandCluster(map, feature) {
  const clusterId = Number(feature.properties?.cluster_id);
  const coords = feature.geometry?.coordinates;
  if (!Number.isFinite(clusterId) || !coords) return;

  const source = map.getSource("shops");
  if (!source) return;

  const flyIn = (zoom) => {
    map.easeTo({
      center: coords,
      zoom: Math.min(Math.max(zoom, map.getZoom() + 1), 17),
      duration: 450,
    });
  };

  const fallback = () => flyIn(map.getZoom() + 2);

  try {
    const result = source.getClusterExpansionZoom(clusterId);
    if (result && typeof result.then === "function") {
      result.then(flyIn).catch(fallback);
    } else if (typeof source.getClusterExpansionZoom === "function") {
      source.getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err) fallback();
        else flyIn(zoom);
      });
    } else {
      fallback();
    }
  } catch {
    fallback();
  }
}

function shopFeature(shop, extra = {}) {
  return {
    type: "Feature",
    properties: {
      shop: JSON.stringify(shop),
      name: String(shop.name || "Shop").slice(0, 40),
      id: shop.id,
      ...extra,
    },
    geometry: { type: "Point", coordinates: [shop.longitude, shop.latitude] },
  };
}

function updateShops(map, shops, selectedId = null) {
  const source = map.getSource("shops");
  if (!source) return;
  source.setData({
    type: "FeatureCollection",
    features: shops
      .filter((s) => s.latitude != null && s.longitude != null && s.id !== selectedId)
      .map((s) => shopFeature(s)),
  });
}

function updateSelectedShop(map, shop) {
  const source = map.getSource("selected-shop");
  if (!source) return;

  if (!shop?.latitude || !shop?.longitude) {
    source.setData({ type: "FeatureCollection", features: [] });
    return;
  }

  source.setData({
    type: "FeatureCollection",
    features: [shopFeature(shop)],
  });
}
