import React from 'react';
import { Flex, Typography, Button, Avatar, Tooltip, Card, Divider } from 'antd';

const SellerLists = () => {
  return (
    <Flex align="center" justify="space-between" gap="large">
      <Flex vertical gap="small" className="top-seller">
        <Flex align="center" justify="space-between">
          <Typography.Title level={5} strong className="primary--color">
            Top Seller
          </Typography.Title>

          <Button type="link" className="gray--color">
            View All
          </Button>
        </Flex>

        <Card>
          <Flex align="center" justify="space-between">
            <Avatar.Group
              max={{
                count: 5,
                style: {
                  color: '#f56a00',
                  backgroundColor: '#fde3cf',
                  cursor: 'progress',
                },
                popover: { trigger: 'click' },
              }}
              size="large"
            >
              <Tooltip title="User 1" placement="top">
                <Avatar
                  src={
                    'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png'
                  }
                />
              </Tooltip>
              <Tooltip title="User 2" placement="top">
                <Avatar
                  src={
                    'https://img.freepik.com/free-photo/close-up-portrait-cheerful-glamour-girl-posing-camera_197531-10619.jpg'
                  }
                />
              </Tooltip>
              <Tooltip title="User 3" placement="top">
                <Avatar
                  src={
                    'https://img.freepik.com/free-photo/portrait-young-woman-smiling_1303-23014.jpg'
                  }
                />
              </Tooltip>
              <Tooltip title="User 4" placement="top">
                <Avatar
                  src={
                    'https://img.freepik.com/free-photo/young-woman-posing-camera_1303-23012.jpg'
                  }
                />
              </Tooltip>
              <Tooltip title="User 5" placement="top">
                <Avatar
                  src={
                    'https://img.freepik.com/free-photo/close-up-girl-posing-camera_197531-10620.jpg'
                  }
                />
              </Tooltip>
              <Tooltip title="User 6" placement="top">
                <Avatar
                  src={
                    'https://img.freepik.com/free-photo/medium-shot-woman-smiling_197531-10617.jpg'
                  }
                />
              </Tooltip>
              <Tooltip title="User 7" placement="top">
                <Avatar
                  src={
                    'https://img.freepik.com/free-photo/portrait-handsome-young-man-with-arms-crossed_1303-23015.jpg'
                  }
                />
              </Tooltip>
            </Avatar.Group>

            <Divider orientation="vertical" className="divider" />

            <Flex vertical>
              <Typography.Text type="secondary" strong>
                1,200 plants sold
              </Typography.Text>
              <Typography.Text type="secondary" strong>
                10 seller
              </Typography.Text>
            </Flex>
          </Flex>
        </Card>
      </Flex>

      <Flex vertical gap="small" className="featured-seller">
        <Flex align="center" justify="space-between">
          <Typography.Title level={5} strong className="primary--color">
            Featured Seller
          </Typography.Title>

          <Button type="link" className="gray--color">
            View All
          </Button>
        </Flex>

        <Card>
          <Flex align="center" justify="space-between">
            <Avatar.Group
              max={{
                count: 5,
                style: {
                  color: '#f56a00',
                  backgroundColor: '#fde3cf',
                  cursor: 'progress',
                },
                popover: { trigger: 'click' },
              }}
              size="large"
            >
              <Tooltip title="User 1" placement="top">
                <Avatar
                  src={
                    'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png'
                  }
                />
              </Tooltip>
              <Tooltip title="User 2" placement="top">
                <Avatar
                  src={
                    'https://img.freepik.com/premium-photo/close-up-happy-smiling-woman-posing-camera_197531-10618.jpg'
                  }
                />
              </Tooltip>
              <Tooltip title="User 3" placement="top">
                <Avatar
                  src={
                    'https://img.freepik.com/free-photo/portrait-handsome-man-smiling_1303-23016.jpg'
                  }
                />
              </Tooltip>
              <Tooltip title="User 4" placement="top">
                <Avatar
                  src={
                    'https://img.freepik.com/free-photo/young-woman-posing-camera_1303-23012.jpg'
                  }
                />
              </Tooltip>
              <Tooltip title="User 5" placement="top">
                <Avatar
                  src={
                    'https://img.freepik.com/free-photo/close-up-girl-posing-camera_197531-10620.jpg'
                  }
                />
              </Tooltip>
              <Tooltip title="User 6" placement="top">
                <Avatar
                  src={
                    'https://img.freepik.com/free-photo/medium-shot-woman-smiling_197531-10617.jpg'
                  }
                />
              </Tooltip>
              <Tooltip title="User 7" placement="top">
                <Avatar
                  src={
                    'https://img.freepik.com/free-photo/portrait-handsome-young-man-with-arms-crossed_1303-23015.jpg'
                  }
                />
              </Tooltip>
            </Avatar.Group>

            <Divider orientation="vertical" className="divider" />

            <Flex vertical>
              <Typography.Text type="secondary" strong>
                1,530 plants sold
              </Typography.Text>
              <Typography.Text type="secondary" strong>
                13 seller
              </Typography.Text>
            </Flex>
          </Flex>
        </Card>
      </Flex>
    </Flex>
  );
};

export default SellerLists;
