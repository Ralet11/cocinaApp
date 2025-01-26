import { createSlice } from '@reduxjs/toolkit';

// Estado inicial
const initialState = {
  // Orden actual que se está siguiendo o editando
  currentOrder: {
    user_id: null,
    partner_id: null,
    price: 0,
    finalPrice: 0,
    deliveryFee: 0,
    deliveryAddress: '',
    code: '',
    items: [], // Detalles de los productos
    state: 'pending', // Estado inicial de la orden
  },

  // Lista de órdenes activas
  activeOrders: [],

  // Lista de órdenes históricas
  historicOrders: [],
};

// Creación del slice
const orderSlice = createSlice({
  name: 'order',
  initialState,

  // Reducers para manejar acciones del slice
  reducers: {
    // Actualiza los datos de la orden actual (mezclando los nuevos campos con los existentes)
    setCurrentOrder: (state, action) => {
      state.currentOrder = {
        ...state.currentOrder,
        ...action.payload,
      };
    },

    // Establece los items de la orden actual
    setOrderItems: (state, action) => {
      state.currentOrder.items = action.payload;
    },

    // Limpia los datos de la orden actual, devolviéndola al estado inicial
    clearCurrentOrder: (state) => {
      state.currentOrder = initialState.currentOrder;
    },

    // Agrega la orden actual al array de órdenes activas y luego limpia la orden actual
    addCurrentOrderToActiveOrders: (state, action) => {
      const { order, items } = action.payload;

      state.activeOrders.push({
        ...order,
        items: items || [], // Asegúrate de que los items estén presentes
        state: 'pending', // Estado inicial de la orden
      });

      state.currentOrder = initialState.currentOrder;
    },

    // Elimina una orden activa específica por su código
    removeActiveOrder: (state, action) => {
      state.activeOrders = state.activeOrders.filter(
        (order) => order.code !== action.payload
      );
    },

    // Establece una lista completa de órdenes históricas
    setHistoricOrders: (state, action) => {
      state.historicOrders = action.payload;
    },

    // Agrega una orden al historial
    addHistoricOrder: (state, action) => {
      state.historicOrders.push(action.payload);
    },

    // Actualiza el estado de una orden activa (y también el de la orden actual, si corresponde)
    updateOrderState: (state, action) => {
      const { code, newState } = action.payload;

      // Busca y actualiza la orden activa
      const order = state.activeOrders.find((o) => o.code === code);
      if (order) {
        order.state = newState;
      }

      // Si la orden actual coincide con la que se está actualizando, también actualiza su estado
      if (state.currentOrder?.code === code) {
        state.currentOrder.state = newState;
      }
    },
  },
});

// Exportar acciones y reducer
export const {
  setCurrentOrder,
  setOrderItems,
  clearCurrentOrder,
  addCurrentOrderToActiveOrders,
  removeActiveOrder,
  setHistoricOrders,
  addHistoricOrder,
  updateOrderState,
} = orderSlice.actions;

export default orderSlice.reducer;
