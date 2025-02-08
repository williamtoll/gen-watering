import { BASE_URL } from '../../Config';
import { apiResponseDevices } from '../../Types/Types';

export const getSchedules = () =>
  fetch(`${BASE_URL}/schedules`).then((res) => res.json());

export const getDevices = () =>
  fetch(`${BASE_URL}/devices`).then((res) =>
    res.json()
  ) as Promise<apiResponseDevices>;
