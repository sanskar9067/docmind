import { apiRequest, formBody, isSuccess } from './client';

export async function uploadPdf(token, file) {
  const body = new FormData();
  body.append('file', file);

  const data = await apiRequest('/upload', {
    method: 'POST',
    token,
    body,
  });

  if (!isSuccess(data)) {
    throw new Error(data.message || 'Upload failed');
  }

  return data;
}

export async function sendMessage(token, message, chatType) {
  const data = await apiRequest('/chat', {
    method: 'POST',
    token,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formBody({ message, chatType }),
  });

  if (!isSuccess(data)) {
    throw new Error(data.message || 'Chat request failed');
  }

  return data.response;
}

export async function getChatHistory(token) {
  const data = await apiRequest('/chat_history', { token });

  if (!isSuccess(data)) {
    throw new Error(data.message || 'Failed to load chat history');
  }

  return data.chats || [];
}
