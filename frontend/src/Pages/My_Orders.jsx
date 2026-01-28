import { useState, useEffect } from "react";
const My_Orders = () => {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        // Simulate fetching orders
        setTimeout(() => {
            const mockOrders = [
                {
                    _id: "2503",
                    createdAt: new Date(),
                    shippingAddress: { city: "Russia", country: "USA" },
                    orderItems: [
                        {
                            name: "Product 1",
                            image: "https://picsum.photos/200?random=1",
                        },
                    ],
                    totalPrice: 100,
                    isPaid: true,
                },
                {
                    _id: "2504",
                    createdAt: new Date(),
                    shippingAddress: { city: "Russia", country: "USA" },
                    orderItems: [
                        {
                            name: "Product 1",
                            image: "https://picsum.photos/200?random=1",
                        },
                    ],
                    totalPrice: 100,
                    isPaid: true,
                },
            ];
            setOrders(mockOrders);
        }, 1000);
    }, []);

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold mb-6">My Orders</h2>
            <div className="relative shadow-md sm:rounded-lg overflow-hidden">
                <table className="min-w-full text-left text-gray-500">
                    <thead className="bg-gray-100 text-xs uppercase text-gray-700">
                        <tr>
                            <th className="py-2 px-4 sm:py-3">Image</th>
                            <th className="py-2 px-4 sm:py-3">Order ID</th>
                            <th className="py-2 px-4 sm:py-3">Created</th>
                            <th className="py-2 px-4 sm:py-3">Shipping Address</th>
                            <th className="py-2 px-4 sm:py-3">Price</th>
                            <th className="py-2 px-4 sm:py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.length > 0 ? (
                            orders.map((order) => (
                                <tr key={order._id} className="border-b hover:border-gray- cursor-pointer">
                                    <td className="py-2 px-2 sm:py-4 sm:px-4">
                                        <img src={order.orderItems[0].image} alt={order.orderItems[0].name}
                                            className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-lg"
                                        />
                                    </td>
                                </tr>
                            ))

                        ) : (
                            <tr>
                                <td colSpan={7} className="text-center py-4 px-4 text-center text-gray-500">
                                    No orders found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default My_Orders;