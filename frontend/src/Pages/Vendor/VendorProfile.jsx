const VendorProfile = () => {
    return (
        <div className="max-w-xl bg-white p-6 rounded shadow">
            <h2 className="text-2xl font-bold mb-4">Profile</h2>

            <input className="w-full border p-2 rounded mb-3" placeholder="Vendor Name" />
            <input className="w-full border p-2 rounded mb-3" placeholder="Address" />

            <button className="bg-green-600 text-white px-4 py-2 rounded w-full">
                Update Profile
            </button>
        </div>
    );
};

export default VendorProfile;
