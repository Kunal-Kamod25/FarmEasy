const VendorProducts = () => {
    return (
        <>
            <h2 className="text-2xl font-bold mb-4">My Products</h2>

            <table className="w-full bg-white rounded shadow">
                <thead className="bg-green-600 text-white">
                    <tr>
                        <th className="p-3 text-left">Name</th>
                        <th className="p-3 text-left">Price</th>
                        <th className="p-3 text-left">Action</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className="border-b">
                        <td className="p-3">Urea Fertilizer</td>
                        <td className="p-3">₹500</td>
                        <td className="p-3 space-x-2">
                            <button className="bg-blue-500 text-white px-3 py-1 rounded">Edit</button>
                            <button className="bg-red-500 text-white px-3 py-1 rounded">Delete</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </>
    );
};

export default VendorProducts;
