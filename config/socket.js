import { io } from 'socket.io-client';
import { API_URL } from '@env'; // Asegúrate de configurar correctamente las variables de entorno
import { store } from '../redux/store';
import { updateOrderState } from '../redux/slices/order.slice'; // Importa la acción para actualizar el estado de la orden

const socket = io("http://192.168.0.251:3000", {
  transports: ['websocket'],
  autoConnect: true,
});

// Listener cuando se conecta al servidor
socket.on('connect', () => {
  console.log('Socket conectado:', socket.id);
});

// Listener para cambios de estado de las órdenes
socket.on('state changed', (data) => {
  console.log("Evento 'state changed' recibido:", data);

  const { orderId, status } = data;

  // Despacha la acción de Redux para actualizar el estado de la orden
  store.dispatch(updateOrderState({ orderId, newStatus: status }));
});

// Listener para manejar errores de conexión
socket.on('connect_error', (err) => {
  console.error('Error al conectar al socket:', err);
});

// Desconectar el socket al cerrar la aplicación (opcional)
socket.on('disconnect', () => {
  console.log('Socket desconectado.');
});

export default socket;
