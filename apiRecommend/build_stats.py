import os
import json
import pandas as pd
from sqlalchemy import create_engine
from dotenv import load_dotenv

# 1. Load cấu hình
load_dotenv()

DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_NAME = os.getenv("DB_NAME", "tieuluan")
DB_PORT = os.getenv("DB_PORT", "3306")

DB_URL = f"mysql+mysqlconnector://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
engine = create_engine(DB_URL)

def build_popularity_stats():
    print("[Build Stats] Đang tính toán dữ liệu bán chạy 7 NGÀY QUA...")
    
    query = """
        SELECT 
            BIN_TO_UUID(p.id) as product_id,
            BIN_TO_UUID(p.category_type_id) as category_type_id, 
            SUM(od.quantity) as purchase_count
        FROM order_items od
        JOIN products p ON od.product_id = p.id
        JOIN orders o ON od.order_id = o.id 
        WHERE p.enable = 1 
          AND o.order_date >= DATE_SUB(NOW(), INTERVAL 7 DAY) 
        GROUP BY p.id, p.category_type_id
    """
    
    try:
        df = pd.read_sql(query, engine)
        
        if df.empty:
            print("[Build Stats] Không có đơn hàng nào trong 7 ngày qua. Dùng dữ liệu Backup...")
            # Fallback: Lấy sản phẩm mới nhất làm best seller giả định
            fallback_query = """
                SELECT BIN_TO_UUID(id) as product_id, BIN_TO_UUID(category_type_id) as category_type_id 
                FROM products 
                WHERE enable = 1 
                ORDER BY created_at 
                DESC LIMIT 50
            """
            df = pd.read_sql(fallback_query, engine)
            df['score'] = 1
        else:
            df['score'] = df['purchase_count']
            print(f"[Build Stats] Đã tìm thấy {len(df)} sản phẩm bán chạy (7 ngày).")

        df = df.sort_values(by='score', ascending=False)

        # 1. Top Global
        top_global = df.head(20)['product_id'].tolist()
        
        # 2. Top theo Category Type 
        top_by_category = {}
        
        # Lọc các category_type_id hợp lệ
        valid_cats = [c for c in df['category_type_id'].unique() if c]
        
        for cat in valid_cats:
            # Lấy top 10 sản phẩm của LOẠI đó
            top_items = df[df['category_type_id'] == cat].head(10)['product_id'].tolist()
            top_by_category[str(cat)] = top_items

        result = {
            "global_best_sellers": top_global,
            "category_best_sellers": top_by_category 
        }
        
        # Ghi đè file JSON cũ
        with open("popularity_model.json", "w") as f:
            json.dump(result, f)
            
        print("[Build Stats] HOÀN TẤT! File JSON đã được cập nhật.")

    except Exception as e:
        print(f"[Build Stats] LỖI: {e}")

if __name__ == "__main__":
    build_popularity_stats()