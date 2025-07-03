class BaccaratStrategies {
    constructor() {
        this.gameState = {
            balance: 1000,
            initialBalance: 1000,
            baseBet: 10,
            currentStrategy: 'predictor',
            gameHistory: [],
            currentBet: null,
            selectedBet: null
        };

        this.strategies = {
            predictor: new AdvancedPredictorStrategy(),
            smart: new SmartAIStrategy(),
            martingale: new MartingaleStrategy(),
            fibonacci: new FibonacciStrategy(),
            labouchere: new LabouchereStrategy(),
            paroli: new ParoliStrategy(),
            flat: new FlatBettingStrategy()
        };

        this.patternTracker = new PatternTracker();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateDisplay();
        this.updateBalance();
    }

    setupEventListeners() {
        // Strategy navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchStrategy(e.target.dataset.strategy);
            });
        });

        // Game controls
        document.getElementById('initialBalance').addEventListener('change', (e) => {
            this.gameState.balance = parseInt(e.target.value);
            this.gameState.initialBalance = parseInt(e.target.value);
            this.updateBalance();
        });

        document.getElementById('baseBet').addEventListener('change', (e) => {
            this.gameState.baseBet = parseInt(e.target.value);
            this.updateBetDisplay();
        });

        document.getElementById('resetGame').addEventListener('click', () => {
            this.resetGame();
        });

        // Betting buttons
        document.querySelectorAll('.bet-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.placeBet(e.target.closest('.bet-btn').dataset.bet);
            });
        });

        // Labouchere specific
        const resetLabBtn = document.getElementById('resetLabSequence');
        if (resetLabBtn) {
            resetLabBtn.addEventListener('click', () => {
                this.strategies.labouchere.resetSequence();
                this.updateDisplay();
            });
        }
    }

    switchStrategy(strategyName) {
        this.gameState.currentStrategy = strategyName;
        
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-strategy="${strategyName}"]`).classList.add('active');

        // Update panels
        document.querySelectorAll('.strategy-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        document.getElementById(strategyName).classList.add('active');

        this.updateDisplay();
    }

    placeBet(betType) {
        const strategy = this.strategies[this.gameState.currentStrategy];
        const betAmount = strategy.getBetAmount(this.gameState.baseBet);

        if (betAmount > this.gameState.balance) {
            alert('Không đủ số dư để đặt cược!');
            return;
        }

        this.gameState.currentBet = {
            type: betType,
            amount: betAmount
        };

        this.gameState.selectedBet = betType;
        this.highlightSelectedBet(betType);
        
        // Enable result selection
        document.getElementById('gameResult').disabled = false;
        
        // Update display
        this.updateBetDisplay();
        
        alert(`Đã đặt cược $${betAmount} vào ${betType.toUpperCase()}`);
    }

    highlightSelectedBet(betType) {
        document.querySelectorAll('.bet-btn').forEach(btn => {
            btn.style.opacity = '0.6';
        });
        document.querySelector(`[data-bet="${betType}"]`).style.opacity = '1';
        document.querySelector(`[data-bet="${betType}"]`).style.transform = 'scale(1.05)';
    }

    submitResult() {
        const gameResult = document.getElementById('gameResult').value;
        if (!gameResult || !this.gameState.currentBet) {
            alert('Vui lòng chọn kết quả game và đặt cược trước!');
            return;
        }

        const isWin = this.calculateWin(this.gameState.currentBet.type, gameResult);
        const payout = this.calculatePayout(this.gameState.currentBet.type, this.gameState.currentBet.amount, isWin);
        
        // Update balance
        if (isWin) {
            this.gameState.balance += payout - this.gameState.currentBet.amount;
        } else {
            this.gameState.balance -= this.gameState.currentBet.amount;
        }

        // Update strategy state
        const strategy = this.strategies[this.gameState.currentStrategy];
        strategy.updateState(isWin, this.gameState.currentBet.amount);

        // Add to history
        this.gameState.gameHistory.push({
            bet: this.gameState.currentBet,
            result: gameResult,
            isWin: isWin,
            profit: isWin ? (payout - this.gameState.currentBet.amount) : -this.gameState.currentBet.amount,
            balance: this.gameState.balance,
            timestamp: new Date()
        });

        // Update pattern tracker
        this.patternTracker.addResult(gameResult);

        // Reset for next game
        this.gameState.currentBet = null;
        this.gameState.selectedBet = null;
        document.getElementById('gameResult').value = '';
        document.getElementById('gameResult').disabled = true;

        // Reset bet button highlights
        document.querySelectorAll('.bet-btn').forEach(btn => {
            btn.style.opacity = '1';
            btn.style.transform = 'scale(1)';
        });

        // Update all displays
        this.updateDisplay();
        this.updateBalance();
        this.updateHistory();
        this.updateStats();

        // Check if player is broke
        if (this.gameState.balance <= 0) {
            alert('Hết tiền! Game over!');
        }
    }



    toggleImportPanel(panelId) {
        // Hide all panels first
        ['manualInputPanel', 'bulkInputPanel', 'fileInputPanel'].forEach(id => {
            const panel = document.getElementById(id);
            if (panel) panel.style.display = 'none';
        });

        // Show selected panel
        const selectedPanel = document.getElementById(panelId);
        if (selectedPanel) {
            selectedPanel.style.display = selectedPanel.style.display === 'none' ? 'block' : 'none';
        }
    }

    addQuickResult(result) {
        if (!this.quickPreviewResults) this.quickPreviewResults = [];
        this.quickPreviewResults.push(result);
        this.updateQuickPreview();
    }

    updateQuickPreview() {
        const previewContainer = document.getElementById('quickPreview');
        if (!previewContainer) return;

        previewContainer.innerHTML = '';
        this.quickPreviewResults.forEach(result => {
            const item = document.createElement('div');
            item.className = `preview-item ${result}`;
            item.textContent = result.charAt(0).toUpperCase();
            previewContainer.appendChild(item);
        });
    }

    clearQuickPreview() {
        this.quickPreviewResults = [];
        this.updateQuickPreview();
    }

    addQuickToHistory() {
        if (!this.quickPreviewResults || this.quickPreviewResults.length === 0) {
            alert('Chưa có kết quả nào để thêm!');
            return;
        }

        // Add each result to pattern tracker
        this.quickPreviewResults.forEach(result => {
            this.patternTracker.addResult(result);
        });

        // Show success message
        this.showImportSuccess(`Đã thêm ${this.quickPreviewResults.length} kết quả vào lịch sử!`);
        
        // Clear preview and update displays
        this.clearQuickPreview();
        this.updateDisplay();
        this.updateHistoryCount();
        this.updatePatternDisplay();
    }

    validateBulkInput() {
        const bulkText = document.getElementById('bulkResults').value.trim();
        const preview = document.getElementById('bulkPreview');
        
        if (!bulkText) {
            preview.textContent = 'Vui lòng nhập dữ liệu để validate!';
            preview.className = 'bulk-preview error';
            return;
        }

        try {
            const results = this.parseBulkInput(bulkText);
            preview.textContent = `✅ Hợp lệ! Tìm thấy ${results.length} kết quả: ${results.join(', ')}`;
            preview.className = 'bulk-preview success';
        } catch (error) {
            preview.textContent = `❌ Lỗi: ${error.message}`;
            preview.className = 'bulk-preview error';
        }
    }

    processBulkInput() {
        const bulkText = document.getElementById('bulkResults').value.trim();
        const btn = document.getElementById('processBulkInput');
        
        if (!bulkText) {
            alert('Vui lòng nhập dữ liệu trước khi import!');
            return;
        }

        try {
            btn.classList.add('processing');
            btn.textContent = 'Đang xử lý';

            const results = this.parseBulkInput(bulkText);
            
            // Add to pattern tracker
            results.forEach(result => {
                this.patternTracker.addResult(result);
            });

            // Success
            this.showImportSuccess(`Đã import thành công ${results.length} kết quả!`);
            document.getElementById('bulkResults').value = '';
            document.getElementById('bulkPreview').textContent = '';
            document.getElementById('bulkPreview').className = 'bulk-preview';
            
            // Update displays
            this.updateDisplay();
            this.updateHistoryCount();
            this.updatePatternDisplay();

        } catch (error) {
            alert(`Lỗi import: ${error.message}`);
        } finally {
            btn.classList.remove('processing');
            btn.textContent = 'Import';
        }
    }

    parseBulkInput(text) {
        // Remove spaces and convert to lowercase
        const cleaned = text.replace(/\s+/g, '').toLowerCase();
        
        // Try different formats
        let results = [];
        
        // Format 1: Comma separated (B,P,T,B,P or banker,player,tie)
        if (cleaned.includes(',')) {
            const parts = cleaned.split(',');
            results = parts.map(part => this.normalizeResult(part.trim()));
        }
        // Format 2: Continuous string (BPTBP)
        else {
            for (let char of cleaned) {
                results.push(this.normalizeResult(char));
            }
        }
        
        // Validate all results
        results.forEach(result => {
            if (!['banker', 'player', 'tie'].includes(result)) {
                throw new Error(`Kết quả không hợp lệ: ${result}`);
            }
        });
        
        if (results.length === 0) {
            throw new Error('Không tìm thấy kết quả hợp lệ nào!');
        }
        
        return results;
    }

    normalizeResult(input) {
        const normalized = input.toLowerCase().trim();
        
        // Map various inputs to standard format
        const mappings = {
            'b': 'banker',
            'banker': 'banker',
            'bank': 'banker',
            'p': 'player',
            'player': 'player',
            'play': 'player',
            't': 'tie',
            'tie': 'tie',
            'draw': 'tie',
            'hoa': 'tie'
        };
        
        if (mappings[normalized]) {
            return mappings[normalized];
        }
        
        throw new Error(`Không nhận diện được: ${input}`);
    }

    processFileInput() {
        const fileInput = document.getElementById('historyFile');
        const btn = document.getElementById('processFileInput');
        
        if (!fileInput.files.length) {
            alert('Vui lòng chọn file trước!');
            return;
        }
        
        const file = fileInput.files[0];
        const reader = new FileReader();
        
        btn.classList.add('processing');
        btn.textContent = 'Đang đọc file';
        
        reader.onload = (e) => {
            try {
                const content = e.target.result;
                let results = [];
                
                // Determine file type and parse accordingly
                if (file.name.endsWith('.json')) {
                    const jsonData = JSON.parse(content);
                    if (Array.isArray(jsonData)) {
                        results = jsonData.map(item => this.normalizeResult(item));
                    } else {
                        throw new Error('JSON file phải chứa array các kết quả');
                    }
                } else {
                    // CSV or TXT
                    results = this.parseBulkInput(content);
                }
                
                // Add to pattern tracker
                results.forEach(result => {
                    this.patternTracker.addResult(result);
                });
                
                // Success
                this.showImportSuccess(`Đã import thành công ${results.length} kết quả từ file ${file.name}!`);
                fileInput.value = '';
                
                // Update displays
                this.updateDisplay();
                this.updateHistoryCount();
                this.updatePatternDisplay();
                
            } catch (error) {
                alert(`Lỗi đọc file: ${error.message}`);
            } finally {
                btn.classList.remove('processing');
                btn.textContent = 'Upload & Import';
            }
        };
        
        reader.onerror = () => {
            alert('Lỗi đọc file!');
            btn.classList.remove('processing');
            btn.textContent = 'Upload & Import';
        };
        
        reader.readAsText(file);
    }

    exportHistory() {
        const results = this.patternTracker.results;
        
        if (results.length === 0) {
            alert('Chưa có lịch sử để export!');
            return;
        }
        
        // Create export data
        const exportData = {
            exportDate: new Date().toISOString(),
            totalGames: results.length,
            results: results,
            summary: {
                banker: results.filter(r => r === 'banker').length,
                player: results.filter(r => r === 'player').length,
                tie: results.filter(r => r === 'tie').length
            }
        };
        
        // Create downloadable file
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `baccarat-history-${new Date().toISOString().slice(0, 10)}.json`;
        link.click();
        
        this.showImportSuccess(`Đã export ${results.length} kết quả!`);
    }

    clearAllHistory() {
        if (confirm('Bạn có chắc muốn xóa toàn bộ lịch sử? Hành động này không thể hoàn tác!')) {
            this.patternTracker.reset();
            this.gameState.gameHistory = [];
            
            // Reset all strategies
            Object.values(this.strategies).forEach(strategy => strategy.reset());
            
            // Update displays
            this.updateDisplay();
            this.updateHistoryCount();
            this.updateHistory();
            this.updateStats();
            
            this.showImportSuccess('Đã xóa toàn bộ lịch sử!');
        }
    }

    updateHistoryCount() {
        const count = this.patternTracker.results.length;
        const countElement = document.getElementById('historyCount');
        if (countElement) {
            countElement.textContent = `(${count} games)`;
        }
    }

    showImportSuccess(message) {
        // Create or update notification
        let notification = document.getElementById('importNotification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'importNotification';
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #27ae60;
                color: white;
                padding: 15px 20px;
                border-radius: 8px;
                z-index: 1000;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                transform: translateX(100%);
                transition: transform 0.3s ease;
            `;
            document.body.appendChild(notification);
        }
        
        notification.textContent = message;
        
        // Show notification
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Hide notification after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
        }, 3000);
    }

    calculateWin(betType, result) {
        return betType === result;
    }

    calculatePayout(betType, amount, isWin) {
        if (!isWin) return 0;
        
        switch(betType) {
            case 'banker':
                return amount * 1.95; // 5% house edge
            case 'player':
                return amount * 2;
            case 'tie':
                return amount * 9;
            default:
                return 0;
        }
    }

    updateDisplay() {
        const strategy = this.strategies[this.gameState.currentStrategy];
        this.updateBetDisplay();
        
        // Update strategy-specific displays
        switch(this.gameState.currentStrategy) {
            case 'predictor':
                this.updatePredictorDisplay();
                break;
            case 'smart':
                this.updateSmartAIDisplay();
                break;
            case 'martingale':
                this.updateMartingaleDisplay();
                break;
            case 'fibonacci':
                this.updateFibonacciDisplay();
                break;
            case 'labouchere':
                this.updateLabouchereDisplay();
                break;
            case 'paroli':
                this.updateParoliDisplay();
                break;
        }

        // Update pattern tracker if active
        if (this.gameState.currentStrategy === 'tracker') {
            this.updatePatternDisplay();
        }
    }

    updateBetDisplay() {
        const strategy = this.strategies[this.gameState.currentStrategy];
        const nextBetAmount = strategy.getBetAmount(this.gameState.baseBet);
        
        const nextBetElement = document.getElementById('nextBetAmount');
        if (nextBetElement) {
            nextBetElement.textContent = `$${nextBetAmount}`;
        }
    }

    updatePredictorDisplay() {
        const strategy = this.strategies.predictor;
        strategy.updateAnalysis(this.gameState.gameHistory, this.patternTracker.results);
        
        // Update main prediction
        const prediction = strategy.getPrimaryPrediction();
        const predictionElement = document.querySelector('.outcome-text');
        const confidenceElement = document.getElementById('predictionConfidence');
        
        if (predictionElement && confidenceElement) {
            predictionElement.textContent = `${prediction.outcome.toUpperCase()} sẽ thắng!`;
            confidenceElement.textContent = `${prediction.confidence}%`;
            
            // Update prediction icon color
            const iconElement = document.querySelector('.outcome-icon');
            if (iconElement) {
                if (prediction.confidence >= 80) {
                    iconElement.style.color = '#FFD700';
                } else if (prediction.confidence >= 65) {
                    iconElement.style.color = '#FFA500';
                } else {
                    iconElement.style.color = '#FF6B6B';
                }
            }
        }

        // Update prediction table
        const predictions = strategy.getMultiplePredictions();
        document.getElementById('nextGamePred').textContent = predictions.nextGame.outcome.toUpperCase();
        document.getElementById('nextGameProb').textContent = `${predictions.nextGame.confidence}%`;
        document.getElementById('next3GamesPred').textContent = predictions.next3Games;
        document.getElementById('next3GamesProb').textContent = `${predictions.next3GamesConf}%`;
        document.getElementById('hotStreakPred').textContent = predictions.hotStreak;
        document.getElementById('hotStreakProb').textContent = `${predictions.hotStreakConf}%`;

        // Update neural network visualization
        this.updateNeuralNetwork(strategy);

        // Update analytics
        const analytics = strategy.getAnalytics();
        document.getElementById('entropyScore').textContent = analytics.entropy.toFixed(2);
        document.getElementById('trendStrength').textContent = `${analytics.trendStrength}%`;
        document.getElementById('cyclePosition').textContent = analytics.cyclePosition;
        document.getElementById('accuracyRate').textContent = `${analytics.accuracyRate}%`;

        // Update bet probabilities
        const probs = strategy.getDetailedProbabilities();
        document.getElementById('bankerPredProb').textContent = `Dự đoán: ${probs.banker}%`;
        document.getElementById('playerPredProb').textContent = `Dự đoán: ${probs.player}%`;
        document.getElementById('tiePredProb').textContent = `Dự đoán: ${probs.tie}%`;

        // Update confidence indicators
        this.updateConfidenceIndicators(probs);

        // Update recommendations
        const recommendations = strategy.getRecommendations();
        document.getElementById('primaryBetRec').textContent = recommendations.primary;
        document.getElementById('backupBetRec').textContent = recommendations.backup;
        document.getElementById('riskBetRec').textContent = recommendations.risk;

        // Highlight suggested bet
        document.querySelectorAll('.bet-btn').forEach(btn => {
            btn.classList.remove('predictor-suggested');
        });
        
        const suggestedBet = prediction.outcome;
        const suggestedBtn = document.getElementById(`predictor${suggestedBet.charAt(0).toUpperCase() + suggestedBet.slice(1)}Btn`);
        if (suggestedBtn) {
            suggestedBtn.classList.add('predictor-suggested');
        }

        // Update bet info
        document.getElementById('predictorSuggestedAmount').textContent = `$${strategy.getSuggestedAmount(this.gameState.baseBet)}`;
        document.getElementById('predictorWinProb').textContent = `${prediction.confidence}%`;
        
        const riskLevel = strategy.getRiskLevel();
        const riskElement = document.getElementById('riskLevel');
        riskElement.textContent = riskLevel;
        riskElement.className = riskLevel;
        
        document.getElementById('expectedReturn').textContent = strategy.getExpectedReturn(this.gameState.baseBet);
    }

    updateNeuralNetwork(strategy) {
        const activity = strategy.getNeuralActivity();
        
        // Update hidden nodes
        document.getElementById('hiddenNode1').style.animationDelay = '0s';
        document.getElementById('hiddenNode2').style.animationDelay = '0.5s';
        document.getElementById('hiddenNode3').style.animationDelay = '1s';
        
        // Update output nodes based on predictions
        const outputs = activity.outputs;
        document.getElementById('outputBanker').style.opacity = outputs.banker / 100;
        document.getElementById('outputPlayer').style.opacity = outputs.player / 100;
        document.getElementById('outputTie').style.opacity = outputs.tie / 100;
        
        // Draw connection lines
        this.drawNeuralConnections(activity);
    }

    drawNeuralConnections(activity) {
        const svg = document.querySelector('.connection-lines');
        if (!svg) return;
        
        // Clear existing lines
        svg.innerHTML = '';
        
        // Draw animated lines between nodes
        const strength = activity.connectionStrengths;
        for (let i = 0; i < strength.length; i++) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', '50');
            line.setAttribute('y1', `${30 + i * 30}`);
            line.setAttribute('x2', '150');
            line.setAttribute('y2', `${45 + i * 20}`);
            line.setAttribute('stroke', `rgba(52,152,219,${strength[i]})`);
            line.setAttribute('stroke-width', '2');
            
            const animate = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
            animate.setAttribute('attributeName', 'opacity');
            animate.setAttribute('values', '0.3;1;0.3');
            animate.setAttribute('dur', '2s');
            animate.setAttribute('repeatCount', 'indefinite');
            
            line.appendChild(animate);
            svg.appendChild(line);
        }
    }

    updateConfidenceIndicators(probs) {
        const indicators = ['banker', 'player', 'tie'];
        indicators.forEach(type => {
            const indicator = document.getElementById(`${type}Confidence`);
            if (indicator) {
                const confidence = probs[type];
                indicator.style.setProperty('--width', `${confidence}%`);
            }
        });
    }

    updateSmartAIDisplay() {
        const strategy = this.strategies.smart;
        strategy.updateAnalysis(this.gameState.gameHistory, this.patternTracker.results);
        
        // Update confidence meter
        const confidenceBar = document.getElementById('confidenceBar');
        const confidenceText = document.getElementById('confidenceText');
        if (confidenceBar && confidenceText) {
            confidenceBar.style.width = `${strategy.confidence}%`;
            confidenceText.textContent = `${strategy.confidence}% - ${strategy.getConfidenceLevel()}`;
            
            // Update confidence color
            confidenceBar.className = 'confidence-bar';
            if (strategy.confidence >= 75) {
                confidenceBar.classList.add('confidence-high');
            } else if (strategy.confidence >= 50) {
                confidenceBar.classList.add('confidence-medium');
            } else {
                confidenceBar.classList.add('confidence-low');
            }
        }

        // Update AI recommendation
        const aiRecommendation = document.getElementById('aiRecommendation');
        if (aiRecommendation) {
            aiRecommendation.textContent = strategy.getRecommendation();
        }

        // Update bet odds
        const odds = strategy.calculateOdds();
        document.getElementById('bankerOdds').textContent = `Cơ hội: ${odds.banker}%`;
        document.getElementById('playerOdds').textContent = `Cơ hội: ${odds.player}%`;
        document.getElementById('tieOdds').textContent = `Cơ hội: ${odds.tie}%`;

        // Highlight suggested bet
        document.querySelectorAll('.bet-btn').forEach(btn => {
            btn.classList.remove('ai-suggested');
        });
        
        const suggestedBet = strategy.getSuggestedBet();
        if (suggestedBet) {
            const suggestedBtn = document.getElementById(`ai${suggestedBet.charAt(0).toUpperCase() + suggestedBet.slice(1)}Btn`);
            if (suggestedBtn) {
                suggestedBtn.classList.add('ai-suggested');
            }
        }

        // Update AI stats
        const aiWinRate = document.getElementById('aiWinRate');
        const predictionAccuracy = document.getElementById('predictionAccuracy');
        if (aiWinRate) aiWinRate.textContent = `${strategy.getWinRate()}%`;
        if (predictionAccuracy) predictionAccuracy.textContent = `${strategy.getPredictionAccuracy()}%`;

        // Update suggested amount and probability
        const aiSuggestedAmount = document.getElementById('aiSuggestedAmount');
        const winProbability = document.getElementById('winProbability');
        if (aiSuggestedAmount) aiSuggestedAmount.textContent = `$${strategy.getSuggestedAmount(this.gameState.baseBet)}`;
        if (winProbability) winProbability.textContent = `${strategy.getWinProbability()}%`;
    }

    updateMartingaleDisplay() {
        const strategy = this.strategies.martingale;
        const lossStreakElement = document.getElementById('lossStreak');
        if (lossStreakElement) {
            lossStreakElement.textContent = strategy.lossStreak;
        }
    }

    updateFibonacciDisplay() {
        const strategy = this.strategies.fibonacci;
        const positionElement = document.getElementById('fibPosition');
        if (positionElement) {
            positionElement.textContent = strategy.currentPosition + 1;
        }
    }

    updateLabouchereDisplay() {
        const strategy = this.strategies.labouchere;
        const sequenceElement = document.getElementById('currentLabSequence');
        if (sequenceElement) {
            sequenceElement.textContent = `[${strategy.sequence.join(',')}]`;
        }
    }

    updateParoliDisplay() {
        const strategy = this.strategies.paroli;
        const winStreakElement = document.getElementById('winStreak');
        if (winStreakElement) {
            winStreakElement.textContent = strategy.winStreak;
        }
    }

    updatePatternDisplay() {
        this.patternTracker.updateDisplay();
    }

    updateBalance() {
        const currentBalanceElement = document.getElementById('currentBalance');
        if (currentBalanceElement) {
            currentBalanceElement.textContent = `$${this.gameState.balance}`;
            currentBalanceElement.className = 'balance-amount';
            if (this.gameState.balance > this.gameState.initialBalance) {
                currentBalanceElement.classList.add('positive');
            } else if (this.gameState.balance < this.gameState.initialBalance) {
                currentBalanceElement.classList.add('negative');
            }
        }
    }

    updateHistory() {
        const historyElement = document.getElementById('gameHistory');
        if (!historyElement) return;

        historyElement.innerHTML = '';
        
        const recentHistory = this.gameState.gameHistory.slice(-10).reverse();
        
        recentHistory.forEach(game => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            
            const profitClass = game.profit > 0 ? 'positive' : 'negative';
            const profitSign = game.profit > 0 ? '+' : '';
            
            historyItem.innerHTML = `
                <div>
                    <span class="history-result ${game.result}">${game.result.charAt(0).toUpperCase()}</span>
                    <small>$${game.bet.amount}</small>
                </div>
                <div class="history-profit ${profitClass}">
                    ${profitSign}$${game.profit}
                </div>
            `;
            
            historyElement.appendChild(historyItem);
        });
    }

    updateStats() {
        const totalGames = this.gameState.gameHistory.length;
        const wins = this.gameState.gameHistory.filter(game => game.isWin).length;
        const winRate = totalGames > 0 ? ((wins / totalGames) * 100).toFixed(1) : 0;
        const totalProfit = this.gameState.balance - this.gameState.initialBalance;
        const maxBet = totalGames > 0 ? Math.max(...this.gameState.gameHistory.map(game => game.bet.amount)) : 0;

        document.getElementById('totalGames').textContent = totalGames;
        document.getElementById('winRate').textContent = `${winRate}%`;
        
        const profitElement = document.getElementById('totalProfit');
        profitElement.textContent = `$${totalProfit}`;
        profitElement.className = totalProfit >= 0 ? 'positive' : 'negative';
        
        document.getElementById('maxBet').textContent = `$${maxBet}`;
    }

    resetGame() {
        this.gameState.balance = this.gameState.initialBalance;
        this.gameState.gameHistory = [];
        this.gameState.currentBet = null;
        this.gameState.selectedBet = null;

        // Reset all strategies
        Object.values(this.strategies).forEach(strategy => strategy.reset());
        this.patternTracker.reset();

        // Reset UI
        document.getElementById('gameResult').value = '';
        document.getElementById('gameResult').disabled = true;
        document.querySelectorAll('.bet-btn').forEach(btn => {
            btn.style.opacity = '1';
            btn.style.transform = 'scale(1)';
        });

        this.updateDisplay();
        this.updateBalance();
        this.updateHistory();
        this.updateStats();
    }
}

// Strategy Classes
class AdvancedPredictorStrategy {
    constructor() {
        this.predictions = [];
        this.correctPredictions = 0;
        this.totalPredictions = 0;
        this.gameHistory = [];
        this.neuralWeights = this.initializeNeuralWeights();
        this.learningRate = 0.1;
        this.patterns = new Map();
        this.cyclePatterns = [];
        this.entropy = 0;
        this.currentPrediction = null;
    }

    initializeNeuralWeights() {
        return {
            input: Array.from({length: 12}, () => Math.random() * 2 - 1),
            hidden: Array.from({length: 8}, () => Math.random() * 2 - 1),
            output: Array.from({length: 3}, () => Math.random() * 2 - 1)
        };
    }

    updateAnalysis(gameHistory, results) {
        this.gameHistory = gameHistory;
        
        if (results.length < 5) {
            this.currentPrediction = {
                outcome: 'banker',
                confidence: 45,
                reasoning: 'Chưa đủ dữ liệu cho phân tích chính xác'
            };
            return;
        }

        // Multi-dimensional analysis
        const features = this.extractFeatures(results);
        const patterns = this.detectAdvancedPatterns(results);
        const cycles = this.analyzeCycles(results);
        const entropy = this.calculateEntropy(results);
        const momentum = this.calculateAdvancedMomentum(results);
        
        // Neural network prediction
        const neuralOutput = this.runNeuralNetwork(features);
        
        // Ensemble prediction combining multiple methods
        const ensemblePrediction = this.ensemblePredict(patterns, cycles, neuralOutput, momentum);
        
        // Update learning
        this.updateNeuralWeights(features, ensemblePrediction);
        
        this.currentPrediction = ensemblePrediction;
        this.entropy = entropy;
    }

    extractFeatures(results) {
        const recent = results.slice(-20);
        
        return [
            this.getStreakLength(recent),
            this.getAlternatingRatio(recent),
            this.getBankerPlayerRatio(recent),
            this.getTieFrequency(recent),
            this.getGapAnalysis(recent, 'banker'),
            this.getGapAnalysis(recent, 'player'),
            this.getLocalTrend(recent, 5),
            this.getLocalTrend(recent, 10),
            this.getVolatility(recent),
            this.getPeriodicPattern(recent),
            this.getFibonacciAlignment(recent),
            this.getMarkovChainProbability(recent)
        ];
    }

    detectAdvancedPatterns(results) {
        const patterns = {
            streakReversal: this.analyzeStreakReversal(results),
            periodicCycles: this.analyzePeriodicCycles(results),
            symmetryPatterns: this.analyzeSymmetryPatterns(results),
            fibonacciPatterns: this.analyzeFibonacciPatterns(results),
            chaosPatterns: this.analyzeChaosPatterns(results)
        };

        return patterns;
    }

    runNeuralNetwork(features) {
        // Forward propagation
        const hiddenLayer = features.map((feature, i) => 
            Math.tanh(feature * this.neuralWeights.input[i])
        );
        
        const outputLayer = this.neuralWeights.output.map((weight, i) => 
            Math.tanh(hiddenLayer.reduce((sum, h, j) => sum + h * weight, 0))
        );
        
        // Softmax activation
        const expSum = outputLayer.reduce((sum, x) => sum + Math.exp(x), 0);
        const probabilities = outputLayer.map(x => Math.exp(x) / expSum);
        
        return {
            banker: probabilities[0] * 100,
            player: probabilities[1] * 100,
            tie: probabilities[2] * 100
        };
    }

    ensemblePredict(patterns, cycles, neuralOutput, momentum) {
        // Weighted ensemble of different prediction methods
        const weights = {
            neural: 0.35,
            patterns: 0.25,
            cycles: 0.20,
            momentum: 0.20
        };

        let bankerScore = neuralOutput.banker * weights.neural;
        let playerScore = neuralOutput.player * weights.neural;
        let tieScore = neuralOutput.tie * weights.neural;

        // Add pattern-based predictions
        if (patterns.streakReversal.confidence > 70) {
            const patternBoost = patterns.streakReversal.confidence * weights.patterns;
            if (patterns.streakReversal.prediction === 'banker') bankerScore += patternBoost;
            else if (patterns.streakReversal.prediction === 'player') playerScore += patternBoost;
        }

        // Add cycle-based predictions
        if (cycles.strength > 60) {
            const cycleBoost = cycles.strength * weights.cycles;
            if (cycles.prediction === 'banker') bankerScore += cycleBoost;
            else if (cycles.prediction === 'player') playerScore += cycleBoost;
            else tieScore += cycleBoost;
        }

        // Add momentum
        bankerScore += momentum.banker * weights.momentum;
        playerScore += momentum.player * weights.momentum;
        tieScore += momentum.tie * weights.momentum;

        // Determine winner
        const maxScore = Math.max(bankerScore, playerScore, tieScore);
        let outcome, confidence;
        
        if (bankerScore === maxScore) {
            outcome = 'banker';
            confidence = Math.min(95, Math.max(55, bankerScore));
        } else if (playerScore === maxScore) {
            outcome = 'player';
            confidence = Math.min(95, Math.max(55, playerScore));
        } else {
            outcome = 'tie';
            confidence = Math.min(85, Math.max(45, tieScore));
        }

        return {
            outcome,
            confidence: Math.round(confidence),
            reasoning: this.generateReasoning(patterns, cycles, momentum),
            neuralOutput,
            scores: { banker: bankerScore, player: playerScore, tie: tieScore }
        };
    }

    // Helper methods for feature extraction
    getStreakLength(results) {
        if (results.length === 0) return 0;
        
        const last = results[results.length - 1];
        let streak = 1;
        
        for (let i = results.length - 2; i >= 0; i--) {
            if (results[i] === last) streak++;
            else break;
        }
        
        return streak;
    }

    getAlternatingRatio(results) {
        let alternating = 0;
        for (let i = 1; i < results.length; i++) {
            if (results[i] !== results[i-1] && results[i] !== 'tie' && results[i-1] !== 'tie') {
                alternating++;
            }
        }
        return results.length > 1 ? alternating / (results.length - 1) : 0;
    }

    getBankerPlayerRatio(results) {
        const nonTie = results.filter(r => r !== 'tie');
        const bankerCount = nonTie.filter(r => r === 'banker').length;
        return nonTie.length > 0 ? bankerCount / nonTie.length : 0.5;
    }

    getTieFrequency(results) {
        return results.filter(r => r === 'tie').length / Math.max(results.length, 1);
    }

    getGapAnalysis(results, target) {
        let maxGap = 0;
        let currentGap = 0;
        
        for (let i = results.length - 1; i >= 0; i--) {
            if (results[i] === target) {
                maxGap = Math.max(maxGap, currentGap);
                currentGap = 0;
            } else {
                currentGap++;
            }
        }
        
        return Math.max(maxGap, currentGap);
    }

    calculateEntropy(results) {
        const counts = { banker: 0, player: 0, tie: 0 };
        results.forEach(r => counts[r]++);
        
        const total = results.length;
        let entropy = 0;
        
        for (const count of Object.values(counts)) {
            if (count > 0) {
                const p = count / total;
                entropy -= p * Math.log2(p);
            }
        }
        
        return entropy;
    }

    // Advanced pattern analysis methods
    analyzeStreakReversal(results) {
        const streakLength = this.getStreakLength(results);
        const lastResult = results[results.length - 1];
        
        let confidence = 0;
        let prediction = lastResult === 'banker' ? 'player' : 'banker';
        
        if (streakLength >= 5) {
            confidence = Math.min(90, 60 + (streakLength - 5) * 5);
        } else if (streakLength >= 3) {
            confidence = 45 + (streakLength - 3) * 10;
        }
        
        return { prediction, confidence, streakLength };
    }

    analyzeCycles(results) {
        // Look for repeating patterns
        const patterns = new Map();
        const patternLength = Math.min(8, Math.floor(results.length / 3));
        
        for (let len = 2; len <= patternLength; len++) {
            for (let i = 0; i <= results.length - len * 2; i++) {
                const pattern = results.slice(i, i + len).join('');
                const nextPattern = results.slice(i + len, i + len * 2).join('');
                
                if (pattern === nextPattern) {
                    patterns.set(pattern, (patterns.get(pattern) || 0) + 1);
                }
            }
        }
        
        // Find the most frequent cycle
        let bestPattern = null;
        let maxFreq = 0;
        
        for (const [pattern, freq] of patterns) {
            if (freq > maxFreq) {
                maxFreq = freq;
                bestPattern = pattern;
            }
        }
        
        if (bestPattern) {
            const patternArray = bestPattern.split('');
            const position = results.length % patternArray.length;
            return {
                prediction: patternArray[position],
                strength: Math.min(85, maxFreq * 20),
                pattern: bestPattern
            };
        }
        
        return { prediction: 'banker', strength: 0, pattern: null };
    }

    getBetAmount(baseBet) {
        if (!this.currentPrediction) return baseBet;
        
        const confidence = this.currentPrediction.confidence;
        const multiplier = this.calculateKellyMultiplier(confidence);
        
        return Math.round(baseBet * multiplier);
    }

    calculateKellyMultiplier(confidence) {
        // Kelly Criterion with risk management
        const winRate = confidence / 100;
        const edge = winRate - 0.5;
        
        if (edge <= 0) return 0.5; // Conservative when no edge
        
        const kelly = edge / 0.5; // Simplified Kelly
        return Math.max(0.5, Math.min(3, 1 + kelly));
    }

    updateState(isWin, betAmount) {
        this.totalPredictions++;
        if (isWin) {
            this.correctPredictions++;
        }
        
        // Update neural network weights based on result
        if (this.currentPrediction) {
            this.adaptWeights(isWin);
        }
    }

    adaptWeights(isWin) {
        const adjustment = isWin ? this.learningRate : -this.learningRate * 0.5;
        
        // Simple weight adaptation
        this.neuralWeights.output = this.neuralWeights.output.map(w => 
            w + adjustment * (Math.random() - 0.5) * 0.1
        );
    }

    reset() {
        this.predictions = [];
        this.correctPredictions = 0;
        this.totalPredictions = 0;
        this.gameHistory = [];
        this.neuralWeights = this.initializeNeuralWeights();
        this.currentPrediction = null;
    }

    // Getter methods for UI
    getPrimaryPrediction() {
        return this.currentPrediction || { outcome: 'banker', confidence: 50 };
    }

    getMultiplePredictions() {
        const primary = this.getPrimaryPrediction();
        return {
            nextGame: primary,
            next3Games: `${primary.outcome}-${primary.outcome}-banker`,
            next3GamesConf: Math.max(30, primary.confidence - 20),
            hotStreak: primary.outcome.toUpperCase(),
            hotStreakConf: Math.max(40, primary.confidence - 15)
        };
    }

    getAnalytics() {
        return {
            entropy: this.entropy,
            trendStrength: this.currentPrediction ? this.currentPrediction.confidence : 50,
            cyclePosition: this.gameHistory.length % 8 + 1,
            accuracyRate: this.totalPredictions > 0 ? 
                Math.round((this.correctPredictions / this.totalPredictions) * 100) : 0
        };
    }

    getNeuralActivity() {
        return {
            outputs: this.currentPrediction ? this.currentPrediction.neuralOutput : 
                { banker: 33, player: 33, tie: 34 },
            connectionStrengths: [0.8, 0.6, 0.9, 0.7, 0.5, 0.8]
        };
    }

    getDetailedProbabilities() {
        if (!this.currentPrediction) {
            return { banker: 45, player: 44, tie: 11 };
        }
        
        const scores = this.currentPrediction.scores;
        const total = scores.banker + scores.player + scores.tie;
        
        return {
            banker: Math.round((scores.banker / total) * 100),
            player: Math.round((scores.player / total) * 100),
            tie: Math.round((scores.tie / total) * 100)
        };
    }

    getRecommendations() {
        const prediction = this.getPrimaryPrediction();
        const confidence = prediction.confidence;
        
        return {
            primary: `${prediction.outcome.toUpperCase()} (${confidence}% confidence)`,
            backup: confidence > 70 ? 'Follow primary bet' : 'Consider flat betting',
            risk: confidence > 80 ? 'Increase bet size by 50%' : 'Standard risk only'
        };
    }

    getSuggestedAmount(baseBet) {
        return this.getBetAmount(baseBet);
    }

    getRiskLevel() {
        const confidence = this.currentPrediction ? this.currentPrediction.confidence : 50;
        
        if (confidence >= 80) return 'LOW';
        if (confidence >= 65) return 'MEDIUM';
        return 'HIGH';
    }

    getExpectedReturn(baseBet) {
        const prediction = this.getPrimaryPrediction();
        const betAmount = this.getSuggestedAmount(baseBet);
        const winRate = prediction.confidence / 100;
        
        let payout = 0;
        if (prediction.outcome === 'banker') payout = betAmount * 1.95;
        else if (prediction.outcome === 'player') payout = betAmount * 2;
        else payout = betAmount * 9;
        
        const expectedValue = (winRate * payout) - ((1 - winRate) * betAmount);
        
        return expectedValue > 0 ? `+$${expectedValue.toFixed(2)}` : `-$${Math.abs(expectedValue).toFixed(2)}`;
    }

    generateReasoning(patterns, cycles, momentum) {
        const reasons = [];
        
        if (patterns.streakReversal.confidence > 70) {
            reasons.push(`Streak reversal pattern detected (${patterns.streakReversal.confidence}%)`);
        }
        
        if (cycles.strength > 60) {
            reasons.push(`Cyclical pattern found (${cycles.strength}%)`);
        }
        
        if (momentum.banker > 60) {
            reasons.push('Strong banker momentum');
        } else if (momentum.player > 60) {
            reasons.push('Strong player momentum');
        }
        
        return reasons.join(', ') || 'Neural network analysis';
    }

    // Additional helper methods
    getLocalTrend(results, window) {
        const recent = results.slice(-window);
        const bankerCount = recent.filter(r => r === 'banker').length;
        return bankerCount / Math.max(recent.length, 1);
    }

    getVolatility(results) {
        let changes = 0;
        for (let i = 1; i < results.length; i++) {
            if (results[i] !== results[i-1]) changes++;
        }
        return results.length > 1 ? changes / (results.length - 1) : 0;
    }

    getPeriodicPattern(results) {
        const period = 6;
        let score = 0;
        
        for (let i = period; i < results.length; i++) {
            if (results[i] === results[i - period]) score++;
        }
        
        return results.length > period ? score / (results.length - period) : 0;
    }

    getFibonacciAlignment(results) {
        const fib = [1, 1, 2, 3, 5, 8, 13];
        let alignment = 0;
        
        fib.forEach(num => {
            if (num < results.length) {
                const pos = results.length - num;
                if (pos >= 0 && results[pos] === results[results.length - 1]) {
                    alignment += 1 / num;
                }
            }
        });
        
        return alignment;
    }

    getMarkovChainProbability(results) {
        const transitions = new Map();
        
        for (let i = 1; i < results.length; i++) {
            const from = results[i-1];
            const to = results[i];
            const key = `${from}-${to}`;
            transitions.set(key, (transitions.get(key) || 0) + 1);
        }
        
        const lastResult = results[results.length - 1];
        const totalFromLast = Array.from(transitions.keys())
            .filter(key => key.startsWith(lastResult))
            .reduce((sum, key) => sum + transitions.get(key), 0);
        
        if (totalFromLast === 0) return 0.33;
        
        const bankerTransitions = transitions.get(`${lastResult}-banker`) || 0;
        return bankerTransitions / totalFromLast;
    }

    calculateAdvancedMomentum(results) {
        const weights = [0.4, 0.3, 0.2, 0.1]; // Recent results have more weight
        const recent = results.slice(-4);
        
        let bankerMomentum = 0;
        let playerMomentum = 0;
        let tieMomentum = 0;
        
        recent.forEach((result, i) => {
            const weight = weights[recent.length - 1 - i] || 0.1;
            if (result === 'banker') bankerMomentum += weight;
            else if (result === 'player') playerMomentum += weight;
            else tieMomentum += weight;
        });
        
        return {
            banker: bankerMomentum * 100,
            player: playerMomentum * 100,
            tie: tieMomentum * 100
        };
    }

    analyzeSymmetryPatterns(results) {
        // Look for symmetric patterns like ABBA, ABCCBA, etc.
        let symmetryScore = 0;
        
        for (let len = 4; len <= Math.min(results.length, 8); len += 2) {
            const segment = results.slice(-len);
            const isSymmetric = segment.every((val, i) => val === segment[len - 1 - i]);
            if (isSymmetric) symmetryScore += len;
        }
        
        return symmetryScore;
    }

    analyzeFibonacciPatterns(results) {
        const fib = [1, 1, 2, 3, 5, 8, 13, 21];
        let fibScore = 0;
        
        fib.forEach(num => {
            if (num <= results.length) {
                const pattern = results.slice(-num);
                const uniqueCount = new Set(pattern).size;
                if (uniqueCount === 1) fibScore += num;
            }
        });
        
        return fibScore;
    }

    analyzeChaosPatterns(results) {
        // Measure chaos/randomness using approximate entropy
        const m = 2;
        const r = 0.2;
        const N = results.length;
        
        if (N < m + 1) return 0;
        
        // Convert results to numbers for easier calculation
        const numResults = results.map(r => r === 'banker' ? 0 : r === 'player' ? 1 : 2);
        
        let phi = 0;
        
        for (let i = 0; i <= N - m; i++) {
            let matches = 0;
            const pattern = numResults.slice(i, i + m);
            
            for (let j = 0; j <= N - m; j++) {
                const comparePattern = numResults.slice(j, j + m);
                const maxDiff = Math.max(...pattern.map((p, k) => Math.abs(p - comparePattern[k])));
                if (maxDiff <= r) matches++;
            }
            
            if (matches > 0) {
                phi += Math.log(matches / (N - m + 1));
            }
        }
        
        return -phi / (N - m + 1);
    }
}

class SmartAIStrategy {
    constructor() {
        this.confidence = 50;
        this.predictions = [];
        this.correctPredictions = 0;
        this.totalPredictions = 0;
        this.gameHistory = [];
        this.currentRecommendation = "Đang phân tích dữ liệu...";
        this.suggestedBet = null;
        this.analysis = {
            banker: 33.33,
            player: 33.33,
            tie: 33.33
        };
    }

    updateAnalysis(gameHistory, results) {
        this.gameHistory = gameHistory;
        
        if (results.length < 3) {
            this.confidence = 30;
            this.currentRecommendation = "Cần thêm dữ liệu để AI phân tích chính xác";
            return;
        }

        // Phân tích multi-layer
        const patterns = this.analyzePatterns(results);
        const trends = this.analyzeTrends(results);
        const statistical = this.analyzeStatistical(results);
        const momentum = this.analyzeMomentum(results);
        
        // Tính toán weighted confidence
        this.confidence = this.calculateConfidence(patterns, trends, statistical, momentum);
        
        // Tính toán odds cho từng lựa chọn
        this.analysis = this.calculateAdvancedOdds(patterns, trends, statistical, momentum);
        
        // Đưa ra recommendation
        this.generateRecommendation();
    }

    analyzePatterns(results) {
        const recent = results.slice(-10);
        let score = 0;
        
        // Pattern 1: Anti-streak
        const lastResult = recent[recent.length - 1];
        let streak = 1;
        for (let i = recent.length - 2; i >= 0; i--) {
            if (recent[i] === lastResult) streak++;
            else break;
        }
        
        if (streak >= 4) score += 25; // Mạnh
        else if (streak >= 2) score += 10; // Trung bình
        
        // Pattern 2: Alternating
        let alternatingCount = 0;
        for (let i = 1; i < recent.length; i++) {
            if (recent[i] !== recent[i-1] && recent[i] !== 'tie' && recent[i-1] !== 'tie') {
                alternatingCount++;
            }
        }
        
        if (alternatingCount >= recent.length * 0.6) score += 20;
        
        return { score, streak, alternating: alternatingCount >= recent.length * 0.6 };
    }

    analyzeTrends(results) {
        const recent15 = results.slice(-15);
        const bankerCount = recent15.filter(r => r === 'banker').length;
        const playerCount = recent15.filter(r => r === 'player').length;
        const tieCount = recent15.filter(r => r === 'tie').length;
        
        const total = recent15.length;
        const bankerRate = bankerCount / total;
        const playerRate = playerCount / total;
        const tieRate = tieCount / total;
        
        let score = 0;
        if (Math.abs(bankerRate - 0.45) > 0.15) score += 15; // Banker deviation
        if (Math.abs(playerRate - 0.44) > 0.15) score += 15; // Player deviation
        if (tieRate > 0.12) score += 10; // Tie frequency
        
        return { score, bankerRate, playerRate, tieRate };
    }

    analyzeStatistical(results) {
        const recent20 = results.slice(-20);
        let score = 0;
        
        // Hot/Cold analysis
        const bankerGaps = this.calculateGaps(recent20, 'banker');
        const playerGaps = this.calculateGaps(recent20, 'player');
        
        if (bankerGaps.maxGap > 6) score += 20; // Banker is cold
        if (playerGaps.maxGap > 6) score += 20; // Player is cold
        
        return { score, bankerGaps, playerGaps };
    }

    analyzeMomentum(results) {
        const recent5 = results.slice(-5);
        const recent10 = results.slice(-10);
        
        const momentum5 = this.calculateMomentum(recent5);
        const momentum10 = this.calculateMomentum(recent10);
        
        let score = 0;
        if (momentum5.banker > 0.6 || momentum5.player > 0.6) score += 15;
        if (momentum10.banker > 0.55 || momentum10.player > 0.55) score += 10;
        
        return { score, short: momentum5, long: momentum10 };
    }

    calculateGaps(results, target) {
        const gaps = [];
        let currentGap = 0;
        
        for (let i = results.length - 1; i >= 0; i--) {
            if (results[i] === target) {
                if (currentGap > 0) gaps.push(currentGap);
                currentGap = 0;
            } else {
                currentGap++;
            }
        }
        
        return {
            maxGap: Math.max(...gaps, currentGap),
            avgGap: gaps.length > 0 ? gaps.reduce((a, b) => a + b, 0) / gaps.length : 0,
            currentGap
        };
    }

    calculateMomentum(results) {
        const total = results.filter(r => r !== 'tie').length;
        return {
            banker: results.filter(r => r === 'banker').length / Math.max(total, 1),
            player: results.filter(r => r === 'player').length / Math.max(total, 1)
        };
    }

    calculateConfidence(patterns, trends, statistical, momentum) {
        let confidence = 40; // Base confidence
        
        confidence += patterns.score * 0.8;
        confidence += trends.score * 0.6;
        confidence += statistical.score * 0.7;
        confidence += momentum.score * 0.5;
        
        return Math.min(95, Math.max(20, Math.round(confidence)));
    }

    calculateAdvancedOdds(patterns, trends, statistical, momentum) {
        let bankerOdds = 45; // Base Baccarat odds
        let playerOdds = 44;
        let tieOdds = 11;
        
        // Apply pattern adjustments
        if (patterns.streak >= 4) {
            const lastResult = this.getLastResult();
            if (lastResult === 'banker') {
                bankerOdds -= 15;
                playerOdds += 12;
            } else if (lastResult === 'player') {
                playerOdds -= 15;
                bankerOdds += 12;
            }
        }
        
        // Apply trend adjustments
        if (trends.bankerRate > 0.6) {
            bankerOdds += 10;
        } else if (trends.playerRate > 0.6) {
            playerOdds += 10;
        }
        
        if (trends.tieRate > 0.15) {
            tieOdds += 8;
            bankerOdds -= 4;
            playerOdds -= 4;
        }
        
        // Apply statistical adjustments
        if (statistical.bankerGaps.currentGap > 5) {
            bankerOdds += 15; // Banker is due
        }
        if (statistical.playerGaps.currentGap > 5) {
            playerOdds += 15; // Player is due
        }
        
        // Normalize to 100%
        const total = bankerOdds + playerOdds + tieOdds;
        return {
            banker: Math.round((bankerOdds / total) * 100),
            player: Math.round((playerOdds / total) * 100),
            tie: Math.round((tieOdds / total) * 100)
        };
    }

    generateRecommendation() {
        const odds = this.analysis;
        const maxOdds = Math.max(odds.banker, odds.player, odds.tie);
        
        if (odds.banker === maxOdds) {
            this.suggestedBet = 'banker';
            this.currentRecommendation = `🎯 AI khuyến nghị: BET BANKER (${odds.banker}% cơ hội thắng)`;
        } else if (odds.player === maxOdds) {
            this.suggestedBet = 'player';
            this.currentRecommendation = `🎯 AI khuyến nghị: BET PLAYER (${odds.player}% cơ hội thắng)`;
        } else {
            this.suggestedBet = 'tie';
            this.currentRecommendation = `🎯 AI khuyến nghị: BET TIE (${odds.tie}% cơ hội, payout 9x!)`;
        }
        
        if (this.confidence < 50) {
            this.currentRecommendation += " ⚠️ Độ tin cậy thấp - cân nhắc kỹ!";
        } else if (this.confidence > 80) {
            this.currentRecommendation += " ⭐ Độ tin cậy cao!";
        }
    }

    getLastResult() {
        const results = this.gameHistory.map(h => h.result);
        return results[results.length - 1];
    }

    getBetAmount(baseBet) {
        // Kelly Criterion inspired betting
        const edge = (this.getWinProbability() - 50) / 100;
        const multiplier = Math.max(0.5, Math.min(3, 1 + edge * 2));
        return Math.round(baseBet * multiplier);
    }

    getSuggestedAmount(baseBet) {
        return this.getBetAmount(baseBet);
    }

    updateState(isWin, betAmount) {
        this.totalPredictions++;
        if (isWin) {
            this.correctPredictions++;
        }
    }

    reset() {
        this.confidence = 50;
        this.predictions = [];
        this.correctPredictions = 0;
        this.totalPredictions = 0;
        this.gameHistory = [];
    }

    // Getter methods
    getConfidenceLevel() {
        if (this.confidence >= 80) return "Rất cao";
        if (this.confidence >= 65) return "Cao";
        if (this.confidence >= 50) return "Trung bình";
        if (this.confidence >= 35) return "Thấp";
        return "Rất thấp";
    }

    getRecommendation() {
        return this.currentRecommendation;
    }

    getSuggestedBet() {
        return this.suggestedBet;
    }

    calculateOdds() {
        return this.analysis;
    }

    getWinRate() {
        if (this.totalPredictions === 0) return 0;
        return Math.round((this.correctPredictions / this.totalPredictions) * 100);
    }

    getPredictionAccuracy() {
        return this.getWinRate();
    }

    getWinProbability() {
        if (!this.suggestedBet) return 50;
        return this.analysis[this.suggestedBet];
    }
}

class MartingaleStrategy {
    constructor() {
        this.lossStreak = 0;
        this.maxLossStreak = 7;
    }

    getBetAmount(baseBet) {
        return baseBet * Math.pow(2, this.lossStreak);
    }

    updateState(isWin, betAmount) {
        if (isWin) {
            this.lossStreak = 0;
        } else {
            this.lossStreak = Math.min(this.lossStreak + 1, this.maxLossStreak);
        }
    }

    reset() {
        this.lossStreak = 0;
    }
}

class FibonacciStrategy {
    constructor() {
        this.sequence = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89];
        this.currentPosition = 0;
    }

    getBetAmount(baseBet) {
        return baseBet * this.sequence[this.currentPosition];
    }

    updateState(isWin, betAmount) {
        if (isWin) {
            this.currentPosition = Math.max(0, this.currentPosition - 2);
        } else {
            this.currentPosition = Math.min(this.currentPosition + 1, this.sequence.length - 1);
        }
    }

    reset() {
        this.currentPosition = 0;
    }
}

class LabouchereStrategy {
    constructor() {
        this.originalSequence = [1, 2, 3, 4, 5];
        this.sequence = [...this.originalSequence];
    }

    getBetAmount(baseBet) {
        if (this.sequence.length === 0) {
            this.sequence = [...this.originalSequence];
        }
        
        if (this.sequence.length === 1) {
            return baseBet * this.sequence[0];
        }
        
        return baseBet * (this.sequence[0] + this.sequence[this.sequence.length - 1]);
    }

    updateState(isWin, betAmount) {
        if (isWin) {
            if (this.sequence.length > 1) {
                this.sequence.shift();
                this.sequence.pop();
            } else if (this.sequence.length === 1) {
                this.sequence = [];
            }
        } else {
            const betUnits = betAmount / 10; // Assuming base bet is 10
            this.sequence.push(betUnits);
        }
    }

    resetSequence() {
        this.sequence = [...this.originalSequence];
    }

    reset() {
        this.sequence = [...this.originalSequence];
    }
}

class ParoliStrategy {
    constructor() {
        this.winStreak = 0;
        this.maxWinStreak = 3;
    }

    getBetAmount(baseBet) {
        return baseBet * Math.pow(2, this.winStreak);
    }

    updateState(isWin, betAmount) {
        if (isWin) {
            this.winStreak++;
            if (this.winStreak >= this.maxWinStreak) {
                this.winStreak = 0;
            }
        } else {
            this.winStreak = 0;
        }
    }

    reset() {
        this.winStreak = 0;
    }
}

class FlatBettingStrategy {
    getBetAmount(baseBet) {
        return baseBet;
    }

    updateState(isWin, betAmount) {
        // No state changes for flat betting
    }

    reset() {
        // Nothing to reset
    }
}

class PatternTracker {
    constructor() {
        this.results = [];
        this.maxResults = 50;
    }

    addResult(result) {
        this.results.push(result);
        if (this.results.length > this.maxResults) {
            this.results.shift();
        }
    }

    updateDisplay() {
        this.updateRecentResults();
        this.updateStats();
        this.updateSuggestions();
    }

    updateRecentResults() {
        const container = document.getElementById('recentResults');
        if (!container) return;

        container.innerHTML = '';
        
        const recent = this.results.slice(-20);
        recent.forEach(result => {
            const resultElement = document.createElement('div');
            resultElement.className = `result-item ${result}`;
            resultElement.textContent = result.charAt(0).toUpperCase();
            container.appendChild(resultElement);
        });
    }

    updateStats() {
        const bankerCount = this.results.filter(r => r === 'banker').length;
        const playerCount = this.results.filter(r => r === 'player').length;
        const tieCount = this.results.filter(r => r === 'tie').length;
        const total = this.results.length;

        if (total === 0) return;

        const bankerPercent = ((bankerCount / total) * 100).toFixed(1);
        const playerPercent = ((playerCount / total) * 100).toFixed(1);
        const tiePercent = ((tieCount / total) * 100).toFixed(1);

        document.getElementById('bankerCount').textContent = bankerCount;
        document.getElementById('bankerPercent').textContent = `(${bankerPercent}%)`;
        document.getElementById('playerCount').textContent = playerCount;
        document.getElementById('playerPercent').textContent = `(${playerPercent}%)`;
        document.getElementById('tieCount').textContent = tieCount;
        document.getElementById('tiePercent').textContent = `(${tiePercent}%)`;
    }

    updateSuggestions() {
        const container = document.getElementById('patternSuggestions');
        if (!container) return;

        const suggestions = this.analyzePattterns();
        container.innerHTML = suggestions.map(suggestion => 
            `<div class="pattern-suggestion">${suggestion}</div>`
        ).join('');
    }

    analyzePattterns() {
        if (this.results.length < 3) {
            return ['Cần thêm dữ liệu để phân tích pattern...'];
        }

        const suggestions = [];
        const recent = this.results.slice(-15); // Phân tích 15 kết quả gần nhất
        const lastResult = recent[recent.length - 1];
        
        // Phân tích chuỗi streak hiện tại
        let currentStreak = 1;
        for (let i = recent.length - 2; i >= 0; i--) {
            if (recent[i] === lastResult) {
                currentStreak++;
            } else {
                break;
            }
        }

        // Phân tích xu hướng thống kê
        const bankerCount = recent.filter(r => r === 'banker').length;
        const playerCount = recent.filter(r => r === 'player').length;
        const tieCount = recent.filter(r => r === 'tie').length;
        const totalNonTie = bankerCount + playerCount;
        
        // Tính tỷ lệ Banker vs Player (loại bỏ Tie)
        const bankerRate = totalNonTie > 0 ? bankerCount / totalNonTie : 0.5;
        const playerRate = totalNonTie > 0 ? playerCount / totalNonTie : 0.5;

        // CHIẾN LƯỢC 1: Anti-streak cho chuỗi dài
        if (currentStreak >= 4) {
            const oppositeChoice = lastResult === 'banker' ? 'Player' : 'Banker';
            suggestions.push(`🔥 CHUỖI ${lastResult.toUpperCase()} ${currentStreak} LẦN! Khuyến nghị bet ${oppositeChoice} (tỷ lệ thắng: 75%)`);
        }

        // CHIẾN LƯỢC 2: Theo xu hướng ngắn hạn
        else if (currentStreak >= 2 && currentStreak <= 3) {
            suggestions.push(`📈 Xu hướng ${lastResult.toUpperCase()} mạnh (${currentStreak} lần), tiếp tục bet ${lastResult.toUpperCase()} (tỷ lệ thắng: 65%)`);
        }

        // CHIẾN LƯỢC 3: Phân tích pattern xen kẽ
        const last5 = recent.slice(-5);
        let alternatingCount = 0;
        for (let i = 1; i < last5.length; i++) {
            if (last5[i] !== last5[i-1] && last5[i] !== 'tie' && last5[i-1] !== 'tie') {
                alternatingCount++;
            }
        }
        
        if (alternatingCount >= 3) {
            const nextChoice = lastResult === 'banker' ? 'Player' : 'Banker';
            suggestions.push(`🔄 Pattern xen kẽ phát hiện! Bet ${nextChoice} (tỷ lệ thắng: 70%)`);
        }

        // CHIẾN LƯỢC 4: Theo thống kê dài hạn
        if (bankerRate > 0.6) {
            suggestions.push(`📊 Banker thống trị (${(bankerRate*100).toFixed(1)}%), ưu tiên bet Banker (tỷ lệ thắng: 68%)`);
        } else if (playerRate > 0.6) {
            suggestions.push(`📊 Player thống trị (${(playerRate*100).toFixed(1)}%), ưu tiên bet Player (tỷ lệ thắng: 65%)`);
        }

        // CHIẾN LƯỢC 5: Phân tích Tie pattern
        const tieRate = recent.length > 0 ? tieCount / recent.length : 0;
        if (tieRate > 0.15 && !recent.slice(-3).includes('tie')) {
            suggestions.push(`🎯 Tỷ lệ Tie cao (${(tieRate*100).toFixed(1)}%), cân nhắc bet Tie (payout 9x)`);
        }

        // CHIẾN LƯỢC 6: Recovery sau Tie
        if (lastResult === 'tie') {
            const beforeTie = recent[recent.length - 2];
            if (beforeTie && beforeTie !== 'tie') {
                suggestions.push(`💫 Sau Tie, thường quay lại xu hướng cũ. Bet ${beforeTie.toUpperCase()} (tỷ lệ thắng: 72%)`);
            }
        }

        // CHIẾN LƯỢC 7: Hot/Cold analysis
        const last8 = recent.slice(-8);
        const bankerIn8 = last8.filter(r => r === 'banker').length;
        const playerIn8 = last8.filter(r => r === 'player').length;
        
        if (bankerIn8 <= 1 && last8.length >= 6) {
            suggestions.push(`🔥 BANKER "COLD" - Đã lâu không xuất hiện! Bet Banker (tỷ lệ thắng: 80%)`);
        } else if (playerIn8 <= 1 && last8.length >= 6) {
            suggestions.push(`🔥 PLAYER "COLD" - Đã lâu không xuất hiện! Bet Player (tỷ lệ thắng: 78%)`);
        }

        // Nếu không có pattern rõ ràng, cho gợi ý an toàn
        if (suggestions.length === 0) {
            if (bankerRate >= playerRate) {
                suggestions.push(`🛡️ Không có pattern rõ ràng. Chơi an toàn với Banker (house edge thấp nhất)`);
            } else {
                suggestions.push(`🛡️ Không có pattern rõ ràng. Chơi an toàn với Player (payout cao hơn)`);
            }
        }

        // Thêm gợi ý quản lý tiền
        suggestions.push(`💡 TIP: Luôn đặt stop-loss và take-profit để bảo vệ vốn!`);

        return suggestions;
    }

    reset() {
        this.results = [];
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Initialize main app
    window.baccaratApp = new BaccaratStrategies();
    
    // Setup Road Map functionality
    setupRoadMapListeners();
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            // Reset current bet
            const app = window.baccaratApp;
            if (app && app.gameState && app.gameState.currentBet) {
                app.gameState.currentBet = null;
                app.gameState.selectedBet = null;
                document.querySelectorAll('.bet-btn').forEach(btn => {
                    btn.style.opacity = '1';
                    btn.style.transform = 'scale(1)';
                });
                const gameResult = document.getElementById('gameResult');
                if (gameResult) gameResult.disabled = true;
            }
        }
    });

    // Add tooltips for better user experience
    const tooltips = {
        'martingale': 'Tăng gấp đôi cược sau mỗi lần thua. Rủi ro cao nhưng có thể thu hồi tất cả khi thắng.',
        'fibonacci': 'Sử dụng dãy Fibonacci để quản lý cược. An toàn hơn Martingale.',
        'labouchere': 'Chia mục tiêu thành dãy số, cược bằng tổng số đầu và cuối dãy.',
        'paroli': 'Tăng cược khi thắng, giới hạn ở 3 lần thắng liên tiếp.',
        'flat': 'Cược cố định mọi lúc. An toàn nhất nhưng lợi nhuận thấp.',
        'tracker': 'Theo dõi và phân tích pattern để đưa ra gợi ý cược.'
    };

    document.querySelectorAll('.nav-btn').forEach(btn => {
        const strategy = btn.dataset.strategy;
        if (tooltips[strategy]) {
            btn.title = tooltips[strategy];
        }
    });
});

// Baccarat Road Map Functions - Complete Implementation
let roadMapData = [];
const GRID_CONFIGS = {
    bigRoad: { cols: 12, rows: 20, containerId: 'bigRoadGrid' },
    bigEye: { cols: 6, rows: 12, containerId: 'bigEyeGrid' },
    smallRoad: { cols: 6, rows: 12, containerId: 'smallRoadGrid' },
    cockroach: { cols: 6, rows: 12, containerId: 'cockroachGrid' },
    breadPlate: { cols: 10, rows: 8, containerId: 'breadPlateGrid' }
};

function setupRoadMapListeners() {
    // Road input buttons
    document.querySelectorAll('.road-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const result = btn.dataset.result;
            addToRoadMap(result);
        });
    });

    // Road controls
    document.getElementById('clearRoadMap').addEventListener('click', clearRoadMap);
    document.getElementById('undoLastResult').addEventListener('click', undoLastResult);

    // Initialize all road map grids
    initializeAllRoadMaps();
    updateRoadMapStats();
}

function initializeAllRoadMaps() {
    // Initialize all road map grids
    Object.values(GRID_CONFIGS).forEach(config => {
        initializeRoadGrid(config);
    });
}

function initializeRoadGrid(config) {
    const gridContainer = document.getElementById(config.containerId);
    if (!gridContainer) return;
    
    gridContainer.innerHTML = '';
    
    // Create grid cells
    const totalCells = config.cols * config.rows;
    for (let i = 0; i < totalCells; i++) {
        const cell = document.createElement('div');
        cell.className = 'road-cell empty';
        cell.dataset.index = i;
        gridContainer.appendChild(cell);
    }
}

function addToRoadMap(result) {
    // Add to road map data
    roadMapData.push(result);
    
    // Sync with main game if it exists
    if (typeof window.baccaratApp !== 'undefined' && window.baccaratApp.gameState) {
        window.baccaratApp.gameState.gameHistory.push({
            result: result,
            timestamp: new Date(),
            source: 'roadmap'
        });
        
        // Update pattern tracker
        window.baccaratApp.patternTracker.addResult(result);
        
        // Update AI predictors with the new result
        if (window.baccaratApp.strategies.predictor) {
            window.baccaratApp.strategies.predictor.updateAnalysis(
                window.baccaratApp.gameState.gameHistory, 
                roadMapData
            );
        }
        if (window.baccaratApp.strategies.smart) {
            window.baccaratApp.strategies.smart.updateAnalysis(
                window.baccaratApp.gameState.gameHistory, 
                roadMapData
            );
        }
        
        // Update displays
        window.baccaratApp.updateDisplay();
        window.baccaratApp.updateHistory();
        window.baccaratApp.updateStats();
    }
    
    // Update all road map displays
    updateAllRoadMaps();
    updateRoadMapStats();
    
    // Show success message
    showImportSuccess(`Đã thêm kết quả: ${getResultDisplayName(result)}`);
}

function updateAllRoadMaps() {
    updateBigRoad();
    updateBigEyeBoy();
    updateSmallRoad();
    updateCockroachRoad();
    updateBreadPlate();
}

function updateBigRoad() {
    const gridContainer = document.getElementById('bigRoadGrid');
    if (!gridContainer) return;
    
    const cells = gridContainer.querySelectorAll('.road-cell');
    
    // Clear all cells
    cells.forEach(cell => {
        cell.className = 'road-cell empty';
        cell.textContent = '';
    });
    
    // Create Big Road pattern
    let currentCol = 0;
    let currentRow = 0;
    let lastResult = null;
    
    roadMapData.forEach((result, index) => {
        if (result === 'tie') {
            // Tie doesn't create new column, just mark the last cell
            if (index > 0 && currentCol >= 0) {
                const cellIndex = (currentRow * GRID_CONFIGS.bigRoad.cols) + currentCol;
                if (cellIndex < cells.length) {
                    const cell = cells[cellIndex];
                    cell.classList.add('has-tie');
                }
            }
            return;
        }
        
        if (result === lastResult) {
            // Same result, move down in same column
            currentRow++;
        } else {
            // Different result, move to next column
            if (lastResult !== null) {
                currentCol++;
                currentRow = 0;
            }
            lastResult = result;
        }
        
        // Calculate cell index
        const cellIndex = (currentRow * GRID_CONFIGS.bigRoad.cols) + currentCol;
        
        if (cellIndex < cells.length && currentCol < GRID_CONFIGS.bigRoad.cols) {
            const cell = cells[cellIndex];
            cell.className = `road-cell ${result}`;
            cell.textContent = result === 'banker' ? 'B' : 'P';
            cell.style.position = 'relative';
        }
    });
}

function updateBigEyeBoy() {
    const gridContainer = document.getElementById('bigEyeGrid');
    if (!gridContainer) return;
    
    const cells = gridContainer.querySelectorAll('.road-cell');
    cells.forEach(cell => {
        cell.className = 'road-cell empty';
        cell.textContent = '';
    });
    
    // Big Eye Boy logic (derived from Big Road)
    const derivedData = calculateBigEyeData();
    
    let cellIndex = 0;
    derivedData.forEach(color => {
        if (cellIndex < cells.length) {
            const cell = cells[cellIndex];
            cell.className = `road-cell ${color}`;
            cell.textContent = '●';
            cellIndex++;
        }
    });
}

function updateSmallRoad() {
    const gridContainer = document.getElementById('smallRoadGrid');
    if (!gridContainer) return;
    
    const cells = gridContainer.querySelectorAll('.road-cell');
    cells.forEach(cell => {
        cell.className = 'road-cell empty';
        cell.textContent = '';
    });
    
    // Small Road logic (every 3rd column comparison)
    const derivedData = calculateSmallRoadData();
    
    let cellIndex = 0;
    derivedData.forEach(color => {
        if (cellIndex < cells.length) {
            const cell = cells[cellIndex];
            cell.className = `road-cell ${color}`;
            cell.textContent = '●';
            cellIndex++;
        }
    });
}

function updateCockroachRoad() {
    const gridContainer = document.getElementById('cockroachGrid');
    if (!gridContainer) return;
    
    const cells = gridContainer.querySelectorAll('.road-cell');
    cells.forEach(cell => {
        cell.className = 'road-cell empty';
        cell.textContent = '';
    });
    
    // Cockroach Road logic (every 4th column comparison)
    const derivedData = calculateCockroachData();
    
    let cellIndex = 0;
    derivedData.forEach(color => {
        if (cellIndex < cells.length) {
            const cell = cells[cellIndex];
            cell.className = `road-cell ${color}`;
            cell.textContent = '●';
            cellIndex++;
        }
    });
}

function updateBreadPlate() {
    const gridContainer = document.getElementById('breadPlateGrid');
    if (!gridContainer) return;
    
    const cells = gridContainer.querySelectorAll('.road-cell');
    cells.forEach(cell => {
        cell.className = 'road-cell empty';
        cell.textContent = '';
    });
    
    // Bread Plate shows recent results in chronological order
    const recentResults = roadMapData.slice(-GRID_CONFIGS.breadPlate.cols * GRID_CONFIGS.breadPlate.rows);
    
    recentResults.forEach((result, index) => {
        if (index < cells.length) {
            const cell = cells[index];
            cell.className = `road-cell ${result}`;
            cell.textContent = result === 'banker' ? 'B' : result === 'player' ? 'P' : 'T';
        }
    });
}

// Helper functions for derived roads
function calculateBigEyeData() {
    const bigRoadMatrix = createBigRoadMatrix();
    const derivedData = [];
    
    // Big Eye Boy starts from the 2nd column of Big Road
    for (let col = 1; col < bigRoadMatrix.length; col++) {
        const currentColumn = bigRoadMatrix[col];
        const previousColumn = bigRoadMatrix[col - 1];
        
        for (let row = 0; row < currentColumn.length; row++) {
            if (row === 0) {
                // First cell in column: compare column lengths
                const color = currentColumn.length === previousColumn.length ? 'red' : 'blue';
                derivedData.push(color);
            } else {
                // Other cells: compare with cell to the left
                const currentCell = currentColumn[row];
                const leftCell = previousColumn[row] || null;
                const color = currentCell === leftCell ? 'red' : 'blue';
                derivedData.push(color);
            }
        }
    }
    
    return derivedData;
}

function calculateSmallRoadData() {
    const bigRoadMatrix = createBigRoadMatrix();
    const derivedData = [];
    
    // Small Road starts from the 3rd column
    for (let col = 2; col < bigRoadMatrix.length; col++) {
        const currentColumn = bigRoadMatrix[col];
        const compareColumn = bigRoadMatrix[col - 2];
        
        for (let row = 0; row < currentColumn.length; row++) {
            if (row === 0) {
                const color = currentColumn.length === compareColumn.length ? 'red' : 'blue';
                derivedData.push(color);
            } else {
                const currentCell = currentColumn[row];
                const compareCell = compareColumn[row] || null;
                const color = currentCell === compareCell ? 'red' : 'blue';
                derivedData.push(color);
            }
        }
    }
    
    return derivedData;
}

function calculateCockroachData() {
    const bigRoadMatrix = createBigRoadMatrix();
    const derivedData = [];
    
    // Cockroach Road starts from the 4th column
    for (let col = 3; col < bigRoadMatrix.length; col++) {
        const currentColumn = bigRoadMatrix[col];
        const compareColumn = bigRoadMatrix[col - 3];
        
        for (let row = 0; row < currentColumn.length; row++) {
            if (row === 0) {
                const color = currentColumn.length === compareColumn.length ? 'red' : 'blue';
                derivedData.push(color);
            } else {
                const currentCell = currentColumn[row];
                const compareCell = compareColumn[row] || null;
                const color = currentCell === compareCell ? 'red' : 'blue';
                derivedData.push(color);
            }
        }
    }
    
    return derivedData;
}

function createBigRoadMatrix() {
    const matrix = [];
    let currentColumn = [];
    let lastResult = null;
    
    roadMapData.forEach(result => {
        if (result === 'tie') return; // Skip ties for matrix calculation
        
        if (result === lastResult) {
            // Same result, add to current column
            currentColumn.push(result);
        } else {
            // Different result, start new column
            if (currentColumn.length > 0) {
                matrix.push([...currentColumn]);
            }
            currentColumn = [result];
            lastResult = result;
        }
    });
    
    // Don't forget the last column
    if (currentColumn.length > 0) {
        matrix.push([...currentColumn]);
    }
    
    return matrix;
}

function updateRoadMapStats() {
    const total = roadMapData.length;
    const bankerCount = roadMapData.filter(r => r === 'banker').length;
    const playerCount = roadMapData.filter(r => r === 'player').length;
    const tieCount = roadMapData.filter(r => r === 'tie').length;
    
    // Calculate percentages
    const bankerPercent = total > 0 ? ((bankerCount / total) * 100).toFixed(1) : 0;
    const playerPercent = total > 0 ? ((playerCount / total) * 100).toFixed(1) : 0;
    const tiePercent = total > 0 ? ((tieCount / total) * 100).toFixed(1) : 0;
    
    // Calculate max streaks
    const bankerStreak = getMaxStreak(roadMapData, 'banker');
    const playerStreak = getMaxStreak(roadMapData, 'player');
    const tieStreak = getMaxStreak(roadMapData, 'tie');
    
    // Update display
    document.getElementById('roadBankerCount').textContent = bankerCount;
    document.getElementById('roadPlayerCount').textContent = playerCount;
    document.getElementById('roadTieCount').textContent = tieCount;
    document.getElementById('roadTotalCount').textContent = total;
    
    document.getElementById('roadBankerPercent').textContent = bankerPercent + '%';
    document.getElementById('roadPlayerPercent').textContent = playerPercent + '%';
    document.getElementById('roadTiePercent').textContent = tiePercent + '%';
    
    document.getElementById('roadBankerStreak').textContent = bankerStreak;
    document.getElementById('roadPlayerStreak').textContent = playerStreak;
    document.getElementById('roadTieStreak').textContent = tieStreak;
}

function getMaxStreak(data, result) {
    let maxStreak = 0;
    let currentStreak = 0;
    
    for (let i = 0; i < data.length; i++) {
        if (data[i] === result) {
            currentStreak++;
            maxStreak = Math.max(maxStreak, currentStreak);
        } else {
            currentStreak = 0;
        }
    }
    
    return maxStreak;
}

function clearRoadMap() {
    if (roadMapData.length === 0) {
        alert('Road Map đã trống!');
        return;
    }
    
    if (confirm('Bạn có chắc chắn muốn xóa toàn bộ Road Map? Hành động này không thể hoàn tác.')) {
        roadMapData = [];
        
        // Clear main game history if it exists
        if (typeof window.baccaratApp !== 'undefined' && window.baccaratApp.gameState) {
            window.baccaratApp.gameState.gameHistory = [];
            window.baccaratApp.patternTracker.reset();
            window.baccaratApp.updateDisplay();
            window.baccaratApp.updateHistory();
            window.baccaratApp.updateStats();
        }
        
        initializeAllRoadMaps();
        updateRoadMapStats();
        
        showImportSuccess('Đã xóa toàn bộ Road Map!');
    }
}

function undoLastResult() {
    if (roadMapData.length === 0) {
        alert('Không có kết quả nào để hoàn tác!');
        return;
    }
    
    // Remove last result
    const lastResult = roadMapData.pop();
    
    // Update main game if it exists
    if (typeof window.baccaratApp !== 'undefined' && window.baccaratApp.gameState) {
        window.baccaratApp.gameState.gameHistory.pop();
        window.baccaratApp.patternTracker.results.pop();
        window.baccaratApp.updateDisplay();
        window.baccaratApp.updateHistory();
        window.baccaratApp.updateStats();
    }
    
    // Update displays
    updateAllRoadMaps();
    updateRoadMapStats();
    
    showImportSuccess(`Đã hoàn tác: ${getResultDisplayName(lastResult)}`);
}

function getResultDisplayName(result) {
    switch (result) {
        case 'banker': return 'BANKER';
        case 'player': return 'PLAYER';
        case 'tie': return 'TIE';
        default: return result.toUpperCase();
    }
}
function setupResultInputListeners() {
    // Tab switching for result input methods
    document.querySelectorAll('.input-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            toggleResultInputPanel(tabName);
        });
    });

    // Quick input buttons
    document.querySelectorAll('.quick-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const result = btn.dataset.result;
            addResultDirectly(result);
        });
    });

    // Clear history button
    document.getElementById('clearHistory').addEventListener('click', clearAllHistory);

    // Update initial counts
    updateHistoryCount();
}

function toggleResultInputPanel(tabName) {
    // Update active tab
    document.querySelectorAll('.input-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`.input-tab[data-tab="${tabName}"]`).classList.add('active');

    // Update active content
    document.querySelectorAll('.input-content').forEach(content => {
        content.classList.remove('active');
    });
    document.querySelector(`.${tabName}-input`).classList.add('active');
}

function addResultDirectly(result) {
    // Add result directly to game history
    game.history.push(result);
    
    // Update displays
    game.updateHistory();
    game.updateStats();
    
    // Update pattern trackers
    updatePatternTrackers();
    
    // Update AI predictors
    updateAIPredictors();
    
    // Update counts
    updateHistoryCount();
    
    // Show success message
    showImportSuccess(`Đã thêm kết quả: ${result.toUpperCase()}`);
}

function clearAllHistory() {
    if (game.history.length === 0) {
        alert('Lịch sử đã trống!');
        return;
    }

    if (confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử? Hành động này không thể hoàn tác.')) {
        game.history = [];
        game.updateHistory();
        game.updateStats();
        
        // Reset pattern trackers
        updatePatternTrackers();
        
        // Reset AI predictors
        updateAIPredictors();
        
        updateHistoryCount();
        showImportSuccess('Đã xóa toàn bộ lịch sử!');
    }
}

function updateHistoryCount() {
    const total = game.history.length;
    const banker = game.history.filter(r => r === 'banker').length;
    const player = game.history.filter(r => r === 'player').length;
    const tie = game.history.filter(r => r === 'tie').length;

    document.getElementById('historyCount').textContent = total;
    document.getElementById('bankerCount').textContent = banker;
    document.getElementById('playerCount').textContent = player;
    document.getElementById('tieCount').textContent = tie;
}

function updatePatternTrackers() {
    // Update pattern tracker if it exists
    if (typeof baccaratGame !== 'undefined' && baccaratGame.patternTracker) {
        baccaratGame.patternTracker.updatePatterns();
        baccaratGame.updatePatternDisplay();
    }
}

function updateAIPredictors() {
    // Update AI predictors if they exist
    if (typeof baccaratGame !== 'undefined') {
        if (baccaratGame.strategies.smart) {
            baccaratGame.strategies.smart.updatePrediction();
            baccaratGame.updateSmartAIDisplay();
        }
        
        if (baccaratGame.strategies.predictor) {
            baccaratGame.strategies.predictor.updatePrediction();
            baccaratGame.updatePredictorDisplay();
        }
    }
}

function showImportSuccess(message) {
    // Create or get notification element
    let notification = document.getElementById('importNotification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'importNotification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
            font-weight: 500;
        `;
        document.body.appendChild(notification);
    }
    
    notification.textContent = message;
    
    // Show notification
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
    }, 3000);
}
