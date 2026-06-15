import { createAsyncThunk } from "@reduxjs/toolkit";
import * as Url from "../../../helpers/api/apiEndpoint";
import { ownerApi } from "../../../helpers/api/apiCore";
import { showError, showSuccess } from "../../../helpers/Toast";

export const lookupCustomerByPhone = createAsyncThunk(
  "playerPreferences/lookupCustomer",
  async (phoneNumber, { rejectWithValue }) => {
    try {
      const res = await ownerApi.get(`${Url.PLAYER_PREF_LOOKUP_CUSTOMER}?phoneNumber=${phoneNumber}`);
      return res.data;
    } catch (error) {
      const msg = error?.response?.data?.message || "Error looking up customer";
      showError(msg);
      return rejectWithValue(msg);
    }
  }
);

export const getAllPlayerPreferences = createAsyncThunk(
  "playerPreferences/getAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams();
      if (params.page) query.append("page", params.page);
      if (params.limit) query.append("limit", params.limit);
      if (params.search) query.append("search", params.search);
      if (params.skillLevel) query.append("skillLevel", params.skillLevel);
      if (params.clubId) query.append("clubId", params.clubId);
      if (params.day) query.append("day", params.day);
      if (params.timeSlot) query.append("timeSlot", params.timeSlot);

      const res = await ownerApi.get(`${Url.PLAYER_PREF_GET_ALL}?${query.toString()}`);
      const { status, data } = res || {};
      if (status === 200) {
        return {
          preferences: data?.data || [],
          total: data?.total || 0,
          currentPage: data?.currentPage || 1,
          totalPages: data?.totalPages || 1,
        };
      }
      return rejectWithValue("Failed to fetch preferences");
    } catch (error) {
      const msg = error?.response?.data?.message || "Error fetching preferences";
      showError(msg);
      return rejectWithValue(msg);
    }
  }
);

export const createPlayerPreference = createAsyncThunk(
  "playerPreferences/create",
  async (data, { rejectWithValue }) => {
    try {
      const res = await ownerApi.post(Url.PLAYER_PREF_CREATE, data);
      const { status, data: resData } = res || {};
      if (status === 200 || status === 201) {
        showSuccess("Player preference saved successfully");
        return resData?.data;
      }
      return rejectWithValue("Failed to create preference");
    } catch (error) {
      const msg = error?.response?.data?.message || "Error creating preference";
      showError(msg);
      return rejectWithValue(msg);
    }
  }
);

export const updatePlayerPreference = createAsyncThunk(
  "playerPreferences/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await ownerApi.put(`${Url.PLAYER_PREF_UPDATE}/${id}`, data);
      const { status, data: resData } = res || {};
      if (status === 200) {
        showSuccess("Player preference updated successfully");
        return resData?.data;
      }
      return rejectWithValue("Failed to update preference");
    } catch (error) {
      const msg = error?.response?.data?.message || "Error updating preference";
      showError(msg);
      return rejectWithValue(msg);
    }
  }
);

export const deletePlayerPreference = createAsyncThunk(
  "playerPreferences/delete",
  async (id, { rejectWithValue }) => {
    try {
      const res = await ownerApi.delete(`${Url.PLAYER_PREF_DELETE}/${id}`);
      const { status } = res || {};
      if (status === 200) {
        showSuccess("Player preference deleted successfully");
        return id;
      }
      return rejectWithValue("Failed to delete preference");
    } catch (error) {
      const msg = error?.response?.data?.message || "Error deleting preference";
      showError(msg);
      return rejectWithValue(msg);
    }
  }
);

export const searchPlayersForMatch = createAsyncThunk(
  "playerPreferences/searchForMatch",
  async (params = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams();
      if (params.clubId) query.append("clubId", params.clubId);
      if (params.day) query.append("day", params.day);
      if (params.timeSlot) query.append("timeSlot", params.timeSlot);
      if (params.skillLevel) query.append("skillLevel", params.skillLevel);
      if (params.page) query.append("page", params.page);
      if (params.limit) query.append("limit", params.limit);

      const res = await ownerApi.get(`${Url.PLAYER_PREF_SEARCH_FOR_MATCH}?${query.toString()}`);
      const { status, data } = res || {};
      if (status === 200) {
        return {
          players: data?.data || [],
          total: data?.total || 0,
          currentPage: data?.currentPage || 1,
          totalPages: data?.totalPages || 1,
        };
      }
      return rejectWithValue("Failed to search players");
    } catch (error) {
      const msg = error?.response?.data?.message || "Error searching players";
      showError(msg);
      return rejectWithValue(msg);
    }
  }
);
