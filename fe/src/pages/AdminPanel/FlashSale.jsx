import { useEffect, useState } from "react";
import { FlashOn as FlashOnIcon } from '@mui/icons-material';
import FlashSaleManager from "./pageAdmin/FlashSaleManager";  
import FlashSaleUpdateModal from "./FlashSaleUpdateModal";
import { getAllProductsHome } from "../../api/product/product"; 
import { showCustomToast } from "../../components/Toaster/ShowCustomToast";
import { 
    getAllFlashSales, 
    getFlashSaleDetail, 
    saveFlashSale, 
    deleteFlashSale 
} from "../../api/admin/flashSale";

const FlashSale = () => {
    // State Dữ liệu
    const [allProducts, setAllProducts] = useState([]);
    const [flashSales, setFlashSales] = useState([]); 
    const [loading, setLoading] = useState(false);

    // State Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState(null); // Data để truyền vào Modal (khi Edit)

    useEffect(() => {
        fetchAllProducts();
        fetchFlashSales();
    }, []);

    // --- API CALLS ---
    const fetchAllProducts = async () => {
        try {
            const res = await getAllProductsHome();
            setAllProducts(res || []);
        } catch (error) { console.error(error); }
    };

    const fetchFlashSales = async () => {
        setLoading(true);
        try {
            const res = await getAllFlashSales();
            setFlashSales(res || []);
        } catch (error) {
            showCustomToast("Lỗi tải danh sách", "error");
        } finally {
            setLoading(false);
        }
    };

    // --- ACTIONS ---
    const handleCreate = () => {
        setSelectedCampaign(null); // Reset data để tạo mới
        setIsModalOpen(true);      // Mở Modal
    };

    const handleEdit = async (id) => {
        setLoading(true);
        try {
            // Lấy chi tiết trước khi mở Modal
            const detail = await getFlashSaleDetail(id);
            setSelectedCampaign(detail);
            setIsModalOpen(true);  // Mở Modal
        } catch (error) {
            showCustomToast("Lỗi tải chi tiết", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa?")) return;
        try {
            await deleteFlashSale(id);
            showCustomToast("Đã xóa thành công", "success");
            fetchFlashSales();
        } catch (error) {
            showCustomToast("Lỗi khi xóa", "error");
        }
    };

    const handleSave = async (payload) => {
        setLoading(true); // Loading của Modal
        try {
            if (selectedCampaign?.id) payload.id = selectedCampaign.id;
            await saveFlashSale(payload);
            
            showCustomToast("Lưu thành công!", "success");
            setIsModalOpen(false); // Đóng Modal
            fetchFlashSales();     // Reload lại bảng
        } catch (error) {
            showCustomToast("Lỗi lưu dữ liệu", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <FlashOnIcon className="text-yellow-500" fontSize="large" /> Quản lý Flash Sale
                    </h1>
                </div>

                {/* 1. COMPONENT QUẢN LÝ BẢNG */}
                <FlashSaleManager 
                    flashSales={flashSales}
                    loading={loading}
                    onCreate={handleCreate}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onRefresh={fetchFlashSales}
                />

                {/* 2. COMPONENT MODAL FORM (Luôn được render nhưng ẩn/hiện theo isOpen) */}
                <FlashSaleUpdateModal 
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    initialData={selectedCampaign}
                    allProducts={allProducts}
                    onSave={handleSave}
                    loading={loading}
                />
            </div>
        </div>
    );
};

export default FlashSale;