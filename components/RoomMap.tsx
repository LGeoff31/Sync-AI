import { useEffect, useRef } from "react";

type RoomMapProps = {
  markers?: { lat: number; lon: number; label?: string }[];
  height?: number;
};

export default function RoomMap({ markers = [], height = 240 }: RoomMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
      script.async = true;
      script.onload = initMap;
      document.head.appendChild(script);
    } else {
      initMap();
    }

    function initMap() {
      if (mapRef.current && window.google) {
        let center = { lat: 43.6532, lng: -79.3832 };
        let zoom = 10;

        if (markers.length > 0) {
          const bounds = new window.google.maps.LatLngBounds();
          markers.forEach((marker) => {
            bounds.extend(
              new window.google.maps.LatLng(marker.lat, marker.lon)
            );
          });

          if (markers.length === 1) {
            center = { lat: markers[0].lat, lng: markers[0].lon };
            zoom = 13;
          }
        }

        const map = new window.google.maps.Map(mapRef.current, {
          center,
          zoom,
        });

        markers.forEach((markerData) => {
          const marker = new window.google.maps.Marker({
            position: { lat: markerData.lat, lng: markerData.lon },
            map: map,
            title: markerData.label || "Member location",
          });

          if (markerData.label) {
            const infoWindow = new window.google.maps.InfoWindow({
              content: markerData.label,
            });

            marker.addListener("click", () => {
              infoWindow.open(map, marker);
            });
          }
        });

        if (markers.length > 1) {
          const bounds = new window.google.maps.LatLngBounds();
          markers.forEach((marker) => {
            bounds.extend(
              new window.google.maps.LatLng(marker.lat, marker.lon)
            );
          });
          map.fitBounds(bounds);
        }
      }
    }
  }, [markers]);

  return (
    <div
      ref={mapRef}
      style={{
        height,
        width: "100%",
        borderRadius: "8px",
      }}
    />
  );
}

declare global {
  interface Window {
    google: {
      maps: {
        Map: new (element: HTMLElement, options: object) => object;
        Marker: new (options: object) => object;
        InfoWindow: new (options: object) => object;
        LatLngBounds: new () => object;
        LatLng: new (lat: number, lng: number) => object;
        SymbolPath: object;
        ZoomControlStyle: object;
        ControlPosition: object;
        MapTypeControlStyle: object;
      };
    };
  }
}
