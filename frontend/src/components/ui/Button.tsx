import { ReactElement } from "react";

interface ButtonProps {
  variant: "primary" | "secondary";
  size: "sm" | "md" | "lg";
  text: string;
  startIcon?: ReactElement;
  endIcon?: ReactElement;
  onClick?: () => void;
  hover: "primary" | "secondary";
  type?: "button" | "submit" | "reset";
}

const variantStyles = {
  primary: "bg-primary text-white",
  secondary: "bg-secondary text-text",
};

const hoverStyles = {
  primary: "hover:bg-primary ",
  secondary: "hover:bg-secondary",
};

const sizeStyles = {
  sm: "py-1 px-2",
  md: "py-2 px-4 text-lg mt-2",
  lg: "py-4 px-6",
};

const defaultStyles = "rounded-md px-4 py-2";

export const Button = (props: ButtonProps) => {
  return (
    <button
      className={`${variantStyles[props.variant]} ${defaultStyles} ${sizeStyles[props.size]} ${hoverStyles[props.hover]}`}
      onClick={props.onClick}
      type={props.type}
    >
      <div className="flex items-center justify-center ">
        {props.startIcon ? <div className="pr-2">{props.startIcon}</div> : null}
        {props.text}
      </div>
    </button>
  );
};
