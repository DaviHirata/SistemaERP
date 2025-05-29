import { Home, LogOut, Circle } from 'lucide-react';

export default function Sidebar() {
    return (
        <div className="w-20 bg-blue-800 flex flex-col items-center py-4 space-y-6">
            <Home className="text-white w-6 h-6 cursor-pointer" />
            <LogOut className="text-white w-6 h-6 mt-auto cursor-pointer" />
        </div>
    );
}