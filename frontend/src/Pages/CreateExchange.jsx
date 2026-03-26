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
import { Loader, MapPin, Upload } from "lucide-react";

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
  const [imageUrls, setImageUrls] = useState([]); // Cloudinary URLs
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [errors, setErrors] = useState({});

  const token = localStorage.getItem("token");

  // ===== REDIRECT IF NOT LOGGED IN =====
  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  // ===== GET GPS LOCATION =====
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

  // ===== HANDLE IMAGE SELECTION =====
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);

    // Limit to 3 images
    if (images.length + files.length > 3) {
      alert("Maximum 3 images allowed");
      return;
    }

    setImages([...images, ...files]);
  };

  // ===== UPLOAD IMAGES TO CLOUDINARY =====
  const handleUploadImages = async () => {
    if (images.length === 0) {
      alert("Please select images first");
      return;
    }

    try {
      setUploadingImages(true);

      // Upload each image to Cloudinary
      const uploadPromises = images.map(async (image) => {
        const formDataImg = new FormData();
        formDataImg.append("file", image);
        formDataImg.append("upload_preset", "farmeasy_exchange"); // from Cloudinary settings

        const res = await axios.post(
          "https://api.cloudinary.com/v1_1/YOUR_CLOUDINARY_NAME/image/upload", // Replace with your Cloudinary URL
          formDataImg
        );

        return res.data.secure_url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setImageUrls([...imageUrls, ...uploadedUrls]);
      setImages([]); // Clear file input
      alert("Images uploaded successfully!");
    } catch (err) {
      console.error("Image upload error:", err);
      alert("Failed to upload images");
    } finally {
      setUploadingImages(false);
    }
  };

  // ===== HANDLE FORM INPUT CHANGE =====
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  // ===== VALIDATE FORM =====
  const validateForm = () => {
    const newErrors = {};

    if (!formData.offering_crop.trim()) {
      newErrors.offering_crop = "Please specify crop you're offering";
    }
    if (!formData.offering_quantity || formData.offering_quantity <= 0) {
      newErrors.offering_quantity = "Please enter valid quantity";
    }
    if (!formData.seeking_crop.trim()) {
      newErrors.seeking_crop = "Please specify crop you're seeking";
    }
    if (!location) {
      newErrors.location = "Please enable location to post listing";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ===== SUBMIT FORM =====
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);

      // ===== CREATE LISTING =====
      const res = await axios.post(
        `${API_URL}/api/exchange/create`,
        {
          ...formData,
          latitude: location.latitude,
          longitude: location.longitude,
          exchange_images: imageUrls, // Cloudinary URLs
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success) {
        alert("✅ Crop exchange listing posted successfully!");
        navigate("/exchange"); // Go back to marketplace
      }
    } catch (err) {
      console.error("Submit error:", err);
      alert("Error: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🌾 Post Crop Exchange Listing
          </h1>
          <p className="text-gray-600">
            Tell other farmers what you're offering and what you need
          </p>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-lg p-8 space-y-6 border border-emerald-100"
        >
          {/* SECTION 1: OFFERING */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              ✅ What are you offering?
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Crop Name */}
              <div className="md:col-span-1">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Crop Name *
                </label>
                <input
                  type="text"
                  name="offering_crop"
                  placeholder="E.g., Wheat, Rice, Corn..."
                  value={formData.offering_crop}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                />
                {errors.offering_crop && (
                  <p className="text-red-500 text-xs mt-1">{errors.offering_crop}</p>
                )}
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Quantity *
                </label>
                <input
                  type="number"
                  name="offering_quantity"
                  placeholder="100"
                  value={formData.offering_quantity}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                />
                {errors.offering_quantity && (
                  <p className="text-red-500 text-xs mt-1">{errors.offering_quantity}</p>
                )}
              </div>

              {/* Unit */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Unit
                </label>
                <select
                  name="offering_unit"
                  value={formData.offering_unit}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="kg">kg</option>
                  <option value="quintal">Quintal</option>
                  <option value="ton">Ton</option>
                  <option value="bags">Bags</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2: SEEKING */}
          <div className="pt-6 border-t border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              👀 What do you need?
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Crop Name */}
              <div className="md:col-span-1">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Crop Name *
                </label>
                <input
                  type="text"
                  name="seeking_crop"
                  placeholder="E.g., Rice, Wheat, Pulses..."
                  value={formData.seeking_crop}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                />
                {errors.seeking_crop && (
                  <p className="text-red-500 text-xs mt-1">{errors.seeking_crop}</p>
                )}
              </div>

              {/* Quantity (Optional) */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Expected Quantity
                </label>
                <input
                  type="number"
                  name="seeking_quantity"
                  placeholder="50"
                  value={formData.seeking_quantity}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                />
              </div>

              {/* Unit */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Unit
                </label>
                <select
                  name="seeking_unit"
                  value={formData.seeking_unit}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="kg">kg</option>
                  <option value="quintal">Quintal</option>
                  <option value="ton">Ton</option>
                  <option value="bags">Bags</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 3: LOCATION & RADIUS */}
          <div className="pt-6 border-t border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              📍 Location & Range
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Get Location Button */}
              <button
                type="button"
                onClick={handleGetLocation}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all active:scale-95"
              >
                <MapPin size={20} />
                {location ? "✅ Location Set" : "📍 Enable GPS Location"}
              </button>

              {/* Radius Slider */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Search Radius: {formData.radius_km}km
                </label>
                <input
                  type="range"
                  name="radius_km"
                  min="10"
                  max="100"
                  step="5"
                  value={formData.radius_km}
                  onChange={handleChange}
                  className="w-full cursor-pointer"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Show this listing to farmers within {formData.radius_km}km
                </p>
              </div>
            </div>

            {location && (
              <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 text-sm">
                ✅ <strong>Location:</strong> Lat {location.latitude.toFixed(4)}, Lon{" "}
                {location.longitude.toFixed(4)}
              </div>
            )}

            {locationError && (
              <div className="bg-red-50 p-3 rounded-lg border border-red-200 text-sm text-red-700">
                ❌ {locationError}
              </div>
            )}

            {errors.location && (
              <p className="text-red-500 text-xs mt-2">{errors.location}</p>
            )}
          </div>

          {/* SECTION 4: DESCRIPTION & IMAGES */}
          <div className="pt-6 border-t border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              📝 Details & Photos
            </h2>

            {/* Description */}
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                name="description"
                placeholder="Add any details: quality, variety, harvest date, etc."
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
              ></textarea>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Upload Photos (Max 3)
              </label>

              {/* File Input */}
              <div className="border-2 border-dashed border-emerald-300 rounded-lg p-6 text-center mb-4 cursor-pointer hover:border-emerald-500 transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="imageInput"
                  disabled={images.length >= 3}
                />
                <label htmlFor="imageInput" className="cursor-pointer block">
                  <Upload className="mx-auto mb-2 text-emerald-600" size={32} />
                  <p className="font-bold text-gray-900">
                    Click to upload or drag & drop
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, GIF up to 5MB • Max 3 images
                  </p>
                </label>
              </div>

              {/* Selected Images */}
              {images.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    {images.length} image(s) selected
                  </p>
                  <button
                    type="button"
                    onClick={handleUploadImages}
                    disabled={uploadingImages}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2 disabled:bg-gray-300"
                  >
                    {uploadingImages ? (
                      <>
                        <Loader size={18} className="animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload size={18} />
                        Upload {images.length} Image{images.length > 1 ? "s" : ""}
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Display Uploaded URLs */}
              {imageUrls.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-bold text-gray-700 mb-2">
                    ✅ {imageUrls.length} image(s) uploaded
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {imageUrls.map((url, idx) => (
                      <img
                        key={idx}
                        src={url}
                        alt={`crop-${idx}`}
                        className="w-full h-20 object-cover rounded-lg border border-emerald-200"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-bold py-4 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader size={20} className="animate-spin" />
                  Creating Listing...
                </>
              ) : (
                <>
                  🌾 Post Exchange Listing
                </>
              )}
            </button>
          </div>
        </form>

        {/* INFO BOX */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <p className="text-sm text-blue-900">
            💡 <strong>Tip:</strong> Be specific about your crop quality and
            quantity. This helps farmers make better matches!
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateExchange;
