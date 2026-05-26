import React, {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
} from 'react';
import { useLocation } from 'react-router-dom';
import { openChatSocket } from '../api/chatApi';
import { getNavbarCounts } from '../api/navbarApi';
import { getToken, isLoggedIn } from '../lib/auth';

const NavbarCountContext = createContext({
  unreadMessages: 0,
  unreadRequests: 0,
  unreadNotifications: 0,
  setUnreadMessages: () => {},
  setUnreadRequests: () => {},
  setUnreadNotifications: () => {},
  fetchAllNavbarCounts: async () => {},
});

export function NavbarCountProvider({ children }) {
  const location = useLocation();
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadRequests, setUnreadRequests] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const resetCounts = useCallback(() => {
    setUnreadMessages(0);
    setUnreadRequests(0);
    setUnreadNotifications(0);
  }, []);

  const fetchAllNavbarCounts = useCallback(async () => {
    if (!isLoggedIn()) {
      resetCounts();
      return;
    }

    try {
      const data = await getNavbarCounts();
      setUnreadMessages(Number(data?.unreadConversations ?? 0));
      setUnreadRequests(Number(data?.unreadRequests ?? 0));
      setUnreadNotifications(Number(data?.unreadNotifications ?? 0));
    } catch {
      resetCounts();
    }
  }, [resetCounts]);

  useEffect(() => {
    fetchAllNavbarCounts();
  }, [fetchAllNavbarCounts]);

  useEffect(() => {
    const handleAuthChanged = () => {
      fetchAllNavbarCounts();
    };
    const handleFocus = () => {
      fetchAllNavbarCounts();
    };
    const handleChatCountUpdated = (event) => {
      if (typeof event?.detail?.count === 'number') {
        setUnreadMessages(Number(event.detail.count));
        return;
      }
      fetchAllNavbarCounts();
    };
    const handleRequestCountUpdated = (event) => {
      if (typeof event?.detail?.count === 'number') {
        setUnreadRequests(Number(event.detail.count));
        return;
      }
      fetchAllNavbarCounts();
    };
    const handleNotificationCountUpdated = (event) => {
      if (typeof event?.detail?.count === 'number') {
        setUnreadNotifications(Number(event.detail.count));
        return;
      }
      fetchAllNavbarCounts();
    };

    window.addEventListener('auth:changed', handleAuthChanged);
    window.addEventListener('auth:expired', handleAuthChanged);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('chat:count-updated', handleChatCountUpdated);
    window.addEventListener('requests:count-updated', handleRequestCountUpdated);
    window.addEventListener('notifications:count-updated', handleNotificationCountUpdated);

    return () => {
      window.removeEventListener('auth:changed', handleAuthChanged);
      window.removeEventListener('auth:expired', handleAuthChanged);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('chat:count-updated', handleChatCountUpdated);
      window.removeEventListener('requests:count-updated', handleRequestCountUpdated);
      window.removeEventListener('notifications:count-updated', handleNotificationCountUpdated);
    };
  }, [fetchAllNavbarCounts]);

  useEffect(() => {
    const isChatRoute = location.pathname.startsWith('/chat');
    const isRequestRoute = location.pathname.startsWith('/view-approach')
      || location.pathname.startsWith('/view-approaches-user')
      || location.pathname.startsWith('/requests');
    const isNotificationRoute = location.pathname.startsWith('/notifications');

    if (isChatRoute || isRequestRoute || isNotificationRoute) {
      fetchAllNavbarCounts();
    }
  }, [fetchAllNavbarCounts, location.pathname]);

  useEffect(() => {
    if (!isLoggedIn() || !getToken()) {
      return undefined;
    }

    try {
      const socket = openChatSocket({
        onMessage: (payload) => {
          if (payload?.type === 'CHAT_MESSAGE'
            || payload?.type === 'CONVERSATION_UPDATE'
            || payload?.type === 'CONVERSATION_REMOVED'
            || payload?.type === 'MESSAGE_STATUS_UPDATE') {
            fetchAllNavbarCounts();
          }
        },
      });

      return () => {
        socket.close();
      };
    } catch {
      return undefined;
    }
  }, [fetchAllNavbarCounts]);

  const value = useMemo(() => ({
    unreadMessages,
    unreadRequests,
    unreadNotifications,
    setUnreadMessages,
    setUnreadRequests,
    setUnreadNotifications,
    fetchAllNavbarCounts,
  }), [
    unreadMessages,
    unreadRequests,
    unreadNotifications,
    fetchAllNavbarCounts,
  ]);

  return (
    <NavbarCountContext.Provider value={value}>
      {children}
    </NavbarCountContext.Provider>
  );
}

export const useNavbarCounts = () => useContext(NavbarCountContext);
