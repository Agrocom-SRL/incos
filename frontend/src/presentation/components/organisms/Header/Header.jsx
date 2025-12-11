// src/presentation/components/organisms/Header/Header.jsx
import IconButton from '@atoms/IconButton';
import Logo from '@atoms/Logo';
import { MenuOutlined } from '@ant-design/icons';

const Header = ({ collapsed, onToggle }) => {
    return (
        <>
            <Logo variant="horizontal" size="medium" />
            <IconButton
                icon={<MenuOutlined />}
                onClick={onToggle}
                size="large"
                className="header-trigger"
            />
        </>
    );
};

export default Header;