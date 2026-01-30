const VendorDashboard = () => {
    return (
        <>
            <h1 className="text-3xl font-bold mb-6">Vendor Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card title="Products" value="30" />
                <Card title="Orders" value="152" />
                <Card title="Revenue" value="₹2,10,000" />
                <Card title="Rating" value="4.8 ⭐" />
            </div>
        </>
    );
};

const Card = ({ title, value }) => (
    <div className="bg-white p-6 rounded shadow">
        <p className="text-gray-500">{title}</p>
        <h2 className="text-2xl font-bold mt-2">{value}</h2>
    </div>
);

export default VendorDashboard;
