// src/presentation/components/organisms/Activity/Activity.jsx
import { Flex, List } from 'antd';
import { SectionHeader } from '@molecules';
import { ActivityItem } from '@molecules';
import '@styles/components/organisms/activity.css';

const data = [
    { name: 'Emma Turner', orderTime: 1 },
    { name: 'Liam Smith', orderTime: 2 },
    { name: 'Olivia Read', orderTime: 3 },
    { name: 'Ethan Hayes', orderTime: 4 },
    { name: 'Isabella James', orderTime: 5 },
];

const Activity = () => {
    return (
        <Flex vertical gap="small" className="activity">
            <SectionHeader title="Recent Activity" viewAllText="View All" />
            <List
                pagination
                dataSource={data}
                renderItem={(activity) => <ActivityItem activity={activity} />}
            />
        </Flex>
    );
};

export default Activity;