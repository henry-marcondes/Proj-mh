import axios from "axios";

const API = "http://localhost:8000";

export const register = (data) => axios.post(`${API}/auth/register`, data);
export const login = (data) => axios.post(`${API}/auth/login`, data);
export const getMe = (token) =>
  axios.get(`${API}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
