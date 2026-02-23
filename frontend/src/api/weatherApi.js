import { requestJson } from '../lib/api';

export const getWeatherByCity = async (city) => {
  return requestJson(`/weather?city=${encodeURIComponent(city)}`);
};

export const getWeatherForMe = async () => {
  return requestJson('/weather/me');
};
