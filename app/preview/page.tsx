"use client";
import React, { useEffect, useState } from "react";
import { Input } from "@heroui/input";

import { ImagePreviewModal } from "@/components/ImagePreviewModal";

export default function App() {
  const [src, setSrc] = useState<string>("");
  const [open, setOpen] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];

    if (selected) {
      setSrc(URL.createObjectURL(selected));
      setOpen(true);
    }
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

      <ImagePreviewModal
        isOpen={open}
        src={src}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}
