import { useState, useEffect, useCallback } from 'react';
import { useNotification } from '../context/NotificationContext';

/**
 * Custom hook for WebSocket connection with auto-reconnect and event handling
 * @param {Object} options - Configuration options
 * @param {Function} options.onConnect - Callback when connection is established
 * @param {Function} options.onDisconnect - Callback when connection is lost
 * @param {Function} options.onNewOrder - Callback when a new order is received
 * @param {Function} options.onOrderStatusUpdate - Callback when an order status is updated
 * @param {boolean} options.autoReconnect - Whether to automatically reconnect on disconnect
 * @param {boolean} options.showToasts - Whether to show toast notifications for events
 * @returns {Object} WebSocket state and methods
 */
export function useWebSocket({
  onConnect,
  onDisconnect,
  onNewOrder,
  onOrderStatusUpdate,
  autoReconnect = true,
  showToasts = true
} = {}) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const { playNotificationSound } = useNotification();

  // Connect to WebSocket server
  const connect = useCallback(() => {
    try {
      // Get server URL from localStorage
      const serverUrl = localStorage.getItem('serverUrl') || window.location.origin;
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = serverUrl.startsWith('http') 
        ? serverUrl.replace(/^http/, 'ws') + '/ws'
        : `${wsProtocol}//${window.location.host}/ws`;
      
      console.log('Connecting to WebSocket:', wsUrl);
      
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        if (onConnect) onConnect();
      };
      
      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        if (onDisconnect) onDisconnect();
        
        // Auto reconnect after delay
        if (autoReconnect) {
          setTimeout(() => {
            connect();
          }, 5000);
        }
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastMessage(data);
          
          console.log('WebSocket message received:', data);
          
          // Handle different message types
          switch (data.type) {
            case 'new-order':
              handleNewOrder(data.order);
              break;
            case 'order-status-update':
              handleOrderStatusUpdate(data.order);
              break;
            default:
              // Handle other message types or ignore
              break;
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      setSocket(ws);
      
      // Clean up on unmount
      return () => {
        if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
          ws.close();
        }
      };
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
    }
  }, [autoReconnect, onConnect, onDisconnect]);
  
  // Handle new order notification
  const handleNewOrder = useCallback((order) => {
    // Play notification sound
    playNotificationSound();
    
    // Call event handler if provided
    if (onNewOrder) onNewOrder(order);
    
    // Show notification if browser is in background
    if (document.visibilityState === 'hidden' && Notification.permission === 'granted') {
      try {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.ready.then(registration => {
            registration.showNotification('New Order Received!', {
              body: `Order #${order.id} from ${order.name || 'Room ' + order.roomNumber}`,
              icon: '/logo192.png',
              badge: '/logo192.png',
              vibrate: [200, 100, 200, 100, 200, 100, 400],
              tag: `new-order-${order.id}`,
              data: { orderId: order.id },
              actions: [
                {
                  action: 'view',
                  title: 'View',
                }
              ],
              requireInteraction: true,
              renotify: true
            });
          });
        } else {
          // Fallback to regular notification
          new Notification('New Order Received!', {
            body: `Order #${order.id} from ${order.name || 'Room ' + order.roomNumber}`,
            icon: '/logo192.png'
          });
        }
      } catch (error) {
        console.error('Error showing notification:', error);
      }
    }
  }, [onNewOrder, playNotificationSound]);
  
  // Handle order status update notification
  const handleOrderStatusUpdate = useCallback((order) => {
    // Call event handler if provided
    if (onOrderStatusUpdate) onOrderStatusUpdate(order);
  }, [onOrderStatusUpdate]);

  // Connect on mount
  useEffect(() => {
    connect();
    
    // Listen for visibility changes to reconnect if needed
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !isConnected) {
        connect();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [connect, isConnected]);

  // Method to send a message to the server
  const sendMessage = useCallback((type, data) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type, data }));
      return true;
    }
    return false;
  }, [socket]);

  // Method to manually reconnect
  const reconnect = useCallback(() => {
    if (socket) {
      socket.close();
    }
    connect();
  }, [socket, connect]);

  return {
    isConnected,
    lastMessage,
    sendMessage,
    reconnect
  };
}