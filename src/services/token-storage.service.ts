import { Injectable } from '@angular/core';
import { ApiUser, TokenData } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';

  constructor() { }

  /**
   * Save token data to local storage with validation
   */
  saveToken(tokenData: TokenData): void {
    window.localStorage.removeItem(this.TOKEN_KEY);
    
    // Validate and normalize token data before saving
    const normalizedTokenData: TokenData = {
      accessToken: tokenData.accessToken,
      tokenType: tokenData.tokenType || 'Bearer',
      expiresAt: tokenData.expiresAt || (Date.now() + 3600000), // Default 1 hour expiry if not specified
      user: tokenData.user
    };
    
    // Log what we're saving
    console.log('DEBUG - Saving token data:', {
      tokenType: normalizedTokenData.tokenType,
      tokenLength: normalizedTokenData.accessToken?.length,
      expiryTime: new Date(normalizedTokenData.expiresAt).toISOString(),
      userRole: normalizedTokenData.user?.role
    });
    
    window.localStorage.setItem(this.TOKEN_KEY, JSON.stringify(normalizedTokenData));
  }

  /**
   * Get the stored token data
   */
  getToken(): TokenData | null {
    const tokenString = window.localStorage.getItem(this.TOKEN_KEY);
    if (tokenString) {
      try {
        return JSON.parse(tokenString) as TokenData;
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  /**
   * Get just the access token string
   */
  getAccessToken(): string | null {
    const tokenData = this.getToken();
    return tokenData ? tokenData.accessToken : null;
  }

  /**
   * Check if there's a valid non-expired token with comprehensive validation
   */
  isTokenValid(): boolean {
    const tokenData = this.getToken();
    if (!tokenData) {
      console.log('DEBUG - Token validation failed: No token data found');
      return false;
    }
    
    // Check for required token fields
    if (!tokenData.accessToken || !tokenData.tokenType) {
      console.log('DEBUG - Token validation failed: Missing required token fields', {
        hasAccessToken: !!tokenData.accessToken,
        hasTokenType: !!tokenData.tokenType
      });
      return false;
    }
    
    // Check if expiry is valid
    if (!tokenData.expiresAt || typeof tokenData.expiresAt !== 'number') {
      console.log('DEBUG - Token validation failed: Invalid expiry timestamp', {
        expiresAt: tokenData.expiresAt,
        type: typeof tokenData.expiresAt
      });
      return false;
    }
    
    // Check if the token is expired
    const now = Date.now();
    const isValid = now < tokenData.expiresAt;
    
    console.log('DEBUG - Token validation result:', {
      isValid: isValid,
      currentTime: new Date(now).toISOString(),
      expiryTime: new Date(tokenData.expiresAt).toISOString(),
      timeRemaining: Math.floor((tokenData.expiresAt - now) / 1000 / 60) + ' minutes'
    });
    
    return isValid;
  }

  /**
   * Save user data to local storage
   */
  saveUser(user: ApiUser): void {
    window.localStorage.removeItem(this.USER_KEY);
    window.localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  /**
   * Get user data from local storage
   */
  getUser(): ApiUser | null {
    const userString = window.localStorage.getItem(this.USER_KEY);
    if (userString) {
      try {
        return JSON.parse(userString) as ApiUser;
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  /**
   * Clear all authentication data from storage
   */
  signOut(): void {
    window.localStorage.removeItem(this.TOKEN_KEY);
    window.localStorage.removeItem(this.USER_KEY);
  }
}
