export type scheduleItemRaw = {
  device_name: string;
  duration_minutes: number;
  end: string;
  id: number;
  start: string;
  status: 'pending' | 'completed' | 'failed';
  title: string;
  date: string;
  duration: string;
  color: string;
  rrule: RRule;
  interval: number;
  frequency: string;
};

export type RRule = {
  freq: 'daily' | 'weekly' | 'monthly';
  interval: number;
  dtstart: string;
  until: string;
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
  interval: number;
  time: string;
};

export type scheduleItemToSendRawNew = {
  device_name: string;
  duration: number;
  time: string;
  device_id: number | string;
  end_date: string;
  status: string;
  title: string;
  start_date: string;
  frequency: string;
};

export type editScheduleItemToSendRaw = scheduleItemToSendRaw & {
  id: number | string;
};

export type scheduleItem = {
  deviceName: string;
  durationMinutes: number;
  end: string;
  id: string;
  start: string;
  status: string;
  title: string;
  extendedProps: {
    title: string;
    start: string; // ISO 8601 datetime string
    end: string; // ISO 8601 datetime string
    duration: string; // Formato "HH:mm:ss"
    device_name: string;
    status: 'pending' | 'completed' | 'failed'; // Enum con valores posibles
    id: number;
    interval: number;
    frequency: string;
  };
};

export type PreviewScheduleEvent = {
  id: string; // Puede ser string, pero si es siempre numérico, podría usarse number
  title: string;
  start: string; // ISO 8601 datetime string
  end: string; // ISO 8601 datetime string
  extendedProps: {
    title: string;
    start: string; // ISO 8601 datetime string
    end: string; // ISO 8601 datetime string
    duration: string; // Formato "HH:mm:ss"
    device_name: string;
    status: 'pending' | 'completed' | 'failed'; // Enum con valores posibles
    id: number;
  };
  deviceName: string;
  status: 'pending' | 'completed' | 'failed'; // Enum con valores posibles
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
