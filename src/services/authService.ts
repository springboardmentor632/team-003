import api from './api'

export type RegisterData = { name: string; email: string; password: string; role?: string }
export type LoginData = { email: string; password: string }
export type UserResponse = { id: number; name: string; email: string; role: string; createdAt: string; updatedAt: string }

export const register = (data: RegisterData) => api.post('/auth/register', data)

export const login = async (data: LoginData) => {
  const res = await api.post('/auth/login', data)
  const token = res?.data?.token
  if (token) localStorage.setItem('token', token)
  return res
}

export const getProfile = () => api.get<UserResponse>('/users/profile')

export const updateProfile = (payload: Partial<{ name: string; email: string; password: string }>) =>
  api.put<UserResponse>('/users/profile', payload)

export const logout = () => {
  localStorage.removeItem('token')
}
