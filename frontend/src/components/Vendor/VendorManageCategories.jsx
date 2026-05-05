import React, { useState, useEffect } from "react";
import { Plus, X, AlertCircle, Check } from "lucide-react";
import { API_URL } from "../../config";

const VendorManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showSubcategoryForm, setShowSubcategoryForm] = useState(false);
  const [selectedParent, setSelectedParent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
  });

  const [subcategoryForm, setSubcategoryForm] = useState({
    name: "",
    description: "",
    parentId: null,
  });

  // Fetch categories on load
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/api/categories`);
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const showNotification = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  // Create new category
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    
    if (!categoryForm.name.trim()) {
      showNotification("error", "Category name is required");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/vendor/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: categoryForm.name.trim(),
          description: categoryForm.description.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        showNotification("success", "Category created successfully!");
        setCategoryForm({ name: "", description: "" });
        setShowCategoryForm(false);
        fetchCategories();
      } else {
        showNotification("error", data.error || "Failed to create category");
      }
    } catch (err) {
      showNotification("error", "Error creating category");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Create new subcategory
  const handleCreateSubcategory = async (e) => {
    e.preventDefault();
    
    if (!subcategoryForm.name.trim()) {
      showNotification("error", "Subcategory name is required");
      return;
    }

    if (!subcategoryForm.parentId) {
      showNotification("error", "Please select a parent category");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/vendor/categories/subcategory`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          parentId: subcategoryForm.parentId,
          name: subcategoryForm.name.trim(),
          description: subcategoryForm.description.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        showNotification("success", "Subcategory created successfully!");
        setSubcategoryForm({ name: "", description: "", parentId: null });
        setShowSubcategoryForm(false);
        setSelectedParent(null);
        fetchCategories();
      } else {
        showNotification("error", data.error || "Failed to create subcategory");
      }
    } catch (err) {
      showNotification("error", "Error creating subcategory");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#04110d] p-6 lg:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Manage Categories</h1>
          <p className="text-white/60">Create and manage product categories and subcategories for your inventory</p>
        </div>

        {/* Notification */}
        {message.text && (
          <div className={`mb-6 flex items-center gap-3 rounded-2xl border px-4 py-3 ${
            message.type === "success" 
              ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-100" 
              : "border-rose-400/30 bg-rose-400/10 text-rose-100"
          }`}>
            {message.type === "success" ? <Check size={20} /> : <AlertCircle size={20} />}
            {message.text}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <button
            onClick={() => {
              setShowCategoryForm(true);
              setShowSubcategoryForm(false);
            }}
            className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 px-4 py-3 text-sm font-semibold text-emerald-100 hover:bg-emerald-500/30 transition"
          >
            <Plus size={18} />
            Add New Category
          </button>
          <button
            onClick={() => {
              setShowSubcategoryForm(true);
              setShowCategoryForm(false);
            }}
            className="flex items-center justify-center gap-2 rounded-2xl bg-cyan-500/20 border border-cyan-400/50 px-4 py-3 text-sm font-semibold text-cyan-100 hover:bg-cyan-500/30 transition"
          >
            <Plus size={18} />
            Add Subcategory
          </button>
        </div>

        {/* Create Category Form */}
        {showCategoryForm && (
          <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Create New Category</h2>
              <button
                onClick={() => setShowCategoryForm(false)}
                className="text-white/40 hover:text-white/60"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-white/80">
                  Category Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Organic Seeds, Premium Tools"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/35 outline-none transition focus:border-emerald-300/60 focus:bg-white/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-white/80">
                  Description
                </label>
                <textarea
                  placeholder="Describe this category..."
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/35 outline-none transition focus:border-emerald-300/60 focus:bg-white/10"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-600 transition disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create Category"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCategoryForm(false);
                    setCategoryForm({ name: "", description: "" });
                  }}
                  className="flex-1 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-white/70 hover:bg-white/5 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Create Subcategory Form */}
        {showSubcategoryForm && (
          <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Create New Subcategory</h2>
              <button
                onClick={() => setShowSubcategoryForm(false)}
                className="text-white/40 hover:text-white/60"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSubcategory} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-white/80">
                  Parent Category *
                </label>
                <select
                  value={subcategoryForm.parentId || ""}
                  onChange={(e) => setSubcategoryForm({ ...subcategoryForm, parentId: parseInt(e.target.value) || null })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-emerald-300/60 focus:bg-white/10"
                >
                  <option value="">Select a parent category...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-white/80">
                  Subcategory Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Hybrid Seeds, Drip Irrigation"
                  value={subcategoryForm.name}
                  onChange={(e) => setSubcategoryForm({ ...subcategoryForm, name: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/35 outline-none transition focus:border-emerald-300/60 focus:bg-white/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-white/80">
                  Description
                </label>
                <textarea
                  placeholder="Describe this subcategory..."
                  value={subcategoryForm.description}
                  onChange={(e) => setSubcategoryForm({ ...subcategoryForm, description: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/35 outline-none transition focus:border-emerald-300/60 focus:bg-white/10"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-600 transition disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create Subcategory"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowSubcategoryForm(false);
                    setSubcategoryForm({ name: "", description: "", parentId: null });
                  }}
                  className="flex-1 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-white/70 hover:bg-white/5 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Categories List */}
        <div className="space-y-4">
          {categories.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
              <p className="text-white/60">No categories yet. Create one to get started!</p>
            </div>
          ) : (
            categories.map((category) => (
              <div key={category.id} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                <h3 className="text-lg font-semibold text-white mb-2">{category.name}</h3>
                <p className="text-white/60 text-sm mb-4">{category.description}</p>

                {category.subcategories && category.subcategories.length > 0 && (
                  <div className="ml-4">
                    <p className="text-xs font-semibold text-white/40 uppercase mb-2">Subcategories:</p>
                    <div className="space-y-2">
                      {category.subcategories.map((sub) => (
                        <div key={sub.id} className="text-sm text-white/70 flex items-center gap-2">
                          <span className="w-1 h-1 bg-emerald-400 rounded-full"></span>
                          {sub.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorManageCategories;
