export interface LoginRequest {
  email: string;
  password: string;
}

// API User model from the backend
export interface ApiUser {
  id: string;
  email: string;
  name: string;
  primaryDepartment: string;
  additionalDepartments: string[];
  role: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// API response format for login
export interface ApiAuthResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: ApiUser;
}

// Local storage token data format
export interface TokenData {
  accessToken: string;
  tokenType: string;
  expiresAt: number; // Timestamp when the token expires
  user: ApiUser;
}
