export type scheduleItemRaw = {
  device_name: string;
  duration_minutes: number;
  end: string;
  id: number | string;
  start: string;
  status: string;
  title: string;
  date: string;
};

export type scheduleItemToSendRaw = {
  device_name: string;
  duration: number;
  end: string;
  device_id: number | string;
  end_date: string;
  status: string;
  title: string;
  start_date: string;
  frequency: string;
};

export type scheduleItem = {
  deviceName: string;
  durationMinutes: number;
  end: string;
  id: string;
  start: string;
  status: string;
  title: string;
};

export type scheduleItemToSend = {
  deviceName: string;
  durationMinutes: number;
  end: string;
  device_id: string;
  start: string;
  status: string;
  title: string;
  date: string;
};

export type device = {
  id: string;
  name: string;
};

export type apiResponse = {
  status: string;
  message: string;
  result: scheduleItemRaw[];
};

export type apiResponseDevices = device[];

export interface FormData {
  id: string;
  device: {
    id: string;
    name: string;
  };
  date: string;
  time: string;
  duration: number;
  endDate: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  interval: number;
}
