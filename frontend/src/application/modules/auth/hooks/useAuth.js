/**
 * Hook: useAuth
 * 
 * Single Responsibility: Gestionar el estado y lógica de autenticación
 * 
 * Clean Architecture:
 * - Application Layer: Hook que maneja la lógica de autenticación
 * - Usa LocalStorageAdapter para persistencia (Infrastructure)
 * 
 * Funcionalidades:
 * - Login con usuario y contraseña
 * - Logout
 * - Verificar si está autenticado
 * - Obtener información del usuario autenticado
 */

import { useState, useEffect, useCallback } from 'react';
import { LocalStorageAdapter } from '@storage/LocalStorageAdapter';

// Credenciales válidas (simple)
const VALID_CREDENTIALS = {
  username: 'admin',
  password: '123456',
};

// Claves para localStorage
const AUTH_TOKEN_KEY = 'authToken';
const AUTH_USER_KEY = 'authUser';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verificar autenticación al cargar
  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = LocalStorageAdapter.getString(AUTH_TOKEN_KEY);
        const userData = LocalStorageAdapter.get(AUTH_USER_KEY);

        if (token && userData) {
          setIsAuthenticated(true);
          setUser(userData);
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  /**
   * Inicia sesión con usuario y contraseña
   * @param {string} username - Nombre de usuario
   * @param {string} password - Contraseña
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  const login = useCallback(async (username, password) => {
    try {
      // Validar credenciales
      if (username === VALID_CREDENTIALS.username && password === VALID_CREDENTIALS.password) {
        // Crear token simple (en producción sería un JWT del backend)
        const token = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const userData = {
          username: VALID_CREDENTIALS.username,
          role: 'admin',
          loginTime: new Date().toISOString(),
        };

        // Guardar en localStorage
        LocalStorageAdapter.set(AUTH_TOKEN_KEY, token);
        LocalStorageAdapter.set(AUTH_USER_KEY, userData);

        // Actualizar estado
        setIsAuthenticated(true);
        setUser(userData);

        return { success: true };
      } else {
        return {
          success: false,
          error: 'Usuario o contraseña incorrectos',
        };
      }
    } catch (error) {
      console.error('Error during login:', error);
      return {
        success: false,
        error: 'Error al iniciar sesión. Por favor, intente nuevamente.',
      };
    }
  }, []);

  /**
   * Cierra sesión
   */
  const logout = useCallback(() => {
    try {
      // Limpiar localStorage
      LocalStorageAdapter.remove(AUTH_TOKEN_KEY);
      LocalStorageAdapter.remove(AUTH_USER_KEY);

      // Actualizar estado
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }, []);

  return {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
  };
};
