/**
 * HeaderUtilities — molécula de botones de utilidad del topbar (pantallas anchas).
 *
 * Contiene: Ayuda + Idioma + Notificaciones (Badge) + ThemeToggle.
 * El logout/perfil se separó a UserProfileChip (SRP).
 * Versión compacta (< 900px): ver HeaderCompactMenu.
 *
 * Replica .matricula-v2-topbar__utilities de MatriculaV2TopBar.
 *
 * @module presentation/components/molecules/HeaderUtilities
 * @level molécula
 */

import { Badge, Button } from 'antd';
import {
  BellOutlined,
  GlobalOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import ThemeToggle from '@atoms/ThemeToggle';

/**
 * @param {{ className?: string }} props
 */
const HeaderUtilities = ({ className = '' }) => {
  return (
    <div
      className={`app-topbar__utilities${className ? ` ${className}` : ''}`}
    >
      <Button
        type="text"
        icon={<QuestionCircleOutlined />}
        className="app-topbar__icon"
        aria-label="Ayuda"
      />
      <Button
        type="text"
        icon={<GlobalOutlined />}
        className="app-topbar__icon"
        aria-label="Idioma"
      />
      <Badge count={3} size="small" offset={[-2, 2]}>
        <Button
          type="text"
          icon={<BellOutlined />}
          className="app-topbar__icon"
          aria-label="Notificaciones"
        />
      </Badge>
      {/* ThemeToggle global — oscurece TODA la app (shell + módulos) */}
      <ThemeToggle className="app-topbar__theme-toggle" />
    </div>
  );
};

export default HeaderUtilities;
