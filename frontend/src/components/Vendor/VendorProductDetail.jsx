import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { 
  ArrowLeft, Package, Star, MessageSquare, 
  HelpCircle, TrendingUp, Edit3, Trash2,
  Clock, User, CheckCircle, AlertTriangle, Send
} from "lucide-react";
import { API_URL, getImageUrl } from "../../config";
import ErrorNotification from "../Common/ErrorNotification";

const VendorProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [ratingSummary, setRatingSummary] = useState(null);
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview"); // overview | reviews | questions
  
  const [answerText, setAnswerText] = useState({}); // map of queryId -> text

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      
      // 1. Fetch Product (Required)
      try {
        const productRes = await axios.get(`${API_URL}/api/vendor/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProduct(productRes.data);
      } catch (err) {
        console.error("Product fetch error:", err);
        setError("Failed to load product details.");
        setLoading(false);
        return; // Don't proceed if product itself fails
      }

      // 2. Fetch Reviews (Optional - don't crash if it fails)
      try {
        const reviewRes = await axios.get(`${API_URL}/api/reviews/product/${id}`);
        setReviews(reviewRes.data.reviews || []);
        setRatingSummary(reviewRes.data.summary || null);
      } catch (err) {
        console.error("Reviews fetch error:", err);
      }

      // 3. Fetch Queries (Optional - don't crash if it fails)
      try {
        const queryRes = await axios.get(`${API_URL}/api/queries/${id}`);
        setQueries(queryRes.data || []);
      } catch (err) {
        console.error("Queries fetch error:", err);
      }
      
    } catch (err) {
      console.error("Fetch error:", err);
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAnswerSubmit = async (queryId) => {
    const text = answerText[queryId];
    if (!text?.trim()) return;

    try {
      await axios.patch(`${API_URL}/api/queries/${queryId}/answer`, 
        { answer_text: text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state
      setQueries(prev => prev.map(q => 
        q.id === queryId ? { ...q, answer_text: text } : q
      ));
      setAnswerText(prev => ({ ...prev, [queryId]: "" }));
    } catch (err) {
      console.error("Answer submit error:", err);
      alert("Failed to submit answer.");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) return;
    try {
      await axios.delete(`${API_URL}/api/vendor/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate("/vendor/products");
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete product.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-bold animate-pulse">Loading Product Details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center justify-center">
        <AlertTriangle size={48} className="text-amber-500 mb-4" />
        <h2 className="text-2xl font-black text-gray-900">Product Not Found</h2>
        <Link to="/vendor/products" className="mt-4 text-emerald-600 font-bold hover:underline">Back to Inventory</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] px-4 md:px-8 pb-12 space-y-6">
      {error && <ErrorNotification message={error} onClose={() => setError("")} />}

      {/* STICKY HEADER */}
      <div className="sticky top-0 z-30 -mx-4 md:-mx-8 px-4 md:px-8 py-4 bg-white/80 backdrop-blur-xl border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all duration-300">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate("/vendor/products")}
            className="group p-2.5 bg-white border border-slate-200 rounded-xl hover:border-emerald-500 hover:text-emerald-600 transition-all shadow-sm"
            title="Back to Products"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight truncate">
              {product.product_name}
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-md uppercase tracking-wider">
                ID: {product.id}
              </span>
              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
              <span className="text-xs font-semibold text-slate-400">SKU: PRD-{product.id}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button 
            onClick={() => navigate(`/vendor/products/edit/${id}`)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl shadow-sm hover:bg-slate-50 hover:border-emerald-500 hover:text-emerald-600 transition-all font-bold text-sm"
          >
            <Edit3 size={16} />
            Edit Product
          </button>
          <button 
            onClick={handleDelete}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-rose-50 text-rose-600 px-4 py-2.5 rounded-xl border border-rose-100 hover:bg-rose-100 transition-all font-bold text-sm"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Visuals & Core Stats & Reviews */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Image Card */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 overflow-hidden group">
            <div className="aspect-square rounded-2xl bg-slate-50 overflow-hidden border border-slate-100 relative mb-6">
              <img 
                src={getImageUrl(product.product_image)} 
                alt={product.product_name} 
                className="w-full h-full object-contain p-6 group-hover:scale-105 transition-transform duration-700" 
              />
              <div className="absolute top-4 left-4">
                 <span className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-black rounded-lg shadow-lg shadow-emerald-500/20 uppercase">
                   {product.product_type || "Standard"}
                 </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Base Price</p>
                <p className="text-xl font-black text-slate-900">₹{Number(product.price).toLocaleString()}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Available Stock</p>
                <p className={`text-xl font-black ${product.product_quantity > 10 ? "text-emerald-600" : "text-amber-600"}`}>
                  {product.product_quantity}
                </p>
              </div>
            </div>
          </div>

          {/* REVIEWS LIST */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wider">
                <Star size={18} className="text-amber-500" />
                Latest Reviews
              </h3>
              {reviews.length > 0 && (
                <span className="text-[10px] font-black text-slate-400 uppercase">{reviews.length} Total</span>
              )}
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto no-scrollbar pr-2">
              {reviews.length === 0 ? (
                <div className="py-8 text-center bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-400">No reviews yet</p>
                </div>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100 group">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[11px] font-extrabold text-slate-900 truncate max-w-[120px]">{review.reviewer_name}</p>
                      <div className="flex items-center gap-0.5 text-amber-500">
                         <Star size={10} fill="currentColor" />
                         <span className="text-[10px] font-black">{review.rating}.0</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-3 italic">"{review.comment}"</p>
                    <p className="text-[9px] text-slate-300 font-bold mt-2 text-right uppercase tracking-tighter">
                      {new Date(review.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Tabbed Content (Overview & Q&A) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Navigation Tabs */}
          <div className="flex items-center p-1.5 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-x-auto no-scrollbar">
            {[
              { id: "overview", label: "Product Overview", icon: <Package size={16} /> },
              { id: "questions", label: `Farmer Q&A (${queries.length})`, icon: <HelpCircle size={16} /> },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id === "reviews" ? "overview" : tab.id)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-300 ${
                  activeTab === tab.id 
                    ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20" 
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {React.cloneElement(tab.icon, { size: 18 })}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content Pane */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm min-h-[500px] overflow-hidden">
            
            {activeTab === "overview" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 p-8 space-y-10">
                
                {/* MARKET INSIGHTS & CATEGORY */}
                <section>
                  <div className="flex items-center gap-2 mb-6">
                    <span className="w-1.5 h-6 bg-amber-500 rounded-full"></span>
                    <h3 className="text-lg font-extrabold text-slate-900">Product Performance & Details</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 rounded-2xl bg-amber-50/50 border border-amber-100 flex items-center gap-4">
                      <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                        <Star size={24} fill="currentColor" />
                      </div>
                      <div>
                        <p className="text-xl font-black text-slate-900">{ratingSummary?.average_rating || 0} / 5.0</p>
                        <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Average Rating</p>
                      </div>
                    </div>
                    <div className="p-6 rounded-2xl bg-blue-50/50 border border-blue-100 flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                        <MessageSquare size={24} />
                      </div>
                      <div>
                        <p className="text-xl font-black text-slate-900">{ratingSummary?.total_reviews || 0}</p>
                        <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Total Reviews</p>
                      </div>
                    </div>
                    <div className="p-6 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                        <Package size={24} />
                      </div>
                      <div>
                        <p className="text-xl font-black text-slate-900 truncate max-w-[120px]">{product.category_name || "General"}</p>
                        <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Category</p>
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <div className="flex items-center gap-2 mb-6">
                    <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
                    <h3 className="text-lg font-extrabold text-slate-900">Description</h3>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                    <p className="text-slate-600 leading-relaxed font-medium whitespace-pre-wrap">
                      {product.product_description || "No description provided for this product. A detailed description helps customers understand the benefits and features of your product better."}
                    </p>
                  </div>
                </section>
                
                <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                   <div className="flex items-center gap-4 p-4">
                     <div className="w-10 h-10 bg-slate-100 text-slate-500 rounded-lg flex items-center justify-center">
                       <Clock size={18} />
                     </div>
                     <div>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Created On</p>
                       <p className="font-bold text-slate-800 text-sm">{new Date(product.created_at).toLocaleDateString("en-IN", { dateStyle: 'long' })}</p>
                     </div>
                   </div>
                   
                   <div className="flex items-center gap-4 p-4">
                     <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                       <CheckCircle size={18} />
                     </div>
                     <div>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Listing Status</p>
                       <p className="font-bold text-emerald-600 text-sm">Active & Public</p>
                     </div>
                   </div>
                </section>
              </div>
            )}

            {activeTab === "questions" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 p-8 space-y-10">
                {queries.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                      <HelpCircle size={40} className="text-slate-200" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">No questions asked</h3>
                    <p className="text-slate-500 max-w-xs mx-auto mt-2">Helpful vendors answer farmer questions to build trust and increase sales.</p>
                  </div>
                ) : (
                  <div className="space-y-10">
                    {queries.map((q) => (
                      <div key={q.id} className="relative pl-6 border-l-2 border-slate-100 hover:border-emerald-200 transition-colors">
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                          <div className="flex items-center gap-2 mb-3">
                            <User size={14} className="text-slate-400" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{q.user_name} asked:</span>
                            <span className="text-[10px] text-slate-300 font-bold ml-auto">{new Date(q.created_at).toLocaleDateString()}</span>
                          </div>
                          <p className="font-extrabold text-slate-800 text-sm">{q.query_text}</p>
                        </div>

                        {q.answer_text ? (
                          <div className="mt-4 ml-6 bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100/50 flex gap-4">
                            <div className="shrink-0 w-8 h-8 bg-emerald-500 text-white rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
                              <MessageSquare size={16} />
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Your Answer</p>
                              <p className="text-emerald-900 text-sm font-medium leading-relaxed">{q.answer_text}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-4 ml-6 space-y-4">
                            <div className="relative">
                              <textarea
                                placeholder="Write a helpful answer for this farmer..."
                                value={answerText[q.id] || ""}
                                onChange={(e) => setAnswerText(prev => ({ ...prev, [q.id]: e.target.value }))}
                                className="w-full border border-slate-200 rounded-2xl p-4 text-sm font-medium focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all outline-none min-h-[120px] bg-slate-50/30"
                              />
                            </div>
                            <button 
                              onClick={() => handleAnswerSubmit(q.id)}
                              disabled={!answerText[q.id]?.trim()}
                              className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                            >
                              <Send size={16} />
                              Send Answer
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};

export default VendorProductDetail;
