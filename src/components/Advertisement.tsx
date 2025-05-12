
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
};

export default Advertisement;
