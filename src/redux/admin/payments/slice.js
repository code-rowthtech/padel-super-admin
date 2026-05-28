import { createSlice } from "@reduxjs/toolkit";
import { getAllTransactions, getPaymentsData } from "./thunk";

const initialState = {
  payments: [],
  paymentsLoading: false,
  paymentsError: null,
  paymentsPagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
  },
  allTransactions: [],
  allTransactionsLoading: false,
  allTransactionsError: null,
  allTransactionsPagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
  },
};

const paymentsSlice = createSlice({
  name: "payments",
  initialState,
  reducers: {
    clearPayments: (state) => {
      state.payments = [];
      state.paymentsError = null;
    },
    clearAllTransactions: (state) => {
      state.allTransactions = [];
      state.allTransactionsError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getPaymentsData.pending, (state) => {
        state.paymentsLoading = true;
        state.paymentsError = null;
      })
      .addCase(getPaymentsData.fulfilled, (state, action) => {
        state.paymentsLoading = false;
        state.payments = action.payload?.bookings || [];
        state.paymentsPagination = action.payload?.pagination || initialState.paymentsPagination;
      })
      .addCase(getPaymentsData.rejected, (state, action) => {
        state.paymentsLoading = false;
        state.paymentsError = action.payload || "Failed to fetch payments data";
      })
      .addCase(getAllTransactions.pending, (state) => {
        state.allTransactionsLoading = true;
        state.allTransactionsError = null;
      })
      .addCase(getAllTransactions.fulfilled, (state, action) => {
        state.allTransactionsLoading = false;
        state.allTransactions = action.payload.transactions || [];
        state.allTransactionsPagination = action.payload.pagination || initialState.allTransactionsPagination;
      })
      .addCase(getAllTransactions.rejected, (state, action) => {
        state.allTransactionsLoading = false;
        state.allTransactionsError = action.payload || "Failed to fetch all transactions";
      });
  },
});

export const { clearPayments, clearAllTransactions } = paymentsSlice.actions;
export default paymentsSlice.reducer;
