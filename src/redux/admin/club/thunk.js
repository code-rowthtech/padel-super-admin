import { createAsyncThunk } from "@reduxjs/toolkit";
import * as Url from "../../../helpers/api/apiEndpoint";
import { ownerApi } from "../../../helpers/api/apiCore";
import { showSuccess, showError } from "../.././../helpers/Toast";

export const registerClub = createAsyncThunk(
  "club/registerClub",
  async (data, { rejectWithValue }) => {
    try {
      const res = await ownerApi.post(Url.REGISTER_CLUB, data);
      console.log({ res });
      if (res?.data?.status === 200 || res?.data?.message === 'res') {
        return res?.data;
      } else {
        showError(res?.data?.message || "Failed to register club");
        return rejectWithValue(res?.data?.message || "Failed to register club");
      }
    } catch (error) {
      showError(error);
    }
  }
);

export const getSlots = createAsyncThunk(
  "club/getSlots",
  async (data, { rejectWithValue }) => {
    try {
      const res = await ownerApi.get(
        `${Url.GET_SLOT}?register_club_id=${data?.register_club_id}&day=${data?.day
        }&time=${data?.time || ""}&duration=${data?.duration || ""}`
      );
      if (res?.status === 200) {
        return res?.data;
      } else {
        showError(res?.data?.message || "Failed to create slot");
        return rejectWithValue(res?.data?.message || "Failed to create slot");
      }
    } catch (error) {
      showError(error);
    }
  }
);

export const updateRegisteredClub = createAsyncThunk(
  "club/updateRegisteredClub",
  async (data, { rejectWithValue }) => {
    try {
      const res = await ownerApi.put(Url.UPDATE_REGISTERED_CLUB, data);
      if (res?.status === 200) {
        return res?.data;
      } else {
        showError(res?.data?.message || "Failed to update club");
        return rejectWithValue(res?.data?.message || "Failed to update club");
      }
    } catch (error) {
      showError(error);
    }
  }
);

export const createSlot = createAsyncThunk(
  "club/createSlot",
  async (data, { rejectWithValue }) => {
    try {
      const res = await ownerApi.post(Url.CREATE_SLOT, data);
      if (res?.data?.status === 200) {
        showSuccess(res?.data?.message);
        return res?.data;
      } else {
        showError(res?.data?.message || "Failed to create slot");
        return rejectWithValue(res?.data?.message || "Failed to create slot");
      }
    } catch (error) {
      showError(error);
    }
  }
);

export const updateCourt = createAsyncThunk(
  "club/updateCourt",
  async (data, { rejectWithValue }) => {
    try {
      const res = await ownerApi.put(Url.UPDATE_COURT, data);
      if (res?.status === 200) {
        return res?.data;
      } else {
        showError(res?.data?.message || "Failed to create slot");
        return rejectWithValue(res?.data?.message || "Failed to create slot");
      }
    } catch (error) {
      showError(error);
    }
  }
);

export const updateSlotPrice = createAsyncThunk(
  "club/updateSlotPrice",
  async (data, { rejectWithValue }) => {
    try {
      const res = await ownerApi.put(Url.UPDATE_SLOT_PRICE, data);
      if (res?.status === 200) {
        showSuccess(res?.data?.message);
        return res?.data;
      } else {
        showError(res?.data?.message || "Failed to create slot");
        return rejectWithValue(res?.data?.message || "Failed to create slot");
      }
    } catch (error) {
      showError(error);
    }
  }
);

export const createSlotPrice = createAsyncThunk(
  "club/createSlotPrice",
  async (data, { rejectWithValue }) => {
    try {
      const res = await ownerApi.post(Url.CREATE_SLOT_PRICE, data);
      if (res?.status === 201 || res?.data?.success === true) {
        // showSuccess(res?.data?.message);
        return res?.data;
      } else {
        showError(res?.data?.message || "Failed to create slot");
        return rejectWithValue(res?.data?.message || "Failed to create slot");
      }
    } catch (error) {
      showError(error);
    }
  }
);

export const updateSlotBulkPrice = createAsyncThunk(
  "club/updateSlotBulkPrice",
  async (data, { rejectWithValue }) => {
    try {
      const res = await ownerApi.put(Url.UPDATE_SLOT_BULK_PRICE, data);
      if (res?.status === 200) {
        showSuccess(res?.data?.message);
        return res?.data;
      } else {
        showError(res?.data?.message || "Failed to create slot");
        return rejectWithValue(res?.data?.message || "Failed to create slot");
      }
    } catch (error) {
      showError(error);
    }
  }
);

export const getClubRegister = createAsyncThunk(
  "club/getClubRegister",
  async (data, { rejectWithValue }) => {
    try {
      const res = await ownerApi.get(`${Url.GET_CLUB_REGISTER}?clubId=${data}`);
      if (res?.status === 200) {
        return res?.data;
      } else {
        showError(res?.data?.message || "Failed to create slot");
        return rejectWithValue(res?.data?.message || "Failed to create slot");
      }
    } catch (error) {
      showError(error);
    }
  }
);
