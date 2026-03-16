import My_Orders from "../components/profile/My_Orders";

const MyOrdersPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 md:px-8">
      <div className="max-w-6xl mx-auto mt-10">
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden min-h-[600px]">
          <div className="px-10 py-8 border-b border-slate-100 bg-slate-50/30">
            <h1 className="text-2xl font-black text-slate-800">My Orders</h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">
              Track and review all your past orders in one place.
            </p>
          </div>

          <div className="p-10">
            <My_Orders />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyOrdersPage;
