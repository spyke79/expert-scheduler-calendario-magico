
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import DatabaseService from './services/database'

// Initialize database
const dbService = DatabaseService.getInstance();
dbService.init().catch(err => {
  console.error("Failed to initialize database:", err);
});

createRoot(document.getElementById("root")!).render(<App />);
