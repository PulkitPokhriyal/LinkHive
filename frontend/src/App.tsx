import "./App.css";
import Dashboard from "./components/Dashboard";
import { Signup } from "./components/Signup";
import { Signin } from "./components/Signin";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
function App() {
  return (
    <Router>
      <>
        <Routes>
          <Route path="/" element={<Navigate to="/signin" />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </>
    </Router>
  );
}

export default App;
