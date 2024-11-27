import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { InputDevicesSelect } from './components/InputDevicesSelect';
import type { FormData } from '../../Types/Types';
import { formatFormDataForApi } from '../../Utils/Utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { scheduleItemToSendRaw } from '../../Types/Types';
import axios from 'axios';
import { useApp } from '../../context/AppProvider/AppProvider';
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

export const SideForm: React.FC = () => {
  const {
    closeSidebar,
    openModal,
    setFormData,
    isModalOpen,
    closeModal,
    isSidebarOpen,
  } = useApp();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (newSchedule: scheduleItemToSendRaw) => {
      return axios.post(
        'http://172.233.17.232:8000/api/new_schedule',
        newSchedule
      );
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['getSchedules'] });
      console.log('Schedule created successfully', data);
      setFormData(null);
      openModal();
    },
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: yupResolver(schema) as any,
    mode: 'all',
  });

  const onSubmit = (data: FormData) => {
    const apiData = formatFormDataForApi(data);
    console.log('API data:', apiData);
    mutation.mutate(apiData);
  };

  const inputClassName =
    'block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6';

  return (
    <div
      className={`fixed inset-y-0 left-0 z-10 w-64 transform bg-white p-6 shadow-md transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
        {/* Dispositivo */}
        <div>
          <label
            htmlFor="device"
            className="block text-sm font-medium text-gray-900"
          >
            Dispositivo
          </label>
          <InputDevicesSelect control={control} />
          {errors.device && (
            <p className="text-red-500 text-sm">{errors.device.message}</p>
          )}
        </div>

        {/* Fecha de inicio */}
        <div>
          <label
            htmlFor="date"
            className="block text-sm font-medium text-gray-900"
          >
            Fecha de inicio
          </label>
          <input type="date" {...register('date')} className={inputClassName} />
          {errors.date && (
            <p className="text-red-500 text-sm">{errors.date.message}</p>
          )}
        </div>

        {/* Hora de inicio */}
        <div>
          <label
            htmlFor="time"
            className="block text-sm font-medium text-gray-900"
          >
            Hora de inicio
          </label>
          <input type="time" {...register('time')} className={inputClassName} />
          {errors.time && (
            <p className="text-red-500 text-sm">{errors.time.message}</p>
          )}
        </div>

        {/* Duración */}
        <div>
          <label
            htmlFor="duration"
            className="block text-sm font-medium text-gray-900"
          >
            Duración (minutos)
          </label>
          <input
            type="number"
            {...register('duration')}
            className={inputClassName}
          />
          {errors.duration && (
            <p className="text-red-500 text-sm">{errors.duration.message}</p>
          )}
        </div>

        {/* Fecha de fin */}
        <div>
          <label
            htmlFor="startDate"
            className="block text-sm font-medium text-gray-900"
          >
            Fecha de Fin
          </label>
          <input
            type="date"
            {...register('endDate')}
            className={inputClassName}
          />
          {errors.endDate && (
            <p className="text-red-500 text-sm">{errors.endDate.message}</p>
          )}
        </div>

        {/* Frecuencia */}
        <div>
          <label
            htmlFor="frequency"
            className="block text-sm font-medium text-gray-900"
          >
            Frecuencia
          </label>
          <select {...register('frequency')} className={inputClassName}>
            <option value="">Seleccionar Frecuencia</option>
            <option value="daily">Diario</option>
            <option value="weekly">Semanal</option>
            <option value="monthly">Mensual</option>
          </select>
          {errors.frequency && (
            <p className="text-red-500 text-sm">{errors.frequency.message}</p>
          )}
        </div>

        {/* Intervalo */}
        <div>
          <label
            htmlFor="interval"
            className="block text-sm font-medium text-gray-900"
          >
            Intervalo
          </label>
          <input
            type="number"
            {...register('interval')}
            className={inputClassName}
          />
          {errors.interval && (
            <p className="text-red-500 text-sm">{errors.interval.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={!isValid}
          className={`w-full rounded-md px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
            !isValid
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-500'
          }`}
        >
          Guardar
        </button>
      </form>
    </div>
  );
};
