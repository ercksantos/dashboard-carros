import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Users,
    Calendar,
    Car,
    BarChart2,
    Settings,
    LogOut,
    Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const NAV_ITEMS = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/leads", label: "Leads", icon: Users, badge: true },
    { to: "/agendamentos", label: "Agendamentos", icon: Calendar },
    { to: "/carros", label: "Veículos", icon: Car },
    { to: "/relatorios", label: "Relatórios", icon: BarChart2 },
    { to: "/configuracoes", label: "Configurações", icon: Settings },
];

export function Sidebar() {
    const navigate = useNavigate();
    const [newLeadsCount, setNewLeadsCount] = useState(0);

    // Count leads with etapa='novo' for the badge
    useEffect(() => {
        const fetchNewLeads = async () => {
            const { count } = await supabase
                .from("leads")
                .select("*", { count: "exact", head: true })
                .eq("etapa", "novo");
            setNewLeadsCount(count ?? 0);
        };

        fetchNewLeads();

        const channel = supabase
            .channel("sidebar-leads")
            .on("postgres_changes", { event: "*", schema: "public", table: "leads" }, fetchNewLeads)
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            toast.error("Erro ao sair");
        } else {
            navigate("/auth");
        }
    };

    return (
        <aside
            className="fixed left-0 top-0 h-screen w-60 flex flex-col z-40 border-r"
            style={{
                background: "#161b27",
                borderColor: "rgba(255,255,255,0.06)",
            }}
        >
            {/* Logo */}
            <div className="flex items-center gap-2.5 px-5 py-5 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: "#1a7aff" }}
                >
                    <Zap className="w-4 h-4 text-white" />
                </div>
                <div>
                    <p className="text-sm font-bold text-white leading-tight">AutoCarros</p>
                    <p className="text-[10px]" style={{ color: "#6b7280" }}>Concessionária</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-0.5">
                {NAV_ITEMS.map(({ to, label, icon: Icon, badge }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative",
                                isActive
                                    ? "text-white"
                                    : "hover:bg-white/5"
                            )
                        }
                        style={({ isActive }) => isActive
                            ? { background: "rgba(26,122,255,0.15)", color: "#1a7aff" }
                            : { color: "#6b7280" }
                        }
                    >
                        {({ isActive }) => (
                            <>
                                {/* Active bar */}
                                {isActive && (
                                    <span
                                        className="absolute left-0 inset-y-1 w-0.5 rounded-full"
                                        style={{ background: "#1a7aff" }}
                                    />
                                )}
                                <Icon className="w-4 h-4 flex-shrink-0" />
                                <span className="flex-1">{label}</span>
                                {badge && newLeadsCount > 0 && (
                                    <span
                                        className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white"
                                        style={{ background: "#1a7aff" }}
                                    >
                                        {newLeadsCount}
                                    </span>
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Logout */}
            <div className="px-3 py-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-white/5"
                    style={{ color: "#6b7280" }}
                >
                    <LogOut className="w-4 h-4 flex-shrink-0" />
                    <span>Sair</span>
                </button>
            </div>
        </aside>
    );
}
