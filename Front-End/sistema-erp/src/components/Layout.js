import Sidebar from './Sidebar.js';
import Topbar from './Topbar.js';
import { useUser } from "@/context/UserContext";

export default function Layout({ children }) {
  const { user } = useUser();
  
    return (
        <div className="min-h-screen" style={{backgroundColor: '#003A86'}}>
            <Sidebar />
            <Topbar user={user} />
            
            {/* Main content area */}
            <div className="ml-20 pt-16">
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
}