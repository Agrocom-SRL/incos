import { Card, Typography, Flex, Image } from 'antd';
import plant from '../assets/plant02.png';

const ContentSidebar = () => {
  return (
    <div>
      <Card className="card">
        <Flex vertical gap="large">
          <Typography.Title level={4} strong>
            Today <br />5 orders
          </Typography.Title>
          <Typography.Title level={4} strong>
            This month <br />
            240 orders
          </Typography.Title>
        </Flex>

        <Image
          src={plant}
          alt="plant"
          style={{
            position: 'absolute',
            bottom: -50,
            left: 96,
            width: 'auto',
            height: '300px',
          }}
        />
      </Card>
    </div>
  );
};

export default ContentSidebar;
