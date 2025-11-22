import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');

// Check if the root element exists before trying to render.
// Since we are using a standalone HTML file with <div id="app">, this block will likely be skipped
// effectively disabling the React build's interference.
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  // Optional: log that React is inactive if you want to debug, or just leave empty.
  // console.log('React root not found, assuming standalone HTML mode.');
}
