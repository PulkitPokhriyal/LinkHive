import "./App.css";
import Dashboard from "./components/Dashboard";
import { Signup } from "./components/Signup";
import { Signin } from "./components/Signin";
import { ProtectedRoute } from "./components/ProtectedRoute";
import ShareableContent from "./components/ShareLink";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { RecoilRoot } from "recoil";
function App() {
  const token = localStorage.getItem("token");
  return (
    <RecoilRoot>
      <Router>
        <>
          <Routes>
            <Route
              path="/"
              element={
                !token ? (
                  <Navigate to="/signin" />
                ) : (
                  <Navigate to="/dashboard" />
                )
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
            <Route
              path="/sharecontent/:sharelink"
              element={<ShareableContent />}
            />
          </Routes>
        </>
      </Router>
    </RecoilRoot>
  );
}

export default App;
