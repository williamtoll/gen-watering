import { apiResponseDevices } from '../../Types/Types';

const BASE_URL = 'http://172.233.17.232:8000/api/';

export const getSchedules = () =>
  fetch(`${BASE_URL}schedules`).then((res) => res.json());

export const getDevices = () =>
  fetch(`${BASE_URL}devices`).then((res) =>
    res.json()
  ) as Promise<apiResponseDevices>;
