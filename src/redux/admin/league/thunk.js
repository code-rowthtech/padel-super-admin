import { createAsyncThunk } from "@reduxjs/toolkit";
import { CREATE_LEAGUE, GET_LEAGUES, GET_LEAGUES_IDS, UPDATE_LEAGUE, GET_STATES, GET_CLUB_WITH_STATE, GET_SPONSOR_CATEGORIES, GET_LEAGUE_BY_ID, DELETE_LEAGUE, GET_LEAGUE_CLUBS, GET_CLUB_TEAMS, EXPORT_LEAGUE_SCHEDULES_PDF } from "../../../helpers/api/apiEndpoint";
import { ownerApi, ownerAxios, getOwnerFromSession } from "../../../helpers/api/apiCore";
import { showSuccess, showError } from "../../../helpers/Toast";

const buildLeagueFormData = (data) => {
  const formData = new FormData();

  // Basic fields
  if (data.id) formData.append('id', data.id);
  if (data.leagueName) formData.append('leagueName', data.leagueName);
  if (data.stateId) formData.append('stateId', data.stateId);
  if (data.startDate) formData.append('startDate', data.startDate);
  if (data.ownerId) formData.append('ownerId', data.ownerId);
  if (data.status) formData.append('status', data.status);

  // Banner Files
  if (data.mobileBanner instanceof File) formData.append('mobileBanner', data.mobileBanner);
  if (data.webBanner instanceof File) formData.append('webBanner', data.webBanner);

  // Clubs array
  if (data.clubs && data.clubs.length > 0) {
    data.clubs.forEach((club, index) => {
      formData.append(`clubs[${index}][clubId]`, club.clubId);
      if (club.ownerId) formData.append(`clubs[${index}][ownerId]`, club.ownerId);
      if (club.categories) {
        club.categories.forEach((cat, catIndex) => {
          formData.append(`clubs[${index}][categories][${catIndex}][name]`, cat.name);
          formData.append(`clubs[${index}][categories][${catIndex}][type]`, cat.type);
        });
      }
      if (club.participationLimit) {
        // if (club.participationLimit.maxParticipants) {
        //   formData.append(`clubs[${index}][participationLimit][maxParticipants]`, club.participationLimit.maxParticipants);
        // }
        if (club.participationLimit.categoryLimits) {
          club.participationLimit.categoryLimits.forEach((limit, limitIndex) => {
            formData.append(`clubs[${index}][participationLimit][categoryLimits][${limitIndex}][categoryType]`, limit.categoryType);
            formData.append(`clubs[${index}][participationLimit][categoryLimits][${limitIndex}][maxParticipants]`, limit.maxParticipants);
          });
        }
      }
    });
  }

  // Title Sponsor
  if (data.titleSponsor) {
    const { logo, ...titleSponsorData } = data.titleSponsor;
    formData.append('titleSponsor', JSON.stringify(titleSponsorData));
    if (logo instanceof File) formData.append('titleSponsorLogo', logo);
  }

  // Sponsors array
  if (data.sponsors && data.sponsors.length > 0) {
    const sponsorsData = data.sponsors.map(({ logo, ...rest }) => rest);
    formData.append('sponsors', JSON.stringify(sponsorsData));

    data.sponsors.forEach((sponsor, index) => {
      if (sponsor.logo instanceof File) {
        formData.append(`sponsorLogo_${index}`, sponsor.logo);
      }
    });
  }

  // Step 2 & 3 fields
  if (data.matchRules) formData.append('matchRules', JSON.stringify(data.matchRules));
  if (data.priceDistribution) formData.append('priceDistribution', JSON.stringify(data.priceDistribution));
  if (data.bounty !== undefined) formData.append('bounty', data.bounty);
  if (data.teamOfLeague !== undefined) formData.append('teamOfLeague', data.teamOfLeague);

  return formData;
};

export const getLeagueById = createAsyncThunk(
  "league/getLeagueById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await ownerApi.get(`${GET_LEAGUE_BY_ID}?id=${id}`);
      if (response?.status === 200) {
        return response.data?.data;
      }
      return rejectWithValue(response?.data?.message);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const getSponsorCategories = createAsyncThunk(
  "league/getSponsorCategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await ownerApi.get(GET_SPONSOR_CATEGORIES);
      if (response?.status === 200) {
        return response.data?.data || [];
      }
      return rejectWithValue(response?.data?.message);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const getStates = createAsyncThunk(
  "league/getStates",
  async (_, { rejectWithValue }) => {
    try {
      const response = await ownerApi.get(GET_STATES);
      if (response?.status === 200) {
        return response.data?.data || [];
      }
      return rejectWithValue(response?.data?.message);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const getClubsWithState = createAsyncThunk(
  "league/getClubsWithState",
  async (_, { rejectWithValue }) => {
    try {
      const response = await ownerApi.get(GET_CLUB_WITH_STATE);
      if (response?.status === 200) {
        return response.data?.data || [];
      }
      return rejectWithValue(response?.data?.message);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const getLeaguesIDS = createAsyncThunk(
  "league/getLeaguesIDS",
  async (_, { rejectWithValue }) => {
    try {
      const response = await ownerApi.get(GET_LEAGUES_IDS);
      if (response?.status === 200) {
        return response.data?.data || [];
      }
      return rejectWithValue(response?.data?.message);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const getLeagues = createAsyncThunk(
  "league/getLeagues",
  async ({ page = 1, limit = 20 } = {}, { rejectWithValue }) => {
    try {
      const response = await ownerApi.get(GET_LEAGUES, { page, limit });
      if (response?.status === 200) {
        return response.data || { data: [], pagination: {} };
      }
      showError(response?.data?.message || "Failed to fetch leagues");
      return rejectWithValue(response?.data?.message);
    } catch (error) {
      showError(error);
      return rejectWithValue(error);
    }
  }
);

export const createLeague = createAsyncThunk(
  "league/createLeague",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await ownerApi.postFile(CREATE_LEAGUE, formData);
      if (response?.status === 200 || response?.status === 201) {
        showSuccess(response?.data?.message || "League created successfully");
        return response.data;
      }
      showError(response?.data?.message || "Failed to create league");
      return rejectWithValue(response?.data?.message);
    } catch (error) {
      showError(error);
      return rejectWithValue(error);
    }
  }
);

export const updateLeague = createAsyncThunk(
  "league/updateLeague",
  async ({ leagueData }, { rejectWithValue, dispatch }) => {
    try {
      let formData;
      if (leagueData instanceof FormData) {
        formData = leagueData;
      } else if (typeof leagueData === 'object' && Object.keys(leagueData).some(key => key.includes('['))) {
        // Handle flattened bracket notation (from StructureCategories)
        formData = new FormData();
        Object.keys(leagueData).forEach(key => {
          formData.append(key, leagueData[key]);
        });
      } else {
        // Handle nested object structure (from BasicInformation)
        formData = buildLeagueFormData(leagueData);
      }
      const response = await ownerApi.putFile(`${UPDATE_LEAGUE}`, formData);

      if (response?.status === 200 && response?.data?.success) {
        showSuccess(response?.data?.message || "League updated successfully");

        // Refresh league data
        const leagueId = leagueData.id || formData.get('id');
        if (leagueId) {
          await dispatch(getLeagueById(leagueId));
        }

        return response.data;
      }
      showError(response?.data?.message || "Failed to update league");
      return rejectWithValue(response?.data?.message);
    } catch (error) {
      console.error('Update error:', error);
      showError(error);
      return rejectWithValue(error);
    }
  }
);

export const getLeagueClubs = createAsyncThunk(
  "league/getLeagueClubs",
  async (leagueId, { rejectWithValue }) => {
    try {
      const response = await ownerApi.get(`${GET_LEAGUE_CLUBS}?leagueId=${leagueId}`);
      if (response?.status === 200) {
        return response.data?.data || [];
      }
      return rejectWithValue(response?.data?.message);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const getClubTeams = createAsyncThunk(
  "league/getClubTeams",
  async ({ leagueId, clubId, categoryType }, { rejectWithValue }) => {
    try {
      const response = await ownerApi.get(`${GET_CLUB_TEAMS}?leagueId=${leagueId}&clubId=${clubId}&categoryType=${categoryType}`);
      if (response?.status === 200) {
        return response.data?.data || [];
      }
      return rejectWithValue(response?.data?.message);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const saveSchedule = createAsyncThunk(
  "league/saveSchedule",
  async (scheduleData, { rejectWithValue }) => {
    try {
      const response = await ownerApi.post('/api/league-schedules/saveSchedule', scheduleData);
      if (response?.status === 200 || response?.status === 201) {
        if (response?.data?.success) {
          showSuccess(response?.data?.message || "Schedule saved successfully");
          return response.data;
        }
      }
      showError(response?.data?.message || "Failed to save schedule");
      return rejectWithValue(response?.data?.message);
    } catch (error) {
      showError(error || error?.message || "Error saving schedule");
      return rejectWithValue(error);
    }
  }
);
export const getAllSchedules = createAsyncThunk(
  "league/getAllSchedules",
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Add all non-empty parameters to query string
      Object.keys(params).forEach(key => {
        if (params[key]) {
          queryParams.append(key, params[key]);
        }
      });
      
      const url = `/api/league-schedules/getAllSchedules${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await ownerApi.get(url);
      if (response?.status === 200) {
        return response.data?.data || [];
      }
      return rejectWithValue(response?.data?.message);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const exportLeagueSchedulesPDF = createAsyncThunk(
  "league/exportLeagueSchedulesPDF",
  async ({ leagueId, clubId, venueClubId, startDate, endDate }, { rejectWithValue }) => {
    try {
      const owner = getOwnerFromSession();
      const token = owner?.token;
      
      const queryParams = new URLSearchParams();
      if (leagueId) queryParams.append('leagueId', leagueId);
      if (clubId) queryParams.append('clubId', clubId);
      if (venueClubId) queryParams.append('venueClubId', venueClubId);
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);
      
      const response = await ownerAxios.get(`${EXPORT_LEAGUE_SCHEDULES_PDF}?${queryParams.toString()}`, {
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response?.status === 200) {
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `league-schedules-export-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        showSuccess("PDF exported successfully");
        return { success: true };
      }
      return rejectWithValue(response?.data?.message);
    } catch (error) {
      showError("Failed to export PDF");
      return rejectWithValue(error);
    }
  }
);

export const deleteLeague = createAsyncThunk(
  "league/deleteLeague",
  async (leagueId, { rejectWithValue }) => {
    try {
      const response = await ownerApi.delete(DELETE_LEAGUE, { _id: leagueId });
      if (response?.status === 200 && response?.data?.success) {
        showSuccess(response?.data?.message || "League deleted successfully");
        return leagueId;
      }
      showError(response?.data?.message || "Failed to delete league");
      return rejectWithValue(response?.data?.message);
    } catch (error) {
      showError(error?.message || "Failed to delete league");
      return rejectWithValue(error);
    }
  }
);