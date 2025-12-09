// src/presentation/components/molecules/ProductCard/ProductCard.jsx
import { Card, Image } from '@atoms';
import '@styles/components/molecules/product-card.css';

/**
 * Componente molecular ProductCard
 * Combina Card, Image y Meta para mostrar un producto
 * 
 * @param {object} product - Objeto del producto con id, picture y name
 * @param {string} className - Clases CSS adicionales
 * @param {function} onClick - Callback al hacer clic en la tarjeta
 */
const ProductCard = ({ product, className = '', onClick }) => {
    const { id, picture, name } = product;

    return (
        <Card key={id} hoverable className={`product-card ${className}`} onClick={onClick}>
            <Image src={picture} className="product-card__image" />
            <Card.Meta title={name} className="product-card__meta" />
        </Card>
    );
};

export default ProductCard;
