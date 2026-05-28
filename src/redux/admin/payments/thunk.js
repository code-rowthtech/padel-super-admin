import { createAsyncThunk } from "@reduxjs/toolkit";
import { ownerApi } from "../../../helpers/api/apiCore";
import { SUPER_ADMIN_GET_UNPAID_BOOKINGS } from "../../../helpers/api/apiEndpoint";

export const getPaymentsData = createAsyncThunk(
  "payments/getPaymentsData",
  async (params, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams(params).toString();
      const endpoint = SUPER_ADMIN_GET_UNPAID_BOOKINGS;
      const res = await ownerApi.get(
        query ? `${endpoint}?${query}` : endpoint
      );
      return res?.data?.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch payments data"
      );
    }
  }
);

export const getAllTransactions = createAsyncThunk(
  "payments/getAllTransactions",
  async (params, { rejectWithValue }) => {
    try {
      // TODO: Replace with actual API call when endpoint is ready
      // const query = new URLSearchParams(params).toString();
      // const res = await ownerApi.get(`${SUPER_ADMIN_GET_ALL_TRANSACTIONS}?${query}`);
      // return res?.data?.data;

      // Mock data for now
      return {
        transactions: [
          {
            _id: "wallet1",
            userId: { 
              name: "John Doe", 
              countryCode: "+91", 
              phoneNumber: "9876543210", 
              email: "john@example.com" 
            },
            type: "credit",
            amount: 500,
            description: "Wallet recharge",
            status: "success",
            createdAt: new Date().toISOString(),
            transactionType: "wallet"
          },
          {
            _id: "wallet2",
            userId: { 
              name: "Jane Smith", 
              countryCode: "+91", 
              phoneNumber: "9876543211", 
              email: "jane@example.com" 
            },
            type: "debit",
            amount: 200,
            description: "Booking payment",
            status: "success",
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            transactionType: "wallet"
          }
        ],
        pagination: {
          currentPage: params?.page || 1,
          totalPages: 1,
          totalItems: 2,
          itemsPerPage: 20,
        }
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch all transactions");
    }
  }
);
