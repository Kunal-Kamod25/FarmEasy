const VendorAddProduct = () => {
    return (
        <div className="max-w-xl bg-white p-6 rounded shadow">
            <h2 className="text-2xl font-bold mb-4">Add Product</h2>

            <form className="space-y-4">
                <input className="w-full border p-2 rounded" placeholder="Product Name" />
                <input className="w-full border p-2 rounded" placeholder="Price" />
                <textarea className="w-full border p-2 rounded" placeholder="Description" />

                <button className="bg-green-600 text-white px-4 py-2 rounded w-full">
                    Add Product
                </button>
            </form>
        </div>
    );
};

export default VendorAddProduct;
