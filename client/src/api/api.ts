import axios from "axios"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api"

let clientId: string | null = null

export const setClientId = (id: string) => {
  clientId = id
}

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

api.interceptors.request.use(config => {
  if (clientId) {
    config.headers["X-Client-ID"] = clientId
  }

  return config
})
