// Mock authentication system for frontend development
// This will be replaced with actual API calls to Django backend

export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface SignupCredentials extends LoginCredentials {
  email: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

// Mock storage for development
const STORAGE_KEY = 'soil_app_auth';

class AuthService {
  private baseURL = '/api/auth'; // Will connect to Django backend

  // Mock users for development
  private mockUsers: User[] = [
    {
      id: '1',
      username: 'demo',
      email: 'demo@soilapp.com',
      createdAt: new Date().toISOString()
    }
  ];

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Mock API call - replace with actual fetch to Django
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

    // Simple mock validation
    if (credentials.username === 'demo' && credentials.password === 'demo123') {
      const user = this.mockUsers[0];
      const tokens = {
        access: `mock_access_token_${Date.now()}`,
        refresh: `mock_refresh_token_${Date.now()}`
      };

      const authData = { ...tokens, user };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));
      
      return authData;
    }

    throw new Error('Invalid credentials');
  }

  async signup(credentials: SignupCredentials): Promise<AuthResponse> {
    // Mock API call - replace with actual fetch to Django
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Check if username exists (mock)
    if (this.mockUsers.some(u => u.username === credentials.username)) {
      throw new Error('Username already exists');
    }

    // Create new user
    const newUser: User = {
      id: String(this.mockUsers.length + 1),
      username: credentials.username,
      email: credentials.email,
      createdAt: new Date().toISOString()
    };

    this.mockUsers.push(newUser);

    const tokens = {
      access: `mock_access_token_${Date.now()}`,
      refresh: `mock_refresh_token_${Date.now()}`
    };

    const authData = { ...tokens, user: newUser };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));

    return authData;
  }

  async logout(): Promise<void> {
    // Mock API call for token invalidation
    localStorage.removeItem(STORAGE_KEY);
  }

  getCurrentUser(): User | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const authData = JSON.parse(stored);
        return authData.user;
      }
    } catch (error) {
      console.error('Error parsing stored auth data:', error);
      localStorage.removeItem(STORAGE_KEY);
    }
    return null;
  }

  getAccessToken(): string | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const authData = JSON.parse(stored);
        return authData.access;
      }
    } catch (error) {
      console.error('Error parsing stored auth data:', error);
    }
    return null;
  }

  isAuthenticated(): boolean {
    return this.getAccessToken() !== null;
  }
}

export const authService = new AuthService();