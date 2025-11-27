import { createSlice } from "@reduxjs/toolkit";
import { addReviewClub, getReviewClub, getUserClub, getMapData } from "./thunk";

const initialState = {
    clubLoading: false,
    clubData: null,
    clubError: null,
    reviewLoading: false,
    reviewData: null,
    reviewError: null,
    getReviewLoading : false,
    getReviewData : null,
    getReviewError:null,
    mapLoading: false,
    mapData: null,
    mapError: null
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
            // -------------------------G-E-T--C-L-U-B----------------------//
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


            // -------------------------A-D-D---R-E-V-I-E-W----------------------//

            .addCase(addReviewClub.pending, (state) => {
                state.reviewLoading = true;
                state.reviewError = null;
            })
            .addCase(addReviewClub.fulfilled, (state, action) => {
                state.reviewLoading = false;
                state.reviewData = action.payload;
            })

            .addCase(addReviewClub.rejected, (state, action) => {
                state.reviewLoading = false
                state.reviewError = action.payload;
            })

              // -------------------------G-E-T---R-E-V-I-E-W----------------------//

            .addCase(getReviewClub.pending, (state) => {
                state.getReviewLoading = true;
                state.getReviewError = null;
            })
            .addCase(getReviewClub.fulfilled, (state, action) => {
                state.getReviewError = false;
                state.getReviewData = action.payload;
            })

            .addCase(getReviewClub.rejected, (state, action) => {
                state.getReviewLoading = false
                state.getReviewError = action.payload;
            })

            // -------------------------G-E-T---M-A-P----------------------//
            .addCase(getMapData.pending, (state) => {
                state.mapLoading = true;
                state.mapError = null;
            })
            .addCase(getMapData.fulfilled, (state, action) => {
                state.mapLoading = false;
                state.mapData = action.payload;
            })
            .addCase(getMapData.rejected, (state, action) => {
                state.mapLoading = false;
                state.mapError = action.payload;
            })
    }
});

export const { resetClub } = clubSlice.actions
export default clubSlice.reducer;