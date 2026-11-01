import axios from 'axios'

const rawBaseURL = import.meta.env.VITE_API_URL?.trim()

if (!rawBaseURL) {
  console.warn('VITE_API_URL is not set or empty. Defaulting to relative API or localhost fallback.')
}

const baseURL = rawBaseURL || (import.meta.env.DEV ? 'http://localhost:5000' : '')

const axiosInstance = axios.create({
    baseURL,
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
