"use client";
import { Button } from "@heroui/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import React, { useState } from "react";
import React from "react";

type Props = {
  src: string;
  isOpen: boolean;
  onClose: () => void;
};

export const ImagePreviewModal: React.FC<Props> = ({
  src,
  isOpen,
  onClose,
}) => {
  const [scale, setScale] = useState(1);

  const toggleZoom = () => {
    setScale((prev) => (prev === 1 ? 2 : 1)); // 1倍 → 2倍 → 1倍のトグル
  };

  return (
    <Modal isOpen={isOpen} scrollBehavior="inside" size="5xl" onClose={onClose}>
      <ModalContent>
        <ModalHeader>Modal Title</ModalHeader>
        <ModalBody>
          <div className="relative w-full">
            <img
              alt="preview"
              className="w-full h-auto object-contain rounded"
              src={src}
              style={{
                transform: `scale(${scale})`,
                transformOrigin: "center center",
                cursor: scale === 1 ? "zoom-in" : "zoom-out",
                transition: "transform 0.3s",
              }}
              onClick={toggleZoom}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
