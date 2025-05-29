import Sidebar from './Sidebar.js';
import Topbar from './Topbar.js';

export default function Layout({ children, user }) {
  return (
    <div className="flex h-screen bg-blue-900 text-white">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Topbar user={user} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}