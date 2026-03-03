import React from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/sidebar";

const Layout = ({ children }) => {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-950 text-slate-100">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <div className="w-72 shrink-0 border-r border-slate-800 bg-slate-950/70 px-3 py-4">
          <Sidebar />
        </div>

        <main className="flex-1 overflow-auto bg-slate-900/40 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
