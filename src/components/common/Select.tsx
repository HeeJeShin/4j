import { SelectHTMLAttributes, forwardRef } from "react";

interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    options: SelectOption[];
    error?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ className = "", label, options, error, id, ...props }, ref) => {
        return (
            <div className="flex items-center gap-4">
                {label && (
                    <label
                        htmlFor={id}
                        className="text-sm font-medium text-zinc-900 whitespace-nowrap"
                    >
                        {label}
                    </label>
                )}
                <select
                    ref={ref}
                    id={id}
                    className={`flex-1 border-b border-zinc-300 bg-transparent px-2 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none disabled:bg-zinc-100 disabled:cursor-not-allowed ${
                        error ? "border-red-500 focus:border-red-500" : ""
                    } ${className}`}
                    {...props}
                >
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
            </div>
        );
    }
);

Select.displayName = "Select";

export default Select;
