/**
 * ErrorState — molécula de estado de error reutilizable.
 *
 * Atomic Design: MOLECULA. Unifica el patrón de error de los listados/fichas
 * (Alert + acción de reintento) en un solo componente compartido.
 *
 * AntD v6: usa `title=` / `description=` (NUNCA `message=`). La acción de
 * reintento se inyecta como `action` del Alert.
 *
 * Entrada animada con FadeIn (gateado por useReducedMotion vía el átomo).
 *
 * @module presentation/components/molecules/ErrorState
 * @param {{
 *   title?: string,                 // título del Alert (default 'Error')
 *   description?: React.ReactNode,  // cuerpo del error
 *   onRetry?: () => void,           // si se pasa, muestra botón de reintento
 *   retryLabel?: string,            // texto del botón (default 'Reintentar')
 *   type?: 'error' | 'warning' | 'info',
 *   className?: string,
 * }} props
 */

import { Alert, Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { FadeIn } from '@presentation/motion';

const ErrorState = ({
  title = 'Error',
  description,
  onRetry,
  retryLabel = 'Reintentar',
  type = 'error',
  className = '',
}) => (
  <FadeIn className={`incos-error ${className}`.trim()}>
    <Alert
      type={type}
      showIcon
      title={title}
      description={description}
      action={
        onRetry ? (
          <Button size="small" icon={<ReloadOutlined />} onClick={onRetry}>
            {retryLabel}
          </Button>
        ) : null
      }
    />
  </FadeIn>
);

export default ErrorState;
