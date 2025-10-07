import axios from '../../../core/infrastructure/http/axiosInstance';

type TokenResponse = { access: string; [key: string]: any };

export const login = async (username: string, password: string) => {
  const response = await axios.post('/token/', { username, password });
  const data = response.data as TokenResponse;
  localStorage.setItem('token', data.access);
  return data;
};
