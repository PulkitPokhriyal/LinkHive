import { useState } from "react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { useFormik } from "formik";
import { Otp } from "./Otp.tsx";
import * as Yup from "yup";
import axios from "axios";
import { BACKEND_URL } from "../../config.ts";
import { useNavigate } from "react-router-dom";

const validationSchema = Yup.object({
  username: Yup.string()
    .min(3, "Username must be at least 3 characters long")
    .required("Username is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters long")
    .matches(/[A-Z]/, "Password must contain at least one capital letter")
    .matches(/[\W_]/, "Password must contain at least one special character")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm Password is required"),
});

export const Signup = () => {
  const navigate = useNavigate();
  const [isOtpRequested, setIsOtpRequested] = useState(false);

  const formik = useFormik({
    initialValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await axios.post(BACKEND_URL + "/api/v1/signup", {
          username: values.username,
          email: values.email,
          password: values.password,
        });
        setIsOtpRequested(true);
      } catch (e: unknown) {
        if (axios.isAxiosError(e)) {
          if (e.response) {
            alert(e.response.data.error);
          } else {
            alert("Something went wrong. Please try again.");
          }
        }
      }
    },
  });

  return (
    <div className="flex ">
      {!isOtpRequested ? (
        <div className="w-[60%] h-screen">
          <div className="flex gap-2 mt-6 ml-6">
            <img src="/Icon.png" className="h-6 w-6" />
            <h1 className="text-lg font-sans font-semibold text-text">
              LinkHive
            </h1>
          </div>
          <div className="flex flex-col items-center mt-36 ">
            <h1 className="text-accent text-3xl pb-8 font-bold">
              Sign Up to LinkHive
            </h1>
            <form
              onSubmit={formik.handleSubmit}
              className="flex flex-col items-center "
            >
              <Input
                placeholder="Username"
                name="username"
                value={formik.values.username}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.username && formik.errors.username && (
                <div style={{ color: "red" }}>{formik.errors.username}</div>
              )}
              <Input
                placeholder="Email"
                name="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.email && formik.errors.email && (
                <div style={{ color: "red" }}>{formik.errors.email}</div>
              )}

              <Input
                placeholder="Password"
                name="password"
                type="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.password && formik.errors.password && (
                <div style={{ color: "red" }}>{formik.errors.password}</div>
              )}

              <Input
                placeholder="Confirm Password"
                name="confirmPassword"
                type="password"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.confirmPassword &&
                formik.errors.confirmPassword && (
                  <div style={{ color: "red" }}>
                    {formik.errors.confirmPassword}
                  </div>
                )}
              <Button
                variant="primary"
                size="md"
                text="Signup"
                hover="secondary"
                type="submit"
              />
            </form>
          </div>
          <div>
            <p className="text-text mt-36 ml-6">
              Have an account?
              <span
                className="text-accent underline font-semibold hover:cursor-pointer"
                onClick={() => {
                  navigate("/signin");
                }}
              >
                Sign in
              </span>
            </p>
          </div>
        </div>
      ) : (
        <Otp email={formik.values.email} />
      )}
      <div className="w-[40%]">
        <img src="/picture.webp" className="w-full h-screen" />
      </div>
    </div>
  );
};
