import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className = "", label, error, id, ...props }, ref) => {
        return (
            <div className="flex items-center gap-4">
        {label && (
            <label
                htmlFor={id}
                className="text-sm font-medium text-zinc-700 whitespace-nowrap"
            >
            {label}
          </label>
        )}
                <input
                    ref={ref}
                    id={id}
                    className={`flex-1 border-b border-zinc-300 px-2 py-2 text-sm bg-transparent placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none disabled:bg-zinc-100 disabled:cursor-not-allowed ${
                        error ? "border-red-500 focus:border-red-500" : ""
                    } ${className}`}
                    {...props}
                />
                {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
        );
    }
);

Input.displayName = "Input";

export default Input;