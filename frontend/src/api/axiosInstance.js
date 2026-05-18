import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL?.trim()

if (!baseURL) {
  if (import.meta.env.DEV) {
    console.warn('VITE_API_URL is not set. Defaulting to http://localhost:5000 for local development.')
  } else {
    throw new Error('VITE_API_URL is required in production. Set this environment variable to your backend URL.')
  }
}

const axiosInstance = axios.create({
    baseURL: baseURL || 'http://localhost:5000',
    headers: {
        'Content-Type': 'application/json'
    }
})

axiosInstance.interceptors.request.use(

    config=>{

        const token=
        localStorage.getItem('token')

        if(token){

            config.headers.Authorization=
            `Bearer ${token}`
        }

        return config
    },

    error=>{

        return Promise.reject(error)
    }
)

axiosInstance.interceptors.response.use(

    response=>response,

    error=>{

        if(error.response?.status===401){

            localStorage.clear()

            window.location.href='/login'
        }

        return Promise.reject(error)
    }
)

export default axiosInstance
