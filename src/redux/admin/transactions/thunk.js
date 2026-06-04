import { createAsyncThunk } from "@reduxjs/toolkit";
import { ownerApi } from "../../../helpers/api/apiCore";
import { SUPER_ADMIN_ALL_TRANSACTIONS } from "../../../helpers/api/apiEndpoint";

export const getAllTransactions = createAsyncThunk(
  "transactions/getAllTransactions",
  async (params, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await ownerApi.get(
        query ? `${SUPER_ADMIN_ALL_TRANSACTIONS}?${query}` : SUPER_ADMIN_ALL_TRANSACTIONS
      );
      return res?.data?.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch transactions"
      );
    }
  }
);
