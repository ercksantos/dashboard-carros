import { Car, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { NavLink } from "@/components/NavLink";

export const Header = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Erro ao sair");
      return;
    }
    toast.success("Logout realizado com sucesso");
    navigate("/auth");
  };

  return (
    <header className="sticky top-0 z-50 glass-card border-b border-border/50 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          
          {/* Logo clicável */}
          <NavLink
            to="/dashboard"
            className="flex items-center gap-3 group cursor-pointer select-none 
                       transition-all duration-200 hover:text-primary active:scale-[0.97]"
          >
            <div className="gradient-primary p-2 rounded-lg glow-primary 
                            transition-transform group-hover:scale-110">
              <Car className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground transition-colors 
                             group-hover:text-primary">
                Concessionária Inteligente
              </h1>
              <p className="text-xs text-muted-foreground">Painel de Gerenciamento</p>
            </div>
          </NavLink>

          {/* Botão de Logout */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLogout}
            className="transition-all duration-200 hover:text-destructive active:scale-[0.97]"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>
    </header>
  );
};
