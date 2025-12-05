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
    (response) => response,
    (error) => {
        // Preserve the full error object with status code
        const errorObj = {
            response: {
                status: error.response?.status,
                data: error.response?.data
            },
            message: error.message
        }
        return Promise.reject(errorObj)
    }
)

export default axiosClient
