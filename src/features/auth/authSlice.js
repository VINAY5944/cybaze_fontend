
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

// Login API
export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/login", credentials);

      const { accessToken, user } = response.data.data;

      localStorage.setItem("accessToken", accessToken);
      return { accessToken, user };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Login failed"
      );
    }
  }
);

// Restore the logged-in user after browser refresh
export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/auth/me");
      return response.data.data.user;
    } catch (error) {
      localStorage.removeItem("accessToken");

      return rejectWithValue(
        error.response?.data?.message || "Session expired"
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",

  initialState: {
    accessToken: localStorage.getItem("accessToken"),
    user: null,
    isAuthenticated: false,
    loading: false,
    authChecked: !localStorage.getItem("accessToken"),
    error: null,
  },

  reducers: {
    logout: (state) => {
      localStorage.removeItem("accessToken");

      state.accessToken = null;
      state.user = null;
      state.isAuthenticated = false;
      state.authChecked = true;
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.accessToken = action.payload.accessToken;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.authChecked = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Restore session
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.authChecked = true;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.loading = false;
        state.accessToken = null;
        state.user = null;
        state.isAuthenticated = false;
        state.authChecked = true;
      });
  },
});

export const { logout } = authSlice.actions;

export default authSlice.reducer;
