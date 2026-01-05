"use client";

import { Button as MuiButton } from "@mui/material";

interface ButtonProps {
    variant?: "primary" | "secondary" | "outline";
    size?: "sm" | "md" | "lg";
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    type?: "button" | "submit" | "reset";
    className?: string;
}

function Button({
    variant = "primary",
    size = "md",
    children,
    onClick,
    disabled,
    type = "button",
    className
}: ButtonProps) {
    const variantStyles = {
        primary: {
            bgcolor: '#10b981',
            color: '#ffffff',
            '&:hover': {
                bgcolor: '#059669',
            },
            '&:active': {
                bgcolor: '#047857',
            },
        },
        secondary: {
            bgcolor: '#a1a1aa',
            color: '#ffffff',
            '&:hover': {
                bgcolor: '#71717a',
            },
            '&:active': {
                bgcolor: '#52525b',
            },
        },
        outline: {
            bgcolor: '#ffffff',
            color: '#3f3f46',
            border: '1px solid #d4d4d8',
            '&:hover': {
                bgcolor: '#fafafa',
                borderColor: '#a1a1aa',
            },
            '&:active': {
                bgcolor: '#f4f4f5',
            },
        },
    };

    const sizeStyles = {
        sm: {
            height: '32px',
            px: 2,
            fontSize: '0.875rem',
        },
        md: {
            height: '40px',
            px: 3,
            fontSize: '0.875rem',
        },
        lg: {
            height: '48px',
            px: 4,
            fontSize: '1rem',
        },
    };

    return (
        <MuiButton
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={className}
            sx={{
                ...variantStyles[variant],
                ...sizeStyles[size],
                textTransform: 'none',
                fontWeight: 500,
                borderRadius: '6px',
                boxShadow: 'none',
                '&:hover': {
                    ...variantStyles[variant]['&:hover'],
                    boxShadow: 'none',
                },
                '&.Mui-disabled': {
                    opacity: 0.5,
                    bgcolor: variantStyles[variant].bgcolor,
                    color: variantStyles[variant].color,
                },
            }}
        >
            {children}
        </MuiButton>
    );
}

Button.displayName = "Button";

export default Button;