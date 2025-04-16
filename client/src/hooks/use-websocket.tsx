import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Order } from '@/types';

// Event types
type WebSocketEvent = 
  | { type: 'connection', message: string }
  | { type: 'echo', data: any }
  | { type: 'new-order', order: Order }
  | { type: 'order-status-update', order: Order };

interface UseWebSocketOptions {
  onNewOrder?: (order: Order) => void;
  onOrderStatusUpdate?: (order: Order) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  autoReconnect?: boolean;
  showToasts?: boolean;
}

export function useWebSocket({
  onNewOrder,
  onOrderStatusUpdate,
  onConnect,
  onDisconnect,
  autoReconnect = true,
  showToasts = true
}: UseWebSocketOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketEvent | null>(null);
  const { toast } = useToast();
  
  // Use ref to avoid issues with callback closures
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  
  // Setup the socket connection
  const connectSocket = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) return;
    
    try {
      // Determine the correct protocol based on the current URL
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      // Create new WebSocket connection
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;
      
      socket.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        onConnect?.();
        
        if (showToasts) {
          toast({
            title: 'Connected to server',
            description: 'You will receive real-time order notifications',
          });
        }
      };
      
      socket.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        onDisconnect?.();
        
        if (showToasts) {
          toast({
            title: 'Disconnected from server',
            description: 'You won\'t receive real-time notifications',
            variant: 'destructive',
          });
        }
        
        // Auto reconnect logic
        if (autoReconnect && !reconnectTimeoutRef.current) {
          reconnectTimeoutRef.current = window.setTimeout(() => {
            reconnectTimeoutRef.current = null;
            connectSocket();
          }, 5000);
        }
      };
      
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as WebSocketEvent;
          console.log('WebSocket message received:', data);
          setLastMessage(data);
          
          // Handle different message types
          switch (data.type) {
            case 'new-order':
              onNewOrder?.(data.order);
              if (showToasts) {
                toast({
                  title: 'New Order Received',
                  description: `Order #${data.order.id} from ${data.order.name || 'Guest'} (Room ${data.order.roomNumber})`,
                  variant: 'default',
                });
                
                // Play sound notification if available and enabled
                const adminSettings = JSON.parse(localStorage.getItem('adminSettings') || '{}');
                if (adminSettings.orderAlertSound !== false) {
                  const audio = new Audio('/notification.mp3');
                  audio.play().catch(err => console.log('Error playing notification sound:', err));
                }
              }
              break;
              
            case 'order-status-update':
              onOrderStatusUpdate?.(data.order);
              if (showToasts) {
                toast({
                  title: 'Order Status Updated',
                  description: `Order #${data.order.id} status changed to ${data.order.status}`,
                });
              }
              break;
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        if (showToasts) {
          toast({
            title: 'Connection Error',
            description: 'Could not connect to notification service',
            variant: 'destructive',
          });
        }
      };
      
    } catch (error) {
      console.error('Error setting up WebSocket:', error);
    }
  }, [onConnect, onDisconnect, onNewOrder, onOrderStatusUpdate, showToasts, toast]);
  
  // Send a message to the server
  const sendMessage = useCallback((data: any) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(data));
      return true;
    }
    return false;
  }, []);
  
  // Connect on mount, disconnect on unmount
  useEffect(() => {
    connectSocket();
    
    return () => {
      // Clear any reconnect timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      // Close the socket
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [connectSocket]);
  
  // Manual reconnect function
  const reconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    
    // Clear any existing reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    connectSocket();
  }, [connectSocket]);
  
  return {
    isConnected,
    lastMessage,
    sendMessage,
    reconnect
  };
}