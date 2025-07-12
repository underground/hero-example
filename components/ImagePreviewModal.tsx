"use client";
import { Button } from "@heroui/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import React from "react";
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
