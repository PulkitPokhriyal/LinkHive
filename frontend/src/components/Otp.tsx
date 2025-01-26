import { useState, useRef } from "react";
import axios from "axios";
import { BACKEND_URL } from "../../config.ts";
import { useNavigate } from "react-router-dom";

interface OtpProps {
  email: string;
}

export const Otp: React.FC<OtpProps> = ({ email }) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<HTMLInputElement[]>([]);
  const navigate = useNavigate();
  const handleChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;
    const updatedOtp = [...otp];
    updatedOtp[index] = value;
    setOtp(updatedOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const key: string = otp.join("");
    try {
      const response = await axios.post(BACKEND_URL + "/api/v1/verify-otp", {
        otp: key,
        email,
      });
      const jwt = response.data.token;
      localStorage.setItem("token", jwt);
      navigate("/dashboard", { replace: true });
    } catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        if (e.response) {
          alert(e.response.data.error);
        } else {
          alert("Something went wrong. Please try again.");
        }
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-[60%] space-y-4">
      <form onSubmit={handleSubmit}>
        <h1 className="text-text font-bold mb-4 text-3xl ml-20">Enter OTP :</h1>
        <div className="flex space-x-2 mb-4">
          {otp.map((value, index) => (
            <input
              key={index}
              type="text"
              required
              maxLength={1}
              value={value}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              ref={(el) => (inputRefs.current[index] = el!)}
              className="w-12 h-12 text-center text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
            />
          ))}
        </div>
        <button
          type="submit"
          className="px-4 py-2 ml-28 bg-accent text-white rounded-md"
        >
          Submit
        </button>
      </form>
    </div>
  );
};
