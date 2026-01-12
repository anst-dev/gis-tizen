/**
 * HttpService - Centralized HTTP Client using Axios
 * Pattern giống với services/httpService.ts trong nawasco-web-gis
 */

import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig
} from 'axios';
import qs from 'qs';

const API_BASE_URL = 'https://unsupercilious-leonarda-unreaving.ngrok-free.dev';

const http: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'accept': '*/*',
    'accept-language': 'vi,en-US;q=0.9,en-GB;q=0.8,en;q=0.7',
    'ngrok-skip-browser-warning': 'true'
    // Note: 'Referer' header cannot be set in browser (forbidden header name)
  },
  paramsSerializer: (params: Record<string, unknown>) => qs.stringify(params, { encode: false })
});

// Request interceptor
http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Có thể thêm token authentication nếu cần
    // const accessToken = localStorage.getItem('accessToken');
    // if (accessToken) {
    //   config.headers['Authorization'] = `Bearer ${accessToken}`;
    // }
    return config;
  },
  (error: unknown) => Promise.reject(error)
);

// Response interceptor
http.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: Error) => {
    console.error('[HttpService] Request failed:', error.message);
    return Promise.reject(error);
  }
);

export default http;
export { API_BASE_URL, type AxiosRequestConfig };
