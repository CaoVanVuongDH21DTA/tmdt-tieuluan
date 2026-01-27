// src/store/features/brand.js
import { createSlice } from "@reduxjs/toolkit";

const brandSlice = createSlice({
  name: "brandState",
  initialState: {
    brands: [],
  },
  reducers: {
    loadBrands: (state, action) => {
      state.brands = action.payload;
    },
  },
});

export const { loadBrands } = brandSlice.actions;
export default brandSlice.reducer;
