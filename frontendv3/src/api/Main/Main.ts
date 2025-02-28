import { apiResponseDevices } from '../../Types/Types';
import {
  scheduleItemToSendRaw,
  editScheduleItemToSendRaw,
} from '../../Types/Types';
import axios from 'axios';

console.log(process.env.REACT_APP_BASE_URL);

export const BASE_URL =
  process.env.REACT_APP_BASE_URL_LOCAL || 'https://www.smartwatering.lat/api/';

// export const BASE_URL = 'http://0.0.0.0:8000/api/';

export const getSchedules = () =>
  fetch(`${BASE_URL}schedules`).then((res) => res.json());

export const getAllSchedules = () =>
  fetch(`${BASE_URL}schedules`).then((res) => res.json());

export const getDevices = () =>
  fetch(`${BASE_URL}devices`).then((res) =>
    res.json()
  ) as Promise<apiResponseDevices>;

export const addSchedule = (newSchedule: scheduleItemToSendRaw) => {
  return axios.post(`${BASE_URL}generate_schedule`, newSchedule);
};

export const editSchedule = (editedSchedule: editScheduleItemToSendRaw) => {
  return axios.put(`${BASE_URL}schedules/${editedSchedule.id}`, editedSchedule);
};
