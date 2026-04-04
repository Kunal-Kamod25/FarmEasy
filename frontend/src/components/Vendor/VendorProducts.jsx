import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Pencil, Trash2, Plus, Package, Search, AlertCircle, Eye } from "lucide-react";
import { API_URL, getImageUrl } from '../../config';
import ReusableProductCard from "../Products/ReusableProductCard";

const VendorProducts = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("card"); // 'list' | 'card'

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/vendor/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data || []);
    } catch (error) {
      console.error(error);
      alert("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await axios.delete(`${API_URL}/api/vendor/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(products.filter((p) => p.id !== id));
    } catch {
      alert("Failed to delete");
    }
  };

  const filtered = products.filter((p) =>
    p.product_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.category_name?.toLowerCase().includes(search.toLowerCase())
  );

  // Group by category
  const groupedProducts = filtered.reduce((groups, product) => {
    const category = product.category_name || "Uncategorized";
    if (!groups[category]) groups[category] = [];
    groups[category].push(product);
    return groups;
  }, {});

  const totalActive = products.filter((p) => p.product_quantity > 0).length;
  const outOfStock = products.filter((p) => p.product_quantity === 0).length;

  return (
    <div className="min-h-screen bg-transparent p-6 space-y-8">

      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Products</h1>
          <p className="text-gray-500 font-medium mt-1">Manage and organize your inventory</p>
        </div>
        <Link
          to="/vendor/add-product"
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all font-bold text-sm"
        >
          <Plus size={18} />
          Add New Product
        </Link>
      </div>

      {/* ── SUMMARY CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="rounded-[2rem] p-6 shadow-lg shadow-emerald-500/20 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 flex items-center gap-4 group hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300">
          <div className="w-14 h-14 bg-white/20 text-white rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20 group-hover:scale-110 transition-transform">
            <Package size={24} />
          </div>
          <div>
            <p className="text-white/80 text-xs font-bold uppercase tracking-wider">Total Catalog</p>
            <h3 className="text-2xl font-black text-white">{products.length}</h3>
          </div>
        </div>
        <div className="rounded-[2rem] p-6 shadow-lg shadow-blue-500/20 bg-gradient-to-br from-blue-500 via-cyan-500 to-sky-500 flex items-center gap-4 group hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300">
          <div className="w-14 h-14 bg-white/20 text-white rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20 group-hover:scale-110 transition-transform">
            <Plus size={24} className="rotate-45" />
          </div>
          <div>
            <p className="text-white/80 text-xs font-bold uppercase tracking-wider">Active Listing</p>
            <h3 className="text-2xl font-black text-white">{totalActive}</h3>
          </div>
        </div>
        <div className="rounded-[2rem] p-6 shadow-lg shadow-rose-500/20 bg-gradient-to-br from-rose-500 via-orange-500 to-amber-500 flex items-center gap-4 group hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-300">
          <div className="w-14 h-14 bg-white/20 text-white rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20 group-hover:scale-110 transition-transform">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-white/80 text-xs font-bold uppercase tracking-wider">Stock Alerts</p>
            <h3 className="text-2xl font-black text-white">{outOfStock}</h3>
          </div>
        </div>
      </div>

      {/* ── CONTROLS & TABS ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        {/* Chrome-style Tabs */}
        <div className="relative -mb-px flex items-end gap-1 w-fit rounded-t-[1.35rem] border border-slate-200 bg-slate-100 px-2 pt-2">
          {[
            { id: "list", label: "List View" },
            { id: "card", label: "Card View" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setViewMode(tab.id)}
              className={`relative -mb-px px-8 py-3 text-sm font-bold transition-all rounded-t-[1.1rem] border border-b-0 ${
                viewMode === tab.id
                  ? "z-10 bg-white text-emerald-700 border-slate-200 shadow-[0_2px_10px_rgba(15,23,42,0.08)]"
                  : "bg-slate-100 text-slate-500 border-transparent hover:bg-slate-200 hover:text-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative group w-full md:w-80">
          <Search size={18} className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
          <input
            type="text"
            placeholder="Search by name or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 pr-6 py-2.5 bg-white border border-gray-400 rounded-[1.2rem] text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/100 focus:border-emerald-500 w-48 lg:w-72 transition-all font-medium"
          />
        </div>
      </div>

      {/* ── CONTENT AREA ── */}
      <div className="-mt-8 bg-white rounded-b-[2.5rem] rounded-tr-[2.5rem] shadow-xl shadow-gray-200/50 border border-slate-200 p-8 min-h-[400px]">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 bg-gray-50 rounded-[2rem] animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mb-6">
              <Package size={40} className="text-gray-200" />
            </div>
            <h3 className="text-xl font-black text-gray-900">No matching products</h3>
            <p className="text-gray-500 font-medium mt-2 max-w-xs">
              {search ? "We couldn't find anything matching your search query." : "Start adding products to your shop to see them here."}
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {Object.entries(groupedProducts).map(([category, catProducts]) => (
              <div key={category} className="space-y-6">
                <div className="flex items-center gap-4">
                  <h2 className="text-sm font-black text-emerald-600 uppercase tracking-[0.2em]">{category}</h2>
                  <div className="flex-1 h-[1px] bg-gradient-to-r from-emerald-100 to-transparent"></div>
                  <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full">{catProducts.length} ITEMS</span>
                </div>

                {viewMode === "card" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {catProducts.map((p) => (
                      <ReusableProductCard
                        key={p.id}
                        product={p}
                        mode="vendor"
                        categoryLabel={category}
                        onViewDetail={() => navigate(`/product/${p.id}`)}
                        onEdit={() => navigate(`/vendor/products/edit/${p.id}`)}
                        onDelete={() => handleDelete(p.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="overflow-x-auto -mx-2">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] border-b border-gray-50">
                          <th className="px-4 py-4 w-16">Item</th>
                          <th className="px-4 py-4">Product Name</th>
                          <th className="px-4 py-4">Base Price</th>
                          <th className="px-4 py-4">Quantity</th>
                          <th className="px-4 py-4">Status</th>
                          <th className="px-4 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50/50">
                        {catProducts.map((p) => (
                          <tr key={p.id} className="group hover:bg-emerald-50/30 transition-colors">
                            <td className="px-4 py-5">
                              <div className="w-12 h-12 rounded-2xl bg-gray-50 overflow-hidden border border-gray-100 flex-shrink-0">
                                {p.product_image ? (
                                  <img src={getImageUrl(p.product_image)} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-200">
                                    <Package size={20} />
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-5">
                              <p className="font-bold text-gray-900 line-clamp-1">{p.product_name}</p>
                              <p className="text-[10px] text-gray-400 font-medium">{p.product_type || "Standard"}</p>
                            </td>
                            <td className="px-4 py-5 font-black text-gray-900">₹{Number(p.price).toLocaleString()}</td>
                            <td className="px-4 py-5">
                              <span className={`font-black ${p.product_quantity > 10 ? "text-emerald-600" : p.product_quantity > 0 ? "text-amber-500" : "text-red-500"}`}>
                                {p.product_quantity}
                              </span>
                            </td>
                            <td className="px-4 py-5">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${p.product_quantity > 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
                                {p.product_quantity > 0 ? "Active" : "OOS"}
                              </span>
                            </td>
                            <td className="px-4 py-5 text-right">
                              <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => navigate(`/product/${p.id}`)} className="p-2 text-gray-400 hover:text-emerald-600 transition-colors"><Eye size={16} /></button>
                                <button onClick={() => navigate(`/vendor/products/edit/${p.id}`)} className="p-2 text-gray-400 hover:text-blue-600 transition-colors"><Pencil size={16} /></button>
                                <button onClick={() => handleDelete(p.id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorProducts;