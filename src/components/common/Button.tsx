import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline";
    size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className = "", variant = "primary", size = "md", children, ...props }, ref) => {
        const baseStyles =
            "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

        const variants = {
            // 계산하기, 저장하기 버튼 (초록색)
            primary: "bg-emerald-500 text-white hover:bg-emerald-600 focus:ring-emerald-500",
            // 초기화, 다시 계산하기 버튼 (회색)
            secondary: "bg-zinc-400 text-white hover:bg-zinc-500 focus:ring-zinc-400",
            // 파일 첨부 버튼 (테두리)
            outline: "border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 focus:ring-zinc-500",
        };

        const sizes = {
            sm: "h-8 px-3 text-sm rounded",
            md: "h-10 px-6 text-sm rounded",
            lg: "h-12 px-8 text-base rounded",
        };

        return (
            <button
                ref={ref}
                className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
                {...props}
            >
                {children}
            </button>
        );
    }
);

Button.displayName = "Button";

export default Button;