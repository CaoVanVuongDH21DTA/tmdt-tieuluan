import React from 'react';
import { 
    Edit as EditIcon, 
    Delete as DeleteIcon, 
    Refresh as RefreshIcon,
    Add as AddIcon
} from '@mui/icons-material';

const FlashSaleManager = ({ flashSales, loading, onEdit, onDelete, onRefresh, onCreate }) => {

    const getStatusBadge = (start, end) => {
        const now = new Date();
        const s = new Date(start);
        const e = new Date(end);
        
        if (now < s) return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold">Sắp diễn ra</span>;
        if (now >= s && now <= e) return <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold animate-pulse">Đang diễn ra</span>;
        return <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs font-bold">Đã kết thúc</span>;
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header của Bảng */}
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="font-bold text-gray-700">Danh sách chương trình</h3>
                <div className="flex gap-2">
                    <button onClick={onRefresh} className="p-2 text-gray-500 hover:bg-white hover:text-blue-600 rounded-lg transition-colors" title="Làm mới">
                        <RefreshIcon/>
                    </button>
                    <button onClick={onCreate} className="bg-blue-600 text-white px-3 py-2 rounded-lg shadow hover:bg-blue-700 flex items-center gap-2 text-sm font-bold">
                        <AddIcon fontSize="small"/> Tạo mới
                    </button>
                </div>
            </div>

            {/* Bảng dữ liệu */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-100 text-gray-600 uppercase text-xs font-bold">
                        <tr>
                            <th className="px-6 py-4">Tên chương trình</th>
                            <th className="px-6 py-4">Thời gian</th>
                            <th className="px-6 py-4 text-center">Số SP</th>
                            <th className="px-6 py-4 text-center">Trạng thái</th>
                            <th className="px-6 py-4 text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan="5" className="text-center py-10 text-gray-500">Đang tải dữ liệu...</td></tr>
                        ) : flashSales.length > 0 ? (
                            flashSales.map((item) => (
                                <tr key={item.id} className="hover:bg-blue-50/30 transition">
                                    <td className="px-6 py-4 font-semibold text-gray-800">
                                        {item.name || `Flash Sale #${item.id.substring(0, 8)}`}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1 text-xs text-gray-500">
                                            <span>Bắt đầu: <b className="text-gray-700">{new Date(item.startDate).toLocaleString('vi-VN')}</b></span>
                                            <span>Kết thúc: <b className="text-gray-700">{new Date(item.endDate).toLocaleString('vi-VN')}</b></span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center font-bold text-blue-600">
                                        {item.totalProducts || 0}
                                    </td>
                                    <td className="px-6 py-4 text-center">{getStatusBadge(item.startDate, item.endDate)}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => onEdit(item.id)} className="text-blue-600 hover:bg-blue-100 p-2 rounded mx-1">
                                            <EditIcon fontSize="small"/>
                                        </button>
                                        <button onClick={() => onDelete(item.id)} className="text-red-500 hover:bg-red-100 p-2 rounded mx-1">
                                            <DeleteIcon fontSize="small"/>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="5" className="text-center py-12 text-gray-400">Không có dữ liệu</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FlashSaleManager;