import { useEffect, useMemo, useRef } from 'react';
import { View } from 'react-native';

import { buildMapHtml, type MapMarker } from './mapHtml';

// react-native-webview has no react-native-web implementation — a plain
// <iframe srcDoc> renders the same generated HTML directly, which is why
// this file exists as the .web platform variant of PriceMapView.
export default function PriceMapView({
  accessToken,
  markers,
  onSelectProperty,
}: {
  accessToken: string;
  markers: MapMarker[];
  onSelectProperty: (id: string) => void;
}) {
  const html = useMemo(() => buildMapHtml(accessToken, markers), [accessToken, markers]);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.source !== iframeRef.current?.contentWindow) return;
      const data = event.data as { type?: string; id?: string };
      if (data?.type === 'selectProperty' && data.id) {
        onSelectProperty(data.id);
      }
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onSelectProperty]);

  // Percentage-height chains (height: '100%' up through every ancestor)
  // don't reliably resolve through react-native-web's flex containers here
  // — absolute-fill inside a relatively positioned flex-1 View sidesteps
  // that entirely and reliably fills whatever space the caller gives it.
  return (
    <View style={{ flex: 1, position: 'relative' }}>
      <iframe
        ref={iframeRef}
        srcDoc={html}
        title="Map"
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', border: 'none' }}
      />
    </View>
  );
}
