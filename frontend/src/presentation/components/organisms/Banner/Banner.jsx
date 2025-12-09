// src/presentation/components/organisms/Banner/Banner.jsx
import { Card } from '@atoms';
import { BannerContent } from '@molecules';
import '@styles/components/organisms/banner.css';

const Banner = () => {
    return (
        <Card className="banner-card">
            <BannerContent
                title="Create and sell products"
                description="Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos."
                primaryButtonText="Explore More"
                secondaryButtonText="Top Sellers"
            />
        </Card>
    );
};

export default Banner;