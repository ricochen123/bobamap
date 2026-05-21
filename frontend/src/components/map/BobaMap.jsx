import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { formatRating } from "../../utils/format";

const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export default function BobaMap({
  shops = [],
  center,
  userPosition,
  flyZoom,
  selectedShop,
  onSelectShop,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const userMarkerRef = useRef(null);
  const onSelectRef = useRef(onSelectShop);
  onSelectRef.current = onSelectShop;

  useEffect(() => {
    if (!containerRef.current || mapRef.current || !TOKEN) return;

    mapboxgl.accessToken = TOKEN;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: center ? [center.lng, center.lat] : [-122.4194, 37.7749],
      zoom: 13,
    });

    map.addControl(new mapboxgl.NavigationControl(), "bottom-right");

    map.on("load", () => {
      map.addSource("shops", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      });

      map.addLayer({
        id: "clusters",
        type: "circle",
        source: "shops",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": ["step", ["get", "point_count"], "#f2d5c9", 10, "#e8b4a0", 25, "#c96b4f"],
          "circle-radius": ["step", ["get", "point_count"], 18, 10, 24, 25, 30],
        },
      });

      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "shops",
        filter: ["has", "point_count"],
        layout: {
          "text-field": "{point_count_abbreviated}",
          "text-size": 12,
        },
        paint: { "text-color": "#ffffff" },
      });

      map.addLayer({
        id: "unclustered-point",
        type: "circle",
        source: "shops",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": "#c96b4f",
          "circle-radius": 10,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        },
      });

      map.on("click", "clusters", async (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ["clusters"] });
        if (!features.length) return;
        const clusterId = features[0].properties.cluster_id;
        const source = map.getSource("shops");
        try {
          const zoom = await source.getClusterExpansionZoom(clusterId);
          map.easeTo({
            center: features[0].geometry.coordinates,
            zoom,
          });
        } catch {
          /* ignore */
        }
      });

      map.on("click", "unclustered-point", (e) => {
        const feature = e.features?.[0];
        if (!feature?.properties?.shop) return;
        try {
          const shop = JSON.parse(feature.properties.shop);
          onSelectRef.current?.(shop);
        } catch {
          /* ignore malformed */
        }
      });

      ["clusters", "unclustered-point"].forEach((layer) => {
        map.on("mouseenter", layer, () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", layer, () => {
          map.getCanvas().style.cursor = "";
        });
      });

      updateShops(map, shops);
    });

    mapRef.current = map;

    return () => {
      markersRef.current.forEach((m) => m.remove());
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
    if (!map || !center || selectedShop) return;
    map.flyTo({
      center: [center.lng, center.lat],
      zoom: flyZoom ?? map.getZoom(),
      essential: true,
    });
  }, [center?.lat, center?.lng, flyZoom, selectedShop]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const apply = () => updateShops(map, shops);
    if (map.isStyleLoaded() && map.getSource("shops")) {
      apply();
    } else {
      map.once("load", apply);
      map.once("style.load", apply);
    }
  }, [shops]);

  useEffect(() => {
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    const map = mapRef.current;
    if (!map || !selectedShop?.longitude) return;

    const el = document.createElement("div");
    el.className = "marker-boba";
    el.innerHTML = `<div style="width:44px;height:44px;background:#c96b4f;border:3px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:0 4px 12px rgba(0,0,0,.25)">🧋</div>`;

    const marker = new mapboxgl.Marker(el)
      .setLngLat([selectedShop.longitude, selectedShop.latitude])
      .addTo(map);
    markersRef.current.push(marker);
    map.flyTo({ center: [selectedShop.longitude, selectedShop.latitude], zoom: 15 });
  }, [selectedShop?.id]);

  if (!TOKEN) {
    return (
      <div className="flex h-full items-center justify-center bg-boba-100 p-8 text-center dark:bg-gray-900">
        <div>
          <p className="mb-4 text-4xl">🗺️</p>
          <p className="font-semibold">Mapbox token not configured</p>
          <p className="mt-2 text-sm text-gray-500">Set VITE_MAPBOX_TOKEN in .env</p>
        </div>
      </div>
    );
  }

  return <div ref={containerRef} className="h-full w-full" />;
}

function updateShops(map, shops) {
  const source = map.getSource("shops");
  if (!source) return;
  source.setData({
    type: "FeatureCollection",
    features: shops
      .filter((s) => s.latitude != null && s.longitude != null)
      .map((s) => ({
        type: "Feature",
        properties: { shop: JSON.stringify(s), name: s.name },
        geometry: { type: "Point", coordinates: [s.longitude, s.latitude] },
      })),
  });
}
