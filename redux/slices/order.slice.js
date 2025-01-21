// src/redux/slices/order.slice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentOrder: {
    user_id: null,
    partner_id: null,
    price: 0,
    finalPrice: 0,
    deliveryFee: 0,
    deliveryAddress: '',
    code: '',
    items: [], // Aquí guardaremos los productos con sus detalles
  },
  activeOrders: [], // Array para las órdenes activas

  // NUEVO: Campo para guardar las órdenes históricas
  historicOrders: [],
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    // Mezcla los campos que llegan en el payload con lo que ya había en currentOrder
    setCurrentOrder: (state, action) => {
      state.currentOrder = {
        ...state.currentOrder,
        ...action.payload,
      };
    },

    // Para poner los items (productos) en la orden
    setOrderItems: (state, action) => {
      // action.payload debería ser un array de productos
      state.currentOrder.items = action.payload;
    },

    // Para limpiar la orden, dejándola como al inicio
    clearCurrentOrder: (state) => {
      state.currentOrder = initialState.currentOrder;
    },

    // Agregar la orden actual al array de órdenes activas
    addCurrentOrderToActiveOrders: (state, action) => {
      const { order, items } = action.payload;

      // Combina la orden y sus items, y agrégala al array de órdenes activas
      state.activeOrders.push({
        ...order,
        items: items || [], // Asegúrate de que los items estén presentes
      });

      // Limpia la orden actual
      state.currentOrder = initialState.currentOrder;
    },

    // Para eliminar una orden activa específica por su ID (aquí por código)
    removeActiveOrder: (state, action) => {
      state.activeOrders = state.activeOrders.filter(
        (order) => order.code !== action.payload // Filtra las órdenes por código
      );
    },

    // NUEVO: Guardar la lista completa de órdenes históricas
    setHistoricOrders: (state, action) => {
      state.historicOrders = action.payload;
    },

    // NUEVO: Agregar una orden al historial
    addHistoricOrder: (state, action) => {
      state.historicOrders.push(action.payload);
    },
  },
});

export const {
  setCurrentOrder,
  setOrderItems,
  clearCurrentOrder,
  addCurrentOrderToActiveOrders,
  removeActiveOrder,
  setHistoricOrders,
  addHistoricOrder,
} = orderSlice.actions;

export default orderSlice.reducer;
