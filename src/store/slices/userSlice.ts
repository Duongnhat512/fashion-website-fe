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
    // setUser cập nhật data
    setUser: (state, action: PayloadAction<UserState | null>) => {
      state.data = action.payload;
    },
    // updateUser chỉ cập nhật state.data nếu không phải null
    updateUser: (state, action: PayloadAction<Partial<UserState>>) => {
      if (state.data) {
        state.data = { ...state.data, ...action.payload };
      }
    },
    // clearUser đặt data về null
    clearUser: (state) => {
      state.data = null;
    },
  },
});

// Export các action creators và reducer
export const { setUser, updateUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
