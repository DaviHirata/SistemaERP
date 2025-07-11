import { Home, ClipboardList, ListCheck, FolderCog, LogOut, UserCog, ChartColumn, Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';

export default function Sidebar() {
    const router = useRouter();
    const { user } = useUser();

    const isAdmin = user?.tipoUsuario === 'administrador' || user?.tipoUsuario === 'presidente';

    const handleHome = () => {
        router.push("/");
    }

    const handleLogout = () => {
        // Limpar dados do LocalStorage
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");

        // Limpar outros dados relacionados a usuário
        localStorage.removeItem("sessaoId");
        
        router.push("/login");

        console.log("Logout realizado com sucesso");
    }

    const handleTarefas = () => {
        router.push("/tarefas");
    }

    const handleConcluidas = () => {
        router.push("/concluidas");
    }

    const handleGerenciarTarefas = () => {
        router.push("/gerenciarTarefas");
    }

    const handleGerenciarUsuario = () => {
        router.push("/gerenciarUsuarios");
    }

    const handleRelatorios = () => {
        router.push("/relatorio");
    }

    const handleNotificacoes = () => {
        router.push("/notificacao");
    }

     return (
        <div className="fixed left-0 top-16 w-20 flex flex-col items-center py-6 z-50" style={{backgroundColor: '#002E6B', height: 'calc(100vh - 4rem)'}}>            
            {/* Navigation Icons */}
            <div className="flex flex-col space-y-4 flex-1">
                {/* Home Button */}
                <button 
                    onClick={handleHome}
                    className="w-12 h-12 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors"
                    style={{backgroundColor: 'rgba(255,255,255,0.1)'}}
                >
                    <Home size={20} className="text-white" />
                </button>

                <button
                    onClick={handleTarefas}
                    className="w-12 h-12 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors"
                    style={{backgroundColor: 'rgba(255,255,255,0.1)'}}
                >
                    <ClipboardList size={20} className="text-white"/>
                </button>

                {isAdmin && (
                    <>
                        <button
                            onClick={handleConcluidas}
                            className="w-12 h-12 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors"
                            style={{backgroundColor: 'rgba(255,255,255,0.1)'}}
                        >
                            <ListCheck size={20} className="text-white"/>
                        </button>

                        <button
                            onClick={handleGerenciarTarefas}
                            className="w-12 h-12 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors"
                            style={{backgroundColor: 'rgba(255,255,255,0.1)'}}
                        >
                            <FolderCog size={20} className="text-white"/>
                        </button>

                        <button
                            onClick={handleGerenciarUsuario}
                            className="w-12 h-12 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors"
                            style={{backgroundColor: 'rgba(255,255,255,0.1)'}}
                        >
                            <UserCog size={20} className="text-white"/>
                        </button>

                        <button
                            onClick={handleRelatorios}
                            className="w-12 h-12 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors"
                            style={{backgroundColor: 'rgba(255,255,255,0.1)'}}
                        >
                            <ChartColumn size={20} className="text=white"/>
                        </button>
                    </>
                )}

                <button
                    onClick={handleNotificacoes}
                    className="w-12 h-12 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors"
                    style={{backgroundColor: 'rgba(255,255,255,0.1)'}}
                >
                    <Bell size={20} className="text=white"/>
                </button>
            </div>
            
            {/* Logout Button */}
            <button 
                onClick={handleLogout}
                className="w-12 h-12 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors mt-auto"
                style={{backgroundColor: 'rgba(255,255,255,0.1)'}}
            >
                <LogOut size={20} className="text-white" />
            </button>
        </div>
    );
}