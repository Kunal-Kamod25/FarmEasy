import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2, Plus, Package, Search, AlertCircle, Eye } from "lucide-react";

const VendorProducts = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/vendor/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data);
    } catch (error) {
      console.error(error);
      alert("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/vendor/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(products.filter((p) => p.id !== id));
    } catch (error) {
      alert("Failed to delete");
    }
  };

  const filtered = products.filter((p) =>
    p.product_name?.toLowerCase().includes(search.toLowerCase())
  );

  const totalActive = products.filter((p) => p.product_quantity > 0).length;
  const outOfStock = products.filter((p) => p.product_quantity === 0).length;

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Products</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage your product catalog</p>
        </div>
        <button
          onClick={() => navigate("/vendor/products/add")}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all text-sm font-semibold"
        >
          <Plus size={16} />
          Add Product
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-5 text-white shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
          <p className="text-white/70 text-xs font-medium uppercase tracking-wider">Total Products</p>
          <h3 className="text-3xl font-bold mt-1">{products.length}</h3>
          <p className="text-white/60 text-xs mt-2">In your catalog</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-5 text-white shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
          <p className="text-white/70 text-xs font-medium uppercase tracking-wider">Active</p>
          <h3 className="text-3xl font-bold mt-1">{totalActive}</h3>
          <p className="text-white/60 text-xs mt-2">In stock & live</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl p-5 text-white shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
          <p className="text-white/70 text-xs font-medium uppercase tracking-wider">Out of Stock</p>
          <h3 className="text-3xl font-bold mt-1">{outOfStock}</h3>
          <p className="text-white/60 text-xs mt-2">Needs restocking</p>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

        {/* Table Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-800">All Products</h2>
          <div className="relative w-64">
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="bg-gray-100 rounded-2xl p-5 mb-4">
              <AlertCircle className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-gray-600 font-semibold">No products found</p>
            <p className="text-gray-400 text-sm mt-1">
              {search ? "Try a different search term" : "Add your first product to get started"}
            </p>
            {!search && (
              <button
                onClick={() => navigate("/vendor/products/add")}
                className="mt-4 bg-emerald-600 text-white text-sm px-5 py-2 rounded-xl hover:bg-emerald-700 transition font-semibold"
              >
                + Add Product
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="text-left px-6 py-3">Product</th>
                  <th className="text-left px-6 py-3">Type</th>
                  <th className="text-left px-6 py-3">Price</th>
                  <th className="text-left px-6 py-3">Stock</th>
                  <th className="text-left px-6 py-3">Status</th>
                  <th className="text-left px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Package size={16} className="text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 leading-tight line-clamp-1 max-w-[180px]">
                            {product.product_name}
                          </p>
                          <p className="text-gray-400 text-xs line-clamp-1 max-w-[180px]">
                            {product.product_description || "No description"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {product.product_type || "—"}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-800">
                      ₹{Number(product.price).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-semibold ${product.product_quantity > 10
                          ? "text-emerald-600"
                          : product.product_quantity > 0
                            ? "text-amber-500"
                            : "text-red-500"
                        }`}>
                        {product.product_quantity ?? "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${product.product_quantity > 0
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-red-50 text-red-600"
                        }`}>
                        {product.product_quantity > 0 ? "Active" : "Out of Stock"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/vendor/products/view/${product.id}`)}
                          className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition"
                          title="View"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => navigate(`/vendor/products/edit/${product.id}`)}
                          className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        {!loading && filtered.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-500">
              Showing {filtered.length} of {products.length} products
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorProducts;







// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import { Pencil, Trash2, Plus } from "lucide-react";

// const VendorProducts = () => {
//   const navigate = useNavigate();
//   const token = localStorage.getItem("token");

//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const fetchProducts = async () => {
//     try {
//       setLoading(true);

//       const res = await axios.get(
//         "http://localhost:5000/api/vendor/products",
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       setProducts(res.data);
//     } catch (error) {
//       console.error(error);
//       alert("Failed to load products");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchProducts();
//   }, []);

//   const handleDelete = async (id) => {
//     if (!window.confirm("Delete this product?")) return;

//     try {
//       await axios.delete(
//         `http://localhost:5000/api/vendor/products/${id}`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       setProducts(products.filter((p) => p.id !== id));
//     } catch (error) {
//       alert("Failed to delete");
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 p-8">

//       {/* Header */}
//       <div className="flex justify-between items-center mb-8">
//         <h2 className="text-3xl font-bold text-green-700">
//           My Products
//         </h2>

//         <button
//           onClick={() => navigate("/vendor/products/add")}
//           className="flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition"
//         >
//           <Plus size={18} />
//           Add Product
//         </button>
//       </div>

//       {loading ? (
//         <p>Loading...</p>
//       ) : products.length === 0 ? (
//         <p>No products added yet.</p>
//       ) : (
//         <div className="space-y-6">
//           {products.map((product) => (
//             <div
//               key={product.id}
//               className="bg-white rounded-2xl shadow-md p-6 flex justify-between items-center hover:shadow-lg transition"
//             >

//               {/* LEFT SIDE */}
//               <div className="flex items-center gap-6">

//                 {/* Product Image */}
//                 <img
//                   src="https://via.placeholder.com/100"
//                   alt="product"
//                   className="w-24 h-24 object-cover rounded-xl"
//                 />

//                 {/* Product Info */}
//                 <div>
//                   <h3 className="text-xl font-semibold text-gray-800">
//                     {product.product_name}
//                   </h3>

//                   <p className="text-gray-500 text-sm mt-1">
//                     Quantity: {product.product_quantity}
//                   </p>

//                   <p className="text-gray-400 text-sm mt-1">
//                     {product.product_description}
//                   </p>

//                   {/* Status Badge */}
//                   <span className="inline-block mt-3 px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
//                     Active
//                   </span>
//                 </div>
//               </div>

//               {/* RIGHT SIDE */}
//               <div className="text-right space-y-3">

//                 <div>
//                   <p className="text-gray-400 text-sm uppercase tracking-wide">
//                     Price
//                   </p>
//                   <p className="text-2xl font-bold text-green-600">
//                     ₹{product.price}
//                   </p>
//                 </div>

//                 <div className="flex gap-2 justify-end">
//                   <button
//                     onClick={() =>
//                       navigate(`/vendor/products/edit/${product.id}`)
//                     }
//                     className="bg-blue-100 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-200 transition"
//                   >
//                     <Pencil size={16} />
//                   </button>

//                   <button
//                     onClick={() => handleDelete(product.id)}
//                     className="bg-red-100 text-red-600 px-3 py-2 rounded-lg hover:bg-red-200 transition"
//                   >
//                     <Trash2 size={16} />
//                   </button>
//                 </div>

//                 <button
//                   onClick={() =>
//                     navigate(`/vendor/products/view/${product.id}`)
//                   }
//                   className="text-green-600 font-medium text-sm hover:underline"
//                 >
//                   View Details →
//                 </button>

//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default VendorProducts;