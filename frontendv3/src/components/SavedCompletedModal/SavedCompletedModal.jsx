import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useApp } from '../../context/AppProvider/AppProvider';
import { Button } from '@headlessui/react';

export const SavedCompletedModal = () => {
  const { isModalOpen, setIsModalOpen, formData } = useApp();
  return (
    <Transition show={isModalOpen} as={React.Fragment}>
      <Dialog onClose={() => setIsModalOpen(false)} className="relative z-50">
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                <Dialog.Title className="text-lg font-medium leading-6 text-gray-900">
                  Fecha Guardada
                </Dialog.Title>
                <div className="mt-4">
                  {formData && (
                    <div className="space-y-2">
                      <p>
                        <strong>Nombre de dispositivo:</strong>{' '}
                        {formData.deviceName}
                      </p>
                      <p>
                        <strong>Fecha de inicio:</strong> {formData.date}
                      </p>
                      <p>
                        <strong>Hora de inicio:</strong> {formData.time}
                      </p>
                      <p>
                        <strong>Duracion:</strong> {formData.duration} minutes
                      </p>
                      <p>
                        <strong>Fecha de fin:</strong> {formData.startDate}
                      </p>
                      <p>
                        <strong>Frecuencia:</strong> {formData.frequency}
                      </p>
                      <p>
                        <strong>Intervalo:</strong> {formData.interval}
                      </p>
                    </div>
                  )}
                </div>
                <div className="mt-6">
                  <Button
                    onClick={() => setIsModalOpen(false)}
                    className="w-full"
                  >
                    Cerrar
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
