import React from "react";

interface Inputprops extends React.InputHTMLAttributes<HTMLInputElement> {
  placeholder: string;
  reference?: React.Ref<HTMLInputElement>;
  name?: string;
  value?: string;
  type?: string;
  required?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent) => void;
}

export const Input = (props: Inputprops) => {
  return (
    <div>
      <input
        ref={props.reference}
        placeholder={props.placeholder}
        className="pl-4 pr-14  py-3 border focus:outline-accent  rounded-sm m-2"
        name={props.name}
        value={props.value}
        type={props.type}
        required={props.required}
        onChange={props.onChange}
        onBlur={props.onBlur}
      />
    </div>
  );
};
