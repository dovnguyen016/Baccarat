# Baccarat Strategies Tool - Công cụ Chiến lược Baccarat

## Mô tả
Công cụ web phân tích và chiến lược Baccarat chuyên nghiệp với nhiều tính năng AI tiên tiến và khả năng nhập lịch sử game linh hoạt.

## Tính năng chính

### 🔮 AI Predictors
- **AI Predictor**: Dự đoán kết quả với thuật toán Machine Learning tiên tiến
- **Smart AI**: Phân tích pattern và tối ưu hóa tỷ lệ thắng
- **Neural Network Visualization**: Hiển thị hoạt động mạng neural trực quan
- **Advanced Analytics**: Entropy Score, Trend Strength, Cycle Position

### 💰 Chiến lược Betting
- **Martingale**: Tăng gấp đôi cược sau mỗi lần thua
- **Fibonacci**: Sử dụng dãy Fibonacci để quản lý cược
- **Labouchere**: Chia mục tiêu thành dãy số
- **Paroli**: Tăng cược khi thắng (Reverse Martingale)
- **Flat Betting**: Cược cố định an toàn
- **Pattern Tracker**: Theo dõi và phân tích pattern

### 📊 Baccarat Road Map (MỚI!)
- **Big Road (Đường Lớn)**: Hiển thị kết quả theo format casino thực
- **Nhập Nhanh**: Click nút BANKER/PLAYER/TIE để thêm kết quả tức thì  
- **Thống Kê Chi Tiết**: Bảng thống kê với tỷ lệ %, streak max
- **Hoàn Tác**: Có thể undo kết quả vừa nhập
- **Xóa Road Map**: Dọn dẹp toàn bộ bảng khi cần

### 📈 Thống kê & Phân tích
- Tỷ lệ thắng thua
- Lợi nhuận/lỗ
- Pattern analysis
- Streak detection
- Risk assessment

## Cách sử dụng

### 1. Mở trong VS Code
Có 3 cách để mở website trong VS Code:

#### Cách 1: Live Server Extension
```bash
# Cài đặt Live Server extension
# Nhấp chuột phải vào index.html → "Open with Live Server"
```

#### Cách 2: Live Preview Extension  
```bash
# Cài đặt Live Preview extension
# Nhấp chuột phải vào index.html → "Show Preview"
```

#### Cách 3: Simple Browser
```bash
# Mở Command Palette (Ctrl+Shift+P)
# Gõ "Simple Browser" → nhập đường dẫn file:///c:/Users/Hp/Videos/Baccarat/index.html
```

### 2. Sử dụng Baccarat Road Map

#### Nhập kết quả (phong cách casino):
1. Click nút **BANKER**, **PLAYER**, hoặc **TIE**
2. Kết quả sẽ xuất hiện ngay trên bảng Big Road
3. Tie sẽ được đánh dấu trên ô Banker/Player trước đó

#### Xem Road Map:
- **Big Road**: Hiển thị pattern theo cột (cùng kết quả xuống dưới)
- **Thống kê**: Bảng số liệu chi tiết với tỷ lệ % và streak max
- **Hoàn tác**: Nút "Hoàn tác" để xóa kết quả cuối cùng

### 3. Nhập kết quả game (cách truyền thống)

#### Sử dụng Dropdown (cách truyền thống):
1. Chọn kết quả từ dropdown "Chọn kết quả..."
2. Click "Xác nhận" để thêm vào lịch sử

#### Nhập nhanh:
1. Click tab "Nhập Nhanh" 
2. Click nút Banker/Player/Tie để thêm kết quả tức thì
3. Kết quả sẽ được thêm vào lịch sử ngay lập tức

### 4. Xem lịch sử và thống kê
- **Road Map**: Bảng Big Road theo phong cách casino
- **Lịch sử**: Hiển thị tất cả kết quả đã nhập 
- **Thống kê nhanh**: Tổng, số lượng B/P/T, tỷ lệ %, streak max
- **Xóa dữ liệu**: Nút "Xóa Road Map" hoặc "Xóa Lịch Sử"

### 5. Sử dụng chiến lược
1. Chọn chiến lược từ menu navigation
2. Xem dự đoán AI và khuyến nghị
3. Đặt cược theo gợi ý
4. Nhập kết quả thực tế (dropdown hoặc nhanh)
5. Xem thống kê và điều chỉnh

## Chi tiết các chiến lược

### Martingale
- Tăng gấp đôi cược sau mỗi lần thua
- Trở về cược cơ bản khi thắng
- Rủi ro cao nhưng có thể thu hồi tất cả khi thắng
- Có giới hạn số lần tăng gấp đôi để tránh rủi ro quá lớn

### Fibonacci  
- Sử dụng dãy số Fibonacci: 1, 1, 2, 3, 5, 8, 13, 21...
- Tăng theo dãy khi thua, lùi 2 bước khi thắng
- An toàn hơn Martingale vì tăng chậm hơn

### Labouchere
- Chia mục tiêu lợi nhuận thành dãy số (VD: 1,2,3,4,5)
- Cược = số đầu + số cuối dãy
- Thắng: xóa 2 số đầu cuối
- Thua: thêm số tiền thua vào cuối dãy

### Paroli
- Tăng gấp đôi cược sau mỗi lần thắng
- Trở về cược cơ bản sau 3 lần thắng liên tiếp hoặc khi thua
- Chiến lược tích cực, tận dụng chuỗi thắng

### Flat Betting
- Cược cố định mọi lúc
- An toàn nhất, dễ quản lý
- Phù hợp cho người chơi bảo thủ

### Pattern Tracker
- Theo dõi 50 kết quả gần nhất
- Phân tích chuỗi thắng/thua
- Phát hiện pattern xen kẽ
- Đưa ra gợi ý cược dựa trên xu hướng

## Thống kê và phân tích

Công cụ cung cấp:
- **Tổng số games**: Số lượng game đã chơi
- **Tỷ lệ thắng**: Phần trăm games thắng
- **Lợi nhuận**: Số tiền thắng/thua so với ban đầu  
- **Cược lớn nhất**: Cược cao nhất trong session
- **Lịch sử chi tiết**: 10 games gần nhất với kết quả và P&L

## Cảnh báo quan trọng

⚠️ **Công cụ này chỉ dành cho mục đích học tập và giải trí**

- Không có chiến lược nào đảm bảo thắng 100%
- Luôn chơi có trách nhiệm và trong khả năng tài chính
- Baccarat là game may rủi, house edge luôn tồn tại
- Đặt giới hạn thua lỗ trước khi chơi

## Cấu trúc file
```
Baccarat/
├── index.html          # Giao diện chính
├── styles.css          # CSS styling
├── script.js           # Logic JavaScript
├── package.json        # Package configuration
└── README.md          # Hướng dẫn này
```

## Yêu cầu hệ thống
- **Browser**: Chrome, Firefox, Safari, Edge (modern browsers)
- **VS Code**: Version mới nhất
- **Extensions**: Live Server, Live Preview, hoặc Simple Browser

## Lưu ý
- Dữ liệu lưu trong browser (localStorage)
- Refresh trang sẽ giữ lại lịch sử
- AI cần ít nhất 10-20 kết quả để dự đoán chính xác
- Xuất lịch sử thường xuyên để backup

## Troubleshooting

### Website không hiển thị:
1. Kiểm tra đường dẫn file
2. Đảm bảo tất cả file (html, css, js) cùng thư mục
3. Thử refresh browser (Ctrl+F5)

### Lỗi JavaScript:
1. Mở Developer Tools (F12)
2. Xem Console tab để tìm lỗi
3. Đảm bảo script.js load thành công

### Không nhập được lịch sử:
1. Kiểm tra định dạng file/dữ liệu
2. Đảm bảo chỉ chứa B/P/T
3. Thử với dữ liệu nhỏ trước

## Liên hệ hỗ trợ
Nếu gặp vấn đề, vui lòng cung cấp:
1. Thông tin browser và version
2. Screenshots lỗi
3. File dữ liệu gây lỗi (nếu có)

---
© 2025 Baccarat Strategies Tool - Made with ❤️
