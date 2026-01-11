import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import blogReducer from './blogSlice';

// Create the Redux store
export const store = configureStore({
    reducer: {
        auth: authReducer,    // Auth state managed by authSlice
        blogs: blogReducer,   // Blog state managed by blogSlice
    },
});

// TypeScript types for the store
// RootState: type of the entire Redux state
export type RootState = ReturnType<typeof store.getState>;
// AppDispatch: type for dispatch function (used when dispatching actions)
export type AppDispatch = typeof store.dispatch;
