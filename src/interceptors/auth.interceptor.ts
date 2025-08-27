import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenStorageService } from '../services/token-storage.service';

/**
 * Auth interceptor that adds authorization header with JWT token
 * to outgoing HTTP requests
 */
export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>, 
  next: HttpHandlerFn
) => {
  const tokenStorage = inject(TokenStorageService);
  
  // Get token from storage
  const tokenData = tokenStorage.getToken();
  
  // Add debug logging for API requests
  console.log(`Intercepting request to: ${req.url}`, { 
    hasToken: !!tokenData, 
    isTokenValid: tokenData ? tokenStorage.isTokenValid() : false,
    tokenType: tokenData?.tokenType,
    authHeader: tokenData ? `${tokenData.tokenType} ${tokenData.accessToken.substring(0, 10)}...` : 'none'
  });
  
  // If token exists and is valid, add it to request headers
  if (tokenData && tokenStorage.isTokenValid()) {
    const authHeader = `${tokenData.tokenType} ${tokenData.accessToken}`;
    console.log('Adding auth header:', authHeader.substring(0, tokenData.tokenType.length + 11) + '...');
    
    const authReq = req.clone({
      headers: req.headers.set('Authorization', authHeader)
    });
    return next(authReq);
  } else {
    console.log('No valid token available for request');
  }
  
  // If no token or token is invalid, proceed with original request
  return next(req);
};
