
import React, { useEffect } from 'react';

const Advertisement: React.FC = () => {
  useEffect(() => {
    // Async load Google AdSense script
    const loadAdsScript = () => {
      const script = document.createElement('script');
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
      script.async = true;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
    };

    // Load ads after main content
    if (document.readyState === 'complete') {
      loadAdsScript();
    } else {
      window.addEventListener('load', loadAdsScript);
    }

    return () => {
      window.removeEventListener('load', loadAdsScript);
    };
  }, []);

  return (
    <div className="w-full h-16 bg-gray-200 flex items-center justify-center border border-gray-300 rounded-md">
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-4358788562530186"
        data-ad-slot="XXXXXXXXXX"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default Advertisement;
