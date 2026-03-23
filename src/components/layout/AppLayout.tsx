import { Sidebar } from "./Sidebar";

interface AppLayoutProps {
    children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
    return (
        <div className="flex min-h-screen" style={{ background: "#0f1117" }}>
            <Sidebar />
            {/* Content pushed right by sidebar width */}
            <main className="flex-1 ml-60 min-h-screen overflow-x-hidden">
                {children}
            </main>
        </div>
    );
}
