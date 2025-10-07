import React from "react";
import { HiExclamationTriangle } from "react-icons/hi2";
import CrudModal from "./CrudModal";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  title: string;
  message: string;
  itemName?: string;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
  title,
  message,
  itemName
}: DeleteConfirmModalProps) {
  return (
    <CrudModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      onSubmit={onConfirm}
      loading={loading}
      submitText="Eliminar"
      submitButtonColor="red"
    >
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
          <HiExclamationTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
        </div>
        
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          {title}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {message}
        </p>
        
        {itemName && (
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {itemName}
            </p>
          </div>
        )}
      </div>
    </CrudModal>
  );
}