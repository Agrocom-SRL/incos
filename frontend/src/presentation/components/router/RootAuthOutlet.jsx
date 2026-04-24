import { Outlet } from 'react-router-dom';
import { AuthProvider } from '@application-auth';

/**
 * Envuelve el árbol de rutas para que useAuth / useAuthContext y guards tengan Router (navigate).
 */
export default function RootAuthOutlet() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}
