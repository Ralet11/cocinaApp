// useSocket.js
import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { store } from '../redux/store';
import { updateOrderState } from '../redux/slices/order.slice';

// O si prefieres, usa la variable de entorno: const socketUrl = API_URL;
const SOCKET_URL = 'http://192.168.0.251:3000';

export default function useSocket() {
  // 1. Obtenemos el userInfo (donde está el userId)
  const userInfo = useSelector((state) => state.user.userInfo);

  // 2. Usamos useRef para guardar la instancia del socket sin que se pierda en cada render
  const socketRef = useRef(null);

  useEffect(() => {
    // Solo conectamos si existe userInfo y, por ende, userInfo.id
    if (userInfo?.id) {
      // 3. Inicializamos el socket
      socketRef.current = io(SOCKET_URL, {
        transports: ['websocket'],
        autoConnect: true,
      });

      // 4. Escuchamos el evento `connect`
      socketRef.current.on('connect', () => {
        console.log('Socket conectado:', socketRef.current.id);
        // 4.1. Emitimos el joinRoom con el userId
        socketRef.current.emit('joinRoom', userInfo.id);
      });

      // 5. Escuchamos el evento "state changed"
      socketRef.current.on('state changed', (data) => {
        console.log("Evento 'state changed' recibido:", data);
        const { orderId, status } = data;

        // Despacha la acción de Redux para actualizar el estado de la orden
        store.dispatch(updateOrderState({ orderId, newStatus: status }));
      });

      // 6. Manejo de errores
      socketRef.current.on('connect_error', (err) => {
        console.error('Error al conectar al socket:', err);
      });

      // 7. Limpieza: al desmontar el componente o cambiar de usuario, desconectamos el socket
      return () => {
        console.log('Desconectando socket...');
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    }
  }, [userInfo?.id]); // se reejecuta si el userId cambia

  // 8. Devuelve el socketRef por si necesitas usarlo en otro lado
  return socketRef.current;
}
