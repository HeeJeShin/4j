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
            // 이미지 파일인지 검증
            if (!file.type.startsWith('image/')) {
                alert('이미지 파일만 업로드할 수 있습니다.');
                e.target.value = ''; // input 초기화
                return;
            }
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
                accept={accept || "image/*"}
                onChange={handleChange}
                className="hidden"
            />
            <Button variant="outline" size="sm" onClick={handleClick} type="button">
                파일 첨부
            </Button>
        </div>
    );
}
