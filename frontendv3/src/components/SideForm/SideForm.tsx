import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { InputDevicesSelect } from './components/InputDevicesSelect';
import type { FormData } from '../../Types/Types';
import { formatFormDataForApi } from '../../Utils/Utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addSchedule } from '../../api/Main/Main';
import { useApp } from '../../context/AppProvider/AppProvider';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';

const schema = yup
  .object({
    id: yup.string().optional(),
    device: yup
      .object({
        id: yup.mixed().required('Dispositivo es requerido'),
        name: yup.string().required('Nombre del dispositivo es requerido'),
      })
      .required(),
    date: yup
      .string()
      .required('Fecha de inicio es requerida')
      .test(
        'is-before-endDate',
        'La fecha de inicio debe ser anterior o igual a la fecha de fin',
        function (value) {
          const { endDate } = this.parent; // Accede a otros campos del esquema
          return !endDate || new Date(value) <= new Date(endDate);
        }
      ),
    time: yup.string().required('Hora de inicio es requerida'),
    duration: yup.number().required('Duración es requerida'),
    endDate: yup.string().required('Fecha de fin es requerida'),
    frequency: yup
      .string()
      .oneOf(['daily', 'weekly', 'monthly'])
      .required('Frecuencia es requerida'),
    interval: yup.number().required('Intervalo es requerido').min(1),
  })
  .required();

const getLocalDate = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  const localDate = new Date(now.getTime() - offset);

  return localDate.toISOString().split('T')[0];
};

export const SideForm: React.FC = () => {
  const { setFormData, isSidebarOpen, toggleSidebar } = useApp();

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: addSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['getSchedules'] });
      setFormData(null);
      toast('Nueva fecha creada!', { type: 'success' });
    },
    onError: (error) => {
      console.error('Error creating schedule:', error);
      toast('Error al tratar de crear fecha!', { type: 'error' });
    },
  });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: yupResolver(schema) as any,
    mode: 'all',
    defaultValues: {
      date: getLocalDate(),
      endDate: getLocalDate(),
      duration: 1,
      interval: 1,
      frequency: 'daily',
    },
  });
  const onSubmit = (data: FormData) => {
    console.log('data:', data);
    const apiData = formatFormDataForApi(data);
    console.log('apiData:', apiData);
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
      <button
        onClick={toggleSidebar}
        className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 lg:hidden"
      >
        <X className="h-6 w-6" />
      </button>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-2 mt-8 lg:mt-0"
      >
        {/* Device */}
        <div>
          <label
            htmlFor="device"
            className="block text-sm font-medium text-gray-900"
          >
            Dispositivo
          </label>
          <InputDevicesSelect setValue={setValue} control={control} />
          {errors.device && (
            <p className="text-red-500 text-sm">{errors.device.message}</p>
          )}
        </div>

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

        <div>
          <label
            htmlFor="frequency"
            className="block text-sm font-medium text-gray-900"
          >
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
