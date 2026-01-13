export interface Blog {
    id: string;                    // Unique identifier (UUID from Supabase)
    title: string;                 // Blog post title
    content: string;               // Blog post content/body
    author_id: string;             // ID of the user who created it
    author_email?: string;         // Email of the author (for display)
    image_url?: string;            // Public URL of the blog image
    image_path?: string;           // Storage path for deletion (e.g., "user123/image.jpg")
    created_at: string;            // When it was created (ISO timestamp)
    updated_at: string;            // When it was last updated
}

// Defines the structure of a User
export interface User {
    id: string;                    // Unique user ID from Supabase Auth
    email: string;                 // User's email address
}

// Defines the shape of Authentication state in Redux
export interface AuthState {
    user: User | null;             // Current logged-in user (null if not logged in)
    isAuthenticated: boolean;      // Quick check if user is logged in
    loading: boolean;              // True when checking auth status
}

// Defines the shape of Blog state in Redux
export interface BlogState {
    blogs: Blog[];                 // Array of all blog posts
    currentBlog: Blog | null;      // Single blog being viewed/edited
    loading: boolean;              // True when fetching data
    error: string | null;          // Error message if something fails
    totalPages: number;            // Total number of pages for pagination
}