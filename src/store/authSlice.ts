import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../services/supabase';
import { AuthState, User } from '../types';

// Initial state - what the auth state looks like when app starts
const initialState: AuthState = {
    user: null,              // No user logged in initially
    isAuthenticated: false,  // Not authenticated
    loading: true,           // Loading true to check if user session exists
};

// Async action to register a new user
// createAsyncThunk handles the async logic and creates pending/fulfilled/rejected actions
export const register = createAsyncThunk(
    'auth/register',  // Action type name
    async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
        try {
            // Call Supabase to create new user
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) throw error;  // If error, throw it to be caught below
            if (!data.user) throw new Error('Registration failed');

            // Return user data on success
            return { id: data.user.id, email: data.user.email! } as User;
        } catch (error: any) {
            // Return error message if registration fails
            return rejectWithValue(error.message);
        }
    }
);

// Async action to login existing user
export const login = createAsyncThunk(
    'auth/login',
    async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
        try {
            // Call Supabase to sign in user
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
            if (!data.user) throw new Error('Login failed');

            return { id: data.user.id, email: data.user.email! } as User;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

// Async action to logout user
export const logout = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

// Async action to check if user session exists (on app load)
export const checkAuth = createAsyncThunk(
    'auth/checkAuth',
    async () => {
        // Get current session from Supabase
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
            return { id: session.user.id, email: session.user.email! } as User;
        }
        return null;
    }
);

// Create the auth slice
// A slice is a collection of Redux reducer logic and actions for a single feature
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {},  // No synchronous actions needed
    extraReducers: (builder) => {
        // Handle register action states
        builder
            .addCase(register.fulfilled, (state, action) => {
                state.user = action.payload;           // Set user data
                state.isAuthenticated = true;           // Mark as authenticated
                state.loading = false;                  // Stop loading
            })
            .addCase(register.rejected, (state) => {
                state.loading = false;
            })
            // Handle login action states
            .addCase(login.fulfilled, (state, action) => {
                state.user = action.payload;
                state.isAuthenticated = true;
                state.loading = false;
            })
            .addCase(login.rejected, (state) => {
                state.loading = false;
            })
            // Handle logout action
            .addCase(logout.fulfilled, (state) => {
                state.user = null;                      // Clear user
                state.isAuthenticated = false;          // Mark as not authenticated
            })
            // Handle checkAuth action
            .addCase(checkAuth.pending, (state) => {
                state.loading = true;
            })
            .addCase(checkAuth.fulfilled, (state, action) => {
                if (action.payload) {
                    state.user = action.payload;
                    state.isAuthenticated = true;
                }
                state.loading = false;
            })
            .addCase(checkAuth.rejected, (state) => {
                state.loading = false;
            });
    },
});

export default authSlice.reducer;