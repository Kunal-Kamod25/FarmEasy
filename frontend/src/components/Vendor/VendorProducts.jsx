import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Pencil, Trash2, Plus, Package, Search, AlertCircle, Eye } from "lucide-react";
import { API_URL, getImageUrl } from '../../config';

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
        <div className="flex items-end bg-gray-100/50 p-1 px-2 rounded-t-[1.5rem] w-fit border-b-2 border-transparent">
          {[
            { id: "list", label: "List View" },
            { id: "card", label: "Card View" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setViewMode(tab.id)}
              className={`relative px-8 py-3 text-sm font-bold transition-all rounded-t-xl overflow-hidden ${
                viewMode === tab.id
                  ? "bg-white text-emerald-700 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] before:content-[''] before:absolute before:-left-4 before:bottom-0 before:w-4 before:h-4 before:bg-white before:rounded-br-xl before:shadow-[4px_0_0_0_white] after:content-[''] after:absolute after:-right-4 after:bottom-0 after:w-4 after:h-4 after:bg-white after:rounded-bl-xl after:shadow-[-4px_0_0_0_white]"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
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
            className="w-full pl-12 pr-6 py-3.5 bg-white border border-gray-100 rounded-[1.5rem] shadow-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:outline-none text-sm font-medium transition-all"
          />
        </div>
      </div>

      {/* ── CONTENT AREA ── */}
      <div className="bg-white rounded-b-[2.5rem] rounded-tr-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-50 p-8 min-h-[400px]">
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
                  <div className="space-y-4">
                    {catProducts.map((p) => (
                      <div key={p.id} className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden min-h-[230px]">
                        <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-[160px_minmax(0,1fr)] gap-4 sm:gap-5 h-full">
                          <div className="relative w-full h-36 sm:h-full bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
                            {p.product_image ? (
                              <img
                                src={getImageUrl(p.product_image)}
                                alt={p.product_name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-200">
                                <Package size={38} />
                              </div>
                            )}
                            <span className={`absolute top-2 right-2 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${p.product_quantity > 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
                              {p.product_quantity > 0 ? "In Stock" : "OOS"}
                            </span>
                          </div>

                          <div className="min-w-0 flex flex-col justify-between h-full">
                            <div>
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <h4 className="font-bold text-lg text-gray-900 group-hover:text-emerald-700 transition-colors line-clamp-1">{p.product_name}</h4>
                                  <p className="text-xs font-semibold text-emerald-600 mt-0.5 uppercase tracking-wide">{category}</p>
                                </div>
                                <button onClick={() => navigate(`/product/${p.id}`)} className="text-emerald-600 font-black text-[10px] uppercase tracking-widest hover:underline flex items-center gap-1 shrink-0">
                                  Preview <Eye size={12} />
                                </button>
                              </div>
                              <p className="text-gray-500 text-sm font-medium mt-2 line-clamp-2 min-h-[40px]">{p.product_description || "No description provided"}</p>
                            </div>

                            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                              <div className="bg-gray-50 rounded-xl px-3 py-2">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wide">Price</p>
                                <p className="text-base font-black text-gray-900">₹{Number(p.price).toLocaleString()}</p>
                              </div>
                              <div className="bg-gray-50 rounded-xl px-3 py-2">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wide">Quantity</p>
                                <p className={`text-base font-black ${p.product_quantity > 10 ? "text-emerald-600" : p.product_quantity > 0 ? "text-amber-500" : "text-red-500"}`}>{p.product_quantity}</p>
                              </div>
                              <div className="col-span-2 sm:col-span-1 flex sm:justify-end items-center gap-2">
                                <button onClick={() => navigate(`/vendor/products/edit/${p.id}`)} className="p-2.5 rounded-xl border border-gray-100 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors">
                                  <Pencil size={16} />
                                </button>
                                <button onClick={() => handleDelete(p.id)} className="p-2.5 rounded-xl border border-gray-100 text-red-600 hover:bg-red-600 hover:text-white transition-colors">
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
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