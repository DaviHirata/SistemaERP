import { Home, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Sidebar() {
    const router = useRouter();

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
                
                {/* Additional menu items - you can add more buttons here */}
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{backgroundColor: 'rgba(255,255,255,0.1)'}}>
                    <div className="w-6 h-6 rounded-full" style={{backgroundColor: 'rgba(255,255,255,0.2)'}}></div>
                </div>
                
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{backgroundColor: 'rgba(255,255,255,0.1)'}}>
                    <div className="w-6 h-6 rounded-full" style={{backgroundColor: 'rgba(255,255,255,0.2)'}}></div>
                </div>
                
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{backgroundColor: 'rgba(255,255,255,0.1)'}}>
                    <div className="w-6 h-6 rounded-full" style={{backgroundColor: 'rgba(255,255,255,0.2)'}}></div>
                </div>
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