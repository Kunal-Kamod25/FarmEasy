import React, { useState, useEffect } from "react";
import { 
  Plus, X, AlertCircle, Check, Sprout, Sparkles, 
  Layers, Tag, ShieldCheck, ArrowLeft, Search, 
  LayoutDashboard, Archive, Briefcase
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../config";

const VendorManageCategories = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [activeTab, setActiveTab] = useState("categories"); // categories, brands
  const [showForm, setShowForm] = useState(null); // category, subcategory, brand

  const [categoryForm, setCategoryForm] = useState({ name: "", description: "" });
  const [subcategoryForm, setSubcategoryForm] = useState({ name: "", description: "", parentId: "" });
  const [brandForm, setBrandForm] = useState({ name: "", description: "" });

  useEffect(() => {
    fetchCategories();
    fetchBrands();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/api/categories`);
      const data = await res.json();
      if (data.success) setCategories(data.data);
    } catch (err) { console.error(err); }
  };

  const fetchBrands = async () => {
    try {
      const res = await fetch(`${API_URL}/api/brands`);
      const data = await res.json();
      if (data.success) setBrands(data.data);
    } catch (err) { console.error(err); }
  };

  const showNotification = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) return showNotification("error", "Name is required");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/vendor/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(categoryForm),
      });
      const data = await res.json();
      if (data.success) {
        showNotification("success", "Category created!");
        setCategoryForm({ name: "", description: "" });
        setShowForm(null);
        fetchCategories();
      }
    } catch (err) { showNotification("error", "Failed to create"); }
    finally { setLoading(false); }
  };

  const handleCreateSubcategory = async (e) => {
    e.preventDefault();
    if (!subcategoryForm.name.trim() || !subcategoryForm.parentId) return showNotification("error", "Name and Parent required");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/vendor/categories/subcategory`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(subcategoryForm),
      });
      const data = await res.json();
      if (data.success) {
        showNotification("success", "Subcategory created!");
        setSubcategoryForm({ name: "", description: "", parentId: "" });
        setShowForm(null);
        fetchCategories();
      }
    } catch (err) { showNotification("error", "Failed to create"); }
    finally { setLoading(false); }
  };

  const handleCreateBrand = async (e) => {
    e.preventDefault();
    if (!brandForm.name.trim()) return showNotification("error", "Brand name is required");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/brands`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(brandForm),
      });
      const data = await res.json();
      if (data.success) {
        showNotification("success", "Brand created!");
        setBrandForm({ name: "", description: "" });
        setShowForm(null);
        fetchBrands();
      }
    } catch (err) { showNotification("error", "Failed to create"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#04110d] lg:grid lg:grid-cols-[0.95fr_1.05fr] font-Lora text-white">
      {/* ASIDE: DECORATIVE PANEL */}
      <aside className="relative overflow-hidden border-b border-white/5 bg-[radial-gradient(circle_at_top_left,_rgba(134,239,172,0.18),_transparent_32%),radial-gradient(circle_at_80%_18%,_rgba(45,212,191,0.16),_transparent_28%),linear-gradient(135deg,_#02110b_0%,_#041b13_45%,_#0a2a1d_100%)] px-6 py-10 text-white lg:min-h-screen lg:border-b-0 lg:border-r lg:px-12 lg:py-12">
        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:72px_72px]" />
        
        <div className="relative flex min-h-[280px] flex-col justify-between lg:min-h-[calc(100vh-6rem)]">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white/80 backdrop-blur-xl">
            <LayoutDashboard className="h-4 w-4 text-emerald-200" />
            Catalog Master
          </div>

          <div className="max-w-xl pt-16 lg:pt-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-100/80 backdrop-blur-xl">
              <Sparkles className="h-4 w-4" />
              Inventory Structure
            </div>

            <h1 className="mt-6 text-4xl font-semibold leading-tight text-white sm:text-5xl">
              Organize Your Store's DNA
            </h1>
            <p className="mt-4 max-w-lg text-base leading-7 text-white/70 sm:text-lg">
              Define the categories and brands that make your products easy to find. A well-structured catalog sells 40% faster.
            </p>

            <div className="mt-10 space-y-4">
              {[
                { icon: Layers, title: "Category Hierarchy", text: "Groups products by type for easy navigation." },
                { icon: ShieldCheck, title: "Brand Identity", text: "Establish trust with recognized manufacturer labels." },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 items-start p-5 rounded-[1.75rem] border border-white/10 bg-white/5 backdrop-blur-xl group hover:bg-white/10 transition">
                  <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-300">
                    <item.icon size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                    <p className="text-sm text-white/60">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="hidden max-w-md text-sm leading-6 text-white/55 lg:block">
            Updating master data affects all linked products. Ensure accuracy when creating new subcategories.
          </p>
        </div>
      </aside>

      {/* MAIN: CONTENT PANEL */}
      <main className="flex items-start justify-center px-4 py-10 sm:px-6 lg:px-12 overflow-y-auto">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold">Catalog Settings</h2>
              <p className="text-white/50 text-sm">Manage store-wide categories and brands</p>
            </div>
            <button onClick={() => navigate("/vendor")} className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition">
              <ArrowLeft size={20} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 p-1.5 bg-white/5 rounded-2xl border border-white/10 mb-8">
            <button 
              onClick={() => setActiveTab("categories")}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition ${activeTab === "categories" ? "bg-emerald-500 text-white shadow-lg" : "text-white/50 hover:text-white"}`}
            >
              Categories
            </button>
            <button 
              onClick={() => setActiveTab("brands")}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition ${activeTab === "brands" ? "bg-emerald-500 text-white shadow-lg" : "text-white/50 hover:text-white"}`}
            >
              Brands
            </button>
          </div>

          {/* Quick Actions based on tab */}
          <div className="flex gap-3 mb-8">
            {activeTab === "categories" ? (
              <>
                <button onClick={() => setShowForm("category")} className="flex-1 flex items-center justify-center gap-2 py-4 rounded-[1.5rem] bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold hover:bg-emerald-500/20 transition">
                  <Plus size={18} /> Category
                </button>
                <button onClick={() => setShowForm("subcategory")} className="flex-1 flex items-center justify-center gap-2 py-4 rounded-[1.5rem] bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold hover:bg-cyan-500/20 transition">
                  <Plus size={18} /> Subcategory
                </button>
              </>
            ) : (
              <button onClick={() => setShowForm("brand")} className="w-full flex items-center justify-center gap-2 py-4 rounded-[1.5rem] bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold hover:bg-amber-500/20 transition">
                <Plus size={18} /> New Brand
              </button>
            )}
          </div>

          {/* Notification */}
          {message.text && (
            <div className={`mb-6 p-4 rounded-2xl border flex items-center gap-3 animate-in fade-in zoom-in duration-300 ${message.type === "success" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" : "bg-rose-500/10 border-rose-500/30 text-rose-300"}`}>
              {message.type === "success" ? <Check size={18} /> : <AlertCircle size={18} />}
              <span className="font-semibold text-sm">{message.text}</span>
            </div>
          )}

          {/* Forms */}
          {showForm && (
            <div className="mb-10 p-8 rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl animate-in fade-in slide-in-from-top-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold capitalize">Add {showForm}</h3>
                <button onClick={() => setShowForm(null)} className="text-white/40 hover:text-white"><X size={20} /></button>
              </div>

              <form className="space-y-4" onSubmit={
                showForm === "category" ? handleCreateCategory : 
                showForm === "subcategory" ? handleCreateSubcategory : 
                handleCreateBrand
              }>
                {showForm === "subcategory" && (
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2 block">Parent Category</label>
                    <select 
                      value={subcategoryForm.parentId}
                      onChange={(e) => setSubcategoryForm({...subcategoryForm, parentId: e.target.value})}
                      className="w-full bg-[#04110d] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-cyan-500 transition outline-none"
                    >
                      <option value="">Select Parent...</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                )}
                
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2 block">Name</label>
                  <input 
                    type="text"
                    placeholder={`Enter ${showForm} name`}
                    value={showForm === "category" ? categoryForm.name : showForm === "subcategory" ? subcategoryForm.name : brandForm.name}
                    onChange={(e) => {
                      if (showForm === "category") setCategoryForm({...categoryForm, name: e.target.value});
                      else if (showForm === "subcategory") setSubcategoryForm({...subcategoryForm, name: e.target.value});
                      else setBrandForm({...brandForm, name: e.target.value});
                    }}
                    className="w-full bg-[#04110d] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 transition outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2 block">Description</label>
                  <textarea 
                    placeholder="Brief description..."
                    rows={3}
                    value={showForm === "category" ? categoryForm.description : showForm === "subcategory" ? subcategoryForm.description : brandForm.description}
                    onChange={(e) => {
                      if (showForm === "category") setCategoryForm({...categoryForm, description: e.target.value});
                      else if (showForm === "subcategory") setSubcategoryForm({...subcategoryForm, description: e.target.value});
                      else setBrandForm({...brandForm, description: e.target.value});
                    }}
                    className="w-full bg-[#04110d] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 transition outline-none resize-none"
                  />
                </div>

                <button disabled={loading} type="submit" className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 rounded-2xl font-bold text-sm shadow-xl shadow-emerald-950/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50">
                  {loading ? "Saving..." : `Create ${showForm}`}
                </button>
              </form>
            </div>
          )}

          {/* Lists */}
          <div className="space-y-4">
            {activeTab === "categories" ? (
              categories.length > 0 ? (
                categories.map(cat => (
                  <div key={cat.id} className="p-6 rounded-[2rem] border border-white/10 bg-white/5 hover:bg-white/8 transition-all group">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-lg font-bold group-hover:text-emerald-400 transition">{cat.name}</h4>
                      <span className="text-[10px] font-black uppercase text-emerald-500/50">{cat.subcategories?.length || 0} Subs</span>
                    </div>
                    <p className="text-sm text-white/40 line-clamp-2 mb-4">{cat.description || "No description provided."}</p>
                    {cat.subcategories && cat.subcategories.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {cat.subcategories.map(sub => (
                          <span key={sub.id} className="px-3 py-1 bg-emerald-500/5 border border-emerald-500/10 rounded-lg text-[10px] font-bold text-emerald-100/60">
                            {sub.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[2rem] text-white/20">No categories found.</div>
              )
            ) : (
              brands.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {brands.map(brand => (
                    <div key={brand.id} className="p-6 rounded-[2rem] border border-white/10 bg-white/5 hover:border-amber-500/30 transition-all group flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center font-black text-2xl text-amber-500/40 group-hover:bg-amber-500/20 transition">
                        {brand.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-lg font-bold group-hover:text-amber-400 transition">{brand.name}</h4>
                        <p className="text-sm text-white/40">{brand.description || "Active Brand"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[2rem] text-white/20">No brands found.</div>
              )
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default VendorManageCategories;
