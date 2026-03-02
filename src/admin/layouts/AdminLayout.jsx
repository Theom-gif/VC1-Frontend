import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

export default function AdminLayout() {
  return (
    <div className="admin-shell min-h-screen flex bg-bg-dark">
      <Sidebar />
      <main className="admin-main flex-1 ml-64 p-8">
        <Header />
        <Outlet />
      </main>
    </div>
  );
}
