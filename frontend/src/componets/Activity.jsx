import React from 'react';
import { Flex, Typography, Button, List, Avatar } from 'antd';

const data = [
  {
    name: 'Emma Turner',
    orderTime: 1,
  },
  {
    name: 'Liam Smith',
    orderTime: 2,
  },
  {
    name: 'Olivia Read',
    orderTime: 3,
  },
  {
    name: 'Ethan Hayes',
    orderTime: 4,
  },
  {
    name: 'Isabella James',
    orderTime: 5,
  },
];
const Activity = () => {
  return (
    <Flex vertical gap="small">
      <Flex align="center" justify="space-between" gap="large">
        <Typography.Title level={3} strong className="primary--color">
          Recent Activity
        </Typography.Title>

        <Button type="link" className="gray--color">
          View All
        </Button>
      </Flex>

      <List
        pagination
        dataSource={data}
        renderItem={(user) => (
          <List.Item>
            <List.Item.Meta
              avatar={
                <Avatar
                  src={'https://api.dicebear.com/7.x/miniavs/svg?seed=${index}'}
                />
              }
              title={<a href={'#'}>{user.name}</a>}
              description="Ordered a new plant"
            ></List.Item.Meta>
            <span className="gray--color">
              {user.orderTime} {user.orderTime === 1 ? 'day ago' : 'days ago'}
            </span>
          </List.Item>
        )}
      />
    </Flex>
  );
};

export default Activity;
