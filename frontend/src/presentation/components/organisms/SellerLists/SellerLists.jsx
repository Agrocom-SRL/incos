// src/presentation/components/organisms/SellerLists/SellerLists.jsx
import { Flex } from 'antd';
import { SectionHeader } from '@molecules';
import { SellerCard } from '@molecules';
import '@styles/components/organisms/seller-lists.css';

const topSellers = [
    { name: 'User 1', avatar: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png' },
    { name: 'User 2', avatar: 'https://img.freepik.com/free-photo/close-up-portrait-cheerful-glamour-girl-posing-camera_197531-10619.jpg' },
    { name: 'User 3', avatar: 'https://img.freepik.com/free-photo/portrait-young-woman-smiling_1303-23014.jpg' },
    { name: 'User 4', avatar: 'https://img.freepik.com/free-photo/young-woman-posing-camera_1303-23012.jpg' },
    { name: 'User 5', avatar: 'https://img.freepik.com/free-photo/close-up-girl-posing-camera_197531-10620.jpg' },
    { name: 'User 6', avatar: 'https://img.freepik.com/free-photo/medium-shot-woman-smiling_197531-10617.jpg' },
    { name: 'User 7', avatar: 'https://img.freepik.com/free-photo/portrait-handsome-young-man-with-arms-crossed_1303-23015.jpg' },
];

const featuredSellers = [
    { name: 'User 1', avatar: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png' },
    { name: 'User 2', avatar: 'https://img.freepik.com/premium-photo/close-up-happy-smiling-woman-posing-camera_197531-10618.jpg' },
    { name: 'User 3', avatar: 'https://img.freepik.com/free-photo/portrait-handsome-man-smiling_1303-23016.jpg' },
    { name: 'User 4', avatar: 'https://img.freepik.com/free-photo/young-woman-posing-camera_1303-23012.jpg' },
    { name: 'User 5', avatar: 'https://img.freepik.com/free-photo/close-up-girl-posing-camera_197531-10620.jpg' },
    { name: 'User 6', avatar: 'https://img.freepik.com/free-photo/medium-shot-woman-smiling_197531-10617.jpg' },
    { name: 'User 7', avatar: 'https://img.freepik.com/free-photo/portrait-handsome-young-man-with-arms-crossed_1303-23015.jpg' },
];

const SellerLists = () => {
    return (
        <Flex align="center" justify="space-between" gap="large" className="seller-lists">
            <Flex vertical gap="small" className="seller-lists__top-seller">
                <SectionHeader title="Top Seller" viewAllText="View All" level={5} />
                <SellerCard
                    sellers={topSellers}
                    stats={{ plantsSold: '1,200', sellerCount: 10 }}
                />
            </Flex>

            <Flex vertical gap="small" className="seller-lists__featured-seller">
                <SectionHeader title="Featured Seller" viewAllText="View All" level={5} />
                <SellerCard
                    sellers={featuredSellers}
                    stats={{ plantsSold: '1,530', sellerCount: 13 }}
                />
            </Flex>
        </Flex>
    );
};

export default SellerLists;