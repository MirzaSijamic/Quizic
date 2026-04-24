import { useEffect } from 'react';

const DifyChatbot = () => {
  useEffect(() => {
    const initFlag = '__difyEmbedInitialized';
    const token = import.meta.env.VITE_DIFY_TOKEN as string | undefined;

    if (!token) {
      console.warn('[DifyChatbot] VITE_DIFY_TOKEN is not set. Chatbot will not be initialized.');
      return;
    }

    const scriptId = `dify-embed-${token}`;

    if ((window as any)[initFlag]) {
      console.info('[DifyChatbot] Embed already initialized, skipping');
      return;
    }

    (window as any).difyChatbotConfig = {
      token,
      dynamicScript: true,
    };
    console.info('[DifyChatbot] Initializing Dify embed', {
      token,
      host: window.location.host,
      protocol: window.location.protocol,
    });

    const existingScript = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (existingScript) {
      console.info('[DifyChatbot] Embed script already present, skipping reinjection');
      (window as any)[initFlag] = true;
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://udify.app/embed.min.js';
    script.id = scriptId;
    script.defer = true;

    script.onload = () => {
      (window as any)[initFlag] = true;
      console.info('[DifyChatbot] Embed script loaded successfully');

      // The embed script should create this floating button in document.body.
      window.setTimeout(() => {
        const button = document.getElementById('dify-chatbot-bubble-button');
        const iframe = document.getElementById('dify-chatbot-bubble-window');

        if (!button) {
          console.error('[DifyChatbot] Script loaded, but chatbot button was not created.');
          console.error('[DifyChatbot] Likely causes: invalid token, unpublished bot, or domain not allow-listed in Dify.');
          return;
        }

        console.info('[DifyChatbot] Chatbot button is present in DOM');
        if (iframe) {
          console.info('[DifyChatbot] Chatbot iframe is already present in DOM');
        }
      }, 1200);
    };

    script.onerror = (event) => {
      console.error('[DifyChatbot] Failed to load embed script', event);
      console.error('[DifyChatbot] Check ad-blockers, CSP, and Dify domain allow-list');
    };

    document.body.appendChild(script);

    return;
  }, []);

  return null; // This component doesn't render any visible UI itself
};

export default DifyChatbot;