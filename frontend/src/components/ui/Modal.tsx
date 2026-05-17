import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './Button';

interface ModalProps {
  open: boolean;
  title: string;
  description?: string;
  children: React.ReactNode;
  onClose: () => void;
  className?: string;
}

export function Modal({ open, title, description, children, onClose, className }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className={cn(
        "max-h-[92vh] w-full overflow-y-auto rounded-t-2xl border border-slate-800 bg-slate-950 shadow-2xl sm:max-w-xl sm:rounded-xl",
        className
      )}>
        <div className="flex items-start justify-between gap-4 border-b border-slate-900 p-5">
          <div>
            <h3 className="text-lg font-black text-white">{title}</h3>
            {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
