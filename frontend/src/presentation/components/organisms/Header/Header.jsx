// src/presentation/components/organisms/Header/Header.jsx
import IconButton from '@atoms/IconButton';
import { MenuOutlined } from '@ant-design/icons';

const Header = ({ collapsed, onToggle }) => {
    return (
        <IconButton
            icon={<MenuOutlined />}
            onClick={onToggle}
            size="large"
            className="header-trigger"
        />
    );
};

export default Header;