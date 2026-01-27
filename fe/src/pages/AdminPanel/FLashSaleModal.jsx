import React, { useState, useEffect, useMemo } from 'react';
import { 
    Search as SearchIcon, 
    PlaylistAddCheck as AddAllIcon,
    Close as CloseIcon,
    CheckBox as CheckBoxIcon,
    CheckBoxOutlineBlank as UnCheckBoxIcon,
    FilterListOff as NoResultIcon
} from '@mui/icons-material';

const FlashSaleModal = ({ isOpen, onClose, allProducts = [], onConfirmSelection }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIds, setSelectedIds] = useState([]);

    // Reset khi mở modal
    useEffect(() => {
        if (isOpen) {
            setSearchTerm('');
            setSelectedIds([]);
        }
    }, [isOpen]);

    // Lọc sản phẩm realtime
    const filteredProducts = useMemo(() => {
        if (!searchTerm) return allProducts; // Nếu ko tìm gì thì hiện hết
        const lowerTerm = searchTerm.toLowerCase();
        return allProducts.filter(p => 
            p.name.toLowerCase().includes(lowerTerm) ||
            p.category?.name?.toLowerCase().includes(lowerTerm)
        );
    }, [allProducts, searchTerm]);

    const toggleProduct = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleSelectAll = () => {
        if (selectedIds.length === filteredProducts.length && filteredProducts.length > 0) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredProducts.map(p => p.id));
        }
    };

    const handleConfirm = () => {
        const selected = allProducts.filter(p => selectedIds.includes(p.id));
        onConfirmSelection(selected);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col h-[80vh] overflow-hidden">
                
                {/* 1. Header & Search */}
                <div className="p-4 border-b border-gray-100 bg-white z-10">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg text-gray-800">Chọn sản phẩm</h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <CloseIcon/>
                        </button>
                    </div>
                    
                    <div className="flex gap-3">
                        <div className="relative flex-1">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fontSize="small"/>
                            <input 
                                type="text" 
                                placeholder="Nhập tên sản phẩm để tìm kiếm..." 
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                value={searchTerm} 
                                onChange={e => setSearchTerm(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <button 
                            onClick={handleSelectAll} 
                            className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all flex items-center gap-2 whitespace-nowrap
                                ${selectedIds.length === filteredProducts.length && filteredProducts.length > 0
                                    ? "bg-blue-50 text-blue-600 border-blue-200" 
                                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                                }`}
                        >
                            <AddAllIcon fontSize="small"/> 
                            {selectedIds.length === filteredProducts.length && filteredProducts.length > 0 ? "Bỏ chọn" : "Chọn tất cả"}
                        </button>
                    </div>
                </div>

                {/* 2. Product List */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50 custom-scroll">
                    {filteredProducts.length > 0 ? (
                        <div className="grid grid-cols-1 gap-2">
                            {filteredProducts.map(p => {
                                const isSelected = selectedIds.includes(p.id);
                                return (
                                    <div 
                                        key={p.id} 
                                        onClick={() => toggleProduct(p.id)} 
                                        className={`flex items-center gap-4 p-3 rounded-xl border cursor-pointer transition-all select-none group
                                            ${isSelected 
                                                ? 'border-blue-500 bg-blue-50/40 shadow-sm' 
                                                : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-white hover:shadow-sm'
                                            }`}
                                    >
                                        <div className={`text-2xl flex-shrink-0 transition-colors ${isSelected ? "text-blue-600" : "text-gray-300 group-hover:text-blue-400"}`}>
                                            {isSelected ? <CheckBoxIcon /> : <UnCheckBoxIcon />}
                                        </div>

                                        <div className="w-14 h-14 rounded-lg border border-gray-100 bg-white overflow-hidden flex-shrink-0">
                                            <img src={p.thumbnail} alt="" className="w-full h-full object-contain"/>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <p className={`text-sm font-semibold line-clamp-1 ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>
                                                    {p.name}
                                                </p>
                                                <span className="text-sm font-bold text-red-500 whitespace-nowrap ml-2">
                                                    {p.price.toLocaleString()}đ
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded border border-gray-200">
                                                    {p.category?.name || "N/A"}
                                                </span>
                                                <span className="text-xs text-gray-400">Kho: {p.stock}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400">
                            <NoResultIcon style={{ fontSize: 64, opacity: 0.2 }} className="mb-4"/>
                            <p>Không tìm thấy sản phẩm nào phù hợp</p>
                        </div>
                    )}
                </div>

                {/* 3. Footer Action */}
                <div className="p-4 border-t border-gray-100 bg-white flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                        Đã chọn: <b className="text-blue-600">{selectedIds.length}</b> sản phẩm
                    </span>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-5 py-2 rounded-xl text-gray-600 font-medium hover:bg-gray-100">Hủy</button>
                        <button 
                            onClick={handleConfirm} 
                            disabled={selectedIds.length === 0}
                            className="px-6 py-2 rounded-xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 disabled:opacity-50 disabled:shadow-none transition-all"
                        >
                            Thêm sản phẩm
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default FlashSaleModal;