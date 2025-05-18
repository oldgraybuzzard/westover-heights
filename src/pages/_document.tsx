import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        {/* Add preconnect for Google services */}
        <link rel="preconnect" href="https://www.google.com" />
        <link rel="preconnect" href="https://www.gstatic.com" crossOrigin="anonymous" />
        
        {/* Add custom styles for reCAPTCHA badge */}
        <style dangerouslySetInnerHTML={{
          __html: `
            .grecaptcha-badge { 
              visibility: hidden;
              opacity: 0;
              transition: linear opacity 1s;
            }
            .grecaptcha-badge.show {
              visibility: visible;
              opacity: 1;
            }
          `
        }} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
