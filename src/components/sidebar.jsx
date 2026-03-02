import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  HomeIcon,
  FilePlus,
  FileInput,
  FileOutput,
  Settings,
  LogOut,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const linkBase =
  "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200";
const activeState =
  "bg-white text-slate-900 shadow-lg shadow-blue-100 border border-blue-100";
const idleState =
  "text-white/80 hover:text-white hover:bg-white/10 border border-transparent";

const Sidebar = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/");
  };

  const navItems = [
    { to: "/admin/dashboard", label: "Dashboard", icon: HomeIcon },
    { to: "/admin/add", label: "Add Documents", icon: FilePlus },
    { to: "/admin/incoming", label: "Incoming", icon: FileInput },
    { to: "/admin/outgoing", label: "Outgoing", icon: FileOutput },
    { to: "/admin/incoming-ro", label: "Incoming from RO", icon: FileInput },
  ];

  return (
    <aside className="flex h-full flex-col rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-900 p-5 shadow-2xl">
      <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 p-4 text-white shadow-lg">
        <p className="text-xs uppercase tracking-[0.35em] text-blue-100">
          Admin Panel
        </p>
        <h2 className="text-2xl font-semibold">Control Center</h2>
        <p className="text-sm text-blue-100/90">
          Monitor, manage, and move documents with ease.
        </p>
      </div>

      <nav className="mt-6 flex-1 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `${linkBase} ${isActive ? activeState : idleState}`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={18}
                  className={`transition-colors ${
                    isActive ? "text-slate-900" : "text-white/80 group-hover:text-white"
                  }`}
                />
                <span
                  className={`transition-colors ${
                    isActive ? "text-slate-900" : "text-white/90 group-hover:text-white"
                  }`}
                >
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}

        <div className="pt-4">
          <button
            onClick={() => setIsSettingsOpen((prev) => !prev)}
            className={`${linkBase} w-full ${isSettingsOpen ? activeState : idleState} justify-between`}
          >
            <span className="flex items-center gap-3 text-left text-white">
              <Settings size={18} className="text-white/70" />
              Settings
            </span>
            {isSettingsOpen ? (
              <ChevronUp size={18} className="text-white/70" />
            ) : (
              <ChevronDown size={18} className="text-white/70" />
            )}
          </button>
          <div
            className={`overflow-hidden transition-all duration-200 ${isSettingsOpen ? "mt-2 max-h-40" : "max-h-0"}`}
          >
            <NavLink
              to="/admin/settings/add-agency"
              className={({ isActive }) =>
                `ml-4 mt-2 block rounded-xl border px-3 py-2 text-sm ${isActive ? "border-blue-100 bg-white text-blue-700 shadow" : "border-white/10 text-white/70 hover:border-white/30 hover:bg-white/10"}`
              }
            >
              Add Agency
            </NavLink>
            <NavLink
              to="/admin/settings/add-receiver"
              className={({ isActive }) =>
                `ml-4 mt-2 block rounded-xl border px-3 py-2 text-sm ${isActive ? "border-blue-100 bg-white text-blue-700 shadow" : "border-white/10 text-white/70 hover:border-white/30 hover:bg-white/10"}`
              }
            >
              Add Receiver
            </NavLink>
          </div>
        </div>
      </nav>

      <button
        onClick={handleLogout}
        className="mt-4 flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-3 py-2 text-sm font-medium text-white/80 transition-all hover:bg-white/20"
      >
        <LogOut size={18} />
        Logout
      </button>
    </aside>
  );
};

export default Sidebar;
