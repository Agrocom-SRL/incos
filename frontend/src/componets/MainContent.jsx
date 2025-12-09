import React from 'react';
import { Flex } from 'antd';
import Banner from './Banner';
import ProductList from './ProductList';
import SellerLists from './SellerLists';

const MainContent = () => {
  return (
    <div style={{ flex: '1' }}>
      <Flex vertical gap="2.3rem">
        <Banner />
        <ProductList />
        <SellerLists />
      </Flex>
    </div>
  );
};

export default MainContent;
