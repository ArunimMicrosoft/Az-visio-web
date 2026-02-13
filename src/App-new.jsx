import { useState, useRef } from 'react';
import './App.css';

function App() {
  const [items, setItems] = useState([]);
  
  return (
    <div style={{ padding: '40px', background: '#0078D4', minHeight: '100vh', color: 'white', fontSize: '24px' }}>
      <h1>✅ REACT IS WORKING!</h1>
      <p>If you see this, React is rendering successfully.</p>
      <p>Items: {items.length}</p>
      <button 
        onClick={() => setItems([...items, { id: Date.now() }])}
        style={{ padding: '15px 30px', fontSize: '18px', cursor: 'pointer', background: 'white', color: '#0078D4', border: 'none', borderRadius: '5px' }}
      >
        Click to test state (Items: {items.length})
      </button>
    </div>
  );
}

export default App;
