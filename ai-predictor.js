
// Ultimate Baccarat AI: Multi-Strategy Professional Predictor
// Sử dụng nhiều thuật toán mạnh nhất: Streak, Chop, Pattern, Dynamic Prob, Consensus

class UltimateBaccaratAI {
    detectUltraLocalBias(history) {
        // Bias cực ngắn 4-6 hand gần nhất
        for (let w of [4,5,6]) {
            let recent = history.slice(-w).filter(x=>x!=='T');
            let b = recent.filter(x=>x==='B').length;
            let p = recent.filter(x=>x==='P').length;
            let total = b+p;
            if (total < 3) continue;
            if (b/total > 0.66) return 'B';
            if (p/total > 0.66) return 'P';
        }
        return null;
    }
    detectMajorityBias(history, biasType, strict=true) {
        // Nếu bias chiếm đa số trong 5-7 hand gần nhất (kể cả alternating/tie xen kẽ)
        let arr = history.filter(x=>x!=='T');
        let last7 = arr.slice(-7);
        let last5 = arr.slice(-5);
        let count7 = last7.filter(x=>x===biasType).length;
        let count5 = last5.filter(x=>x===biasType).length;
        if (strict) {
            if (count7 >= 5 || count5 >= 4) return true;
        } else {
            if (count7 >= 4 || count5 >= 3) return true;
        }
        return false;
    }
    detectLongRunSwitch(history) {
        // Nếu vừa có run dài (>=5) rồi đảo chiều hoặc alternating
        let arr = history.filter(x=>x!=='T');
        if (arr.length < 8) return false;
        let run = 1;
        for (let i = arr.length-1; i > 0; i--) {
            if (arr[i] === arr[i-1]) run++;
            else break;
        }
        if (run >= 5) {
            let before = arr[arr.length-run-1];
            let last = arr[arr.length-1];
            if (before && before !== last) {
                // Đảo chiều sau run dài
                return {from: before, to: last, run};
            }
        }
        return false;
    }

    detectLocalBias(history, window=10) {
        // Bias local mạnh trong 8-12 hand gần nhất
        let recent = history.slice(-window).filter(x=>x!=='T');
        let b = recent.filter(x=>x==='B').length;
        let p = recent.filter(x=>x==='P').length;
        let total = b+p;
        if (total < 6) return null;
        if (b/total > 0.62) return 'B';
        if (p/total > 0.62) return 'P';
        return null;
    }
    detectAlternatingTiePattern(history) {
        // Nhận diện tie xen kẽ đều (B T B T, P T P T, ...)
        if (history.length < 6) return false;
        let arr = history.slice(-6);
        // Pattern: X T X T X T hoặc T X T X T X
        let altTie1 = true, altTie2 = true;
        for (let i = 0; i < arr.length; i++) {
            if (i % 2 === 0 && arr[i] !== 'T') altTie1 = false;
            if (i % 2 === 1 && arr[i] === 'T') altTie1 = false;
            if (i % 2 === 1 && arr[i] !== 'T') altTie2 = false;
            if (i % 2 === 0 && arr[i] === 'T') altTie2 = false;
        }
        return altTie1 || altTie2;
    }

    detectLooseTiePattern(history) {
        // Nếu trong 7 hand gần nhất có >=2 tie, các tie cách nhau đúng 2 hoặc 3 hand
        let recent = history.slice(-7);
        let tieIdx = [];
        for (let i=0;i<recent.length;i++) if (recent[i]==='T') tieIdx.push(i);
        if (tieIdx.length >= 2) {
            let diffs = tieIdx.slice(1).map((v,i)=>v-tieIdx[i]);
            if (diffs.every(d=>d===2 || d===3)) return true;
        }
        return false;
    }

    detectSoftBias(history, window=16) {
        // Bias nhẹ, bias động
        let recent = history.slice(-window).filter(x=>x!=='T');
        let b = recent.filter(x=>x==='B').length;
        let p = recent.filter(x=>x==='P').length;
        let total = b+p;
        if (total < 8) return null;
        if (b/total > 0.54 && b/total <= 0.58) return 'B';
        if (p/total > 0.54 && p/total <= 0.58) return 'P';
        return null;
    }
    constructor() {
        this.patternStats = {};
        this.fallbackRandom = () => (Math.random() < 0.5 ? 'B' : 'P');
        this.lastResults = [];
        this.lastPredictions = [];
    }

    updatePatternStats(history) {
        // Lưu pattern con độ dài 3–8
        for (let len = 3; len <= 8; len++) {
            for (let i = 0; i <= history.length - len - 1; i++) {
                const pattern = history.slice(i, i + len).join('');
                const next = history[i + len];
                if (!this.patternStats[pattern]) this.patternStats[pattern] = {B:0, P:0, T:0};
                this.patternStats[pattern][next] = (this.patternStats[pattern][next] || 0) + 1;
            }
        }
    }

    hybridPatternScore(history) {
        // Kết hợp nhiều pattern con, tính điểm cho từng dự đoán
        let scores = {B:0, P:0, T:0};
        let usedPatterns = [];
        for (let len = 8; len >= 3; len--) {
            if (history.length < len) continue;
            const pattern = history.slice(-len).join('');
            if (this.patternStats[pattern]) {
                let stats = this.patternStats[pattern];
                for (let k of ['B','P','T']) {
                    if (stats[k] > 0) {
                        scores[k] += stats[k] * (len + 1); // pattern dài hơn trọng số cao hơn
                    }
                }
                usedPatterns.push({pattern, stats});
            }
        }
        return {scores, usedPatterns};
    }

    detectCluster(history) {
        // Nhận diện cluster tie hoặc cluster B/P bất thường
        let last = history[history.length-1];
        let count = 1;
        for (let i = history.length-2; i >= 0; i--) {
            if (history[i] === last) count++;
            else break;
        }
        if (count >= 3 && count <= 4) {
            return {type: last, count};
        }
        // Cluster tie: nhiều tie liên tục
        if (last === 'T' && count >= 2) {
            return {type: 'T', count};
        }
        return null;
    }

    detectRunSwitch(history) {
        // Nếu vừa có run dài rồi đảo chiều, dự đoán đảo chiều tiếp
        let last = history[history.length-1];
        let run = 1;
        for (let i = history.length-2; i >= 0; i--) {
            if (history[i] === 'T') continue;
            if (history[i] === last) run++;
            else break;
        }
        if (run >= 4) {
            // Check đảo chiều
            let before = history.filter(x=>x!=='T')[history.filter(x=>x!=='T').length-run-1];
            if (before && before !== last) {
                return {from: before, to: last, run};
            }
        }
        return null;
    }

    detectBias(history, window=30) {
        // Bias tổng thể và local (nhạy hơn)
        let recent = history.slice(-window).filter(x=>x!=='T');
        let b = recent.filter(x=>x==='B').length;
        let p = recent.filter(x=>x==='P').length;
        let total = b+p;
        if (total < 10) return null;
        if (b/total > 0.58) return 'B';
        if (p/total > 0.58) return 'P';
        return null;
    }
    detectIrregularTie(history) {
        // Nếu trong 5-7 hand gần nhất có >=2 tie, nhưng không liên tục
        let recent = history.slice(-7);
        let tieIdx = [];
        for (let i=0;i<recent.length;i++) if (recent[i]==='T') tieIdx.push(i);
        if (tieIdx.length >= 2 && tieIdx.length <= 4) {
            // Không phải cluster tie (không liên tục)
            let isCluster = true;
            for (let i=1;i<tieIdx.length;i++) if (tieIdx[i]-tieIdx[i-1]>1) isCluster = false;
            if (!isCluster) return true;
        }
        return false;
    }

    detectAlternatingDeep(history) {
        // Alternating sâu, bỏ qua tie
        let arr = history.filter(x=>x!=='T');
        if (arr.length < 6) return false;
        let ok = true;
        for (let i = arr.length-1; i > arr.length-6; i--) {
            if (arr[i] === arr[i-1]) ok = false;
        }
        return ok;
    }

    detectTiePattern(history) {
        // Nếu tie xuất hiện đều đặn (ví dụ cứ 3 hand lại có tie)
        let tieIdx = [];
        for (let i=0;i<history.length;i++) if (history[i]==='T') tieIdx.push(i);
        if (tieIdx.length < 3) return null;
        let diffs = tieIdx.slice(1).map((v,i)=>v-tieIdx[i]);
        let avg = diffs.reduce((a,b)=>a+b,0)/diffs.length;
        let consistent = diffs.every(d=>Math.abs(d-avg)<=1);
        if (consistent && avg >= 2 && avg <= 5) return {avg, next: tieIdx[tieIdx.length-1]+Math.round(avg)};
        return null;
    }

    predict(history, lastResult = null) {
        // 0.00. Proactive: Hand đầu tiên và thứ 2 - dự đoán cực sớm, không cần pattern rõ
        if (history.length === 1) {
            // Nếu hand đầu là tie, dự đoán tie tiếp hoặc alternating tie
            if (history[0] === 'T') {
                this.lastPredictions.push('T');
                return {
                    predicted: 'T',
                    confidence: 70,
                    pattern: 'ProactiveFirstHandTie',
                    methods: ['Proactive','FirstHandTie']
                };
            }
            // Nếu hand đầu là B hoặc P, proactive alternating hoặc bias nối tiếp
            let alt = history[0] === 'B' ? 'P' : 'B';
            this.lastPredictions.push(alt);
            return {
                predicted: alt,
                confidence: 68,
                pattern: 'ProactiveFirstHandAlternating',
                methods: ['Proactive','FirstHandAlternating']
            };
        }
        if (history.length === 2) {
            // Nếu vừa có 2 tie liên tiếp
            if (history[0] === 'T' && history[1] === 'T') {
                this.lastPredictions.push('T');
                return {
                    predicted: 'T',
                    confidence: 72,
                    pattern: 'Proactive2Tie',
                    methods: ['Proactive','2Tie']
                };
            }
            // Nếu vừa có alternating (B P hoặc P B)
            if (history[0] !== 'T' && history[1] !== 'T' && history[0] !== history[1]) {
                let alt = history[1] === 'B' ? 'P' : 'B';
                this.lastPredictions.push(alt);
                return {
                    predicted: alt,
                    confidence: 71,
                    pattern: 'Proactive2HandAlternating',
                    methods: ['Proactive','2HandAlternating']
                };
            }
            // Nếu vừa có 2 giống nhau (B B hoặc P P)
            if (history[0] !== 'T' && history[1] !== 'T' && history[0] === history[1]) {
                this.lastPredictions.push(history[1]);
                return {
                    predicted: history[1],
                    confidence: 70,
                    pattern: 'Proactive2HandBias',
                    methods: ['Proactive','2HandBias']
                };
            }
            // Nếu có tie xen kẽ
            if (history[0] === 'T' || history[1] === 'T') {
                this.lastPredictions.push('T');
                return {
                    predicted: 'T',
                    confidence: 69,
                    pattern: 'Proactive2HandTie',
                    methods: ['Proactive','2HandTie']
                };
            }
        }
        // 0.0. Proactive: Pattern cực ngắn (2 hand), bias local cực ngắn (2-3 hand), alternating 2 hand, tie cực ngắn
        if (history.length >= 2) {
            let last2 = history.slice(-2);
            // Alternating 2 hand (B P hoặc P B)
            if (last2[0] !== 'T' && last2[1] !== 'T' && last2[0] !== last2[1]) {
                let alt = last2[1] === 'B' ? 'P' : 'B';
                this.lastPredictions.push(alt);
                if (this.lastPredictions.length > 20) this.lastPredictions.shift();
                return {
                    predicted: alt,
                    confidence: 71,
                    pattern: 'Proactive2HandAlternating',
                    methods: ['Proactive','2HandAlternating']
                };
            }
            // Bias local cực ngắn 2 hand (B B hoặc P P)
            if (last2[0] !== 'T' && last2[1] !== 'T' && last2[0] === last2[1]) {
                this.lastPredictions.push(last2[1]);
                if (this.lastPredictions.length > 20) this.lastPredictions.shift();
                return {
                    predicted: last2[1],
                    confidence: 70,
                    pattern: 'Proactive2HandBias',
                    methods: ['Proactive','2HandBias']
                };
            }
            // Tie cực ngắn (T xuất hiện ở hand 2 hoặc 1 trong 2 hand gần nhất)
            if (last2.includes('T')) {
                this.lastPredictions.push('T');
                if (this.lastPredictions.length > 20) this.lastPredictions.shift();
                return {
                    predicted: 'T',
                    confidence: 69,
                    pattern: 'Proactive2HandTie',
                    methods: ['Proactive','2HandTie']
                };
            }
        }
        if (history.length >= 3) {
            let last3 = history.slice(-3);
            // Bias local cực ngắn 3 hand (2/3 cùng loại, không tính tie)
            let b = last3.filter(x=>x==='B').length;
            let p = last3.filter(x=>x==='P').length;
            if (b >= 2 && last3.filter(x=>x!=='T').length >= 2) {
                this.lastPredictions.push('B');
                if (this.lastPredictions.length > 20) this.lastPredictions.shift();
                return {
                    predicted: 'B',
                    confidence: 68,
                    pattern: 'Proactive3HandBiasB',
                    methods: ['Proactive','3HandBias','BiasB']
                };
            }
            if (p >= 2 && last3.filter(x=>x!=='T').length >= 2) {
                this.lastPredictions.push('P');
                if (this.lastPredictions.length > 20) this.lastPredictions.shift();
                return {
                    predicted: 'P',
                    confidence: 68,
                    pattern: 'Proactive3HandBiasP',
                    methods: ['Proactive','3HandBias','BiasP']
                };
            }
            // Nếu vừa có 3 alternating (B P B hoặc P B P), dự đoán alternating tiếp
            if ((last3[0] !== 'T' && last3[1] !== 'T' && last3[2] !== 'T') && last3[0] !== last3[1] && last3[1] !== last3[2] && last3[0] === last3[2]) {
                let alt = last3[2] === 'B' ? 'P' : 'B';
                this.lastPredictions.push(alt);
                if (this.lastPredictions.length > 20) this.lastPredictions.shift();
                return {
                    predicted: alt,
                    confidence: 70,
                    pattern: 'Proactive3HandAlternating',
                    methods: ['Proactive','3HandAlternating']
                };
            }
            // Nếu vừa có 2 tie trong 3 hand gần nhất
            let tieCount = last3.filter(x=>x==='T').length;
            if (tieCount >= 2) {
                this.lastPredictions.push('T');
                if (this.lastPredictions.length > 20) this.lastPredictions.shift();
                return {
                    predicted: 'T',
                    confidence: 69,
                    pattern: 'Proactive3HandClusterTie',
                    methods: ['Proactive','3HandClusterTie']
                };
            }
        }
        // Hybrid Baccarat AI: Pattern Memory Voting + AntiStreak + Alternating + Cluster + Bias + Forgotten + Adaptive Fallback
        if (lastResult) {
            this.lastResults.push(lastResult);
            if (this.lastResults.length > 20) this.lastResults.shift();
        }
        if (history.length < 10) {
            let pred = this.fallbackRandom();
            this.lastPredictions.push(pred);
            if (this.lastPredictions.length > 20) this.lastPredictions.shift();
            return {
                predicted: pred,
                confidence: 52,
                pattern: 'Random (insufficient data)',
                methods: ['Random']
            };
        }
        this.updatePatternStats(history);
        let last3 = this.lastPredictions.slice(-3);
        // Nếu vừa sai liên tiếp 2-3 lần, ưu tiên forgotten hoặc anti-repeat, hoặc diversity (không lặp lại 3 dự đoán gần nhất)
        if (this.lastResults.length >= 3 && this.lastResults.slice(-3).every(x=>x===false)) {
            let recent8 = history.slice(-8);
            let never8 = [];
            for (let k of ['B','P','T']) if (!recent8.includes(k)) never8.push(k);
            if (never8.length > 0) {
                let pred = never8[0];
                this.lastPredictions.push(pred);
                if (this.lastPredictions.length > 20) this.lastPredictions.shift();
                return {
                    predicted: pred,
                    confidence: 64,
                    pattern: 'ForgottenRecovery (after mistakes)',
                    methods: ['Forgotten','MistakeAdaptive']
                };
            }
            // Nếu không, chọn anti-repeat hoặc diversity
            let pred = this.fallbackRandom();
            if (last3.length === 3 && last3[0] === last3[1] && last3[1] === last3[2]) {
                pred = last3[0] === 'B' ? 'P' : 'B';
            } else if (last3.includes(pred)) {
                pred = pred === 'B' ? 'P' : 'B';
            }
            this.lastPredictions.push(pred);
            if (this.lastPredictions.length > 20) this.lastPredictions.shift();
            return {
                predicted: pred,
                confidence: 56,
                pattern: 'MistakeAdaptive AntiRepeat Diversity',
                methods: ['MistakeAdaptive','NoRepeat','Diversity']
            };
        }
        // 0. Long Run Sudden Switch: Nếu vừa có run dài rồi đảo chiều, ưu tiên bias local cực ngắn, nếu không alternating/anti-switch, nếu vừa sai liên tiếp thì fallback forgotten
        let longRunSwitch = this.detectLongRunSwitch(history);
        if (longRunSwitch) {
            // Ưu tiên bias local cực ngắn (4-6 hand) nếu bias chuyển đổi mạnh
            let ultraBias = this.detectUltraLocalBias ? this.detectUltraLocalBias(history) : null;
            if (ultraBias) {
                this.lastPredictions.push(ultraBias);
                if (this.lastPredictions.length > 20) this.lastPredictions.shift();
                return {
                    predicted: ultraBias,
                    confidence: 73,
                    pattern: `LongRunSwitchUltraLocalBias(${ultraBias})`,
                    methods: ['LongRunSwitch','UltraLocalBias','Proactive']
                };
            }
            // Nếu alternating/anti-switch vừa fail liên tiếp, fallback forgotten hoặc diversity
            if (this.lastResults.length >= 2 && this.lastResults.slice(-2).every(x=>x===false)) {
                let recent8 = history.slice(-8);
                let never8 = [];
                for (let k of ['B','P','T']) if (!recent8.includes(k)) never8.push(k);
                if (never8.length > 0) {
                    let pred = never8[0];
                    this.lastPredictions.push(pred);
                    if (this.lastPredictions.length > 20) this.lastPredictions.shift();
                    return {
                        predicted: pred,
                        confidence: 65,
                        pattern: 'ForgottenRecovery (after run switch fail)',
                        methods: ['Forgotten','RunSwitchFallback','Diversity']
                    };
                }
            }
            let arr = history.filter(x=>x!=='T');
            let last = arr[arr.length-1];
            let prev = arr[arr.length-2];
            if (last !== prev) {
                let alt = last === 'B' ? 'P' : 'B';
                // Nếu vừa sai liên tiếp, ưu tiên diversity
                if (this.lastResults.length >= 2 && this.lastResults.slice(-2).every(x=>x===false)) {
                    if (last3.includes(alt)) alt = alt === 'B' ? 'P' : 'B';
                }
                this.lastPredictions.push(alt);
                if (this.lastPredictions.length > 20) this.lastPredictions.shift();
                return {
                    predicted: alt,
                    confidence: 66,
                    pattern: `LongRunSwitchAlternatingProactive(${longRunSwitch.run})`,
                    methods: ['LongRunSwitch','Alternating','Proactive','Diversity']
                };
            } else {
                let anti = last === 'B' ? 'P' : 'B';
                if (this.lastResults.length >= 2 && this.lastResults.slice(-2).every(x=>x===false)) {
                    if (last3.includes(anti)) anti = anti === 'B' ? 'P' : 'B';
                }
                this.lastPredictions.push(anti);
                if (this.lastPredictions.length > 20) this.lastPredictions.shift();
                return {
                    predicted: anti,
                    confidence: 64,
                    pattern: `LongRunSwitchAntiProactive(${longRunSwitch.run})`,
                    methods: ['LongRunSwitch','AntiSwitch','Proactive','Diversity']
                };
            }
        }
        // 0.5. Alternating Tie Pattern (B T B T ... hoặc P T P T ...)
        if (this.detectAlternatingTiePattern(history)) {
            this.lastPredictions.push('T');
            if (this.lastPredictions.length > 20) this.lastPredictions.shift();
            return {
                predicted: 'T',
                confidence: 67,
                pattern: 'AlternatingTie',
                methods: ['AlternatingTie']
            };
        }
        // 0.6. Loose Tie Pattern (tie cách đều 2 hoặc 3 hand)
        if (this.detectLooseTiePattern(history)) {
            this.lastPredictions.push('T');
            if (this.lastPredictions.length > 20) this.lastPredictions.shift();
            return {
                predicted: 'T',
                confidence: 63,
                pattern: 'LooseTiePattern',
                methods: ['LooseTie']
            };
        }
        // 1. Pattern Memory Voting (ưu tiên pattern ngắn, nhận diện cực sớm, không lặp lại 3 dự đoán gần nhất)
        let allPatterns = [];
        for (let len = 8; len >= 3; len--) {
            if (history.length < len) continue;
            const pattern = history.slice(-len).join('');
            if (this.patternStats[pattern]) {
                let stats = this.patternStats[pattern];
                let total = stats.B + stats.P + stats.T;
                // Nếu pattern ngắn (3-4) và xuất hiện >=1 lần, ưu tiên dự đoán cực sớm
                if ((len <= 4 && total >= 1) || (len > 4 && total > 1)) {
                    allPatterns.push({pattern, stats, len, total});
                }
            }
        }
        // Ưu tiên pattern ngắn, mới xuất hiện gần nhất
        allPatterns.sort((a,b)=>{
            if (a.len <= 4 && b.len > 4) return -1;
            if (a.len > 4 && b.len <= 4) return 1;
            return b.len*1000+b.total-b.len*1000-a.total;
        });
        let voting = {B:0, P:0, T:0};
        for (let i=0;i<allPatterns.length;i++) {
            let p = allPatterns[i];
            // Pattern ngắn (3-4) trọng số cao hơn nếu vừa xuất hiện
            let weight = (p.len <= 4 ? 3.5 : 1) * (p.len+1);
            for (let k of ['B','P','T']) voting[k] += (p.stats[k]||0)*weight;
        }
        let sortedVoting = Object.entries(voting).sort((a,b)=>b[1]-a[1]);
        let best = sortedVoting.find(([k])=>!last3.includes(k)) || sortedVoting[0];
        if (best && best[1] > 0) {
            this.lastPredictions.push(best[0]);
            if (this.lastPredictions.length > 20) this.lastPredictions.shift();
            return {
                predicted: best[0],
                confidence: 72 + Math.min(best[1], 28),
                pattern: `PatternVoting+UltraEarlyShortPattern`,
                methods: ['PatternMemory', 'Voting', 'UltraEarlyShortPattern']
            };
        }
        // 2. AntiStreak: Nếu streak >=4 (không tính tie), đảo chiều
        let arrNoTie = history.filter(x=>x!=='T');
        if (arrNoTie.length >= 4) {
            let streak = 1;
            for (let i = arrNoTie.length-1; i > 0; i--) {
                if (arrNoTie[i] === arrNoTie[i-1]) streak++;
                else break;
            }
            if (streak >= 4) {
                let anti = arrNoTie[arrNoTie.length-1] === 'B' ? 'P' : 'B';
                if (!last3.includes(anti)) {
                    this.lastPredictions.push(anti);
                    if (this.lastPredictions.length > 20) this.lastPredictions.shift();
                    return {
                        predicted: anti,
                        confidence: 72,
                        pattern: `AntiStreak(${streak})`,
                        methods: ['AntiStreak','StrongPattern']
                    };
                }
            }
        }
        // 3. Alternating cực ngắn (3 hand, proactive)
        if (arrNoTie.length >= 3) {
            let ok = true;
            for (let i = arrNoTie.length-1; i > arrNoTie.length-3; i--) {
                if (arrNoTie[i] === arrNoTie[i-1]) ok = false;
            }
            if (ok) {
                let alt = arrNoTie[arrNoTie.length-1] === 'B' ? 'P' : 'B';
                if (!last3.includes(alt)) {
                    this.lastPredictions.push(alt);
                    if (this.lastPredictions.length > 20) this.lastPredictions.shift();
                    return {
                        predicted: alt,
                        confidence: 67,
                        pattern: 'UltraEarlyAlternating',
                        methods: ['Alternating','UltraEarlyPattern']
                    };
                }
            }
        }
        // 3.5. Irregular Tie: tie xuất hiện xen kẽ, không phải cluster tie
        if (this.detectIrregularTie(history)) {
            this.lastPredictions.push('T');
            if (this.lastPredictions.length > 20) this.lastPredictions.shift();
            return {
                predicted: 'T',
                confidence: 64,
                pattern: 'IrregularTie',
                methods: ['IrregularTie']
            };
        }
        // 4. Cluster tie cực ngắn (2 hand liên tiếp hoặc 2/3 hand gần nhất)
        let last = history[history.length-1];
        let countTie = 0;
        for (let i = history.length-1; i >= 0; i--) {
            if (history[i] === 'T') countTie++;
            else break;
        }
        if (countTie >= 2 || (history.slice(-3).filter(x=>x==='T').length >= 2)) {
            this.lastPredictions.push('T');
            if (this.lastPredictions.length > 20) this.lastPredictions.shift();
            return {
                predicted: 'T',
                confidence: 66,
                pattern: `UltraEarlyClusterTie(${countTie})`,
                methods: ['ClusterTie','UltraEarlyPattern']
            };
        }
        // 4.2. Ưu tiên bias mạnh tuyệt đối nếu bias chiếm đa số gần nhất
        let biasTypes = [
            this.detectBias(history, 10),
            this.detectBias(history, 20),
            this.detectBias(history, 30),
            this.detectBias(history, 50),
            this.detectLocalBias(history, 4),
            this.detectLocalBias(history, 6),
            this.detectLocalBias(history, 8),
            this.detectLocalBias(history, 12),
            this.detectSoftBias(history, 12),
            this.detectSoftBias(history, 16),
            this.detectSoftBias(history, 20)
        ];
        for (let biasType of biasTypes) {
            if (biasType && this.detectMajorityBias(history, biasType)) {
                this.lastPredictions.push(biasType);
                if (this.lastPredictions.length > 20) this.lastPredictions.shift();
                return {
                    predicted: biasType,
                    confidence: 67,
                    pattern: `UltimateBiasMajority(${biasType})`,
                    methods: ['Bias','MajorityBias','UltimateBias','LocalBias']
                };
            }
        }
        // 6. Forgotten Recovery: Nếu có kết quả chưa xuất hiện trong 8 hand gần nhất, ưu tiên chọn
        let recent8_forgotten = history.slice(-8);
        let never8_forgotten = [];
        for (let k of ['B','P','T']) if (!recent8_forgotten.includes(k)) never8_forgotten.push(k);
        if (never8_forgotten.length > 0) {
            let pred = never8_forgotten[0];
            this.lastPredictions.push(pred);
            if (this.lastPredictions.length > 20) this.lastPredictions.shift();
            return {
                predicted: pred,
                confidence: 60,
                pattern: 'ForgottenRecovery',
                methods: ['Forgotten']
            };
        }
        // 7. Adaptive Fallback: diversity tuyệt đối, không lặp lại 2 dự đoán gần nhất, ưu tiên forgotten, anti-repeat, proactive switching
        // Fallback tối ưu thực chiến: Ưu tiên forgotten, bias local, alternating, diversity, giảm random hóa mạnh
        let fallbackOptions = ['B', 'P', 'T'];
        let recent8_fallback = history.slice(-8);
        let never8_fallback = fallbackOptions.filter(k => !recent8_fallback.includes(k));
        let pred = null;
        // 1. Forgotten recovery nếu có (và không trùng 2 dự đoán gần nhất)
        if (never8_fallback.length > 0 && !last3.includes(never8_fallback[0])) {
            pred = never8_fallback[0];
        }
        // 2. Ưu tiên bias local cực ngắn nếu có
        if (!pred) {
            let biasLocal = this.detectLocalBias(history, 4) || this.detectLocalBias(history, 6);
            if (biasLocal && !last3.includes(biasLocal)) pred = biasLocal;
        }
        // 3. Alternating cực ngắn (2-3 hand)
        if (!pred) {
            let arr = history.filter(x=>x!=='T');
            if (arr.length >= 3 && arr[arr.length-1] !== arr[arr.length-2] && arr[arr.length-2] !== arr[arr.length-3]) {
                let alt = arr[arr.length-1] === 'B' ? 'P' : 'B';
                if (!last3.includes(alt)) pred = alt;
            }
        }
        // 4. Nếu vừa switching hoặc alternating liên tục, proactive đảo chiều
        if (!pred) {
            let arr = history.filter(x=>x!=='T');
            if (arr.length >= 6) {
                let last = arr[arr.length-1];
                let prev = arr[arr.length-2];
                let prev2 = arr[arr.length-3];
                if ((last !== prev && prev !== prev2) || (last !== prev && arr[arr.length-4] === last)) {
                    let alt = last === 'B' ? 'P' : 'B';
                    if (!last3.includes(alt)) pred = alt;
                }
            }
        }
        // 5. Nếu vừa sai liên tiếp, ưu tiên forgotten hoặc đảo chiều, không random hóa mạnh
        if (!pred && this.lastResults.length >= 2 && this.lastResults.slice(-2).every(x=>x===false)) {
            if (never8_fallback.length > 0) pred = never8_fallback[0];
            else {
                let arr = history.filter(x=>x!=='T');
                let alt = arr[arr.length-1] === 'B' ? 'P' : 'B';
                if (!last3.includes(alt)) pred = alt;
            }
        }
        // 6. Nếu vẫn chưa chọn được, diversity tuyệt đối: chọn khác 2 dự đoán gần nhất
        if (!pred) {
            let pool = fallbackOptions.filter(k => last3.length < 2 || k !== last3[last3.length-1]);
            if (pool.length > 0) pred = pool[Math.floor(Math.random()*pool.length)];
            else pred = this.fallbackRandom();
        }
        // 7. Không để 3 dự đoán liên tiếp giống nhau
        if (last3.length === 3 && last3[0] === last3[1] && last3[1] === last3[2]) {
            pred = last3[0] === 'B' ? 'P' : 'B';
        }
        this.lastPredictions.push(pred);
        if (this.lastPredictions.length > 20) this.lastPredictions.shift();
        return {
            predicted: pred,
            confidence: 60,
            pattern: 'AdaptiveFallback+Practical+PatternFirst+Diversity+Forgotten+ProactiveSwitching',
            methods: ['Pattern','NoRepeat','Diversity','Forgotten','ProactiveSwitching','BiasLocal','Alternating']
        };
    }
}

export default UltimateBaccaratAI;
