import React, { useState, useEffect } from 'react';
import FlashSaleModal from './FLashSaleModal'; 
import { showCustomToast } from "../../components/Toaster/ShowCustomToast";
import {
    Close as CloseIcon,
    Save as SaveIcon,
    Add as AddIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';

const FlashSaleUpdateModal = ({ isOpen, onClose, initialData, allProducts, onSave, loading }) => {
    const [formData, setFormData] = useState({ 
        name: '', 
        startDate: '', 
        endDate: '', 
        items: [] 
    });
    const [isProductPickerOpen, setIsProductPickerOpen] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                const formatTime = (iso) => iso ? new Date(iso).toISOString().slice(0, 16) : '';
                setFormData({
                    name: initialData.name || '', // Load tên nếu sửa
                    startDate: formatTime(initialData.startDate),
                    endDate: formatTime(initialData.endDate),
                    items: initialData.items.map(i => ({
                        productId: i.product.id,
                        name: i.product.name,
                        thumbnail: i.product.thumbnail,
                        originalPrice: i.product.price,
                        discountPercent: i.discountPercent,
                        quantity: i.quantity,
                        sold: i.sold
                    }))
                });
            } else {
                // Reset form khi tạo mới
                setFormData({ name: '', startDate: '', endDate: '', items: [] });
            }
        }
    }, [isOpen, initialData]);

    const handleAddProducts = (selected) => {
        // Lọc các sản phẩm chưa có trong list hiện tại
        const newItems = selected
            .filter(p => !formData.items.find(i => i.productId === p.id))
            .map(p => ({
                productId: p.id,
                name: p.name,
                thumbnail: p.thumbnail,
                originalPrice: p.price,
                discountPercent: 10, // Mặc định giảm 10%
                quantity: 10,        // Mặc định số lượng 10
                sold: 0
            }));
        setFormData(prev => ({ ...prev, items: [...prev.items, ...newItems] }));
    };

    const handleChangeItem = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index][field] = value;
        setFormData({ ...formData, items: newItems });
    };

    const handleRemoveItem = (index) => {
        const newItems = [...formData.items];
        newItems.splice(index, 1);
        setFormData({ ...formData, items: newItems });
    };

    const handleSubmit = () => {
        // Validate dữ liệu
        if (!formData.name.trim()) return showCustomToast("Vui lòng nhập tên chương trình", "error");
        if (!formData.startDate || !formData.endDate) return showCustomToast("Vui lòng chọn thời gian", "error");
        if (formData.items.length === 0) return showCustomToast("Chưa chọn sản phẩm nào", "error");

        // Tạo payload đúng với UpsertRequest của Java
        const payload = {
            name: formData.name, // Gửi tên lên
            startDate: new Date(formData.startDate).toISOString(),
            endDate: new Date(formData.endDate).toISOString(),
            items: formData.items.map(i => ({
                productId: i.productId,
                discountPercent: parseFloat(i.discountPercent),
                quantity: parseInt(i.quantity)
            }))
        };
        onSave(payload);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
                
                {/* Header Modal */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-800">
                        {initialData ? 'Cập nhật Flash Sale' : 'Tạo chương trình mới'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors">
                        <CloseIcon />
                    </button>
                </div>

                {/* Body Modal */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
                    
                    {/* KHỐI NHẬP THÔNG TIN CHUNG */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Input Tên Chương Trình */}
                            <div className="md:col-span-3">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tên chương trình <span className="text-red-500">*</span></label>
                                <input 
                                    type="text" 
                                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    placeholder="VD: Flash Sale 12.12 - Giảm giá sốc..."
                                    value={formData.name} 
                                    onChange={e => setFormData({...formData, name: e.target.value})} 
                                />
                            </div>

                            {/* Input Thời gian */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Bắt đầu</label>
                                <input 
                                    type="datetime-local" 
                                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.startDate} 
                                    onChange={e => setFormData({...formData, startDate: e.target.value})} 
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Kết thúc</label>
                                <input 
                                    type="datetime-local" 
                                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.endDate} 
                                    onChange={e => setFormData({...formData, endDate: e.target.value})} 
                                />
                            </div>
                        </div>
                    </div>

                    {/* KHỐI DANH SÁCH SẢN PHẨM ĐÃ CHỌN */}
                    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-gray-700 flex items-center gap-2">
                                Danh sách sản phẩm <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">{formData.items.length}</span>
                            </h3>
                            <button onClick={() => setIsProductPickerOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm transition-all">
                                <AddIcon fontSize="small"/> Thêm sản phẩm
                            </button>
                        </div>
                        
                        <div className="max-h-[350px] overflow-y-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-100 text-gray-600 text-xs uppercase sticky top-0 z-10">
                                    <tr>
                                        <th className="px-4 py-3">Sản phẩm</th>
                                        <th className="px-4 py-3 text-center w-32">% Giảm</th>
                                        <th className="px-4 py-3 text-center w-32">Số lượng Flash Sale</th>
                                        <th className="px-4 py-3 text-center">Đã bán</th>
                                        <th className="px-4 py-3 w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {formData.items.length > 0 ? formData.items.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-blue-50/50 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <img src={item.thumbnail} alt="" className="w-12 h-12 rounded-lg object-cover border border-gray-200"/>
                                                    <div>
                                                        <div className="font-medium text-gray-800 line-clamp-1">{item.name}</div>
                                                        <div className="text-xs text-gray-500 mt-0.5">Giá gốc: {item.originalPrice?.toLocaleString()}đ</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 ring-blue-500">
                                                    <input 
                                                        type="number" 
                                                        min="1" max="100"
                                                        className="w-full p-2 text-center outline-none font-semibold text-red-500"
                                                        value={item.discountPercent} 
                                                        onChange={e => handleChangeItem(idx, 'discountPercent', e.target.value)} 
                                                    />
                                                    <span className="bg-gray-100 px-2 text-gray-500 border-l">%</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <input 
                                                    type="number" 
                                                    min="1"
                                                    className="w-full border border-gray-300 rounded-lg p-2 text-center outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium"
                                                    value={item.quantity} 
                                                    onChange={e => handleChangeItem(idx, 'quantity', e.target.value)} 
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-center font-bold text-gray-500">{item.sold}</td>
                                            <td className="px-4 py-3 text-center">
                                                <button onClick={() => handleRemoveItem(idx)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-all">
                                                    <DeleteIcon fontSize="small"/>
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="5" className="text-center py-10 text-gray-400 flex flex-col items-center">
                                                <img src="https://cdn-icons-png.flaticon.com/512/4076/4076432.png" className="w-16 h-16 opacity-20 mb-2" alt=""/>
                                                Chưa có sản phẩm nào được chọn
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Footer Modal */}
                <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-white">
                    <button onClick={onClose} className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition-colors">
                        Đóng
                    </button>
                    <button 
                        onClick={handleSubmit} 
                        disabled={loading} 
                        className="px-6 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-bold shadow-lg shadow-blue-200 flex items-center gap-2 transition-all disabled:opacity-70"
                    >
                        <SaveIcon fontSize="small"/> {loading ? "Đang lưu..." : "Lưu chương trình"}
                    </button>
                </div>
            </div>

            {/* Modal Chọn Sản Phẩm Con */}
            <FlashSaleModal 
                isOpen={isProductPickerOpen} 
                onClose={() => setIsProductPickerOpen(false)}
                allProducts={allProducts}
                onConfirmSelection={handleAddProducts}
            />
        </div>
    );
};

export default FlashSaleUpdateModal;