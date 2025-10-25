/**
 * Token Service
 * Servicio centralizado para manejar tokens JWT en toda la aplicación
 */

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'asisVox_user';
const TOKEN_EXPIRY_KEY = 'token_expiry';

class TokenService {
  /**
   * Guarda un token en localStorage
   */
  setToken(token: string, expiresIn?: number): void {
    if (!token) {
      console.warn('Intento de guardar token vacío');
      return;
    }

    localStorage.setItem(TOKEN_KEY, token);

    // Si se proporciona tiempo de expiración, calcular y guardar
    if (expiresIn) {
      const expiryTime = new Date().getTime() + expiresIn * 1000;
      localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
    }

    console.log('✅ Token guardado correctamente');
  }

  /**
   * Obtiene el token del localStorage
   */
  getToken(): string | null {
    const token = localStorage.getItem(TOKEN_KEY);

    // Verificar si el token ha expirado
    if (token && this.isTokenExpired()) {
      console.warn('⚠️ Token expirado, eliminando');
      this.clearToken();
      return null;
    }

    return token;
  }

  /**
   * Verifica si el token está expirado
   */
  isTokenExpired(): boolean {
    const expiryTime = localStorage.getItem(TOKEN_EXPIRY_KEY);

    if (!expiryTime) {
      return false; // Sin fecha de expiración, considerar válido
    }

    const now = new Date().getTime();
    return now > parseInt(expiryTime);
  }

  /**
   * Obtiene el token con el prefijo Bearer
   */
  getAuthorizationHeader(): string | null {
    const token = this.getToken();
    return token ? `Bearer ${token}` : null;
  }

  /**
   * Decodifica el token para obtener información del usuario
   */
  decodeToken(): any {
    const token = this.getToken();
    if (!token) return null;

    try {
      // Dividir el token en partes
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.error('Token JWT inválido');
        return null;
      }

      // Decodificar el payload (segunda parte)
      const payload = parts[1];
      const decoded = JSON.parse(atob(payload));
      return decoded;
    } catch (error) {
      console.error('Error al decodificar token:', error);
      return null;
    }
  }

  /**
   * Obtiene el ID del usuario del token
   */
  getUserId(): string | null {
    const decoded = this.decodeToken();
    return decoded?.userId || decoded?.id || null;
  }

  /**
   * Obtiene el rol del usuario del token
   */
  getUserRole(): string | null {
    const decoded = this.decodeToken();
    return decoded?.role || null;
  }

  /**
   * Verifica si el usuario tiene un rol específico
   */
  hasRole(role: string): boolean {
    return this.getUserRole() === role;
  }

  /**
   * Limpia el token y datos relacionados
   */
  clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
    localStorage.removeItem(USER_KEY);
    console.log('🧹 Token limpiado correctamente');
  }

  /**
   * Verifica si hay un token válido
   */
  isAuthenticated(): boolean {
    return this.getToken() !== null && !this.isTokenExpired();
  }

  /**
   * Sincroniza el token entre pestañas/ventanas
   */
  enableStorageSync(callback?: (token: string | null) => void): void {
    window.addEventListener('storage', (event) => {
      if (event.key === TOKEN_KEY) {
        console.log('📡 Token sincronizado desde otra pestaña');
        if (callback) {
          callback(event.newValue);
        }
      }
    });
  }
}

// Exportar instancia singleton
export const tokenService = new TokenService();

// Exportar clase para testing si es necesario
export default TokenService;
