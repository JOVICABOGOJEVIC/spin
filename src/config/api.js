const normalizeUrl = (url) => {
  if (!url) return url;
  return url.endsWith('/') ? url.slice(0, -1) : url;
};

export const API_BASE_URL = normalizeUrl(process.env.REACT_APP_API_URL) || 'http://localhost:5000';
export const SOCKET_BASE_URL = API_BASE_URL;

export default {
  API_BASE_URL,
  SOCKET_BASE_URL,
};

