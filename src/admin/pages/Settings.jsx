import { useEffect, useState } from "react";
import { cn } from "../../lib/utils";
import { useLanguage } from "../../i18n/LanguageContext";

const notifications = [
  { label: "New Reader", desc: "When someone starts reading your book", active: true },
  { label: "Book Approved", desc: "When admin approves your submission", active: true },
  { label: "Weekly Report", desc: "Weekly analytics summary email", active: false },
  { label: "New Comment", desc: "When someone comments on your book", active: true },
];

const ADMIN_THEME_KEY = "admin-theme";

const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "km", label: "Khmer" },
  { value: "zh", label: "Chinese (China)" },
];

const Settings = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [theme, setTheme] = useState(() => {
    const savedTheme = window.localStorage.getItem(ADMIN_THEME_KEY);
    return savedTheme === "light" ? "light" : "dark";
  });
  const { language, setLanguage, t } = useLanguage();
  const [msg, setMsg] = useState({ type: "", text: "" });

  useEffect(() => {
    window.localStorage.setItem(ADMIN_THEME_KEY, theme);
    if (theme === "light") {
      document.documentElement.setAttribute("data-theme", "light");
      return;
    }

    document.documentElement.removeAttribute("data-theme");
  }, [theme]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: "", text: "" });

    const token =
      window.localStorage.getItem("bookhub_token") ||
      window.sessionStorage.getItem("bookhub_token");
    if (!token) {
      setMsg({ type: "error", text: t("Missing login token. Please login again.") });
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:8000/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      let data = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (!res.ok || !data.success) {
        setMsg({
          type: "error",
          text: data.message || `Password update failed (HTTP ${res.status}).`,
        });
        return;
      }

      setMsg({ type: "success", text: data.message || t("Password updated successfully.") });

      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      setMsg({
        type: "error",
        text: error?.message || t("Network error. Please try again."),
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <div className="glass-card p-6">
          <h3 className="text-xl font-bold mb-6">{t("Notifications")}</h3>
          <div className="space-y-6">
            {notifications.map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div>
                  <p className="font-bold">{t(item.label)}</p>
                  <p className="text-sm text-slate-500">{t(item.desc)}</p>
                </div>
                <button className={cn("w-12 h-6 rounded-full transition-colors relative", item.active ? "bg-purple-500" : "bg-white/10")}>
                  <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all", item.active ? "right-1" : "left-1")} />
                </button>
              </div>
            ))}
          </div>
          <button className="mt-8 w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 rounded-xl">
            {t("Save Notifications")}
          </button>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-xl font-bold mb-6">{t("Change Password")}</h3>
          <form className="space-y-4" onSubmit={onSubmit}>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder={t("Current password")}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3"
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={t("New password")}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t("Confirm new password")}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3"
            />

            {msg.text && (
              <p className={msg.type === "success" ? "text-green-400" : "text-red-400"}>
                {msg.text}
              </p>
            )}

            <button type="submit" className="mt-4 w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 rounded-xl">
              {t("Update Password")}
            </button>
          </form>
        </div>
      </div>

      <div className="space-y-8">
        <div className="glass-card p-6">
          <h3 className="text-xl font-bold mb-6">{t("Preferences")}</h3>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">{t("Preferred Language")}</label>
              <select
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-slate-300"
              >
                {LANGUAGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {t(option.label)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">{t("Theme")}</label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-white/5 rounded-xl">
                <button
                  type="button"
                  onClick={() => setTheme("dark")}
                  className={cn(
                    "py-2 text-xs font-bold rounded-lg transition-colors",
                    theme === "dark" ? "bg-purple-500 text-white" : "text-slate-400 hover:text-white",
                  )}
                >
                  {t("Dark")}
                </button>
                <button
                  type="button"
                  onClick={() => setTheme("light")}
                  className={cn(
                    "py-2 text-xs font-bold rounded-lg transition-colors",
                    theme === "light" ? "bg-purple-500 text-white" : "text-slate-400 hover:text-white",
                  )}
                >
                  {t("Light")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
