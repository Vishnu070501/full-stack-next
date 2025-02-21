import { apiClient } from '@/utils/api';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

interface UserState {
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  user: null,
  loading: false,
  error: null,
};

// Add type for user
interface User {
  id: string;
  name: string;
  email: string;
}

// Update createAsyncThunk with return type
export const fetchUserDetails = createAsyncThunk<User>(
  'user/fetchDetails',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get<{ user: User }>('/api/auth/me');
      if (response.error) {
        throw new Error(response.error);
      }
      if (!response.data?.user) {
        throw new Error('User not found');
      }
      return response.data.user;
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'An error occurred');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    clearUser: (state) => {
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchUserDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;