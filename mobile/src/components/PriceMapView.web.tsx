import { useEffect, useMemo, useRef } from 'react';

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

  return (
    <iframe
      ref={iframeRef}
      srcDoc={html}
      title="Map"
      style={{ flex: 1, width: '100%', height: '100%', border: 'none' }}
    />
  );
}
