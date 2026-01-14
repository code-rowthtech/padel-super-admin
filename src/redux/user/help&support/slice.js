import { createSlice } from "@reduxjs/toolkit";
import { createHelpRequest } from "./thunk";

const initialState = {
    helpLoading: false,
    helpData: null,
    helpError: null,
};

const helpSlice = createSlice({
    name: "help",
    initialState,
    reducers: {
        resetHelp(state) {
            state.helpLoading = false;
            state.helpData = null;
            state.helpError = null;

        }
    },
    extraReducers: (builder) => {
        builder
            // create help slice
            .addCase(createHelpRequest.pending, (state) => {
                state.helpLoading = true;
                state.helpError = null;
            })
            .addCase(createHelpRequest.fulfilled, (state, action) => {
                state.helpLoading = false;
                state.helpData = action.payload;
            })
            .addCase(createHelpRequest.rejected, (state, action) => {
                state.helpLoading = false;
                state.helpError = action.payload;
            })
    }
});

export const { resetHelp } = helpSlice.actions
export default helpSlice.reducer;