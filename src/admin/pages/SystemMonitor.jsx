import { Activity, Database, HardDrive, Mail, Search, Server } from "lucide-react";
import { motion } from "motion/react";
import HealthItem from "../components/HealthItem";
import { ACTIVITY_LOGS } from "../data/mockData";
import { cn } from "../../lib/utils";
import { useLanguage } from "../../i18n/LanguageContext";

const resources = [
  { label: "CPU Usage", value: "42%", className: "bg-purple-500" },
  { label: "Memory", value: "78%", className: "bg-pink-500" },
  { label: "Disk Usage", value: "55%", className: "bg-orange-500" },
  { label: "Network I/O", value: "23%", className: "bg-green-500" },
];

const SystemMonitor = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-card p-6">
            <h3 className="text-xl font-bold mb-8">{t("System Resources")}</h3>
            <div className="space-y-6">
              {resources.map((resource) => (
                <div key={resource.label}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-slate-400">{t(resource.label)}</p>
                    <p className="text-sm font-bold">{resource.value}</p>
                  </div>
                  <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: resource.value }}
                      className={cn("h-full", resource.className)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-xl font-bold mb-6">{t("Live Activity Log")}</h3>
            <div className="space-y-4 font-mono text-xs">
              {ACTIVITY_LOGS.map((log, i) => (
                <div key={i} className="flex gap-4 p-2 rounded bg-white/2 border-l-2 border-slate-500">
                  <span className="text-slate-500">{log.time}</span>
                  <span
                    className={cn(
                      "font-bold",
                      log.type === "INFO"
                        ? "text-blue-400"
                        : log.type === "WARN"
                          ? "text-orange-400"
                          : log.type === "ERROR"
                            ? "text-red-400"
                            : "text-purple-400",
                    )}
                  >
                    {log.type}
                  </span>
                  <span className="text-slate-300">{log.msg}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="glass-card p-6">
            <h3 className="text-xl font-bold mb-6">{t("Services Status")}</h3>
            <div className="space-y-1">
              <HealthItem label={t("API Server")} value="12ms" status="online" icon={Server} />
              <HealthItem label={t("Database")} value="4ms" status="online" icon={Database} />
              <HealthItem label={t("File Storage")} value="78%" status="warning" icon={HardDrive} />
              <HealthItem label={t("Gutenberg API")} value={t("Timeout")} status="error" icon={Activity} />
              <HealthItem label={t("Open Library API")} value="145ms" status="online" icon={Search} />
              <HealthItem label={t("Email Service")} value="67ms" status="online" icon={Mail} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemMonitor;
