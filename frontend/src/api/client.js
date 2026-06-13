const API_BASE = process.env.REACT_APP_API_URL || '';

export function isSuccess(data) {
  return data?.success === 'True' || data?.success === true;
}

export async function apiRequest(path, options = {}) {
  const { token, body, headers = {}, ...rest } = options;

  const requestHeaders = { ...headers };
  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: requestHeaders,
    body,
  });

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error('Unexpected server response');
  }

  return data;
}

export function formBody(fields) {
  const params = new URLSearchParams();
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, value);
    }
  });
  return params;
}
