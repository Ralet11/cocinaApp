import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentOrder: {
    id: null,
    user_id: null,
    partner_id: null,
    price: 0,
    finalPrice: 0,
    deliveryFee: 0,
    deliveryAddress: '',
    items: [],
    status: 'pendiente',
  },
  historicOrders: [],
  activeOrders: [], // ← Añade esta propiedad para almacenar las órdenes "activas"
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    setCurrentOrder: (state, action) => {
      state.currentOrder = {
        ...state.currentOrder,
        ...action.payload,
      };
    },
    setOrderItems: (state, action) => {
      state.currentOrder.items = action.payload;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = initialState.currentOrder;
    },
    addCurrentOrderToHistoricOrders: (state, action) => {
      const { order, items } = action.payload;
      state.historicOrders.push({
        ...order,
        items: items || [],
        status: 'pendiente',
      });
      state.currentOrder = initialState.currentOrder;
    },

    // NUEVA FUNCIÓN
    addCurrentOrderToActiveOrders: (state, action) => {
      const { order, items } = action.payload;
      // Puedes ajustar el status si lo deseas, por ejemplo 'pending' u otro.
      state.activeOrders.push({
        ...order,
        items: items || [],
        status: 'pendiente',
      });
      state.currentOrder = initialState.currentOrder;
    },

    removeHistoricOrder: (state, action) => {
      state.historicOrders = state.historicOrders.filter(
        (o) => o.id !== action.payload
      );
    },
    setHistoricOrders: (state, action) => {
      state.historicOrders = action.payload;
    },
    addHistoricOrder: (state, action) => {
      state.historicOrders.push(action.payload);
    },
    updateOrderState: (state, action) => {
      const { orderId, newStatus } = action.payload;
      console.log(`in action updatestate id :${orderId}, status: ${newStatus}`);
      const order = state.historicOrders.find((o) => o.id === orderId);
      if (order) {
        order.status = newStatus;
      }
      if (state.currentOrder.id === orderId) {
        state.currentOrder.status = newStatus;
      }
    },
    setCurrentOrderById: (state, action) => {
      const orderId = action.payload;
      const order = state.historicOrders.find((o) => o.id === orderId);
      if (order) {
        state.currentOrder = { ...order };
      }
    },
  },
});

export const {
  setCurrentOrder,
  setOrderItems,
  clearCurrentOrder,
  addCurrentOrderToHistoricOrders,
  removeHistoricOrder,
  setHistoricOrders,
  addHistoricOrder,
  updateOrderState,
  setCurrentOrderById,

  // Asegúrate de exportar la nueva acción
  addCurrentOrderToActiveOrders,
} = orderSlice.actions;

export default orderSlice.reducer;
