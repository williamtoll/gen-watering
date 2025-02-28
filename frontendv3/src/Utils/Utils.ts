import {
  scheduleItem,
  apiResponse,
  scheduleItemRaw,
  editScheduleItemToSendRaw,
  scheduleItemToSendRaw,
  scheduleItemToSendRawNew,
  scheduleItemToSend,
  FormData,
} from '../Types/Types';

import dayjs from 'dayjs';

const combineDayTime = (date: string, time: string): string => {
  const combinedDateTime = dayjs(`${date}T${time}`);
  return combinedDateTime.format();
};

export const defaultThemeBlue = '#007bff';

export const sheduleItemsMap = (data: apiResponse): scheduleItem[] => {
  return (
    data?.result?.map((item: scheduleItemRaw) => ({
      id: item.id.toString(),
      title: item.title,
      start: item.start,
      end: item.end,
      extendedProps: item,
      deviceName: item.device_name,
      durationMinutes: item.duration_minutes,
      status: item.status,
      backgroundColor: item.color,
    })) || []
  );
};

// {
//   title: 'Evento Recurrente',
//   start: '2025-01-08T09:00:00', // Hora de inicio del primer evento
//   end: '2025-01-08T09:30:00', // Duración específica (30 minutos en este caso)
//   rrule: {
//     freq: 'daily', // Frecuencia: diaria
//     interval: 1, // Se repite cada 1 día
//     dtstart: '2025-01-08T09:00:00', // Fecha de inicio de la recurrencia
//     until: '2025-01-15T09:30:00', // Fecha final de la recurrencia
//   },
// },

export const scheduleItemToSendMap = (
  data: scheduleItem
): scheduleItemToSend => {
  return { ...data, device_id: data.id, date: data.start };
};

export const scheduleItemToSendRawMap = (
  data: FormData
): scheduleItemToSendRaw => {
  return {
    device_name: data.device.name,
    duration: data.duration,
    end: data.time,
    device_id: data.id,
    end_date: data.endDate,
    status: 'pending',
    title: data.device.name,
    start_date: combineDayTime(data.date, data.time),
    frequency: data.frequency,
    interval: data.interval,
    time: data.time,
  };
};

export const formatFormDataForApi = (data: FormData): scheduleItemToSendRaw => {
  const formattedTime = data.time + ':00';
  return {
    device_name: data.device.name,
    duration: Number(data.duration),
    end: data.time,
    device_id: data.device.id,
    end_date: data.endDate,
    status: 'pending',
    title: data.device.name,
    start_date: data.date,
    frequency: data.frequency,
    interval: data.interval,
    time: formattedTime,
  };
};

export const formatFormDataForApiNew = (
  data: FormData
): scheduleItemToSendRawNew => {
  return {
    device_name: data.device.name,
    duration: Number(data.duration),
    time: data.time,
    device_id: data.device.id,
    end_date: data.endDate,
    status: 'pending',
    title: data.device.name,
    start_date: data.date,
    frequency: data.frequency,
  };
};

export const formatEditFormDataForApi = (
  data: FormData
): editScheduleItemToSendRaw => {
  return {
    device_name: data.device.name,
    duration: Number(data.duration),
    end: data.time,
    device_id: data.device.id,
    end_date: data.endDate,
    status: 'pending',
    title: data.device.name,
    start_date: combineDayTime(data.date, data.time),
    frequency: data.frequency,
    interval: data.interval,
    id: data.id,
    time: data.time,
  };
};

export const translateFrequency = (frequency: string): string => {
  switch (frequency) {
    case 'daily':
      return 'Diario';
    case 'weekly':
      return 'Semanal';
    case 'monthly':
      return 'Mensual';
    case 'yearly':
      return 'Anual';
    default:
      return '';
  }
};
