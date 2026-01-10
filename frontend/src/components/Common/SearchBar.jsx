import { useState } from "react";
import { HiMagnifyingGlass, HiMiniXMark } from "react-icons/hi2";
import Topbar from "../Layout/Topbar.jsx";

const SearchBar = () => {

    const [SearchTerm, setSearchTerm] = useState("");
    const [isOpen, setIsOpen] = useState(false);

const handleSearchToggle = () => {
    setIsOpen(!isOpen);
};
const handleSearch = (e) => {
    e.preventDefault();
    console.log("Search Term:", SearchTerm);
    setIsOpen(false);
}

    return (
        <div
            className={`flex items-center justify-center w-full transition-all duration-300 ${
                isOpen
                ? "absolute top-0 left-0 w-full bg-black h-24 z-50"

                : "w-auto"
            }`}
            >

            {isOpen ? (
                <form onSubmit={handleSearch} className="relative flex text-black items-center justify-center w-full">
                    <div className="relative w-1/2">
                        <input
                        type="text"
                        placeholder="Search"
                        value={SearchTerm}
                        onChange={(e)=> setSearchTerm(e.target.value)}
                        className="bg-green-200 px-4 py-2 pl-2 pr-12 rounded-lg 
                        focus:outline-1px w-full text-inter placeholder:text-black "
                        />
                        {/* Search Icons */}
                        <button type="submit" className="absolute right-2 top-1/2 transform -translate-y-1/2 
                        text-gray-900 hover:text-gray-800">
                            <HiMagnifyingGlass className="h-6 w-6" />
                        </button>
                    </div>
                    {/* close icons */}
                    <button type="button" 
                    onClick={handleSearchToggle} 
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-600
                     hover:text-gray-800"
                     >
                    <HiMiniXMark className="h-6 w-6 text-white hover:text-gray-500"/>
                    </button>
                </form>
            ) : (
                <button onClick={handleSearchToggle}>
                    <HiMagnifyingGlass className="h-6 w-6 text-white hover:text-green-500" />
                </button>
            )}
        </div>
    );
};

export default SearchBar;