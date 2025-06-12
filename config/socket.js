// ─────────────────────────────────────────────────────────────────────────────
// hooks/useSocket.js      ← REEMPLAZA TODO ESTE ARCHIVO
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useRef } from 'react';
import { io }                 from 'socket.io-client';
import axios                  from 'react-native-axios';
import { useSelector, useDispatch } from 'react-redux';
import {
  updateOrderState,
  addHistoricOrder,
} from '../redux/slices/order.slice';
import { API_URL } from '@env';

import { navigationRef } from '../navigation';
import { store }         from '../redux/store';

/* ───────── URL del socket ─────────────────────────────────────────── */
const DEV_SOCKET = 'http://192.168.0.251:3000';
const SOCKET_URL =
  process.env.NODE_ENV === 'development'
    ? DEV_SOCKET
    : process.env.SOCKET_URL || `${API_URL.replace(/\/+$/, '')}`;

export default function useSocket() {
  const dispatch  = useDispatch();
  const userInfo  = useSelector((s) => s.user.userInfo);
  const token     = useSelector((s) => s.user.token);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!userInfo?.id) return;
    if (socketRef.current) return;

    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1500,
      auth: { token },
    });

    socketRef.current.connect();

    /* ----- Conexión base ----- */
    socketRef.current.on('connect', () => {
      console.log('[socket] connected:', socketRef.current.id);
      socketRef.current.emit('joinRoom', userInfo.id);
    });

    socketRef.current.on('disconnect', (reason) =>
      console.log('[socket] disconnected:', reason),
    );

    socketRef.current.on('connect_error', (err) =>
      console.error('[socket] connect_error:', err.message),
    );

    /* ----- Evento principal ----- */
    socketRef.current.on(
      'order_state_changed',
      async ({ orderId, status }) => {
        console.log('[socket] order_state_changed:', orderId, status);

        /* 1️⃣ Actualizar estado en Redux */
        dispatch(updateOrderState({ orderId, newStatus: status }));

        /* 2️⃣ Si la orden no existe todavía, obtenerla completa y guardarla */
        const {
          order: { activeOrders, historicOrders },
        } = store.getState();

        const known =
          activeOrders.some((o) => o.id === orderId) ||
          historicOrders.some((o) => o.id === orderId);

        if (!known) {
          try {
            const { data: fullOrder } = await axios.get(
              `${API_URL}/order/${orderId}`,
            );
            dispatch(addHistoricOrder(fullOrder)); // guarda objeto completo
          } catch (e) {
            console.error('[socket] error fetching order', e.message);
          }
        }

        /* 3️⃣ Navegar a tracking si la navegación está lista */
        if (navigationRef.isReady()) {
          navigationRef.navigate('OrderTracking', { orderId });
        }
      },
    );

    /* ----- Limpieza ----- */
    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [userInfo?.id, token, dispatch]);

  return socketRef.current;
}
