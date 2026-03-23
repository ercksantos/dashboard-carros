import { BarChart2 } from "lucide-react";

export default function RelatoriosPage() {
    return (
        <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] gap-4" style={{ color: '#e8eaf0' }}>
            <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(26,122,255,0.1)' }}
            >
                <BarChart2 className="w-8 h-8" style={{ color: '#1a7aff' }} />
            </div>
            <h1 className="text-2xl font-bold" style={{ color: '#e8eaf0' }}>Relatórios</h1>
            <p className="text-sm text-center max-w-xs" style={{ color: '#6b7280' }}>
                Esta funcionalidade está em desenvolvimento e estará disponível em breve.
            </p>
        </div>
    );
}
