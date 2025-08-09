// Dialog.tsx
import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface DialogProps {
  open: boolean;
  title?: string;
  description?: string;
  onClose: () => void;
  onConfirm?: () => void;
  hideCloseIcon?: boolean;
  children?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  showFooter?: boolean;
}

const Dialog: React.FC<DialogProps> = ({
  open,
  title,
  description,
  onClose,
  onConfirm,
  hideCloseIcon,
  children,
  confirmText = "Confirm",
  cancelText = "Cancel",
  showFooter = true,
}) => {
  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
          <AlertDialogContent
            asChild
            className="bg-black border border-emerald-500 text-white rounded-xl p-6 shadow-lg"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20, duration: 0.15 }}
            >
              <div className="relative">
                {!hideCloseIcon && (
                  <button
                    onClick={onClose}
                    className="absolute right-0 top-0 text-white/70 hover:text-white hover:bg-emerald-600/20 p-2 rounded-md transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
                <AlertDialogHeader>
                  {title && (
                    <AlertDialogTitle className="text-xl font-bold text-white">
                      {title}
                    </AlertDialogTitle>
                  )}
                  {description && (
                    <AlertDialogDescription className="text-emerald-200 text-sm">
                      {description}
                    </AlertDialogDescription>
                  )}
                </AlertDialogHeader>

                <div className="mt-4 text-emerald-100">{children}</div>

                {showFooter && (
                  <AlertDialogFooter className="mt-6 flex space-x-3">
                    <AlertDialogCancel
                      className="border-emerald-500 text-emerald-300 hover:bg-emerald-500/20"
                      asChild
                    >
                      <Button variant="outline">{cancelText}</Button>
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleConfirm}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      asChild
                    >
                      <Button>{confirmText}</Button>
                    </AlertDialogAction>
                  </AlertDialogFooter>
                )}
              </div>
            </motion.div>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </AnimatePresence>
  );
};

export default Dialog;