"use client";
import React, { useState } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";

import { MaskImageModal } from "@/components/MaskImageModal";

export default function App() {
  const [url, setUrl] = useState("");
  const [open, setOpen] = useState(false);
  const [maskedUrl, setMaskedUrl] = useState<string | null>(null);

  const handleConfirm = (masked: string) => {
    setMaskedUrl(masked);
    setOpen(false);
  };

  return (
    <div className="p-6 space-y-6 max-w-md mx-auto">
      <Input
        placeholder="画像URLを入力"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <Button onClick={() => setOpen(true)}>マスキング開始</Button>

      <MaskImageModal
        isOpen={open}
        src={url}
        onClose={() => setOpen(false)}
        onConfirm={handleConfirm} // ★ コールバック
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
