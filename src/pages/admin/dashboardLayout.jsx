import React from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/sidebar";

const DashboardLayout = ({ children }) => {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 bg-blue-800 text-white p-6">
          <Sidebar />
        </aside>

        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
