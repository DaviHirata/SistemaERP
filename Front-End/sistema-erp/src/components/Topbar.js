export default function Topbar({ user }) {
  return (
    <div className="bg-blue-800 h-14 px-6 flex justify-between items-center">
      {/* Lado esquerdo: Logo da empresa */}
      <div className="text-white font-bold text-lg">
        {/* Substituir por <img src="/logo.png" /> */}
        Sistema ERP
      </div>

      {/* Lado direito: Usuário */}
      <div className="flex items-center space-x-2">
        {user?.photoUrl ? (
          <img
            src={user.photoUrl}
            alt="User"
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
            {user?.name?.charAt(0).toUpperCase() || "?"}
          </div>
        )}
        <span className="text-blue-300">{user?.name || "Usuário"}</span>
      </div>
    </div>
  );
}