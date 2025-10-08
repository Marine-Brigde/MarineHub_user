// src/api/axiosClient.ts
import axios from 'axios'

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'https://marine-bridge.orbitmap.vn/api',
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
    }
})

// 🔁 Interceptors (tự động gắn token nếu có)
axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

axiosClient.interceptors.response.use(
    (response) => response.data,
    (error) => Promise.reject(error.response?.data || error.message)
)

export default axiosClient
