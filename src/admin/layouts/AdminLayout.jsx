import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

const ADMIN_THEME_KEY = "admin-theme";

export default function AdminLayout() {
  useEffect(() => {
    const savedTheme = window.localStorage.getItem(ADMIN_THEME_KEY);

    if (savedTheme === "light") {
      document.documentElement.setAttribute("data-theme", "light");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }, []);

  return (
    <div className="min-h-screen flex bg-bg-dark">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <Header />
        <Outlet />
      </main>
    </div>
  );
}
