
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import DatabaseService from './services/database'

// Initialize database with configuration
const dbService = DatabaseService.getInstance();
dbService.setConfig({
  host: import.meta.env.VITE_DB_HOST || 'localhost',
  user: import.meta.env.VITE_DB_USER || 'root',
  password: import.meta.env.VITE_DB_PASSWORD || '',
  database: import.meta.env.VITE_DB_NAME || 'school_management',
  port: Number(import.meta.env.VITE_DB_PORT || 3306)
});

createRoot(document.getElementById("root")!).render(<App />);
