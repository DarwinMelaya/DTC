import {
  ChevronDown,
  ChevronUp,
  FileInput,
  HomeIcon,
  LogOut,
  Settings,
} from "lucide-react";
import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

const linkBase =
  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors";
const activeState =
  "bg-slate-800 text-slate-50 border border-slate-700 shadow-sm";
const idleState =
  "text-slate-300 hover:text-slate-50 hover:bg-slate-800/70 border border-transparent";

const Sidebar = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPstoOpen, setIsPstoOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/");
  };

  const navItems = [
    { to: "/admin/dashboard", label: "Dashboard", icon: HomeIcon },
    { to: "/admin/incoming-ro", label: "Incoming from RO", icon: FileInput },
  ];

  return (
    <aside className="flex h-full flex-col gap-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur">
      <div className="rounded-xl border border-white/10 bg-gradient-to-r from-sky-500 via-blue-600 to-blue-700 p-4 text-white shadow">
        <p className="text-xs font-medium uppercase tracking-[0.35em] text-blue-100/90">
          Admin Panel
        </p>
        <h2 className="mt-1 text-xl font-semibold">Control Center</h2>
        <p className="mt-1 text-xs text-blue-100/90">
          Monitor, manage, and move documents with ease.
        </p>
      </div>

      <nav className="flex-1 space-y-1">
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
                    isActive
                      ? "text-slate-50"
                      : "text-slate-400 group-hover:text-slate-50"
                  }`}
                />
                <span
                  className={`transition-colors ${
                    isActive
                      ? "text-slate-50"
                      : "text-slate-200 group-hover:text-slate-50"
                  }`}
                >
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}

        <div className="pt-2">
          <button
            onClick={() => setIsPstoOpen((prev) => !prev)}
            className={`${linkBase} w-full ${
              isPstoOpen ? activeState : idleState
            } justify-between`}
          >
            <span className="flex items-center gap-3 text-left">
              <FileInput
                size={18}
                className="text-slate-400 group-hover:text-slate-50"
              />
              PSTO
            </span>
            {isPstoOpen ? (
              <ChevronUp size={18} className="text-slate-400" />
            ) : (
              <ChevronDown size={18} className="text-slate-400" />
            )}
          </button>
          <div
            className={`overflow-hidden transition-all duration-200 ${
              isPstoOpen ? "mt-2 max-h-40" : "max-h-0"
            }`}
          >
            <NavLink
              to="/admin/incoming"
              className={({ isActive }) =>
                `ml-4 mt-2 block rounded-lg border px-3 py-2 text-xs ${
                  isActive
                    ? "border-slate-700 bg-slate-800 text-slate-50 shadow-sm"
                    : "border-slate-800 text-slate-300 hover:border-slate-600 hover:bg-slate-800/70"
                }`
              }
            >
              Incoming
            </NavLink>
            <NavLink
              to="/admin/outgoing"
              className={({ isActive }) =>
                `ml-4 mt-2 block rounded-lg border px-3 py-2 text-xs ${
                  isActive
                    ? "border-slate-700 bg-slate-800 text-slate-50 shadow-sm"
                    : "border-slate-800 text-slate-300 hover:border-slate-600 hover:bg-slate-800/70"
                }`
              }
            >
              Outgoing
            </NavLink>
          </div>
        </div>

        <div className="pt-4">
          <button
            onClick={() => setIsSettingsOpen((prev) => !prev)}
            className={`${linkBase} w-full ${
              isSettingsOpen ? activeState : idleState
            } justify-between`}
          >
            <span className="flex items-center gap-3 text-left">
              <Settings
                size={18}
                className="text-slate-400 group-hover:text-slate-50"
              />
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
                `ml-4 mt-2 block rounded-lg border px-3 py-2 text-xs ${
                  isActive
                    ? "border-slate-700 bg-slate-800 text-slate-50 shadow-sm"
                    : "border-slate-800 text-slate-300 hover:border-slate-600 hover:bg-slate-800/70"
                }`
              }
            >
              Add Agency
            </NavLink>
            <NavLink
              to="/admin/settings/add-receiver"
              className={({ isActive }) =>
                `ml-4 mt-2 block rounded-lg border px-3 py-2 text-xs ${
                  isActive
                    ? "border-slate-700 bg-slate-800 text-slate-50 shadow-sm"
                    : "border-slate-800 text-slate-300 hover:border-slate-600 hover:bg-slate-800/70"
                }`
              }
            >
              Add Receiver
            </NavLink>
          </div>
        </div>
      </nav>

      <button
        onClick={handleLogout}
        className="mt-2 flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs font-medium text-slate-200 transition-colors hover:bg-red-500/90 hover:text-white hover:border-red-500"
      >
        <LogOut size={16} />
        Logout
      </button>
    </aside>
  );
};

export default Sidebar;
