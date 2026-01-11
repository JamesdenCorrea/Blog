export interface Blog {
    id: string;                    // Unique identifier (UUID from Supabase)
    title: string;
    content: string;
    author_id: string;
    author_email?: string;
    created_at: string;
    updated_at: string;
}

// Defines the structure of a User
export interface User {
    id: string;                    // Unique user ID from Supabase Auth
    email: string;
}

// Defines the shape of Authentication state in Redux
export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
}

// Defines the shape of Blog state in Redux
export interface BlogState {
    blogs: Blog[];                 // Array of all blog posts
    currentBlog: Blog | null;      // Single blog being viewed/edited
    loading: boolean;              // True when fetching data
    error: string | null;          // Error message if something fails
    totalPages: number;            // Total number of pages for pagination
}