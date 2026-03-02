import { Routes, Route, Navigate } from "react-router-dom";
import Incoming from "./pages/admin/Incoming";
import Outgoing from "./pages/admin/Outgoing";
import Admin from "./pages/admin/Admin";
import AdminDashBoard from "./pages/admin/Dashboard";
import Settings from "./pages/admin/settings/Settings";
import AddAgency from "./pages/admin/settings/addAgency";
import AddReceiver from "./pages/admin/settings/addReceiver";
import AddDocuments from "./pages/admin/addDocuments";
import { useAuth } from "./context/AuthContext";
import PropTypes from "prop-types";

const ProtectedRoute = ({ children }) => {
  const { isAdmin } = useAuth();

  return isAdmin ? children : <Navigate to="/" replace />;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

function App() {
  return (
    <div>
      <Routes>

        <Route path="/" element={<Admin />} />
        <Route path="/login" element={<h1>Login Page</h1>} /> 

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashBoard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/incoming"
          element={
            <ProtectedRoute>
              <Incoming />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/outgoing"
          element={
            <ProtectedRoute>
              <Outgoing />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings/add-agency"
          element={
            <ProtectedRoute>
              <AddAgency />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings/add-receiver"
          element={
            <ProtectedRoute>
              <AddReceiver />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/add"
          element={
            <ProtectedRoute>
              <AddDocuments />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
