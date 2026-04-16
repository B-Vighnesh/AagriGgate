import { getApiBaseUrl, requestJson } from '../lib/api';
import { getToken } from '../lib/auth';

export const getChatConversations = async ({ status, archived } = {}) => {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (archived !== undefined && archived !== null) {
    params.set('archived', String(archived));
  }
  const query = params.toString();
  const path = query ? `/chat/conversations?${query}` : '/chat/conversations';
  return requestJson(path, { method: 'GET' });
};

export const getChatConversation = async (conversationId) =>
  requestJson(`/chat/conversations/${conversationId}`, { method: 'GET' });

export const getChatConversationByApproach = async (approachId) =>
  requestJson(`/chat/conversations/by-approach/${approachId}`, { method: 'GET' });

export const createOrGetChatConversation = async (approachId) =>
  requestJson(`/chat/conversations/from-approach/${approachId}`, { method: 'POST' });

export const getChatMessages = async (conversationId) =>
  requestJson(`/chat/conversations/${conversationId}/messages`, { method: 'GET' });

export const confirmChatDeal = async (conversationId, payload) =>
  requestJson(`/chat/conversations/${conversationId}/deal`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const failChatConversation = async (conversationId) =>
  requestJson(`/chat/conversations/${conversationId}/fail`, {
    method: 'POST',
  });

export const blockChatUser = async (userId, reason) => {
  const params = new URLSearchParams();
  if (reason) params.set('reason', reason);
  const query = params.toString();
  const path = query ? `/chat/users/${userId}/block?${query}` : `/chat/users/${userId}/block`;
  return requestJson(path, { method: 'POST' });
};

export const unblockChatUser = async (userId) =>
  requestJson(`/chat/users/${userId}/block`, {
    method: 'DELETE',
  });

export const reportChatUser = async (userId, payload) =>
  requestJson(`/chat/users/${userId}/report`, {
    method: 'POST',
    body: JSON.stringify(payload || {}),
  });

export const archiveChatConversation = async (conversationId) =>
  requestJson(`/chat/conversations/${conversationId}/archive`, {
    method: 'POST',
  });

export const unarchiveChatConversation = async (conversationId) =>
  requestJson(`/chat/conversations/${conversationId}/unarchive`, {
    method: 'POST',
  });

export const deleteChatConversation = async (conversationId) =>
  requestJson(`/chat/conversations/${conversationId}`, {
    method: 'DELETE',
  });

export const openChatSocket = ({ onOpen, onMessage, onClose, onError } = {}) => {
  const baseUrl = getApiBaseUrl();
  const token = getToken();

  if (!baseUrl) {
    throw new Error('VITE_API_BASE_URL is not configured.');
  }
  if (!token) {
    throw new Error('Missing auth token for chat connection.');
  }

  const wsBase = baseUrl.replace(/^http/i, 'ws').replace(/\/$/, '');
  const socket = new WebSocket(`${wsBase}/ws/chat?token=${encodeURIComponent(token)}`);

  socket.onopen = () => onOpen?.();
  socket.onclose = (event) => onClose?.(event);
  socket.onerror = (event) => onError?.(event);
  socket.onmessage = (event) => {
    try {
      const payload = JSON.parse(event.data);
      onMessage?.(payload);
    } catch {
      onError?.(new Error('Unable to parse chat event.'));
    }
  };

  return socket;
};
