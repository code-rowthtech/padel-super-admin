import { createAsyncThunk } from "@reduxjs/toolkit";
import * as Url from '../../helpers/api/apiEndpoint';
import { getApi, create, update, remove } from "../../helpers/api/apiCore";
import { showSuccess, showError } from "../../helpers/Toast";

export const getMatch = createAsyncThunk(
    "match/getMatch", async (data, { rejectWithValue }) => {
        try {
            const buildQuery = (params) => {
                const query = new URLSearchParams();

                if (params.limit) query.append("limit", params.limit);
                if (params.page) query.append("page", params.page);
                if (params.active !== undefined) query.append("active", params.active);
                if (params.search) query.append("search", params.search);

                return query.toString();
            };
            const res = await getApi(`${Url.GET_MATCH_API}?${buildQuery(data)}`);
            return res?.data;
        } catch (error) { showError(error?.message); return rejectWithValue(error) }
    });
