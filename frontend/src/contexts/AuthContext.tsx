import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '../services/api';
import { tokenService } from '../services/tokenService';
import { User as SharedUser } from '../../../shared/types';

// Redefinir User para el contexto - solo teachers y admins pueden usar esta app
interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin_general' | 'admin_entity' | 'teacher';
  entityId?: string; // Para admin_entity y teachers
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role: 'admin_general' | 'admin_entity' | 'teacher') => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem('asisVox_user');
    
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      
      // Configurar el token en el apiClient desde tokenService si existe
      const token = tokenService.getToken();
      if (token) {
        apiClient.setToken(token);
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Llamar al API real del backend
      const response = await apiClient.auth.login({ email, password });
      
      if (response.success && response.data) {
        const { user, token } = response.data;
        
        // Convertir el User del backend al formato del contexto
        const contextUser: User = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as 'admin_entity' | 'teacher', // Asegurar que es teacher o admin_entity
          entityId: user.entityId // Incluir entityId si existe
        };
        
        // Guardar usuario
        setUser(contextUser);
        localStorage.setItem('asisVox_user', JSON.stringify(contextUser));
        
        // Guardar token usando tokenService - ahora es un JWT válido del backend
        tokenService.setToken(token, 24 * 60 * 60); // 24 horas
        apiClient.setToken(token);
        
        setIsLoading(false);
        return true;
      }
      
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Error en login:', error);
      setIsLoading(false);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string, role: 'admin_general' | 'admin_entity' | 'teacher'): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Llamar al API real del backend
      const response = await apiClient.auth.register({ name, email, password, role });
      
      if (response.success && response.data) {
        const { user, token } = response.data;
        
        // Convertir el User del backend al formato del contexto
        const contextUser: User = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as 'admin_entity' | 'teacher',
          entityId: user.entityId // Incluir entityId si existe
        };
        
        // Guardar usuario
        setUser(contextUser);
        localStorage.setItem('asisVox_user', JSON.stringify(contextUser));
        
        // Guardar token usando tokenService - ahora es un JWT válido del backend
        tokenService.setToken(token, 24 * 60 * 60); // 24 horas
        apiClient.setToken(token);
        
        setIsLoading(false);
        return true;
      }
      
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Error en register:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('asisVox_user');
    // Usar tokenService para limpiar el token
    tokenService.clearToken();
    apiClient.clearToken();
  };

  const value = {
    user,
    login,
    register,
    logout,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}