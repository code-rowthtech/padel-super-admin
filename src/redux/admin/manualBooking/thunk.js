import { createAsyncThunk } from "@reduxjs/toolkit";
import * as Url from '../../../helpers/api/apiEndpoint';
import { getApi } from "../../../helpers/api/apiCore";
import { showError } from "../../../helpers/Toast";

// Constants for error messages
const ERROR_MESSAGES = {
    FETCH_FAILED: 'Failed to get registered club',
    NETWORK_ERROR: 'Network error'
};

export const getOwnerRegisteredClub = createAsyncThunk(
    'manualBooking/getOwnerRegisteredClub',
    async (_, { rejectWithValue }) => { // Removed unused 'data' parameter
        try {
            const res = await getApi(Url.GET_REGISTERED_CLUB);

            // Destructure response data
            const { status, data, message } = res?.data || {};
            if (status === 200 || '200') {
                return data;
            }

            const errorMessage = message || ERROR_MESSAGES.FETCH_FAILED;
            showError(errorMessage);
            return rejectWithValue(errorMessage);

        } catch (error) {
            const errorMessage = error?.response?.data?.message || ERROR_MESSAGES.NETWORK_ERROR;
            showError(error);
            return rejectWithValue(errorMessage);
        }
    }
);

