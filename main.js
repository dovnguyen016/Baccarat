import UltimateBaccaratAI from './ai-predictor.js';
import { renderBeadPlate, renderBigRoad, renderEmptyRoad } from './roads.js';

const ai = new UltimateBaccaratAI();

const historyInput = document.getElementById('history');
const predictBtn = document.getElementById('predictBtn');
const resultDiv = document.getElementById('result');
const addBankerBtn = document.getElementById('addBanker');
const addPlayerBtn = document.getElementById('addPlayer');
const addTieBtn = document.getElementById('addTie');
const historyVisual = document.getElementById('history-visual');
// Add history by button
if (addBankerBtn && addPlayerBtn && addTieBtn) {
    addBankerBtn.addEventListener('click', () => {
        historyInput.value += 'B';
        historyInput.focus();
        updateRoads();
    });
    addPlayerBtn.addEventListener('click', () => {
        historyInput.value += 'P';
        historyInput.focus();
        updateRoads();
    });
    addTieBtn.addEventListener('click', () => {
        historyInput.value += 'T';
        historyInput.focus();
        updateRoads();
    });
}

function parseHistory(str) {
    return str.toUpperCase().replace(/[^BPT]/g, '').split('');
}

// Render road to grid
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

function updateRoads() {
    const history = parseHistory(historyInput.value);
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
    renderHistoryVisual();
}

function renderHistoryVisual() {
    const history = parseHistory(historyInput.value);
    historyVisual.innerHTML = '';
    history.forEach(val => {
        const chip = document.createElement('div');
        chip.className = 'history-chip ' + val;
        chip.textContent = val;
        historyVisual.appendChild(chip);
    });
}

predictBtn.addEventListener('click', () => {
    const history = parseHistory(historyInput.value);
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

// Enter key triggers prediction
document.getElementById('history').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') predictBtn.click();
    setTimeout(updateRoads, 10);
});
historyInput.addEventListener('input', updateRoads);
window.addEventListener('DOMContentLoaded', updateRoads);
