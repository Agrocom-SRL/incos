import { useCallback, useMemo, useState } from 'react';
import { Form } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../useAuth.js';
import { authenticateCredentials } from '../../utils/authenticateCredentials.js';
import { mapLoginErrorMessage } from '../../utils/mapLoginErrorMessage.js';
import {
  clearRememberedLogin,
  isLoginRememberEnabled,
  loadRememberedLogin,
  saveRememberedLogin,
} from '../../utils/loginRememberStorage.js';
import { AUTH_DASHBOARD_PATH } from '../../utils/authPaths.js';

const MIN_PASSWORD_LENGTH = 8;

export function useLoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [remember, setRemember] = useState(isLoginRememberEnabled);

  const initialValues = useMemo(() => loadRememberedLogin() ?? {}, []);

  const clearError = useCallback(() => setError(null), []);

  const handleRememberChange = useCallback((checked) => {
    setRemember(checked);
    if (!checked) {
      clearRememberedLogin();
    }
  }, []);

  const handleSubmit = useCallback(
    async ({ username, password }) => {
      setError(null);

      const pass = String(password ?? '');
      if (pass.length < MIN_PASSWORD_LENGTH) {
        setError(`La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`);
        return;
      }

      setLoading(true);
      try {
        const { token, usuario, permisos } = await authenticateCredentials({
          username: String(username ?? '').trim(),
          password: pass,
        });
        login(token, usuario, permisos);

        if (remember) {
          saveRememberedLogin({ username, password: pass });
        } else {
          clearRememberedLogin();
        }

        navigate(AUTH_DASHBOARD_PATH, { replace: true });
      } catch (e) {
        if (!e?.status) {
          console.error(e);
        }
        setError(mapLoginErrorMessage(e));
      } finally {
        setLoading(false);
      }
    },
    [login, navigate, remember],
  );

  return {
    form,
    loading,
    error,
    clearError,
    remember,
    onRememberChange: handleRememberChange,
    onSubmit: handleSubmit,
    initialValues,
    minPasswordLength: MIN_PASSWORD_LENGTH,
  };
}
