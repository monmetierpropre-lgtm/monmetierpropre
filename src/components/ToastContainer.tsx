import { useToasts } from '@/lib/toast';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, dismiss } = useToasts();

  return (
    <div className="fixed top-4 left-0 right-0 z-[100] flex flex-col items-center gap-2 px-4 pointer-events-none">
      {toasts.map((toast) => {
        const Icon = toast.type === 'success' ? CheckCircle : toast.type === 'error' ? XCircle : Info;
        const bg =
          toast.type === 'success'
            ? 'bg-green-600'
            : toast.type === 'error'
            ? 'bg-red-600'
            : 'bg-blue-600';
        return (
          <div
            key={toast.id}
            className={`${bg} text-white rounded-2xl shadow-lg px-4 py-3 flex items-center gap-2 max-w-sm w-full pointer-events-auto animate-[slideIn_0.3s_ease-out]`}
          >
            <Icon size={20} className="flex-shrink-0" />
            <span className="text-sm font-semibold flex-1">{toast.message}</span>
            <button onClick={() => dismiss(toast.id)} className="flex-shrink-0">
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
