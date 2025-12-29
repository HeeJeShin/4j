"use client";

import { useRef } from "react";
import Button from "./Button";

interface FileUploadProps {
    label?: string;
    onFileSelect: (file: File) => void;
    accept?: string;
}

export default function FileUpload({ label, onFileSelect, accept }: FileUploadProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleClick = () => {
        inputRef.current?.click();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onFileSelect(file);
        }
    };

    return (
        <div className="flex items-center gap-4">
            {label && (
                <label className="text-sm font-medium text-zinc-700 whitespace-nowrap">
                    {label}
                </label>
            )}
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                onChange={handleChange}
                className="hidden"
            />
            <Button variant="outline" size="sm" onClick={handleClick} type="button">
                파일 첨부
            </Button>
        </div>
    );
}
