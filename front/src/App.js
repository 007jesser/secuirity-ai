import React from "react";
import Dashboard from "./pages/Dashboard";

// Import Inter font from Google Fonts
const fontStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;600;700&display=swap');
  
  body {
    font-family: 'Tajawal', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    margin: 0;
    padding: 0;
    direction: rtl;
  }
  
  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  
  ::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: #a1a1a1;
  }
`;

// Add font styles to the document head
const styleElement = document.createElement('style');
styleElement.textContent = fontStyles;
document.head.appendChild(styleElement);

function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Dashboard />
    </div>
  );
}

export default App;
