import { requestJson } from '../lib/api';

export const getWeatherForMe = async () => {
  return requestJson('/weather/me');
};
