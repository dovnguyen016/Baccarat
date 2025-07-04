/**
 * Test và cải thiện AI Predictor để tránh "gãy 2 tay liên tiếp"
 */

// Load AI code
const fs = require('fs');
const aiCode = fs.readFileSync('./ai-predictor.js', 'utf8');

// Create a proper context for evaluation
const vm = require('vm');
const context = {
    module: { exports: {} },
    exports: {},
    require: require,
    console: console,
    global: global,
    process: process,
    Buffer: Buffer,
    __dirname: __dirname,
    __filename: __filename
};

// Execute the AI code in the context
vm.createContext(context);
vm.runInContext(aiCode, context);

// Get the BaccaratAIPredictor class
const BaccaratAIPredictor = context.module.exports || context.BaccaratAIPredictor || global.BaccaratAIPredictor;

function testConsecutiveFailures() {
    console.log('🧪 Testing AI Predictor for consecutive failures...\n');
    
    const ai = new BaccaratAIPredictor();
    
    // Test với 100 predictions
    const testHistory = ['B', 'P', 'B', 'B', 'P', 'P', 'B', 'P', 'B', 'P'];
    let history = [...testHistory];
    
    let consecutiveFailures = 0;
    let maxConsecutiveFailures = 0;
    let totalTests = 0;
    let correctPredictions = 0;
    
    console.log('Starting history:', history.join(''));
    console.log('Running 100 predictions...\n');
    
    for (let i = 0; i < 100; i++) {
        const prediction = ai.generatePrediction(history);
        
        if (!prediction.predicted) {
            console.log(`❌ No prediction at step ${i + 1}`);
            continue;
        }
        
        // Generate actual result (weighted random for more realistic testing)
        const actualResult = Math.random() > 0.48 ? 'B' : 'P'; // Slight banker bias
        
        const isCorrect = prediction.predicted === actualResult;
        
        totalTests++;
        if (isCorrect) {
            correctPredictions++;
            consecutiveFailures = 0;
        } else {
            consecutiveFailures++;
            maxConsecutiveFailures = Math.max(maxConsecutiveFailures, consecutiveFailures);
        }
        
        // Update AI
        ai.updatePerformance(prediction.predicted, actualResult, isCorrect);
        history.push(actualResult);
        
        // Log consecutive failures
        if (consecutiveFailures >= 2) {
            console.log(`🚨 Step ${i + 1}: ${consecutiveFailures} consecutive failures!`);
        }
        
        // Log some details
        if (i < 10 || consecutiveFailures >= 2) {
            const status = isCorrect ? '✅' : '❌';
            console.log(`${i + 1}. Pred: ${prediction.predicted} (${prediction.confidence}%) | Actual: ${actualResult} ${status} | Fails: ${consecutiveFailures}`);
        }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('TEST RESULTS:');
    console.log(`Total predictions: ${totalTests}`);
    console.log(`Correct predictions: ${correctPredictions}`);
    console.log(`Accuracy: ${(correctPredictions/totalTests*100).toFixed(1)}%`);
    console.log(`Max consecutive failures: ${maxConsecutiveFailures}`);
    
    if (maxConsecutiveFailures >= 2) {
        console.log('🚨 PROBLEM: AI has consecutive failures >= 2');
        return false;
    } else {
        console.log('✅ GOOD: No consecutive failures >= 2');
        return true;
    }
}

// Run test
console.log('🚀 Starting test...');
const isPassing = testConsecutiveFailures();

if (!isPassing) {
    console.log('\n⚡ AI needs improvement! Creating enhanced version...');
} else {
    console.log('\n✅ AI is working well!');
}
