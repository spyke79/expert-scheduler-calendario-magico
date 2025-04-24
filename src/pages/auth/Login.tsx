
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // For demo purposes, we'll just simulate login
    if (email && password) {
      // In a real application, we would validate credentials with the backend
      const isAdmin = email.includes("admin");
      
      setTimeout(() => {
        toast.success("Login effettuato con successo");
        localStorage.setItem("userRole", isAdmin ? "admin" : "expert");
        navigate(isAdmin ? "/dashboard" : "/expert-dashboard");
        setIsLoading(false);
      }, 1000);
    } else {
      toast.error("Inserisci email e password");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">Calendario Magico</h1>
          <p className="text-gray-600 mt-2">Gestione esperti e corsi di formazione</p>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-2xl font-semibold mb-6 text-center">Accedi</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tua@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Button
                    type="button"
                    variant="link"
                    className="text-sm text-primary"
                    onClick={() => toast.info("Funzionalità in arrivo")}
                  >
                    Password dimenticata?
                  </Button>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <Button className="w-full mt-6" type="submit" disabled={isLoading}>
              {isLoading ? "Accesso in corso..." : "Accedi"}
            </Button>
          </form>
        </div>
        
        <p className="text-center mt-4 text-sm text-gray-600">
          &copy; {new Date().getFullYear()} Calendario Magico - Tutti i diritti riservati
        </p>
      </div>
    </div>
  );
};

export default Login;
