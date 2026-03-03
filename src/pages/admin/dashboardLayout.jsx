import React from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/sidebar";

const DashboardLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <div className="hidden w-72 shrink-0 border-r border-slate-800 bg-slate-950/70 px-3 py-4 lg:block">
          <Sidebar />
        </div>

        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gradient-to-b from-slate-950/10 to-slate-950/40 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
