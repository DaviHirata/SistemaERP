"use client";

import { useUser } from "@/context/UserContext";

export default function Topbar() {
  const { user } = useUser();

  return (
    <div className="fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-6 z-40 border-b-2" style={{backgroundColor: '#002E6B', borderBottomColor: '#004DB3'}}>
      <div className="flex items-center">
        <h1 className="text-white text-xl font-semibold">Sistema ERP</h1>
      </div>
      <div className="flex items-center space-x-3">
        {/*{user?.photoUrl ? (
          <img 
            src={user.photoUrl} 
            alt="User" 
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <span className="font-semibold text-sm" style={{color: '#002E6B'}}>
              {user?.nomeCompleto?.charAt(0).toUpperCase() || "?"}
            </span>
          </div>
        )}*/}
        <span className="text-white text-sm">
          {user?.nomeCompleto || "Usuário"}
        </span>
      </div>
    </div>
  );
}