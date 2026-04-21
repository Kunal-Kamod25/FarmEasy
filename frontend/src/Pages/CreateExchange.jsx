// =====================================================
// CreateExchange.jsx
// =====================================================
// Form for farmers to create a new crop exchange listing
// Get GPS location, upload images, specify crop details
// =====================================================

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";
import { 
  Loader, MapPin, Upload, Sprout, Sparkles, 
  Leaf, ShieldCheck, ArrowLeft, ArrowRight,
  Package, Search, Info, CheckCircle2
} from "lucide-react";
import ErrorNotification from "../components/Common/ErrorNotification";

const CreateExchange = () => {
  const navigate = useNavigate();

  // ===== FORM STATE =====
  const [formData, setFormData] = useState({
    offering_crop: "",
    offering_quantity: "",
    offering_unit: "kg",
    seeking_crop: "",
    seeking_quantity: "",
    seeking_unit: "kg",
    radius_km: 50,
    description: "",
  });

  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState("");
  const [images, setImages] = useState([]);
  const [imageUrls, setImageUrls] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        setLocationError("");
      },
      (error) => {
        setLocationError(`Error: ${error.message}`);
      }
    );
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 3) {
      setGeneralError("Maximum 3 images allowed");
      return;
    }
    setImages([...images, ...files]);
  };

  const handleUploadImages = async () => {
    if (images.length === 0) {
      setGeneralError("Please select images first");
      return;
    }

    try {
      setUploadingImages(true);
      setGeneralError("");

      const uploadPromises = images.map(async (image) => {
        const formDataImg = new FormData();
        formDataImg.append("exchange_image", image);

        const res = await axios.post(
          `${API_URL}/api/exchange/upload-image`,
          formDataImg,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (res.data.success) {
          return res.data.imageUrl;
        } else {
          throw new Error(res.data.error || "Upload failed");
        }
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setImageUrls([...imageUrls, ...uploadedUrls]);
      setImages([]); 
    } catch (err) {
      console.error("Image upload error:", err);
      setGeneralError(err.response?.data?.error || "Failed to upload images.");
    } finally {
      setUploadingImages(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.offering_crop.trim()) newErrors.offering_crop = "Required";
    if (!formData.offering_quantity || formData.offering_quantity <= 0) newErrors.offering_quantity = "Required";
    if (!formData.seeking_crop.trim()) newErrors.seeking_crop = "Required";
    if (!location) newErrors.location = "Enable GPS location";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setGeneralError("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      setGeneralError("");

      const res = await axios.post(
        `${API_URL}/api/exchange/create`,
        {
          ...formData,
          latitude: location.latitude,
          longitude: location.longitude,
          exchange_images: imageUrls,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success) {
        navigate("/exchange");
      }
    } catch (err) {
      setGeneralError(err.response?.data?.error || "Failed to create listing");
    } finally {
      setLoading(false);
    }
  };

  const fieldShell =
    "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-emerald-300/60 focus:bg-white/10 focus:ring-2 focus:ring-emerald-200/20";

  return (
    <div className="min-h-screen bg-[#04110d] lg:grid lg:grid-cols-[1.05fr_0.95fr] font-Lora text-white">
      {/* LEFT: DECORATIVE PANEL */}
      <aside className="relative overflow-hidden border-b border-white/5 bg-[radial-gradient(circle_at_top_left,_rgba(134,239,172,0.18),_transparent_32%),radial-gradient(circle_at_80%_18%,_rgba(45,212,191,0.16),_transparent_28%),linear-gradient(135deg,_#02110b_0%,_#041b13_45%,_#0a2a1d_100%)] px-6 py-10 text-white lg:min-h-screen lg:border-b-0 lg:border-r lg:px-12 lg:py-12">
        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:72px_72px]" />
        <div className="absolute -left-20 top-8 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-teal-300/10 blur-3xl" />

        <div className="relative flex min-h-[280px] flex-col justify-between lg:min-h-[calc(100vh-6rem)]">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white/80 backdrop-blur-xl">
            <Sprout className="h-4 w-4 text-emerald-200" />
            Exchange Hub
          </div>

          <div className="max-w-xl pt-16 lg:pt-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-100/80 backdrop-blur-xl">
              <Sparkles className="h-4 w-4" />
              Barter System Reimagined
            </div>

            <h1 className="mt-6 text-4xl font-semibold leading-tight text-white sm:text-5xl">
              Swap Your Surplus, Gain What You Need
            </h1>
            <p className="mt-4 max-w-lg text-base leading-7 text-white/70 sm:text-lg">
              Exchange your crops with local farmers within your radius. Save costs and build a stronger agricultural community.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {[
                {
                  icon: CheckCircle2,
                  title: "Direct Barter",
                  text: "Offer rice for wheat or swap any surplus crop easily.",
                },
                {
                  icon: ShieldCheck,
                  title: "Verified Listings",
                  text: "Connect with real farmers in your local area securely.",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-[1.75rem] border border-white/10 bg-white/8 p-5 backdrop-blur-xl">
                    <Icon className="h-5 w-5 text-emerald-200" />
                    <h3 className="mt-4 text-lg font-semibold text-white">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-white/65">{item.text}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="hidden max-w-md text-sm leading-6 text-white/55 lg:block">
            Our geo-location services ensure you find the most convenient matches nearby.
          </p>
        </div>
      </aside>

      {/* RIGHT: FORM PANEL */}
      <main className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
        <div className="w-full max-w-2xl rounded-[2rem] border border-white/10 bg-white/8 p-6 shadow-2xl shadow-emerald-950/25 backdrop-blur-2xl sm:p-10">
          
          {generalError && (
            <div className="mb-6 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200 backdrop-blur-xl">
              {generalError}
            </div>
          )}

          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-100/70">Create Listing</p>
              <h2 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Crop Exchange</h2>
            </div>
            <button
              onClick={() => navigate("/exchange")}
              className="p-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition"
            >
              <ArrowLeft size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* OFFERING */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-emerald-200 flex items-center gap-2">
                <CheckCircle2 size={18} /> What are you offering?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-white/80">Crop Name *</label>
                  <input
                    type="text"
                    name="offering_crop"
                    placeholder="E.g., Wheat, Rice, Corn..."
                    value={formData.offering_crop}
                    onChange={handleChange}
                    className={`${fieldShell} ${errors.offering_crop ? 'border-rose-400/40' : ''}`}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-white/80">Quantity *</label>
                  <input
                    type="number"
                    name="offering_quantity"
                    placeholder="100"
                    value={formData.offering_quantity}
                    onChange={handleChange}
                    className={fieldShell}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-white/80">Unit</label>
                  <select
                    name="offering_unit"
                    value={formData.offering_unit}
                    onChange={handleChange}
                    className={`${fieldShell} appearance-none`}
                  >
                    <option value="kg" className="bg-[#0a2a1d]">kg</option>
                    <option value="quintal" className="bg-[#0a2a1d]">Quintal</option>
                    <option value="ton" className="bg-[#0a2a1d]">Ton</option>
                    <option value="bags" className="bg-[#0a2a1d]">Bags</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SEEKING */}
            <div className="space-y-4 pt-4 border-t border-white/5">
              <h3 className="text-lg font-bold text-teal-200 flex items-center gap-2">
                <Search size={18} /> What do you need?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-white/80">Crop Name *</label>
                  <input
                    type="text"
                    name="seeking_crop"
                    placeholder="E.g., Rice, Wheat, Pulses..."
                    value={formData.seeking_crop}
                    onChange={handleChange}
                    className={`${fieldShell} ${errors.seeking_crop ? 'border-rose-400/40' : ''}`}
                  />
                </div>
              </div>
            </div>

            {/* LOCATION */}
            <div className="space-y-4 pt-4 border-t border-white/5">
              <h3 className="text-lg font-bold text-blue-200 flex items-center gap-2">
                <MapPin size={18} /> Location & Range
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={handleGetLocation}
                  className={`flex h-12 items-center justify-center gap-2 rounded-2xl font-bold transition-all ${
                    location 
                      ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-200" 
                      : "bg-blue-500/80 hover:bg-blue-600 text-white"
                  }`}
                >
                  <MapPin size={18} />
                  {location ? "Location Set" : "Enable GPS"}
                </button>
                <div className="flex flex-col justify-center">
                  <div className="flex justify-between text-xs font-semibold text-white/60 mb-2">
                    <span>Radius</span>
                    <span>{formData.radius_km}km</span>
                  </div>
                  <input
                    type="range"
                    name="radius_km"
                    min="10"
                    max="100"
                    step="5"
                    value={formData.radius_km}
                    onChange={handleChange}
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>
              </div>
              {locationError && (
                <p className="text-xs text-rose-300">{locationError}</p>
              )}
            </div>

            {/* DESCRIPTION & IMAGES */}
            <div className="space-y-4 pt-4 border-t border-white/5">
              <h3 className="text-lg font-bold text-white/90">Details & Photos</h3>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-white/70">Description</label>
                <textarea
                  name="description"
                  placeholder="Variety, harvest date, quality etc..."
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className={`${fieldShell} resize-none h-24`}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mt-4">
                <label className="group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/10 bg-white/5 py-8 cursor-pointer hover:border-emerald-300/40 hover:bg-white/8 transition-all">
                  <Upload className="text-emerald-300/80 mb-2" size={24} />
                  <span className="text-xs font-semibold text-white/60">Upload Photo (Max 3)</span>
                  <input type="file" multiple className="hidden" onChange={handleImageSelect} />
                </label>

                <div className="flex flex-col gap-2">
                  {images.length > 0 && (
                    <button
                      type="button"
                      onClick={handleUploadImages}
                      disabled={uploadingImages}
                      className="w-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 py-2 rounded-xl text-xs font-bold transition hover:bg-emerald-500/30"
                    >
                      {uploadingImages ? "Uploading..." : `Upload ${images.length} Image(s)`}
                    </button>
                  )}
                  {imageUrls.length > 0 && (
                    <div className="flex gap-2">
                      {imageUrls.map((url, idx) => (
                        <div key={idx} className="relative w-12 h-12 rounded-lg overflow-hidden border border-white/10">
                          <img src={url} alt="crop" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 py-4 text-lg font-semibold text-white shadow-lg shadow-emerald-900/40 transition hover:bg-emerald-400 disabled:opacity-50"
            >
              {loading ? (
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  <Sprout size={20} />
                  Post Exchange Listing
                </>
              )}
            </button>
          </form>

          <div className="mt-8 rounded-2xl border border-blue-400/10 bg-blue-400/5 p-4 flex items-start gap-4">
            <Info className="text-blue-300 shrink-0" size={20} />
            <p className="text-sm text-blue-100/70 leading-relaxed">
              <strong>Tip:</strong> Detailed descriptions and real photos lead to faster and more reliable exchange matches.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateExchange;
