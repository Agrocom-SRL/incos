import { IAuthRepository } from '@repositories/IAuthRepository';
// import apiClient from '@api/client'; // TODO: Descomentar cuando se implemente API real
import { InvalidCredentialsError } from '@core/errors/AuthErrors';

export class AuthRepository extends IAuthRepository {
  async login(credentials) {
    // TODO: Cambiar por API real cuando esté disponible
    // const response = await apiClient.post('/auth/login', credentials);
    // return response.data;

    // Mock temporal
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simular login exitoso
        if (
          credentials.email === 'admin@instituto.com' &&
          credentials.password === 'admin123'
        ) {
          resolve({
            user: {
              id: '1',
              email: 'admin@instituto.com',
              name: 'Miguel',
              lastName: 'Administrator',
              role: 'admin',
              avatar: null,
              isActive: true,
            },
            token: 'mock-jwt-token-' + Date.now(),
          });
        } else {
          reject(new InvalidCredentialsError());
        }
      }, 1000);
    });
  }

  async logout() {
    // TODO: Cambiar por API real
    // await apiClient.post('/auth/logout');

    // Mock
    return new Promise((resolve) => {
      setTimeout(() => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        resolve();
      }, 300);
    });
  }

  async getCurrentUser() {
    // TODO: Cambiar por API real
    // const response = await apiClient.get('/auth/me');
    // return response.data;

    // Mock
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  async register(userData) {
    // TODO: Cambiar por API real
    // const response = await apiClient.post('/auth/register', userData);
    // return response.data;

    // Mock
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          user: {
            id: Date.now().toString(),
            email: userData.email,
            name: userData.name,
            lastName: userData.lastName,
            role: 'student',
            avatar: null,
            isActive: true,
          },
          token: 'mock-jwt-token-' + Date.now(),
        });
      }, 1000);
    });
  }

  async forgotPassword(_email) {
    // TODO: Implementar cuando API esté disponible
    // const response = await apiClient.post('/auth/forgot-password', { email });
    // return response.data;
    return Promise.resolve();
  }

  async resetPassword(_token, _newPassword) {
    // TODO: Implementar cuando API esté disponible
    // const response = await apiClient.post('/auth/reset-password', { token, newPassword });
    // return response.data;
    return Promise.resolve();
  }
}