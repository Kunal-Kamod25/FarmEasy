import My_Orders from "../components/profile/My_Orders";

const MyOrdersPage = () => {
  return (
    <div className="min-h-screen p-6 relative bg-[#04110d] bg-[radial-gradient(circle_at_top_left,_rgba(134,239,172,0.14),_transparent_35%),radial-gradient(circle_at_80%_20%,_rgba(45,212,191,0.14),_transparent_28%),linear-gradient(145deg,_#03110c_0%,_#072117_45%,_#0b2d20_100%)]">
      <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:68px_68px]" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">My Orders</h1>
          <p className="text-white/80 flex items-center gap-2 text-lg font-medium">
            Track and review all your past orders in one place.
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-[2rem] shadow-xl border border-white/10 overflow-hidden min-h-[600px] p-8 md:p-10 transition-all duration-300">
          <My_Orders />
        </div>
      </div>
    </div>
  );
};

export default MyOrdersPage;
