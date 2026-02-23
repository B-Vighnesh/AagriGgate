import { requestJson } from '../lib/api';

export const getWeather = async (latitude, longitude) => {
  return requestJson(`/weather?latitude=${encodeURIComponent(latitude)}&longitude=${encodeURIComponent(longitude)}`);
};
