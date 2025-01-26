import "./App.css";
import Dashboard from "./components/Dashboard";
import { Signup } from "./components/Signup";
import { Signin } from "./components/Signin";
import { ProtectedRoute } from "./components/ProtectedRoute";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
function App() {
  const token = localStorage.getItem("token");
  return (
    <Router>
      <>
        <Routes>
          <Route
            path="/"
            element={
              !token ? <Navigate to="/signin" /> : <Navigate to="/dashboard" />
            }
          />
          <Route path="/signup" element={<Signup />} />
          <Route path="/signin" element={<Signin />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                {" "}
                <Dashboard />{" "}
              </ProtectedRoute>
            }
          />
        </Routes>
      </>
    </Router>
  );
}

export default App;
