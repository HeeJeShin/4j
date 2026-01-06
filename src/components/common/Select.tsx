"use client";

import { FormControl, Select as MuiSelect, MenuItem, FormHelperText } from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";

interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps {
    label?: string;
    options: SelectOption[];
    error?: string;
    id?: string;
    value?: string;
    onChange?: (e: SelectChangeEvent<string>) => void;
    disabled?: boolean;
    className?: string;
}

function Select({ label, options, error, id, value, onChange, disabled, className }: SelectProps) {
    return (
        <div className={`flex items-center gap-4 ${className || ""}`}>
            {label && (
                <label className="text-sm font-medium text-zinc-900 whitespace-nowrap min-w-fit">
                    {label}
                </label>
            )}
            <FormControl fullWidth size="small" error={!!error} disabled={disabled}>
                <MuiSelect
                    id={id}
                    value={value}
                    onChange={onChange}
                    sx={{
                        fontSize: "0.875rem",
                        "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#d4d4d8",
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#a1a1aa",
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#18181b",
                            borderWidth: "2px",
                        },
                    }}
                >
                    {options.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                            {option.label}
                        </MenuItem>
                    ))}
                </MuiSelect>
                {error && <FormHelperText>{error}</FormHelperText>}
            </FormControl>
        </div>
    );
}

Select.displayName = "Select";

export default Select;
