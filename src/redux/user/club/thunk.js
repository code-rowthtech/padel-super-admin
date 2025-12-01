import { createAsyncThunk } from "@reduxjs/toolkit";
import * as Url from "../../../helpers/api/apiEndpoint";
import { userApi } from "../../../helpers/api/apiCore";
import { showError } from "../../../helpers/Toast";

export const getUserClub = createAsyncThunk(
  "club/getUserClub",
  async (data, { rejectWithValue }) => {
    try {
      const buildQuery = (params) => {
        const query = new URLSearchParams();

        if (params.limit) query.append("limit", params.limit);
        if (params.page) query.append("page", params.page);
        if (params.active !== undefined) query.append("active", params.active);
        if (params.search) query.append("search", params.search);

        return query.toString();
      };
      const res = await userApi.get(`${Url.GET_CLUB_API}?${buildQuery(data)}`);
      return res?.data;
    } catch (error) {
      showError(error?.message || error);
      return rejectWithValue(error);
    }
  }
);

export const addReviewClub = createAsyncThunk(
  "club/addReviewClub",
  async (data, { rejectWithValue }) => {
    try {
      const res = await userApi.post(Url.ADD_REVIEW_CLUB, data);
      return res?.data;
    } catch (error) {
      showError(error?.message || error);
      return rejectWithValue(error);
    }
  }
);

export const getReviewClub = createAsyncThunk(
  "club/getReviewClub",
  async (data, { rejectWithValue }) => {
    try {
      const res = await userApi.get(`${Url.GET_REVIEW_CLUB}?clubId=${data}`);
      return res?.data;
    } catch (error) {
    }
  }
);

export const getMapData = createAsyncThunk(
  "club/getMapData",
  async (address, { rejectWithValue }) => {
    try {
      const res = await userApi.get(`${Url.MAP_API}?address=${encodeURIComponent(address)}`);
      return res?.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);
