import { createSlice } from "@reduxjs/toolkit";
import {
  getAllPlayerPreferences,
  createPlayerPreference,
  updatePlayerPreference,
  deletePlayerPreference,
  lookupCustomerByPhone,
  searchPlayersForMatch,
  searchPlayersByOpenMatch,
} from "./thunk";

const initialState = {
  preferences: [],
  loading: false,
  error: null,
  pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
  filters: { search: "", skillLevel: "", clubId: "" },

  // Lookup
  lookupLoading: false,
  lookupResult: null,

  // Save (create/update)
  saveLoading: false,

  // Delete
  deleteLoading: false,

  // Search for match
  matchSearchResults: [],
  matchSearchLoading: false,
  matchSearchError: null,
  selectedMatchContext: null,
  matchSearchPagination: { page: 1, limit: 20, total: 0, totalPages: 1 },
};

const playerPreferencesSlice = createSlice({
  name: "playerPreferences",
  initialState,
  reducers: {
    resetLookup: (state) => {
      state.lookupResult = null;
      state.lookupLoading = false;
    },
    resetMatchSearch: (state) => {
      state.matchSearchResults = [];
      state.matchSearchError = null;
      state.selectedMatchContext = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    // --- Lookup ---
    builder
      .addCase(lookupCustomerByPhone.pending, (state) => {
        state.lookupLoading = true;
        state.lookupResult = null;
      })
      .addCase(lookupCustomerByPhone.fulfilled, (state, action) => {
        state.lookupLoading = false;
        state.lookupResult = action.payload;
      })
      .addCase(lookupCustomerByPhone.rejected, (state) => {
        state.lookupLoading = false;
      });

    // --- Get All ---
    builder
      .addCase(getAllPlayerPreferences.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllPlayerPreferences.fulfilled, (state, action) => {
        state.loading = false;
        state.preferences = action.payload.preferences;
        state.pagination = {
          ...state.pagination,
          total: action.payload.total,
          page: action.payload.currentPage,
          totalPages: action.payload.totalPages,
        };
      })
      .addCase(getAllPlayerPreferences.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // --- Create ---
    builder
      .addCase(createPlayerPreference.pending, (state) => {
        state.saveLoading = true;
      })
      .addCase(createPlayerPreference.fulfilled, (state) => {
        state.saveLoading = false;
      })
      .addCase(createPlayerPreference.rejected, (state) => {
        state.saveLoading = false;
      });

    // --- Update ---
    builder
      .addCase(updatePlayerPreference.pending, (state) => {
        state.saveLoading = true;
      })
      .addCase(updatePlayerPreference.fulfilled, (state, action) => {
        state.saveLoading = false;
        const idx = state.preferences.findIndex((p) => p._id === action.payload?._id);
        if (idx !== -1) state.preferences[idx] = action.payload;
      })
      .addCase(updatePlayerPreference.rejected, (state) => {
        state.saveLoading = false;
      });

    // --- Delete ---
    builder
      .addCase(deletePlayerPreference.pending, (state) => {
        state.deleteLoading = true;
      })
      .addCase(deletePlayerPreference.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.preferences = state.preferences.filter((p) => p._id !== action.payload);
      })
      .addCase(deletePlayerPreference.rejected, (state) => {
        state.deleteLoading = false;
      });

    // --- Search for match ---
    builder
      .addCase(searchPlayersForMatch.pending, (state) => {
        state.matchSearchLoading = true;
        state.matchSearchError = null;
      })
      .addCase(searchPlayersForMatch.fulfilled, (state, action) => {
        state.matchSearchLoading = false;
        state.matchSearchResults = action.payload.players;
        state.selectedMatchContext = null;
        state.matchSearchPagination = {
          ...state.matchSearchPagination,
          total: action.payload.total,
          page: action.payload.currentPage,
          totalPages: action.payload.totalPages,
        };
      })
      .addCase(searchPlayersForMatch.rejected, (state, action) => {
        state.matchSearchLoading = false;
        state.matchSearchError = action.payload;
      })
      .addCase(searchPlayersByOpenMatch.pending, (state) => {
        state.matchSearchLoading = true;
        state.matchSearchError = null;
        state.selectedMatchContext = null;
      })
      .addCase(searchPlayersByOpenMatch.fulfilled, (state, action) => {
        state.matchSearchLoading = false;
        state.matchSearchResults = action.payload.players;
        state.selectedMatchContext = action.payload.matchContext;
        state.matchSearchPagination = {
          ...state.matchSearchPagination,
          total: action.payload.total,
          page: action.payload.currentPage,
          totalPages: action.payload.totalPages,
        };
      })
      .addCase(searchPlayersByOpenMatch.rejected, (state, action) => {
        state.matchSearchLoading = false;
        state.matchSearchError = action.payload;
      });
  },
});

export const { resetLookup, resetMatchSearch, setFilters, setPagination } =
  playerPreferencesSlice.actions;
export default playerPreferencesSlice.reducer;
