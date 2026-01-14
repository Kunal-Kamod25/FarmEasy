import { RiDeleteBin3Line } from "react-icons/ri";
const CartContents = () => {
    const truncateText = (text, maxLength = 60) => {
        if(text.length <= maxLength) return text;
        return text.slice(0, maxLength) + "...";
    };
    const cartProducts = [
        {
            productId: 1,
            name: "Neptune Model-13-plus knapsack battery sprayer 12V, 12Amp Double Motor, 20L Tank, Spray Gun up to 20ft spray",
            quantity:1,
            price: 6000,
            image: "https://picsum.photos/200?random=1",
        },
        {
            productId: 2,
            name: "Neptune Model-13-plus knapsack battery sprayer 12V, 12Amp Double Motor, 20L Tank, Spray Gun up to 20ft spray",
            quantity:1,
            price: 6000,
            image: "https://picsum.photos/200?random=1",
        },
        {
            productId: 3,
            name: "Neptune Model-13-plus knapsack battery sprayer 12V, 12Amp Double Motor, 20L Tank, Spray Gun up to 20ft spray",
            quantity:1,
            price: 6000,
            image: "https://picsum.photos/200?random=1",
        },
        {
            productId: 3,
            name: "Neptune Model-13-plus knapsack battery sprayer 12V, 12Amp Double Motor, 20L Tank, Spray Gun up to 20ft spray",
            quantity:1,
            price: 6000,
            image: "https://picsum.photos/200?random=1",
        },
        {
            productId: 3,
            name: "Neptune Model-13-plus knapsack battery sprayer 12V, 12Amp Double Motor, 20L Tank, Spray Gun up to 20ft spray",
            quantity:1,
            price: 6000,
            image: "https://picsum.photos/200?random=1",
        },
        {
            productId: 3,
            name: "Neptune Model-13-plus knapsack battery sprayer 12V, 12Amp Double Motor, 20L Tank, Spray Gun up to 20ft spray",
            quantity:1,
            price: 6000,
            image: "https://picsum.photos/200?random=1",
        },

    ];
    return <div className="text-sm text-black text-cut">
        {
            cartProducts.map((product, index) => (
                <div key={index} className="flex items-start justify-between py-4 border-b">
                    <div className="flex items-start">
                        <img src={product.image} alt={product.name} className="w-20 h-24 object-cover mr-4 rounded" />
                        <div>
                            <h3>{truncateText(product.name,30)}</h3>
                            <p className="text-sm text-black hover:underline courser-pointer">
                                Quantity: {product.quantity} | Price: {product.price}
                            </p>
                            <div className="flex items-center mt-2">
                                <button className="border rounded px-2 py-1 text-xl font-medium">
                                    -
                                </button>
                                <span className="mx-4">{product.quantity}</span>
                                <button className="border rounded px-2 py-1 text-xl font-medium">
                                    +
                                </button>
                            </div>
                        </div>
                    </div>
                    <div>
                        {/* <p>$ {product.price.toLocaleString()}</p> */}
                        <button className="h-6 w-6 hover:text-red-600 px-4 py-0.5 object-cover ">
                            <RiDeleteBin3Line size={23  } />
                        </button>
                    </div>
                </div>
            ))
        }
    </div>
};
export default CartContents;
