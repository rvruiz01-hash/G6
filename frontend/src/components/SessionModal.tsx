interface SessionModalProps {
  open: boolean;
  onClose: () => void;
  onKeepAlive: () => void;
}

export default function SessionModal({
  open,
  onClose,
  onKeepAlive,
}: SessionModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          ¿Sigues aquí?
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          Tu sesión expirará pronto. ¿Deseas continuar conectado?
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onKeepAlive}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Sí, continúo aquí
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-900 rounded hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 transition"
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
}
