"use client";
import React, { useEffect, useState } from "react";
import { Input } from "@heroui/input";

import { MaskImageModal } from "@/components/MaskImageModal";

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [src, setSrc] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [maskedUrl, setMaskedUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];

    if (selected) {
      setFile(selected);
      setSrc(URL.createObjectURL(selected));
      setOpen(true);
    }
  };

  const handleSubmit = (file: File) => {
    const url = URL.createObjectURL(file);

    setMaskedUrl(url);
    setOpen(false);

    // ダウンロード
    const a = document.createElement("a");

    a.href = url;
    a.download = file.name; // 例: "masked.png"
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  useEffect(() => {
    return () => {
      if (src.startsWith("blob:")) {
        URL.revokeObjectURL(src);
      }
    };
  }, [src]);

  return (
    <div className="p-6 space-y-6 max-w-md mx-auto">
      <Input accept="image/*" type="file" onChange={handleFileChange} />

      <MaskImageModal
        isOpen={open}
        src={src}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmit}
      />

      {maskedUrl && (
        <div className="mt-6">
          <p className="text-sm text-gray-600 mb-2">マスク済み画像:</p>
          <img
            alt="マスキング後"
            className="border rounded shadow w-full"
            src={maskedUrl}
          />
        </div>
      )}
    </div>
  );
}
