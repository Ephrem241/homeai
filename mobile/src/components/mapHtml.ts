export type MapMarker = { id: string; lat: number; lng: number; label: string };

// Shared by PriceMapView (native, via react-native-webview) and
// PriceMapView.web (a plain <iframe>) — CLAUDE.md §1 "Mapbox SDK... custom
// price markers". Runs Mapbox GL JS from the CDN inside the WebView/iframe
// rather than a native module, so it keeps working under plain `expo start`
// / Expo Go instead of requiring a custom dev client (see project memory).
export function buildMapHtml(accessToken: string, markers: MapMarker[]): string {
  const markersJson = JSON.stringify(markers);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="initial-scale=1,maximum-scale=1,user-scalable=no" />
  <link href="https://api.mapbox.com/mapbox-gl-js/v3.28.1/mapbox-gl.css" rel="stylesheet" />
  <script src="https://api.mapbox.com/mapbox-gl-js/v3.28.1/mapbox-gl.js"></script>
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; }
    .price-marker {
      background: #0B1F33;
      color: #FFFFFF;
      font-family: -apple-system, sans-serif;
      font-size: 12px;
      font-weight: 600;
      padding: 6px 10px;
      border-radius: 999px;
      white-space: nowrap;
      cursor: pointer;
      box-shadow: 0 1px 4px rgba(0,0,0,0.3);
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    function send(msg) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify(msg));
      } else if (window.parent) {
        window.parent.postMessage(msg, '*');
      }
    }

    var markers = ${markersJson};
    mapboxgl.accessToken = ${JSON.stringify(accessToken)};

    if (!markers.length) {
      document.getElementById('map').outerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;font-family:sans-serif;color:#68737D;">No mapped properties in this view.</div>';
    } else {
      var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/light-v11',
        center: [markers[0].lng, markers[0].lat],
        zoom: 12,
      });

      map.addControl(new mapboxgl.NavigationControl(), 'top-right');

      var bounds = new mapboxgl.LngLatBounds();
      markers.forEach(function (marker) {
        var el = document.createElement('div');
        el.className = 'price-marker';
        el.textContent = marker.label;
        el.addEventListener('click', function () {
          send({ type: 'selectProperty', id: marker.id });
        });
        new mapboxgl.Marker(el).setLngLat([marker.lng, marker.lat]).addTo(map);
        bounds.extend([marker.lng, marker.lat]);
      });

      if (markers.length > 1) {
        map.fitBounds(bounds, { padding: 60, maxZoom: 15 });
      }
    }
  </script>
</body>
</html>`;
}
