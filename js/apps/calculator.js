// Приложение Калькулятор
class Calculator {
    constructor(container, options = {}) {
        this.container = container;
        this.options = options;
        
        this.currentInput = '0';
        this.previousInput = '';
        this.operation = null;
        this.resetDisplay = false;
        this.isScientific = false;
        this.history = [];
        
        this.init();
    }

    init() {
        this.render();
        this.setupEventListeners();
        this.loadHistory();
    }

    render() {
        this.container.innerHTML = `
            <div class="calculator-app">
                <div class="calculator">
                    <div class="calculator-display" id="calc-display">
                        <div class="calc-expression" id="calc-expression"></div>
                        <div class="calc-current" id="calc-current">0</div>
                    </div>
                    <div class="calculator-buttons" id="calc-buttons">
                        <button class="calculator-btn function" data-action="clear">C</button>
                        <button class="calculator-btn function" data-action="clear-entry">CE</button>
                        <button class="calculator-btn function" data-action="backspace">⌫</button>
                        <button class="calculator-btn operator" data-action="divide">/</button>
                        
                        <button class="calculator-btn" data-action="7">7</button>
                        <button class="calculator-btn" data-action="8">8</button>
                        <button class="calculator-btn" data-action="9">9</button>
                        <button class="calculator-btn operator" data-action="multiply">×</button>
                        
                        <button class="calculator-btn" data-action="4">4</button>
                        <button class="calculator-btn" data-action="5">5</button>
                        <button class="calculator-btn" data-action="6">6</button>
                        <button class="calculator-btn operator" data-action="subtract">-</button>
                        
                        <button class="calculator-btn" data-action="1">1</button>
                        <button class="calculator-btn" data-action="2">2</button>
                        <button class="calculator-btn" data-action="3">3</button>
                        <button class="calculator-btn operator" data-action="add">+</button>
                        
                        <button class="calculator-btn" data-action="plus-minus">±</button>
                        <button class="calculator-btn" data-action="0">0</button>
                        <button class="calculator-btn" data-action="decimal">.</button>
                        <button class="calculator-btn equals" data-action="equals">=</button>
                    </div>
                    <div class="calculator-scientific" id="calc-scientific" style="display: none;">
                        <button class="calculator-btn scientific" data-action="square">x²</button>
                        <button class="calculator-btn scientific" data-action="square-root">√</button>
                        <button class="calculator-btn scientific" data-action="percent">%</button>
                        <button class="calculator-btn scientific" data-action="reciprocal">1/x</button>
                        
                        <button class="calculator-btn scientific" data-action="sin">sin</button>
                        <button class="calculator-btn scientific" data-action="cos">cos</button>
                        <button class="calculator-btn scientific" data-action="tan">tan</button>
                        <button class="calculator-btn scientific" data-action="log">log</button>
                        
                        <button class="calculator-btn scientific" data-action="pi">π</button>
                        <button class="calculator-btn scientific" data-action="e">e</button>
                        <button class="calculator-btn scientific" data-action="factorial">x!</button>
                        <button class="calculator-btn scientific" data-action="power">x^y</button>
                    </div>
                    <div class="calculator-controls">
                        <button class="calc-mode-btn" id="scientific-toggle">Научный</button>
                        <button class="calc-mode-btn" id="history-toggle">История</button>
                    </div>
                </div>
                
                <div class="calculator-history" id="calc-history" style="display: none;">
                    <div class="history-header">
                        <h4>История вычислений</h4>
                        <button class="clear-history" id="clear-history">Очистить</button>
                    </div>
                    <div class="history-list" id="history-list"></div>
                </div>
            </div>
        `;

        this.display = this.container.querySelector('#calc-current');
        this.expression = this.container.querySelector('#calc-expression');
        this.scientificPanel = this.container.querySelector('#calc-scientific');
        this.historyPanel = this.container.querySelector('#calc-history');
        this.historyList = this.container.querySelector('#history-list');
    }

    setupEventListeners() {
        this.container.addEventListener('click', (e) => {
            const button = e.target.closest('.calculator-btn');
            if (button) {
                const action = button.getAttribute('data-action');
                this.handleButtonClick(action);
                this.animateButton(button);
            }

            if (e.target.id === 'scientific-toggle') {
                this.toggleScientific();
            }

            if (e.target.id === 'history-toggle') {
                this.toggleHistory();
            }

            if (e.target.id === 'clear-history') {
                this.clearHistory();
            }
        });

        document.addEventListener('keydown', (e) => {
            this.handleKeyboardInput(e);
        });
    }

    handleButtonClick(action) {
        Utils.playSound('click');

        if ('0123456789'.includes(action)) {
            this.inputDigit(action);
        } else if (action === 'decimal') {
            this.inputDecimal();
        } else if (action === 'clear') {
            this.clearAll();
        } else if (action === 'clear-entry') {
            this.clearEntry();
        } else if (action === 'backspace') {
            this.backspace();
        } else if (action === 'plus-minus') {
            this.toggleSign();
        } else if (['add', 'subtract', 'multiply', 'divide'].includes(action)) {
            this.inputOperator(action);
        } else if (action === 'equals') {
            this.calculate();
        } else if (this.isScientific) {
            this.handleScientificAction(action);
        }

        this.updateDisplay();
    }

    handleScientificAction(action) {
        switch (action) {
            case 'square':
                this.square();
                break;
            case 'square-root':
                this.squareRoot();
                break;
            case 'percent':
                this.percent();
                break;
            case 'reciprocal':
                this.reciprocal();
                break;
            case 'sin':
                this.sin();
                break;
            case 'cos':
                this.cos();
                break;
            case 'tan':
                this.tan();
                break;
            case 'log':
                this.log();
                break;
            case 'pi':
                this.pi();
                break;
            case 'e':
                this.e();
                break;
            case 'factorial':
                this.factorial();
                break;
            case 'power':
                this.power();
                break;
        }
    }

    handleKeyboardInput(e) {
        const key = e.key;
        
        if ('0123456789'.includes(key)) {
            this.inputDigit(key);
        } else if (key === '.' || key === ',') {
            this.inputDecimal();
        } else if (key === 'Enter' || key === '=') {
            e.preventDefault();
            this.calculate();
        } else if (key === 'Escape') {
            this.clearAll();
        } else if (key === 'Backspace') {
            this.backspace();
        } else if (key === '+') {
            this.inputOperator('add');
        } else if (key === '-') {
            this.inputOperator('subtract');
        } else if (key === '*') {
            this.inputOperator('multiply');
        } else if (key === '/') {
            e.preventDefault();
            this.inputOperator('divide');
        } else if (key === '%') {
            this.percent();
        } else if (key === 's' && e.altKey) {
            e.preventDefault();
            this.toggleScientific();
        }

        this.updateDisplay();
    }

    animateButton(button) {
        button.classList.add('active');
        setTimeout(() => button.classList.remove('active'), 150);
    }

    inputDigit(digit) {
        if (this.currentInput === '0' || this.resetDisplay) {
            this.currentInput = digit;
            this.resetDisplay = false;
        } else if (this.currentInput.length < 16) {
            this.currentInput += digit;
        }
    }

    inputDecimal() {
        if (this.resetDisplay) {
            this.currentInput = '0.';
            this.resetDisplay = false;
            return;
        }
        
        if (!this.currentInput.includes('.')) {
            this.currentInput += '.';
        }
    }

    clearAll() {
        this.currentInput = '0';
        this.previousInput = '';
        this.operation = null;
        this.resetDisplay = false;
        this.expression.textContent = '';
    }

    clearEntry() {
        this.currentInput = '0';
    }

    backspace() {
        if (this.currentInput.length > 1) {
            this.currentInput = this.currentInput.slice(0, -1);
        } else {
            this.currentInput = '0';
        }
    }

    toggleSign() {
        if (this.currentInput !== '0') {
            this.currentInput = (parseFloat(this.currentInput) * -1).toString();
        }
    }

    inputOperator(nextOperation) {
        const input = parseFloat(this.currentInput);
        if (isNaN(input)) return;

        if (this.operation !== null && !this.resetDisplay) {
            this.calculate();
        }

        this.previousInput = this.currentInput;
        this.operation = nextOperation;
        this.resetDisplay = true;

        const operatorSymbols = {
            'add': '+',
            'subtract': '−',
            'multiply': '×',
            'divide': '÷'
        };

        this.expression.textContent = `${this.formatNumber(this.previousInput)} ${operatorSymbols[nextOperation]}`;
    }

    calculate() {
        if (this.operation === null || this.resetDisplay) return;

        const prev = parseFloat(this.previousInput);
        const current = parseFloat(this.currentInput);
        
        if (isNaN(prev) || isNaN(current)) return;

        let result;
        let operationSymbol;

        switch (this.operation) {
            case 'add':
                result = prev + current;
                operationSymbol = '+';
                break;
            case 'subtract':
                result = prev - current;
                operationSymbol = '−';
                break;
            case 'multiply':
                result = prev * current;
                operationSymbol = '×';
                break;
            case 'divide':
                if (current === 0) {
                    this.showError('Деление на ноль');
                    return;
                }
                result = prev / current;
                operationSymbol = '÷';
                break;
            default:
                return;
        }

        // Округляем для избежания ошибок округления
        result = Math.round(result * 10000000000) / 10000000000;
        
        const expression = `${this.formatNumber(this.previousInput)} ${operationSymbol} ${this.formatNumber(this.currentInput)} = ${this.formatNumber(result.toString())}`;
        this.addToHistory(expression);

        this.currentInput = result.toString();
        this.operation = null;
        this.previousInput = '';
        this.resetDisplay = true;
        this.expression.textContent = expression;
    }

    updateDisplay() {
        if (this.display) {
            this.display.textContent = this.formatNumber(this.currentInput);
            
            this.display.classList.add('updating');
            setTimeout(() => {
                this.display.classList.remove('updating');
            }, 100);
        }
    }

    formatNumber(number) {
        let numStr = number.toString();
        
        // Убираем лишние нули после запятой
        if (numStr.includes('.')) {
            numStr = numStr.replace(/\.?0+$/, '');
        }
        
        // Добавляем разделители тысяч
        const parts = numStr.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
        
        return parts.join('.');
    }

    // Научные функции
    squareRoot() {
        const num = parseFloat(this.currentInput);
        if (num < 0) {
            this.showError('Корень из отрицательного числа');
            return;
        }
        const result = Math.sqrt(num);
        this.addToHistory(`√(${this.currentInput}) = ${result}`);
        this.currentInput = result.toString();
        this.resetDisplay = true;
    }

    square() {
        const num = parseFloat(this.currentInput);
        const result = num * num;
        this.addToHistory(`(${this.currentInput})² = ${result}`);
        this.currentInput = result.toString();
        this.resetDisplay = true;
    }

    reciprocal() {
        const num = parseFloat(this.currentInput);
        if (num === 0) {
            this.showError('Деление на ноль');
            return;
        }
        const result = 1 / num;
        this.addToHistory(`1/(${this.currentInput}) = ${result}`);
        this.currentInput = result.toString();
        this.resetDisplay = true;
    }

    percent() {
        const num = parseFloat(this.currentInput);
        const result = num / 100;
        this.addToHistory(`${this.currentInput}% = ${result}`);
        this.currentInput = result.toString();
        this.resetDisplay = true;
    }

    sin() {
        const num = parseFloat(this.currentInput);
        const result = Math.sin(num * Math.PI / 180);
        this.addToHistory(`sin(${this.currentInput}°) = ${result}`);
        this.currentInput = result.toString();
        this.resetDisplay = true;
    }

    cos() {
        const num = parseFloat(this.currentInput);
        const result = Math.cos(num * Math.PI / 180);
        this.addToHistory(`cos(${this.currentInput}°) = ${result}`);
        this.currentInput = result.toString();
        this.resetDisplay = true;
    }

    tan() {
        const num = parseFloat(this.currentInput);
        const result = Math.tan(num * Math.PI / 180);
        this.addToHistory(`tan(${this.currentInput}°) = ${result}`);
        this.currentInput = result.toString();
        this.resetDisplay = true;
    }

    log() {
        const num = parseFloat(this.currentInput);
        if (num <= 0) {
            this.showError('Логарифм не определен');
            return;
        }
        const result = Math.log10(num);
        this.addToHistory(`log(${this.currentInput}) = ${result}`);
        this.currentInput = result.toString();
        this.resetDisplay = true;
    }

    factorial() {
        const num = parseInt(this.currentInput);
        if (num < 0 || num > 100) {
            this.showError('Факториал не определен');
            return;
        }
        let result = 1;
        for (let i = 2; i <= num; i++) {
            result *= i;
        }
        this.addToHistory(`${this.currentInput}! = ${result}`);
        this.currentInput = result.toString();
        this.resetDisplay = true;
    }

    power() {
        this.previousInput = this.currentInput;
        this.operation = 'power';
        this.resetDisplay = true;
        this.expression.textContent = `${this.formatNumber(this.currentInput)}^`;
    }

    pi() {
        this.currentInput = Math.PI.toString();
        this.resetDisplay = true;
    }

    e() {
        this.currentInput = Math.E.toString();
        this.resetDisplay = true;
    }

    showError(message) {
        this.display.textContent = 'Ошибка';
        this.display.classList.add('error');
        
        setTimeout(() => {
            this.display.classList.remove('error');
            this.clearAll();
            this.updateDisplay();
        }, 2000);

        Utils.showNotification('Калькулятор', message, 'error');
    }

    // История вычислений
    addToHistory(expression) {
        this.history.unshift({
            expression: expression,
            timestamp: new Date().toLocaleTimeString()
        });

        if (this.history.length > 20) {
            this.history.pop();
        }

        this.saveHistory();
        this.updateHistoryDisplay();
    }

    updateHistoryDisplay() {
        if (!this.historyList) return;

        this.historyList.innerHTML = this.history.map(item => `
            <div class="history-item">
                <div class="history-expression">${item.expression}</div>
                <div class="history-time">${item.timestamp}</div>
            </div>
        `).join('');
    }

    clearHistory() {
        this.history = [];
        this.saveHistory();
        this.updateHistoryDisplay();
    }

    saveHistory() {
        Utils.storage.set('calculator-history', this.history);
    }

    loadHistory() {
        this.history = Utils.storage.get('calculator-history', []);
        this.updateHistoryDisplay();
    }

    // Переключение режимов
    toggleScientific() {
        this.isScientific = !this.isScientific;
        this.scientificPanel.style.display = this.isScientific ? 'grid' : 'none';
        
        const toggleBtn = this.container.querySelector('#scientific-toggle');
        toggleBtn.textContent = this.isScientific ? 'Обычный' : 'Научный';
        toggleBtn.classList.toggle('active', this.isScientific);
    }

    toggleHistory() {
        const isVisible = this.historyPanel.style.display !== 'none';
        this.historyPanel.style.display = isVisible ? 'none' : 'block';
        
        const toggleBtn = this.container.querySelector('#history-toggle');
        toggleBtn.classList.toggle('active', !isVisible);
    }
}

// Добавляем CSS для расширенного калькулятора
const calculatorStyles = `
    .calculator-display {
        height: 80px;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        padding: 10px 15px;
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        margin-bottom: 15px;
        font-family: 'Segoe UI', monospace;
        position: relative;
        overflow: hidden;
    }

    .calc-expression {
        font-size: 14px;
        color: var(--text-secondary);
        height: 20px;
        margin-bottom: 5px;
        text-align: right;
        opacity: 0.8;
    }

    .calc-current {
        font-size: 24px;
        font-weight: 600;
        text-align: right;
        color: var(--text-primary);
        transition: all 0.1s ease;
    }

    .calculator-scientific {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 8px;
        margin-top: 10px;
        margin-bottom: 10px;
    }

    .calculator-scientific .calculator-btn {
        font-size: 14px;
        height: 40px;
    }

    .calculator-controls {
        display: flex;
        gap: 8px;
        margin-top: 10px;
    }

    .calc-mode-btn {
        flex: 1;
        padding: 8px 12px;
        border: 1px solid var(--border-color);
        background: var(--bg-secondary);
        border-radius: 6px;
        cursor: pointer;
        font-size: 12px;
        transition: all 0.2s ease;
        color: var(--text-primary);
    }

    .calc-mode-btn:hover {
        background: var(--bg-tertiary);
    }

    .calc-mode-btn.active {
        background: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
    }

    .calculator-history {
        margin-top: 15px;
        border-top: 1px solid var(--border-color);
        padding-top: 15px;
    }

    .history-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
    }

    .history-header h4 {
        margin: 0;
        font-size: 14px;
        color: var(--text-primary);
    }

    .clear-history {
        padding: 4px 8px;
        border: none;
        background: var(--error-color);
        color: white;
        border-radius: 4px;
        cursor: pointer;
        font-size: 11px;
    }

    .history-list {
        max-height: 200px;
        overflow-y: auto;
        background: var(--bg-secondary);
        border-radius: 6px;
        padding: 8px;
    }

    .history-item {
        padding: 6px 8px;
        border-bottom: 1px solid var(--border-color);
        font-size: 12px;
    }

    .history-item:last-child {
        border-bottom: none;
    }

    .history-expression {
        color: var(--text-primary);
        margin-bottom: 2px;
    }

    .history-time {
        color: var(--text-secondary);
        font-size: 10px;
        text-align: right;
    }

    .calculator-btn.active {
        transform: scale(0.95);
        background: var(--primary-dark) !important;
    }

    .calc-current.updating {
        transform: scale(1.02);
    }

    .calc-current.error {
        color: var(--error-color);
        animation: shake 0.5s ease-in-out;
    }

    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
`;

// Добавляем стили в документ
const style = document.createElement('style');
style.textContent = calculatorStyles;
document.head.appendChild(style);

window.Calculator = Calculator;
