import React from 'react';
import { Flex, Menu } from 'antd';
import { FaLeaf } from 'react-icons/fa6';
import {
  UserOutlined,
  ProfileOutlined,
  LogoutOutlined,
  OrderedListOutlined,
  CarryOutFilled,
  SettingOutlined,
} from '@ant-design/icons';

const Sidebar = () => {
  return (
    <>
      <Flex align="center" justify="center">
        <div className="logo">
          <FaLeaf />
        </div>
      </Flex>
      <Menu
        mode="inline"
        defaultSelectedKeys={['1']}
        className="menu-bar"
        items={[
          {
            key: '1',
            icon: <UserOutlined />,
            label: 'Dashboard',
          },
          {
            key: '2',
            icon: <CarryOutFilled />,
            label: 'My Orders',
          },
          {
            key: '3',
            icon: <OrderedListOutlined />,
            label: 'ToDo',
          },
          {
            key: '4',
            icon: <ProfileOutlined />,
            label: 'Profile',
          },
          {
            key: '5',
            icon: <SettingOutlined />,
            label: 'Settings',
          },
          {
            key: '6',
            icon: <LogoutOutlined />,
            label: 'Logout',
          },
        ]}
      ></Menu>
    </>
  );
};

export default Sidebar;
