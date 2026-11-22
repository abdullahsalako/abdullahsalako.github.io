/* Shared Google Analytics bootstrap for every public page. */
window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }
var analyticsScript = document.createElement('script');
analyticsScript.async = true;
analyticsScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-TH2S1CQT9B';
document.head.appendChild(analyticsScript);
gtag('js', new Date());
gtag('config', 'G-TH2S1CQT9B');
