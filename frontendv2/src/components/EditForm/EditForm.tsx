import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { InputDevicesSelect } from '../SideForm/components/InputDevicesSelect';
import type { FormData } from '../../Types/Types';
import { formatFormDataForApi } from '../../Utils/Utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { scheduleItemToSendRaw } from '../../Types/Types';
import axios from 'axios';
import { BASE_URL } from '../../Config';

const schema = yup
  .object({
    id: yup.string().optional(),
    device: yup
      .object({
        id: yup.mixed().required('Dispositivo es requerido'),
        name: yup.string().required('Nombre del dispositivo es requerido'),
      })
      .required(),
    date: yup.string().required('Fecha de inicio es requerida'),
    time: yup.string().required('Hora de inicio es requerida'),
    duration: yup.mixed().required('Duración es requerida'),
    endDate: yup.string().required('Fecha de fin es requerida'),
    frequency: yup
      .string()
      .oneOf(['daily', 'weekly', 'monthly'])
      .required('Frecuencia es requerida'),
    interval: yup.mixed().required('Intervalo es requerido'),
  })
  .required();

interface EditFormProps {
  eventData: any;
  onClose: () => void;
}

export const EditForm: React.FC<EditFormProps> = ({ eventData, onClose }) => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (updatedSchedule: scheduleItemToSendRaw) => {
      return axios.put(
        `${BASE_URL}/update_schedule/${eventData.id}`,
        updatedSchedule
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['getSchedules'] });
      onClose();
    },
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { isDirty, errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema) as any,
    mode: 'all',
    defaultValues: {
      device: {
        id: eventData.extendedProps.device_id,
        name: eventData.deviceName,
      },
      start_date: eventData.start_date,
      duration: eventData.durationMinutes,
      end_date: eventData.end_date,
      // frequency: eventData.extendedProps.frequency || 'daily',
      frequency: 'daily',
      interval: parseInt(eventData.extendedProps.interval) || 1,
    },
  });

  const onSubmit = (data: FormData) => {
    const apiData = formatFormDataForApi(data);
    mutation.mutate(apiData);
  };

  const inputClassName =
    'block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4">
      <div>
        <label htmlFor="device" className="block text-sm font-medium text-gray-900">
          Dispositivo
        </label>
        <InputDevicesSelect control={control} />
        {errors.device && (
          <p className="text-red-500 text-sm">{errors.device.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-900">
          Fecha de inicio
        </label>
        <input type="date" {...register('start_date')} className={inputClassName} />
        {errors.start_date && (
          <p className="text-red-500 text-sm">{errors.start_date.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="time" className="block text-sm font-medium text-gray-900">
          Hora de inicio
        </label>
        <input type="time" {...register('time')} className={inputClassName} />
        {errors.time && (
          <p className="text-red-500 text-sm">{errors.time.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="duration" className="block text-sm font-medium text-gray-900">
          Duración (minutos)
        </label>
        <input type="number" {...register('duration')} className={inputClassName} />
        {errors.duration && (
          <p className="text-red-500 text-sm">{errors.duration.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="endDate" className="block text-sm font-medium text-gray-900">
          Fecha de Fin
        </label>
        <input type="date" {...register('end_date')} className={inputClassName} />
        {errors.end_date && (
          <p className="text-red-500 text-sm">{errors.end_date.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="frequency" className="block text-sm font-medium text-gray-900">
          Frecuencia
        </label>
        <select {...register('frequency')} className={inputClassName}>
          <option value="daily">Diario</option>
          <option value="weekly">Semanal</option>
          <option value="monthly">Mensual</option>
        </select>
        {errors.frequency && (
          <p className="text-red-500 text-sm">{errors.frequency.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="interval" className="block text-sm font-medium text-gray-900">
          Intervalo
        </label>
        <input type="number" {...register('interval')} className={inputClassName} />
        {errors.interval && (
          <p className="text-red-500 text-sm">{errors.interval.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={!isDirty}
          className={`px-4 py-2 rounded text-white ${
            !isDirty
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-500'
          }`}
        >
          Actualizar
        </button>
      </div>
    </form>
  );
};
