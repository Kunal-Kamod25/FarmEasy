import { HiMagnifyingGlass } from "react-icons/hi2";

const SearchBar = ({ SearchTerm, setSearchTerm, handleSearch }) => {
    return (
        <form
            onSubmit={handleSearch}
            className="flex flex-1 items-center bg-[#ffffff] rounded-md overflow-hidden w-full"
        >
            <input
                type="text"
                placeholder="Search for equipment, seeds, fertilizers..."
                value={SearchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-transparent px-4 py-2 text-sm text-black placeholder:text-gray-400 focus:outline-none"
            />

            <button
                type="submit"
                className="bg-green-500 hover:bg-green-600 px-4 py-2 transition-colors"
            >
                <HiMagnifyingGlass className="h-5 w-5 text-white" />
            </button>
        </form>
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