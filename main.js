import UltimateBaccaratAI from './ai-predictor.js';
import { renderBeadPlate, renderBigRoad, renderEmptyRoad } from './roads.js';

const ai = new UltimateBaccaratAI();

const historyInput = document.getElementById('history');
const predictBtn = document.getElementById('predictBtn');
const resultDiv = document.getElementById('result');
const addBankerBtn = document.getElementById('addBanker');
const addPlayerBtn = document.getElementById('addPlayer');
const addTieBtn = document.getElementById('addTie');
const removeLastBtn = document.getElementById('removeLast');
const removeAllBtn = document.getElementById('removeAll');
// Xóa mọi biến và hàm liên quan đến historyArr, renderHistoryVisual
// Giữ lại các nút nhập, khi bấm sẽ cập nhật trực tiếp vào một biến historyArr và updateRoads
let historyArr = [];

if (addBankerBtn && addPlayerBtn && addTieBtn) {
    addBankerBtn.addEventListener('click', () => {
        historyArr.push('B');
        updateRoads();
    });
    addPlayerBtn.addEventListener('click', () => {
        historyArr.push('P');
        updateRoads();
    });
    addTieBtn.addEventListener('click', () => {
        historyArr.push('T');
        updateRoads();
    });
}
if (removeLastBtn) {
    removeLastBtn.addEventListener('click', () => {
        historyArr.pop();
        updateRoads();
    });
}
if (removeAllBtn) {
    removeAllBtn.addEventListener('click', () => {
        historyArr = [];
        updateRoads();
    });
}

function updateRoads() {
    const history = historyArr;
    // Bead Plate: 6x6
    const beadGrid = renderBeadPlate(history, 6, 6);
    renderRoadGrid(document.getElementById('bead-plate'), beadGrid);
    // Big Road: 6x24
    const bigRoadGrid = renderBigRoad(history, 6, 24);
    renderRoadGrid(document.getElementById('big-road'), bigRoadGrid);
    // Big Eye Boy, Small Road, Cockroach Pig: 6x12
    renderRoadGrid(document.getElementById('big-eye-boy'), renderEmptyRoad(6, 12));
    renderRoadGrid(document.getElementById('small-road'), renderEmptyRoad(6, 12));
    renderRoadGrid(document.getElementById('cockroach-pig'), renderEmptyRoad(6, 12));
}

function renderRoadGrid(container, grid) {
    container.innerHTML = '';
    for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[r].length; c++) {
            const cell = grid[r][c];
            const div = document.createElement('div');
            div.className = 'road-cell';
            if (cell) {
                div.classList.add(cell.color);
                div.textContent = cell.val;
            }
            container.appendChild(div);
        }
    }
}

predictBtn.addEventListener('click', () => {
    const history = historyArr;
    if (history.length === 0) {
        resultDiv.innerHTML = '<span style="color:#ff5252">Vui lòng nhập lịch sử hợp lệ!</span>';
        updateRoads();
        return;
    }
    const prediction = ai.predict(history);
    let predText = '';
    if (prediction.predicted === 'B') predText = 'Banker (B)';
    else if (prediction.predicted === 'P') predText = 'Player (P)';
    else if (prediction.predicted === 'T') predText = 'Tie (T)';
    resultDiv.innerHTML = `<b>Dự đoán:</b> <span style=\"color:#00e676\">${predText}</span><br>
        <b>Độ tự tin:</b> ${prediction.confidence}%<br>
        <b>Pattern:</b> ${prediction.pattern}<br>
        <b>Thuật toán:</b> ${prediction.methods.join(', ')}`;
    updateRoads();
});

window.addEventListener('DOMContentLoaded', updateRoads);
