import React from "react";
import { useParams } from "react-router-dom";
import { products } from "../components/Products/ProductData";
import ProductCard from "../components/Products/ProductCard";

const ProductDetails = () => {
  const { id } = useParams();
  const pid = parseInt(id, 10);
  const product = products.find((p) => p.id === pid);

  if (!product) {
    return (
      <div className="py-20 text-center text-gray-500">
        <p>Product not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* use the same card component for consistency */}
      <ProductCard product={product} />
      {/* additional details could go here if desired */}
    </div>
  );
};

export default ProductDetails;
