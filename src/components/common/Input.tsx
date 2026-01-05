"use client";

import { TextField } from "@mui/material";

interface InputProps {
    label?: string;
    error?: string;
    id?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    type?: string;
    disabled?: boolean;
    className?: string;
}

export default function Input({ label, error, id, value, onChange, placeholder, type = "text", disabled, className }: InputProps) {
    return (
        <div className={`flex items-center gap-4 ${className || ""}`}>
            {label && (
                <label className="text-sm font-medium text-zinc-900 whitespace-nowrap min-w-fit">
                    {label}
                </label>
            )}
            <TextField
                id={id}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                error={!!error}
                helperText={error}
                fullWidth
                size="small"
                sx={{
                    '& .MuiOutlinedInput-root': {
                        fontSize: '0.875rem',
                        '& fieldset': {
                            borderColor: '#d4d4d8',
                        },
                        '&:hover fieldset': {
                            borderColor: '#a1a1aa',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: '#18181b',
                            borderWidth: '2px',
                        },
                    },
                    '& .MuiInputBase-input': {
                        color: '#18181b',
                    },
                    '& .MuiInputBase-input::placeholder': {
                        color: '#a1a1aa',
                        opacity: 1,
                    },
                }}
            />
        </div>
    );
}