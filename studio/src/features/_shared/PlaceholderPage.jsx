/**
 * PlaceholderPage — pantalla "próximamente" para rutas aún no migradas.
 * Reutiliza EmptyState; deja el shell navegable mientras se construyen features.
 */
import { useLocation } from 'react-router-dom';
import { AppstoreOutlined } from '@ant-design/icons';
import { EmptyState } from '@ui/molecules/EmptyState/EmptyState';

export function PlaceholderPage() {
  const { pathname } = useLocation();
  return (
    <EmptyState
      icon={<AppstoreOutlined />}
      title="Próximamente"
      hint={`Esta sección (${pathname}) aún no está construida en Studio.`}
    />
  );
}

export default PlaceholderPage;
