import { Injectable } from '@angular/core';

declare global {
  interface Window {
    Tawk_API: any;
    Tawk_LoadStart: Date;
  }
}

@Injectable({
  providedIn: 'root'
})
export class TawkService {

  constructor() { }

  /**
   * Check if Tawk.to is loaded and ready
   */
  isTawkLoaded(): boolean {
    return typeof window.Tawk_API !== 'undefined' && window.Tawk_API.onLoad;
  }

  /**
   * Show the chat widget
   */
  showWidget(): void {
    if (this.isTawkLoaded()) {
      window.Tawk_API.showWidget();
    }
  }

  /**
   * Hide the chat widget
   */
  hideWidget(): void {
    if (this.isTawkLoaded()) {
      window.Tawk_API.hideWidget();
    }
  }

  /**
   * Toggle the chat widget visibility
   */
  toggleWidget(): void {
    if (this.isTawkLoaded()) {
      window.Tawk_API.toggle();
    }
  }

  /**
   * Maximize the chat widget
   */
  maximize(): void {
    if (this.isTawkLoaded()) {
      window.Tawk_API.maximize();
    }
  }

  /**
   * Minimize the chat widget
   */
  minimize(): void {
    if (this.isTawkLoaded()) {
      window.Tawk_API.minimize();
    }
  }

  /**
   * Set visitor name
   */
  setVisitorName(name: string): void {
    if (this.isTawkLoaded()) {
      window.Tawk_API.setAttributes({
        name: name
      });
    }
  }

  /**
   * Set visitor email
   */
  setVisitorEmail(email: string): void {
    if (this.isTawkLoaded()) {
      window.Tawk_API.setAttributes({
        email: email
      });
    }
  }

  /**
   * Add event listener for when chat is loaded
   */
  onLoad(callback: () => void): void {
    if (typeof window.Tawk_API !== 'undefined') {
      window.Tawk_API.onLoad = callback;
    } else {
      // If Tawk_API is not yet available, wait for it
      const checkTawk = setInterval(() => {
        if (typeof window.Tawk_API !== 'undefined') {
          window.Tawk_API.onLoad = callback;
          clearInterval(checkTawk);
        }
      }, 100);
    }
  }

  /**
   * Add event listener for when chat status changes
   */
  onStatusChange(callback: (status: string) => void): void {
    if (this.isTawkLoaded()) {
      window.Tawk_API.onStatusChange = callback;
    }
  }

  /**
   * Add event listener for when chat is minimized
   */
  onChatMinimized(callback: () => void): void {
    if (this.isTawkLoaded()) {
      window.Tawk_API.onChatMinimized = callback;
    }
  }

  /**
   * Add event listener for when chat is maximized
   */
  onChatMaximized(callback: () => void): void {
    if (this.isTawkLoaded()) {
      window.Tawk_API.onChatMaximized = callback;
    }
  }

  /**
   * Get current visitor information
   */
  getVisitorInfo(): any {
    if (this.isTawkLoaded()) {
      return window.Tawk_API.visitor;
    }
    return null;
  }
}
