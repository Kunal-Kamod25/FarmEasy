import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

const ProfessionalSelect = ({ 
    label, 
    options, 
    value, 
    onChange, 
    placeholder = "Select Option",
    icon: Icon
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => String(opt.id) === String(value));
    const displayText = selectedOption ? (selectedOption.name || selectedOption.label) : placeholder;

    return (
        <div className="space-y-3" ref={dropdownRef}>
            {label && (
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                    {label}
                </label>
            )}
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-full flex items-center justify-between px-4 py-3 bg-white border rounded-2xl transition-all duration-300 ${
                        isOpen 
                        ? "border-emerald-500 shadow-lg shadow-emerald-500/5 ring-4 ring-emerald-500/5" 
                        : "border-slate-100 hover:border-emerald-400 text-slate-700"
                    }`}
                >
                    <div className="flex items-center gap-3">
                        {Icon && <Icon size={16} className={isOpen ? "text-emerald-500" : "text-slate-400"} />}
                        <span className="text-xs font-bold uppercase tracking-wide truncate max-w-[140px]">
                            {displayText}
                        </span>
                    </div>
                    <ChevronDown 
                        size={16} 
                        className={`transition-transform duration-300 ${isOpen ? "rotate-180 text-emerald-500" : "text-slate-400"}`} 
                    />
                </button>

                {isOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="max-h-60 overflow-y-auto p-2">
                            {options.map((option) => (
                                <button
                                    key={option.id}
                                    type="button"
                                    onClick={() => {
                                        onChange(option.id);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                                        String(value) === String(option.id)
                                        ? "bg-emerald-50 text-emerald-600 font-bold"
                                        : "text-slate-600 hover:bg-slate-50"
                                    }`}
                                >
                                    <span className="text-[10px] font-black uppercase tracking-wider truncate mr-2">
                                        {option.name || option.label}
                                    </span>
                                    {String(value) === String(option.id) && <Check size={14} />}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfessionalSelect;
