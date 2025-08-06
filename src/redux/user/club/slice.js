import { createSlice } from "@reduxjs/toolkit";
import { getUserClub } from "./thunk";

const initialState = {
    clubLoading: false,
    clubData: null,
    clubError: null
};

const clubSlice = createSlice({
    name: "club",
    initialState,
    reducers: {
        resetClub(state) {
            state.clubLoading = false;
            state.clubData = null;
            state.clubError = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // -------------------------G-E-T--M-A-T-C-H----------------------//
            .addCase(getUserClub.pending, (state) => {
                state.clubLoading = true;
                state.clubError = null;
            })
            .addCase(getUserClub.fulfilled, (state, action) => {
                state.clubLoading = false;
                state.clubData = action.payload;
            })
            .addCase(getUserClub.rejected, (state, action) => {
                state.clubLoading = false;
                state.clubError = action.payload;
            })
        // -------------------------U-P-D-A-T-E--M-A-T-C-H----------------------//
    }
});

export const { resetClub } = clubSlice.actions
export default clubSlice.reducer;