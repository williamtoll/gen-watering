import React from 'react';
import { X } from 'lucide-react';
import { scheduleItem } from '../../Types/Types';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: scheduleItem;
  onEdit: () => void;
  onDelete: () => void;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  onClose,
  event,
  onEdit,
  onDelete,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X className="h-6 w-6" />
        </button>

        <h2 className="text-xl font-bold mb-4">Detalles del Riego</h2>

        <div className="space-y-3">
          <div>
            <span className="font-semibold">Dispositivo:</span>{' '}
            {event.deviceName}
          </div>
          <div>
            <span className="font-semibold">Fecha de inicio:</span>{' '}
            {new Date(event.start).toLocaleDateString('es-ES')}
          </div>
          <div>
            <span className="font-semibold">Hora:</span>{' '}
            {new Date(event.start).toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
          <div>
            <span className="font-semibold">Duración:</span>{' '}
            {event.durationMinutes} minutos
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50"
          >
            Cerrar
          </button>
          <button
            onClick={onDelete}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Borrar
          </button>
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500"
          >
            Editar
          </button>
        </div>
      </div>
    </div>
  );
};
