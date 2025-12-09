// src/presentation/components/molecules/SellerCard/SellerCard.jsx
import { Flex, Tooltip } from 'antd';
import { Card, Avatar, Divider, Typography } from '@atoms';
import '@styles/components/molecules/seller-card.css';

/**
 * Componente molecular SellerCard
 * Combina Card, AvatarGroup, Divider y Typography para mostrar información de vendedores
 * 
 * @param {Array<{name: string, avatar: string}>} sellers - Lista de vendedores
 * @param {object} stats - Estadísticas con plantsSold y sellerCount
 * @param {string} className - Clases CSS adicionales
 */
const SellerCard = ({ sellers, stats, className = '' }) => {
    const { plantsSold, sellerCount } = stats;

    return (
        <Card className={`seller-card ${className}`}>
            <Flex align="center" justify="space-between">
                <Avatar.Group
                    className="seller-card__avatar-group"
                    max={{
                        count: 5,
                        popover: { trigger: 'click' },
                    }}
                    size="large"
                >
                    {sellers.map((seller, index) => (
                        <Tooltip key={index} title={seller.name || `User ${index + 1}`} placement="top">
                            <Avatar src={seller.avatar} />
                        </Tooltip>
                    ))}
                </Avatar.Group>

                <Divider orientation="vertical" className="divider" />

                <Flex vertical>
                    <Typography.Text type="secondary" strong>
                        {plantsSold} plants sold
                    </Typography.Text>
                    <Typography.Text type="secondary" strong>
                        {sellerCount} seller
                    </Typography.Text>
                </Flex>
            </Flex>
        </Card>
    );
};

export default SellerCard;
