import React, { useRef } from "react";

type Props = {
  value: string;
  onChange: (val: string) => void;
  length?: number;
  disabled?: boolean;
  className?: string;
};

const CustomOTPInput: React.FC<Props> = ({
  value,
  onChange,
  length = 6,
  disabled = false,
  className = "",
}) => {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    let newValue = value.split("");
    newValue[idx] = val;
    newValue = newValue.slice(0, length);
    onChange(newValue.join("").padEnd(length, ""));
    if (val && idx < length - 1) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === "Backspace" && !value[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
  };

  return (
    <div className={`flex gap-2 justify-center ${className}`}>
      {Array.from({ length }).map((_, idx) => (
        <React.Fragment key={idx}>
          <input
            ref={el => (inputsRef.current[idx] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            disabled={disabled}
            value={value[idx] || ""}
            onChange={e => handleChange(e, idx)}
            onKeyDown={e => handleKeyDown(e, idx)}
            className="w-10 h-12 text-2xl font-mono text-emerald-400 bg-black border-4  rounded-md text-center focus:outline-none focus:border-emerald-400 transition-colors"
          />
          {idx === 2 && (
            <span className="mx-1 text-2xl text-emerald-400 select-none"></span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default CustomOTPInput;