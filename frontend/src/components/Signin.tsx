import { useRef } from "react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../../config.ts";

export const Signin = () => {
  const navigate = useNavigate();
  const emailRef = useRef<HTMLInputElement | null>(null);
  const passRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = emailRef.current?.value;
    const password = passRef.current?.value;
    try {
      const response = await axios.post(BACKEND_URL + "/api/v1/signin", {
        email,
        password,
      });
      const jwt = response.data.token;
      localStorage.setItem("token", jwt);
      navigate("/dashboard", { replace: true });
    } catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        if (e.response) {
          alert(e.response.data.error);
        } else {
          alert("Something went wrong, Please try again later.");
        }
      }
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="md:w-[60%] w-full flex flex-col">
        <div className="flex gap-2 mt-6 ml-6">
          <img src="/Icon.png" className="h-6 w-6" />
          <h1 className="text-lg font-sans font-semibold text-text">
            LinkHive
          </h1>
        </div>
        <div className="flex flex-col flex-1 justify-center items-center px-6">
          <div className="w-full max-w-md">
            <h1 className="text-accent sm:text-3xl text-2xl text-center pb-8 font-bold">
              Sign In to LinkHive
            </h1>
            <form
              className="flex flex-col items-center space-y-4"
              onSubmit={handleSubmit}
            >
              <Input reference={emailRef} placeholder="Email" required />
              <Input
                reference={passRef}
                placeholder="Password"
                required
                type="password"
              />
              <Button
                variant="primary"
                size="md"
                type="submit"
                text="Signin"
                hover="secondary"
              />
            </form>
          </div>
        </div>
        <div className="pb-6 pl-6">
          <p className="text-text">
            No account yet?
            <span
              className="text-accent underline font-semibold hover:cursor-pointer ml-1"
              onClick={() => {
                navigate("/signup");
              }}
            >
              Sign up
            </span>
          </p>
        </div>
      </div>
      <div className="w-[40%] md:block hidden">
        <img src="/picture.webp" className="w-full h-screen" />
      </div>
    </div>
  );
};
