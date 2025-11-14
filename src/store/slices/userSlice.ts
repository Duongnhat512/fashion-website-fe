import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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

const initialState: UserState | null = null;

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserState | null>) => {
      return action.payload;
    },
    updateUser: (state, action: PayloadAction<Partial<UserState>>) => {
      if (state) {
        Object.assign(state, action.payload);
      }
    },
    clearUser: () => null,
  },
});

export const { setUser, updateUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
