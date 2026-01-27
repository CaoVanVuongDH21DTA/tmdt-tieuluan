import os
import json
import logging
from typing import List
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import mysql.connector
from mysql.connector import pooling, Error
from dotenv import load_dotenv

# --- IMPORT SCHEDULER & BUILD FUNCTION ---
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from build_stats import build_popularity_stats 

# ==========================================
# CẤU HÌNH & KHỞI TẠO
# ==========================================
load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# File model JSON
MODEL_FILE = "popularity_model.json"
reco_data = {} 

# --- HÀM CẬP NHẬT DỮ LIỆU ĐỊNH KỲ ---
def update_recommender_data():
    """Hàm này được Scheduler gọi để cập nhật dữ liệu mới"""
    logger.info("[Scheduler] Đang chạy cập nhật thống kê 7 ngày...")
    try:
        # 1. Chạy tính toán lại 
        build_popularity_stats()
        
        # 2. Load lại file JSON vào RAM
        global reco_data
        if os.path.exists(MODEL_FILE):
            with open(MODEL_FILE, "r") as f:
                reco_data = json.load(f)
            logger.info("[Scheduler] Đã reload dữ liệu mới vào RAM.")
        else:
            logger.warning("[Scheduler] Không tìm thấy file JSON sau khi build.")
            
    except Exception as e:
        logger.error(f"[Scheduler] Lỗi cập nhật: {e}")

# --- LIFESPAN MANAGER---
@asynccontextmanager
async def lifespan(app: FastAPI):
    # [STARTUP]
    logger.info("Server starting...")
    
    # 1. Chạy update ngay lập tức khi mở server
    update_recommender_data()
    
    # 2. Cài đặt lịch chạy tự động 1 ngày
    scheduler = BackgroundScheduler()
    scheduler.add_job(
        update_recommender_data, 
        # Chỉnh thời gian tự động chạy 24 hours
        trigger=IntervalTrigger(hours=24),
        id="daily_stats_job",
        replace_existing=True
    )
    scheduler.start()
    logger.info("Scheduler background đã kích hoạt.")
    
    yield
    
    # [SHUTDOWN]
    logger.info("Server shutting down...")
    scheduler.shutdown()

# Khởi tạo App với lifespan
app = FastAPI(lifespan=lifespan)

# Cấu hình CORS
origins = ["http://localhost:3000", "http://127.0.0.1:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cấu hình Database Pool (Cho các API tracking)
db_config = {
    "host": os.getenv("DB_HOST", "localhost"),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", ""),
    "database": os.getenv("DB_NAME", "tieuluan"),
    "port": int(os.getenv("DB_PORT", 3306))
}

try:
    POOL = pooling.MySQLConnectionPool(pool_name="user_pool", pool_size=5, **db_config)
except Error as e:
    logger.error(f"DB Connection Failed: {e}")
    POOL = None

# ==========================================
# HELPER FUNCTIONS
# ==========================================

# Lấy ngẫu nhiên số lượng giới hạn sản phẩm
def get_random_backup(limit: int):
    if not POOL: return []
    results = []
    conn = None
    try:
        conn = POOL.get_connection()
        cursor = conn.cursor()
        query = f"SELECT BIN_TO_UUID(id) FROM products WHERE enable = 1 ORDER BY RAND() LIMIT {limit}"
        cursor.execute(query)
        rows = cursor.fetchall()
        results = [str(row[0]) for row in rows]
    except Error:
        pass
    finally:
        if conn: conn.close()
    return results

# Công thức tính độ tương đồng của user-user
def jaccard_similarity(set_a: set, set_b: set) -> float:
    if not set_a or not set_b:
        return 0.0
    return len(set_a & set_b) / len(set_a | set_b)

# ==========================================
# DATA MODELS & API
# ==========================================
#Kiểu dữ liệu nhận vào
class ViewRequest(BaseModel):
    user_id: str
    product_id: str

class SyncRequest(BaseModel):
    user_id: str
    viewed_ids: List[str]

class HistoryRequest(BaseModel):
    viewed_ids: List[str] 

@app.get("/")
def root():
    return {"message": "Recommender API with Auto-Scheduler"}

# --- User xem sản phẩm --- Đã đăng nhập
# Lưu lại sản phẩm mà người dùng mới xem vào database
@app.post("/tracking/view")
def track_view(data: ViewRequest):
    if not POOL: return {"status": "error", "message": "DB Down"}
    conn = None
    try:
        conn = POOL.get_connection()
        cursor = conn.cursor()
        query = """
            INSERT INTO product_views (user_id, product_id, viewed_at)
            VALUES (UUID_TO_BIN(%s), UUID_TO_BIN(%s), NOW())
            ON DUPLICATE KEY UPDATE viewed_at = NOW()
        """
        cursor.execute(query, (data.user_id, data.product_id))
        conn.commit()
        return {"status": "success"}
    except Error as e:
        logger.error(f"Track error: {e}")
        return {"status": "error"}
    finally:
        if conn: conn.close()

# --- Đồng bộ LocalStorage -> DB --- Khách vãng lai
# Thêm sản phẩm mà người dùng xem trước khi đăng nhập vào tài khoản và người dùng mới đăng nhập
@app.post("/tracking/sync")
def sync_history(data: SyncRequest):
    if not data.viewed_ids or not POOL: return {"status": "skipped"}
    conn = None
    try:
        conn = POOL.get_connection()
        cursor = conn.cursor()
        
        query = """
            INSERT INTO product_views (user_id, product_id, viewed_at)
            VALUES (UUID_TO_BIN(%s), UUID_TO_BIN(%s), NOW())
            ON DUPLICATE KEY UPDATE viewed_at = NOW()
        """
        params = [(data.user_id, pid) for pid in data.viewed_ids]
        cursor.executemany(query, params)
        conn.commit()
        return {"status": "synced", "count": cursor.rowcount}
    except Error as e:
        logger.error(f"Sync error: {e}")
        return {"status": "error"}
    finally:
        if conn: conn.close()

# --- Lấy lịch sử xem --- Đã Đăng nhập
# Trả về danh sách sản phẩm người dùng đã xem 
@app.get("/tracking/history/{user_id}", response_model=List[str])
def get_user_history(user_id: str, limit: int = 10):
    if not POOL: return []
    conn = None
    try:
        conn = POOL.get_connection()
        cursor = conn.cursor()
        query = """
            SELECT BIN_TO_UUID(product_id) 
            FROM product_views 
            WHERE user_id = UUID_TO_BIN(%s)
            ORDER BY viewed_at DESC LIMIT %s
        """
        cursor.execute(query, (user_id, limit))
        rows = cursor.fetchall()
        return [row[0] for row in rows]
    except Error:
        return []
    finally:
        if conn: conn.close()

# ==========================================
#  API GỢI Ý 
# ==========================================

# Lấy sản phẩm bán chạy 7 ngày qua
@app.get("/recommendations/best-sellers", response_model=List[str])
def get_best_sellers(limit: int = 8):
    """Lấy danh sách bán chạy nhất toàn sàn (từ RAM đã load)"""
    # reco_data ở đây luôn là mới nhất nhờ Scheduler
    items = reco_data.get("global_best_sellers", [])
    if not items: return get_random_backup(limit)
    return items[:limit]

# Sản phẩm được xem nhiều nhất 7 ngày qua
@app.get("/recommendations/trending", response_model=List[str])
def get_trending_now(limit: int = 8):
    if not POOL: return get_best_sellers(limit)
    conn = None
    try:
        conn = POOL.get_connection()
        cursor = conn.cursor()
        
        # --- CẬP NHẬT SQL: JOIN VỚI BẢNG PRODUCTS ĐỂ CHECK ENABLE ---
        query = """
            SELECT BIN_TO_UUID(pv.product_id)
            FROM product_views pv
            JOIN products p ON pv.product_id = p.id
            WHERE pv.viewed_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
              AND p.enable = 1
            GROUP BY pv.product_id
            ORDER BY COUNT(*) DESC
            LIMIT %s
        """
        
        cursor.execute(query, (limit,))
        rows = cursor.fetchall()
        results = [str(row[0]) for row in rows]

        # Nếu không đủ số lượng trending, lấy thêm ngẫu nhiên (backup)
        if len(results) < limit:
            needed = limit - len(results)
            backups = get_random_backup(needed) # Hàm này của bạn đã có check enable=1 rồi
            for b in backups:
                if b not in results: results.append(b)

        return results[:limit]
    except Error as e:
        logger.error(f"Trending Error: {e}")
        return get_best_sellers(limit)
    finally:
        if conn: conn.close()

# Gợi ý sản phẩm dựa trên sản phẩm người dùng đã từng mua --- Đã đăng nhập
@app.get("/recommendations/purchased-based/{user_id}", response_model=List[str])
def recommend_by_purchase(user_id: str, limit: int = 8):
    if not POOL: return get_trending_now(limit)
    conn = None
    try:
        conn = POOL.get_connection()
        cursor = conn.cursor()
        query_cat = """
            SELECT DISTINCT BIN_TO_UUID(p.category_type_id)
            FROM order_items oi
            JOIN orders o ON o.id = oi.order_id
            JOIN products p ON p.id = oi.product_id
            WHERE o.user_id = UUID_TO_BIN(%s)
            LIMIT 3
        """
        cursor.execute(query_cat, (user_id,))
        cat_rows = cursor.fetchall()    
        if not cat_rows: return get_trending_now(limit)

        recent_type_ids = [str(row[0]) for row in cat_rows if row[0]]
        reco_items = []
        cats_data = reco_data.get("category_best_sellers", {})
        
        for type_id in recent_type_ids:
            items = cats_data.get(type_id, [])
            reco_items.extend(items)
            
        final_list = list(dict.fromkeys(reco_items))[:limit]
        return final_list if final_list else get_trending_now(limit)

    except Error as e:
        return get_trending_now(limit)
    finally:
        if conn: conn.close()

# Gợi ý sản phẩm cho người dùng đã từng xem các loại sản phẩm khác --- Khách vãng lai
@app.post("/recommendations/by-history", response_model=List[str])
def recommend_by_history(data: HistoryRequest, limit: int = 8):
    if not data.viewed_ids: return get_trending_now(limit)
    if not POOL: return get_best_sellers(limit)
    
    conn = None
    recommended_items = []
    try:
        conn = POOL.get_connection()
        cursor = conn.cursor()
        placeholders = ','.join(['UUID_TO_BIN(%s)'] * len(data.viewed_ids))
        query = f"""
            SELECT DISTINCT BIN_TO_UUID(category_type_id) 
            FROM products WHERE id IN ({placeholders})
        """
        cursor.execute(query, tuple(data.viewed_ids))
        rows = cursor.fetchall()
        recent_type_ids = [str(row[0]) for row in rows if row[0]]

        cats_data = reco_data.get("category_best_sellers", {}) 
        for type_id in recent_type_ids:
            items = cats_data.get(type_id, [])
            items = [item for item in items if item not in data.viewed_ids]
            recommended_items.extend(items)
            if len(recommended_items) >= limit * 2: break

        final_list = list(dict.fromkeys(recommended_items))[:limit]
        return final_list if final_list else get_trending_now(limit)

    except Error as e:
        logger.error(f"History Reco Error: {e}")
        return get_trending_now(limit)
    finally:
        if conn: conn.close()

# Gợi ý sản phẩm cho người dùng có sở thích giống chủ tài khoản
@app.get("/recommendations/user-collaborative/{user_id}", response_model=List[str])
def recommend_user_collaborative(user_id: str, limit: int = 8):
    if not POOL: return get_trending_now(limit)
    conn = None
    try:
        conn = POOL.get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT BIN_TO_UUID(product_id) AS product_id FROM product_views WHERE user_id = UUID_TO_BIN(%s)", (user_id,))
        current_views = {row["product_id"] for row in cursor.fetchall()}
        if not current_views: return get_trending_now(limit)

        cursor.execute("""
            SELECT BIN_TO_UUID(pv.user_id) AS user_id, BIN_TO_UUID(pv.product_id) AS product_id
            FROM product_views pv
            WHERE pv.user_id IN (
                SELECT DISTINCT user_id FROM product_views WHERE product_id IN (
                    SELECT product_id FROM product_views WHERE user_id = UUID_TO_BIN(%s)
                )
            ) AND pv.user_id != UUID_TO_BIN(%s)
        """, (user_id, user_id))

        rows = cursor.fetchall()
        user_views = {}
        for row in rows:
            user_views.setdefault(row["user_id"], set()).add(row["product_id"])

        similarities = []
        for uid, products in user_views.items():
            sim = jaccard_similarity(current_views, products)
            if sim > 0: similarities.append((uid, sim, products))

        if not similarities: return get_trending_now(limit)

        similarities.sort(key=lambda x: x[1], reverse=True)
        top_users = similarities[:3]

        recommendations = []
        for _, _, products in top_users:
            for pid in products:
                if pid not in current_views: recommendations.append(pid)

        final_list = list(dict.fromkeys(recommendations))
        if len(final_list) < limit:
            trending = get_trending_now(limit * 2)
            for pid in trending:
                if pid not in final_list and pid not in current_views:
                    final_list.append(pid)
                if len(final_list) >= limit: break

        return final_list[:limit]
    except Error as e:
        logger.error(f"User-CF Error: {e}")
        return get_trending_now(limit)
    finally:
        if conn: conn.close()