import { createSlice } from "@reduxjs/toolkit";
import { getMatchRequestPlayers, sendMatchRequest } from "./thunk";

const initialState = {
  matchRequestPlayers: [],
  matchRequestLoading: false,
  matchRequestError: null,
  sendRequestLoading: false,
  sendRequestError: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  },
  filters: {
    search: "",
    gender: "",
    level: "",
    skillLevel: "",
  },
};

const matchRequestSlice = createSlice({
  name: "matchRequest",
  initialState,
  reducers: {
    resetMatchRequest: (state) => {
      state.matchRequestPlayers = [];
      state.matchRequestError = null;
      state.sendRequestError = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getMatchRequestPlayers.pending, (state) => {
        state.matchRequestLoading = true;
        state.matchRequestError = null;
      })
      .addCase(getMatchRequestPlayers.fulfilled, (state, action) => {
        state.matchRequestLoading = false;
        state.matchRequestPlayers = action.payload.players || [];
        state.pagination = {
          ...state.pagination,
          page: action.payload.pagination?.currentPage || 1,
          total: action.payload.pagination?.totalItems || 0,
          totalPages: action.payload.pagination?.totalPages || 1,
        };
      })
      .addCase(getMatchRequestPlayers.rejected, (state, action) => {
        state.matchRequestLoading = false;
        state.matchRequestError = action.payload;
      })
      .addCase(sendMatchRequest.pending, (state) => {
        state.sendRequestLoading = true;
        state.sendRequestError = null;
      })
      .addCase(sendMatchRequest.fulfilled, (state) => {
        state.sendRequestLoading = false;
      })
      .addCase(sendMatchRequest.rejected, (state, action) => {
        state.sendRequestLoading = false;
        state.sendRequestError = action.payload;
      });
  },
});

export const { resetMatchRequest, setFilters, setPagination } = matchRequestSlice.actions;
export default matchRequestSlice.reducer;
