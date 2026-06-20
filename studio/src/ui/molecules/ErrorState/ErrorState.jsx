/**
 * ErrorState — estado de error reutilizable sobre Alert de AntD 6 (`title=`, no `message`).
 * Molécula: muestra título + descripción; la acción de reintento por children.
 */
import { Alert } from 'antd';

export function ErrorState({ title, description, children }) {
  return (
    <Alert
      type="error"
      showIcon
      title={<strong>{title}</strong>}
      description={description}
      action={children}
      style={{ marginBottom: 'var(--space-base)' }}
    />
  );
}

export default ErrorState;
