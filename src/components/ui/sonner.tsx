"use client";

import { Toaster as Sonner, ToasterProps } from "sonner@2.0.3";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: 'bg-slate-800 border-slate-700 text-gray-100',
          title: 'text-gray-100',
          description: 'text-gray-400',
          actionButton: 'bg-emerald-500 text-white',
          cancelButton: 'bg-slate-700 text-gray-100',
          error: 'bg-red-900 border-red-800 text-red-100',
          success: 'bg-emerald-900 border-emerald-800 text-emerald-100',
          warning: 'bg-orange-900 border-orange-800 text-orange-100',
          info: 'bg-blue-900 border-blue-800 text-blue-100',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
