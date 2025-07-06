// Hiển thị các loại road Baccarat: Bead Plate, Big Road, Big Eye Boy, Small Road, Cockroach Pig
// Chỉ cần truyền vào history dạng array ['B','P','T',...]

export function renderBeadPlate(history, rows = 6, cols = 6) {
    // Trả về mảng 2D, mỗi cell là {val, color}
    let grid = [];
    for (let r = 0; r < rows; r++) grid.push(Array(cols).fill(null));
    for (let i = 0; i < Math.min(history.length, rows * cols); i++) {
        let r = i % rows;
        let c = Math.floor(i / rows);
        let val = history[i];
        let color = val === 'B' ? 'blue' : val === 'P' ? 'red' : 'green';
        grid[r][c] = { val, color };
    }
    return grid;
}

export function renderBigRoad(history, maxRows = 6, maxCols = 40) {
    // Trả về mảng 2D, mỗi cell là {val, color}
    let grid = Array.from({ length: maxRows }, () => Array(maxCols).fill(null));
    let col = 0, row = 0, last = null, streak = 0, colStart = 0;
    let arr = history.filter(x => x !== 'T');
    for (let i = 0; i < arr.length; i++) {
        let val = arr[i];
        if (val !== last) {
            // New streak
            if (col > 0 && row > 0 && grid[0][col] !== null) col++;
            else if (col > 0) col++;
            row = 0;
            colStart = col;
        } else {
            if (row + 1 < maxRows && grid[row + 1][col] === null) row++;
            else col++;
        }
        let color = val === 'B' ? 'blue' : 'red';
        grid[row][col] = { val, color };
        last = val;
    }
    return grid;
}

// Big Eye Boy, Small Road, Cockroach Pig: các road này dựa trên Big Road, cần thuật toán riêng
// Để đơn giản, chỉ tạo khung, có thể mở rộng sau
export function renderEmptyRoad(rows = 6, cols = 40) {
    return Array.from({ length: rows }, () => Array(cols).fill(null));
}
