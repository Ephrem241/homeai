import { WebView, type WebViewMessageEvent } from 'react-native-webview';

import { buildMapHtml, type MapMarker } from './mapHtml';

export default function PriceMapView({
  accessToken,
  markers,
  onSelectProperty,
}: {
  accessToken: string;
  markers: MapMarker[];
  onSelectProperty: (id: string) => void;
}) {
  function handleMessage(event: WebViewMessageEvent) {
    try {
      const data = JSON.parse(event.nativeEvent.data) as { type: string; id: string };
      if (data.type === 'selectProperty') {
        onSelectProperty(data.id);
      }
    } catch {
      // Ignore malformed messages from the map page.
    }
  }

  return (
    <WebView
      originWhitelist={['*']}
      source={{ html: buildMapHtml(accessToken, markers) }}
      onMessage={handleMessage}
      style={{ flex: 1 }}
    />
  );
}
