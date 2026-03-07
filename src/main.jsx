import { createRoot } from 'react-dom/client'
import './index.css'
import './responsive.css'
import AppWithAuth from './AppWithAuth.jsx'

console.log('=== MAIN.JSX LOADING ===');

const rootElement = document.getElementById('root');
console.log('Root element:', rootElement);

if (!rootElement) {
  console.error('ROOT ELEMENT NOT FOUND!');
  document.body.innerHTML = '<div style="padding: 20px; color: red; background: yellow;"><h1>Error: Root element not found!</h1></div>';
} else {
  try {
    console.log('Attempting to render AppWithAuth...');
    createRoot(rootElement).render(<AppWithAuth />);
    console.log('AppWithAuth rendered successfully!');
  } catch (error) {
    console.error('RENDER ERROR:', error);
    document.body.innerHTML = `<div style="padding: 20px; color: red; background: yellow; font-family: monospace;"><h1>Error rendering app:</h1><pre>${error.message}\n${error.stack}</pre></div>`;
  }
}
