
import React, { useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

const Advertisement: React.FC = () => {
  const isMobile = useIsMobile();
  
  useEffect(() => {
    // Async load Google AdSense script
    const loadAdsScript = () => {
      const script = document.createElement('script');
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4358788562530186';
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

  // Temporarily hide the advertisement section
  return null;

  return (
    <div className="w-full flex items-center justify-center border border-gray-300 rounded-md">
      <ins
        className="adsbygoogle"
        style={{ 
          display: 'block',
          width: isMobile ? '320px' : '970px',
          height: isMobile ? '50px' : '90px'
        }}
        data-ad-client="ca-pub-4358788562530186"
        data-ad-slot="1644378831"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );

};

export default Advertisement;
