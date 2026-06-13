import { apiRequest, formBody, isSuccess } from './client';

export async function signup({ name, email, password }) {
  const data = await apiRequest('/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formBody({ name, email, password }),
  });

  if (!isSuccess(data)) {
    throw new Error(data.message || 'Signup failed');
  }

  return data;
}

export async function login({ email, password }) {
  const data = await apiRequest('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formBody({ email, password }),
  });

  if (!isSuccess(data)) {
    throw new Error(data.message || 'Login failed');
  }

  return data;
}

export async function getProfile(token) {
  const data = await apiRequest('/profile', { token });

  if (!isSuccess(data)) {
    throw new Error(data.message || 'Failed to load profile');
  }

  return data.user;
}
