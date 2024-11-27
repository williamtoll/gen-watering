import {
  scheduleItem,
  apiResponse,
  scheduleItemRaw,
  scheduleItemToSendRaw,
  scheduleItemToSend,
  FormData,
} from '../Types/Types';

export const defaultThemeBlue = '#007bff';

export const sheduleItemsMap = (data: apiResponse): scheduleItem[] => {
  return (
    data?.result.map((item: scheduleItemRaw) => ({
      id: item.id.toString(),
      title: item.title,
      start: item.start,
      end: item.end,
      extendedProps: item,
      deviceName: item.device_name,
      durationMinutes: item.duration_minutes,
      status: item.status,
    })) || []
  );
};

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
    start_date: data.date,
    frequency: String(data.interval),
  };
};

export const formatFormDataForApi = (data: FormData): scheduleItemToSendRaw => {
  return {
    device_name: data.device.name,
    duration: Number(data.duration),
    end: data.time,
    device_id: data.device.id,
    end_date: data.endDate,
    status: 'pending',
    title: data.device.name,
    start_date: data.date,
    frequency: String(data.interval),
  };
};
