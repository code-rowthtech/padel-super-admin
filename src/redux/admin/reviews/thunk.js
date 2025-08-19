import { createAsyncThunk } from "@reduxjs/toolkit";
import * as Url from "../../../helpers/api/apiEndpoint";
import { ownerApi } from "../../../helpers/api/apiCore";
import { showError, showSuccess } from "../../../helpers/Toast";

export const getReviewsForOwner = createAsyncThunk(
  "reviews/getReviewsForOwner",
  async (params, { rejectWithValue }) => {
    try {
      const res = await ownerApi.get(
        `${Url.GET_REVIEWS_FOR_OWNER}?clubId=${params?.clubId}`
      );
      const { status, data, message } = res?.data || {};
      if (status === 200 || "200") {
        return data;
      }
      const errorMessage = message || "error fetching Data";
      showError(errorMessage);
      return rejectWithValue(errorMessage);
    } catch (error) {
      const errorMessage = error?.response?.data?.message;
      // showError(error);
      return rejectWithValue(errorMessage);
    }
  }
);
