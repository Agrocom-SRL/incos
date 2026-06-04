/**
 * Inicio de sesión — orquestación; lógica en useLoginPage.
 */

import { useLoginPage } from '@application-auth';
import LoginFormCard from '../components/organisms/LoginFormCard.jsx';
import '../styles/login.css';

export default function LoginPage() {
  const {
    form,
    loading,
    error,
    clearError,
    remember,
    onRememberChange,
    onSubmit,
    initialValues,
    minPasswordLength,
  } = useLoginPage();

  return (
    <LoginFormCard
      form={form}
      loading={loading}
      error={error}
      clearError={clearError}
      remember={remember}
      onRememberChange={onRememberChange}
      onSubmit={onSubmit}
      initialValues={initialValues}
      minPasswordLength={minPasswordLength}
    />
  );
}
