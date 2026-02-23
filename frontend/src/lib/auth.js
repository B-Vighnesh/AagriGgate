export const getToken = () => localStorage.getItem('token');
export const getRole = () => localStorage.getItem('role') || '';
export const getFarmerId = () => localStorage.getItem('farmerId') || '';

const isUsableToken = (value) => Boolean(value && value !== 'undefined' && value !== 'null');

export const setAuth = ({ token, role, farmerId }) => {
  if (isUsableToken(token)) localStorage.setItem('token', token);
  if (role) localStorage.setItem('role', role);
  if (farmerId) localStorage.setItem('farmerId', farmerId);
};

export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('farmerId');
};

export const isLoggedIn = () => isUsableToken(getToken());

export const hasCompleteSession = () => isLoggedIn() && Boolean(getRole()) && Boolean(getFarmerId());
