import { createAsyncThunk } from "@reduxjs/toolkit";
import * as Url from "../../../helpers/api/apiEndpoint";
import { ownerApi } from "../../../helpers/api/apiCore";
import { showError, showSuccess } from "../../../helpers/Toast";

export const searchUserByNumber = createAsyncThunk(
  "searchUserbynumber/searchUserByNumber",
  async (params, { rejectWithValue }) => {
    try {
    
      const res = await ownerApi.get(`${Url.SEARCH_USER_BY_PHONE_NUMBER}?phoneNumber=${params.phoneNumber}&type=${params.type || ''}`);
      rejectWithValue(res?.data?.message);

      return res?.data;

    } catch (error) {
      const errorMessage = error?.response?.data?.message;
      showError(errorMessage || error);
      // return rejectWithValue(errorMessage);
    }
  }
);

