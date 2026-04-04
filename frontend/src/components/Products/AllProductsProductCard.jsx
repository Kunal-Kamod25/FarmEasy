import React from "react";
import ReusableProductCard from "./ReusableProductCard";

const AllProductsProductCard = ({
    product,
    onToggleWishlist,
    isWishlisted,
    onViewDetail
}) => {
    return (
        <ReusableProductCard
            product={product}
            mode="user"
            isWishlisted={isWishlisted}
            onToggleWishlist={onToggleWishlist}
            onViewDetail={onViewDetail}
        />
    );
};

export default AllProductsProductCard;
