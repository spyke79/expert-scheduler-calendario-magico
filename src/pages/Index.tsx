
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    if (userRole === 'admin') {
      navigate('/dashboard');
    } else if (userRole === 'expert') {
      navigate('/expert-dashboard');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white">
      <div className="text-center max-w-3xl px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">Calendario Magico</h1>
        <p className="text-xl text-gray-700 mb-8">
          La piattaforma per la gestione degli esperti e dei corsi di formazione per le scuole
        </p>
        
        <div className="grid gap-6 md:grid-cols-2 max-w-lg mx-auto">
          <Button 
            size="lg" 
            className="h-14 text-lg" 
            onClick={() => navigate('/login')}
          >
            Accedi
          </Button>
        </div>
        
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-sm">
            <div className="rounded-full bg-blue-100 p-3 mb-4">
              <School className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">Gestione Scuole</h3>
            <p className="text-gray-500 text-center">
              Registra le scuole e i plessi per organizzare i corsi
            </p>
          </div>
          
          <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-sm">
            <div className="rounded-full bg-blue-100 p-3 mb-4">
              <User className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">Gestione Esperti</h3>
            <p className="text-gray-500 text-center">
              Cataloga gli esperti e le loro competenze
            </p>
          </div>
          
          <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-sm">
            <div className="rounded-full bg-blue-100 p-3 mb-4">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">Pianifica Corsi</h3>
            <p className="text-gray-500 text-center">
              Crea e organizza i corsi evitando sovrapposizioni
            </p>
          </div>
        </div>
      </div>
      
      <footer className="mt-auto py-6 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} Calendario Magico - Tutti i diritti riservati
      </footer>
    </div>
  );
};

import { Calendar, School, User } from 'lucide-react';

export default Index;
