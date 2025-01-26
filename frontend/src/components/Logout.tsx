import { useNavigate } from "react-router-dom";
import { Button } from "./ui/Button";

export const Logout = () => {
  const navigate = useNavigate();
  function logout() {
    localStorage.clear();
    navigate("/signin");
  }

  return (
    <div>
      <div>
        <Button
          variant="orange"
          size="md"
          text="Logout"
          hover="danger"
          onClick={logout}
        />
      </div>
    </div>
  );
};
