import { HiMagnifyingGlass } from "react-icons/hi2";

const SearchBar = ({
    searchTerm,
    setSearchTerm,
    handleSearch,
    suggestions = [],
    suggestionsLoading = false,
    onSuggestionSelect = () => { },
    onViewAllMatches = () => { }
}) => {
    const showDropdown = searchTerm.trim().length >= 2 && (suggestionsLoading || suggestions.length > 0);

    return (
        <div className="relative w-full max-w-xl">
            <form
                onSubmit={handleSearch}
                className="flex w-full items-center bg-[#ffffff] rounded-md overflow-hidden"
            >
                <input
                    type="text"
                    placeholder="Search for equipment, seeds, fertilizers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="min-w-0 flex-1 bg-transparent px-3 sm:px-4 py-2 text-sm text-black placeholder:text-gray-400 placeholder:text-xs sm:placeholder:text-sm focus:outline-none"
                />

                <button
                    type="submit"
                    className="flex h-10 w-11 flex-shrink-0 items-center justify-center bg-green-500 hover:bg-green-600 transition-colors sm:h-auto sm:w-auto sm:px-4 sm:py-2"
                >
                    <HiMagnifyingGlass className="h-5 w-5 text-white flex-shrink-0" />
                </button>
            </form>

            {showDropdown && (
                <div className="absolute top-[105%] left-0 right-0 z-[70] rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden">
                    {suggestionsLoading ? (
                        <p className="px-4 py-3 text-sm text-slate-500">Searching best-price matches...</p>
                    ) : (
                        <>
                            {suggestions.map((product) => (
                                <button
                                    key={`${product.id}-${product.seller_id || product.seller_table_id || "vendor"}`}
                                    type="button"
                                    onClick={() => onSuggestionSelect(product)}
                                    className="w-full px-4 py-3 text-left hover:bg-emerald-50 transition border-b border-slate-100 last:border-b-0"
                                >
                                    <p className="text-sm font-semibold text-slate-800 line-clamp-1">{product.product_name}</p>
                                    <p className="text-xs text-slate-500 line-clamp-1">
                                        {product.shop_name || product.seller_name || "Vendor"}
                                    </p>
                                    <p className="text-xs font-bold text-emerald-700 mt-1">
                                        ₹{Number(product.price || 0).toLocaleString()}
                                    </p>
                                </button>
                            ))}

                            <button
                                type="button"
                                onClick={onViewAllMatches}
                                className="w-full px-4 py-3 text-left text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition"
                            >
                                View all matches sorted by lowest price
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchBar;






// import { HiMagnifyingGlass } from "react-icons/hi2";

// const SearchBar = ({ SearchTerm, setSearchTerm, handleSearch }) => {
//     return (
//         <form
//             onSubmit={handleSearch}
//             className="flex items-center bg-green-100 rounded-lg px-3 py-1 w-full max-w-[200px] md:max-w-[300px]"
//         >
//             <input
//                 type="text"
//                 placeholder="Search products..."
//                 value={SearchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="bg-transparent border-none outline-none text-black placeholder:text-gray-500 text-sm w-full py-1 pl-4 pr-10"
//             />
//                         <button type="submit" className="text-gray-700 hover:text-green-600 transition-colors">
//                 <HiMagnifyingGlass className="h-5 w-5" />
//             </button>
//         </form>
//     );
// };

// export default SearchBar;