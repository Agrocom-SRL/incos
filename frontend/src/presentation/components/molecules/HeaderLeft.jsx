// src/presentation/components/molecules/HeaderLeft.jsx
/**
 * HeaderLeft — zona izquierda del header (solo trigger/hamburguesa).
 *
 * WS-C: el logo se eliminó del header para evitar duplicado con el sidebar
 * (el logo vive únicamente en la zona superior del Sidebar).
 * El buscador global se difiere hasta que exista búsqueda real (WS-búsqueda).
 * Layout mv2: hamburguesa · (spacer) → utilities a la derecha via Header.
 *
 * @level molécula
 */
import IconButton from '@atoms/IconButton';
import { MenuOutlined } from '@ant-design/icons';

const HeaderLeft = ({ onToggle }) => {
    return (
        <IconButton
            icon={<MenuOutlined />}
            onClick={onToggle}
            size="large"
            className="header-trigger matricula-v2-topbar__menu"
            aria-label="Abrir/cerrar menú"
        />
    );
};

export default HeaderLeft;
