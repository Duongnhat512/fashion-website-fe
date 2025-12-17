import { createSlice,  type PayloadAction } from '@reduxjs/toolkit';

export interface UserState {
  id: string;
  fullname: string;
  email: string;
  avt?: string;
  phone?: string;
  dob?: string;
  gender?: 'male' | 'female' | 'other';
  role: string;
}

interface UserSliceState {
  data: UserState | null;
}

// Khai báo initialState với kiểu UserSliceState
const initialState: UserSliceState = {
  data: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserState | null>) => {
      state.data = action.payload;
    },
    updateUser: (state, action: PayloadAction<Partial<UserState>>) => {
      if (state.data) {
        state.data = { ...state.data, ...action.payload };
      }
    },
    clearUser: (state) => {
      state.data = null;
    },
  },
});

export const { setUser, updateUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
