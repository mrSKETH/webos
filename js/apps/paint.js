// Приложение Рисование
class Paint {
    constructor(container, options = {}) {
        this.container = container;
        this.options = options;
        
        this.canvas = null;
        this.context = null;
        this.isDrawing = false;
        this.currentTool = 'brush';
        this.currentColor = '#000000';
        this.brushSize = 5;
        this.history = [];
        this.historyIndex = -1;
        
        this.init();
    }

    init() {
        this.render();
        this.setupEventListeners();
        this.setupCanvas();
        this.loadSettings();
    }

    render() {
        this.container.innerHTML = `
            <div class="paint-app">
                <div class="paint-toolbar">
                    <div class="tool-group">
                        <button class="paint-tool active" data-tool="brush" title="Кисть">
                            <span>🖌️</span>
                        </button>
                        <button class="paint-tool" data-tool="eraser" title="Ластик">
                            <span>🧽</span>
                        </button>
                        <button class="paint-tool" data-tool="line" title="Линия">
                            <span>📏</span>
                        </button>
                        <button class="paint-tool" data-tool="rectangle" title="Прямоугольник">
                            <span>⬜</span>
                        </button>
                        <button class="paint-tool" data-tool="circle" title="Круг">
                            <span>⭕</span>
                        </button>
                        <button class="paint-tool" data-tool="text" title="Текст">
                            <span>🔤</span>
                        </button>
                    </div>
                    
                    <div class="tool-group">
                        <div class="tool-option">
                            <label>Размер:</label>
                            <input type="range" id="brush-size" min="1" max="50" value="${this.brushSize}" class="size-slider">
                            <span id="brush-size-value">${this.brushSize}px</span>
                        </div>
                    </div>
                    
                    <div class="tool-group">
                        <div class="color-picker">
                            <input type="color" id="color-picker" value="${this.currentColor}" title="Выбор цвета">
                            <div class="color-presets">
                                <div class="color-swatch" data-color="#000000" style="background: #000000"></div>
                                <div class="color-swatch" data-color="#ff0000" style="background: #ff0000"></div>
                                <div class="color-swatch" data-color="#00ff00" style="background: #00ff00"></div>
                                <div class="color-swatch" data-color="#0000ff" style="background: #0000ff"></div>
                                <div class="color-swatch" data-color="#ffff00" style="background: #ffff00"></div>
                                <div class="color-swatch" data-color="#ff00ff" style="background: #ff00ff"></div>
                                <div class="color-swatch" data-color="#00ffff" style="background: #00ffff"></div>
                                <div class="color-swatch" data-color="#ffffff" style="background: #ffffff; border: 1px solid #ccc"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="tool-group">
                        <button class="paint-action" id="paint-undo" title="Отменить (Ctrl+Z)">↶</button>
                        <button class="paint-action" id="paint-redo" title="Повторить (Ctrl+Y)">↷</button>
                        <button class="paint-action" id="paint-clear" title="Очистить">🗑️</button>
                        <button class="paint-action" id="paint-save" title="Сохранить">💾</button>
                    </div>
                </div>
                
                <div class="paint-content">
                    <div class="canvas-container">
                        <canvas id="paint-canvas" width="800" height="600"></canvas>
                    </div>
                    
                    <div class="paint-statusbar">
                        <span id="cursor-position">X: 0, Y: 0</span>
                        <span id="canvas-size">800 × 600</span>
                        <span id="tool-info">Инструмент: Кисть</span>
                    </div>
                </div>
                
                <div class="text-toolbar" id="text-toolbar" style="display: none;">
                    <input type="text" id="text-input" placeholder="Введите текст..." maxlength="50">
                    <select id="text-font">
                        <option value="Arial">Arial</option>
                        <option value="Verdana">Verdana</option>
                        <option value="Georgia">Georgia</option>
                        <option value="'Times New Roman'">Times New Roman</option>
                        <option value="'Courier New'">Courier New</option>
                    </select>
                    <input type="number" id="text-size" min="10" max="72" value="24">
                    <button id="text-apply">Применить</button>
                    <button id="text-cancel">Отмена</button>
                </div>
            </div>
        `;

        this.canvas = this.container.querySelector('#paint-canvas');
        this.context = this.canvas.getContext('2d');
        this.cursorPosition = this.container.querySelector('#cursor-position');
        this.toolInfo = this.container.querySelector('#tool-info');
        this.textToolbar = this.container.querySelector('#text-toolbar');
    }

    setupEventListeners() {
        // Инструменты
        this.container.querySelectorAll('.paint-tool').forEach(tool => {
            tool.addEventListener('click', (e) => {
                const toolName = e.currentTarget.getAttribute('data-tool');
                this.selectTool(toolName);
            });
        });

        // Размер кисти
        const sizeSlider = this.container.querySelector('#brush-size');
        const sizeValue = this.container.querySelector('#brush-size-value');
        
        sizeSlider.addEventListener('input', (e) => {
            this.brushSize = parseInt(e.target.value);
            sizeValue.textContent = `${this.brushSize}px`;
        });

        // Выбор цвета
        const colorPicker = this.container.querySelector('#color-picker');
        colorPicker.addEventListener('change', (e) => {
            this.currentColor = e.target.value;
        });

        // Пресеты цветов
        this.container.querySelectorAll('.color-swatch').forEach(swatch => {
            swatch.addEventListener('click', (e) => {
                const color = e.target.getAttribute('data-color');
                this.currentColor = color;
                colorPicker.value = color;
            });
        });

        // Действия
        this.container.querySelector('#paint-undo').addEventListener('click', () => this.undo());
        this.container.querySelector('#paint-redo').addEventListener('click', () => this.redo());
        this.container.querySelector('#paint-clear').addEventListener('click', () => this.clearCanvas());
        this.container.querySelector('#paint-save').addEventListener('click', () => this.saveImage());

        // Текст
        this.container.querySelector('#text-apply').addEventListener('click', () => this.applyText());
        this.container.querySelector('#text-cancel').addEventListener('click', () => this.cancelText());

        // События canvas
        this.setupCanvasEvents();

        // Горячие клавиши
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'z') {
                e.preventDefault();
                this.undo();
            } else if (e.ctrlKey && e.key === 'y') {
                e.preventDefault();
                this.redo();
            } else if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                this.saveImage();
            } else if (e.key === 'Escape') {
                this.cancelText();
            }
        });
    }

    setupCanvas() {
        // Настраиваем контекст canvas
        this.context.lineCap = 'round';
        this.context.lineJoin = 'round';
        this.context.fillStyle = '#ffffff';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.saveState();
    }

    setupCanvasEvents() {
        let startX, startY;
        let isDrawingShape = false;
        let tempCanvas, tempContext;

        // Создаем временный canvas для предпросмотра фигур
        tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.canvas.width;
        tempCanvas.height = this.canvas.height;
        tempContext = tempCanvas.getContext('2d');

        const getMousePos = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            return {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        };

        // Мышь
        this.canvas.addEventListener('mousedown', (e) => {
            if (this.currentTool === 'text') {
                this.startTextInput(e);
                return;
            }

            const pos = getMousePos(e);
            startX = pos.x;
            startY = pos.y;
            this.isDrawing = true;

            if (['brush', 'eraser'].includes(this.currentTool)) {
                this.context.beginPath();
                this.context.moveTo(pos.x, pos.y);
            } else {
                isDrawingShape = true;
                tempContext.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
            }
        });

        this.canvas.addEventListener('mousemove', (e) => {
            const pos = getMousePos(e);
            this.updateCursorPosition(pos.x, pos.y);

            if (!this.isDrawing) return;

            if (['brush', 'eraser'].includes(this.currentTool)) {
                this.drawFreehand(pos.x, pos.y);
            } else if (isDrawingShape) {
                this.drawShapePreview(startX, startY, pos.x, pos.y, tempContext);
            }
        });

        this.canvas.addEventListener('mouseup', (e) => {
            if (!this.isDrawing) return;

            const pos = getMousePos(e);
            
            if (['brush', 'eraser'].includes(this.currentTool)) {
                this.context.closePath();
            } else if (isDrawingShape) {
                this.drawFinalShape(startX, startY, pos.x, pos.y);
                tempContext.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
                isDrawingShape = false;
            }

            this.isDrawing = false;
            this.saveState();
        });

        this.canvas.addEventListener('mouseout', () => {
            this.isDrawing = false;
            if (isDrawingShape) {
                tempContext.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
                isDrawingShape = false;
            }
        });

        // Сенсорные события для мобильных устройств
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.canvas.dispatchEvent(mouseEvent);
        });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.canvas.dispatchEvent(mouseEvent);
        });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            const mouseEvent = new MouseEvent('mouseup');
            this.canvas.dispatchEvent(mouseEvent);
        });
    }

    drawFreehand(x, y) {
        this.context.lineTo(x, y);
        
        if (this.currentTool === 'brush') {
            this.context.strokeStyle = this.currentColor;
            this.context.lineWidth = this.brushSize;
        } else if (this.currentTool === 'eraser') {
            this.context.strokeStyle = '#ffffff';
            this.context.lineWidth = this.brushSize;
        }
        
        this.context.stroke();
    }

    drawShapePreview(startX, startY, currentX, currentY, context) {
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        context.strokeStyle = this.currentColor;
        context.lineWidth = this.brushSize;
        context.setLineDash([5, 5]);

        switch (this.currentTool) {
            case 'line':
                context.beginPath();
                context.moveTo(startX, startY);
                context.lineTo(currentX, currentY);
                context.stroke();
                break;
            case 'rectangle':
                const rectWidth = currentX - startX;
                const rectHeight = currentY - startY;
                context.strokeRect(startX, startY, rectWidth, rectHeight);
                break;
            case 'circle':
                const radius = Math.sqrt(Math.pow(currentX - startX, 2) + Math.pow(currentY - startY, 2));
                context.beginPath();
                context.arc(startX, startY, radius, 0, 2 * Math.PI);
                context.stroke();
                break;
        }

        context.setLineDash([]);
    }

    drawFinalShape(startX, startY, endX, endY) {
        this.context.strokeStyle = this.currentColor;
        this.context.lineWidth = this.brushSize;
        this.context.setLineDash([]);

        switch (this.currentTool) {
            case 'line':
                this.context.beginPath();
                this.context.moveTo(startX, startY);
                this.context.lineTo(endX, endY);
                this.context.stroke();
                break;
            case 'rectangle':
                const rectWidth = endX - startX;
                const rectHeight = endY - startY;
                this.context.strokeRect(startX, startY, rectWidth, rectHeight);
                break;
            case 'circle':
                const radius = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
                this.context.beginPath();
                this.context.arc(startX, startY, radius, 0, 2 * Math.PI);
                this.context.stroke();
                break;
        }
    }

    startTextInput(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        this.textToolbar.style.display = 'flex';
        this.textToolbar.style.position = 'absolute';
        this.textToolbar.style.left = (x + 10) + 'px';
        this.textToolbar.style.top = (y + 10) + 'px';
        this.textToolbar.setAttribute('data-pos-x', x);
        this.textToolbar.setAttribute('data-pos-y', y);
        
        this.container.querySelector('#text-input').focus();
    }

    applyText() {
        const text = this.container.querySelector('#text-input').value;
        const font = this.container.querySelector('#text-font').value;
        const size = this.container.querySelector('#text-size').value;
        const x = parseInt(this.textToolbar.getAttribute('data-pos-x'));
        const y = parseInt(this.textToolbar.getAttribute('data-pos-y'));

        if (text) {
            this.context.font = `${size}px ${font}`;
            this.context.fillStyle = this.currentColor;
            this.context.fillText(text, x, y);
            this.saveState();
        }

        this.cancelText();
    }

    cancelText() {
        this.textToolbar.style.display = 'none';
        this.container.querySelector('#text-input').value = '';
    }

    selectTool(toolName) {
        // Снимаем выделение со всех инструментов
        this.container.querySelectorAll('.paint-tool').forEach(tool => {
            tool.classList.remove('active');
        });

        // Выделяем выбранный инструмент
        this.container.querySelector(`[data-tool="${toolName}"]`).classList.add('active');

        this.currentTool = toolName;
        this.updateToolInfo();

        // Скрываем панель текста если переключились с текстового инструмента
        if (toolName !== 'text') {
            this.cancelText();
        }
    }

    updateCursorPosition(x, y) {
        this.cursorPosition.textContent = `X: ${Math.round(x)}, Y: ${Math.round(y)}`;
    }

    updateToolInfo() {
        const toolNames = {
            'brush': 'Кисть',
            'eraser': 'Ластик',
            'line': 'Линия',
            'rectangle': 'Прямоугольник',
            'circle': 'Круг',
            'text': 'Текст'
        };
        
        this.toolInfo.textContent = `Инструмент: ${toolNames[this.currentTool]}`;
    }

    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.restoreState();
        }
    }

    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.restoreState();
        }
    }

    saveState() {
        // Удаляем все состояния после текущего индекса
        this.history = this.history.slice(0, this.historyIndex + 1);
        
        // Сохраняем текущее состояние
        const imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
        this.history.push(imageData);
        this.historyIndex = this.history.length - 1;

        // Ограничиваем историю 50 состояниями
        if (this.history.length > 50) {
            this.history.shift();
            this.historyIndex--;
        }
    }

    restoreState() {
        if (this.history[this.historyIndex]) {
            this.context.putImageData(this.history[this.historyIndex], 0, 0);
        }
    }

    clearCanvas() {
        if (confirm('Очистить холст?')) {
            this.context.fillStyle = '#ffffff';
            this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.saveState();
            Utils.showNotification('Рисование', 'Холст очищен', 'success');
        }
    }

    saveImage() {
        const link = document.createElement('a');
        link.download = `рисунок-${new Date().getTime()}.png`;
        link.href = this.canvas.toDataURL('image/png');
        link.click();
        Utils.showNotification('Рисование', 'Рисунок сохранен', 'success');
    }

    loadSettings() {
        const settings = Utils.storage.get('paint-settings');
        if (settings) {
            this.currentColor = settings.color || this.currentColor;
            this.brushSize = settings.brushSize || this.brushSize;
            
            // Обновляем UI
            this.container.querySelector('#color-picker').value = this.currentColor;
            this.container.querySelector('#brush-size').value = this.brushSize;
            this.container.querySelector('#brush-size-value').textContent = `${this.brushSize}px`;
        }
    }

    saveSettings() {
        Utils.storage.set('paint-settings', {
            color: this.currentColor,
            brushSize: this.brushSize
        });
    }

    destroy() {
        this.saveSettings();
    }
}

// Добавляем CSS для Paint
const paintStyles = `
    .paint-app {
        height: 100%;
        display: flex;
        flex-direction: column;
        background: var(--bg-primary);
    }

    .paint-toolbar {
        display: flex;
        align-items: center;
        padding: 8px 12px;
        border-bottom: 1px solid var(--border-color);
        background: var(--bg-secondary);
        gap: 20px;
        flex-wrap: wrap;
    }

    .tool-group {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .paint-tool {
        padding: 8px;
        border: 2px solid transparent;
        background: var(--bg-primary);
        border-radius: 6px;
        cursor: pointer;
        font-size: 18px;
        transition: all 0.2s ease;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .paint-tool:hover {
        background: var(--bg-tertiary);
        border-color: var(--border-color);
    }

    .paint-tool.active {
        border-color: var(--primary-color);
        background: rgba(0, 120, 212, 0.1);
    }

    .tool-option {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: var(--text-primary);
    }

    .size-slider {
        width: 80px;
    }

    .color-picker {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    #color-picker {
        width: 40px;
        height: 40px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
    }

    .color-presets {
        display: flex;
        gap: 4px;
    }

    .color-swatch {
        width: 20px;
        height: 20px;
        border-radius: 3px;
        cursor: pointer;
        border: 1px solid var(--border-color);
        transition: transform 0.2s;
    }

    .color-swatch:hover {
        transform: scale(1.1);
    }

    .paint-action {
        padding: 8px 12px;
        border: 1px solid var(--border-color);
        background: var(--bg-primary);
        border-radius: 6px;
        cursor: pointer;
        font-size: 16px;
        transition: all 0.2s ease;
    }

    .paint-action:hover {
        background: var(--bg-tertiary);
        border-color: var(--primary-color);
    }

    .paint-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    .canvas-container {
        flex: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        background: var(--bg-secondary);
        padding: 20px;
        overflow: auto;
    }

    #paint-canvas {
        background: white;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        box-shadow: var(--shadow);
        cursor: crosshair;
    }

    .paint-statusbar {
        display: flex;
        justify-content: space-between;
        padding: 6px 16px;
        border-top: 1px solid var(--border-color);
        background: var(--bg-secondary);
        font-size: 12px;
        color: var(--text-secondary);
    }

    .text-toolbar {
        position: absolute;
        background: var(--bg-primary);
        border: 1px solid var(--border-color);
        border-radius: 6px;
        padding: 8px;
        box-shadow: var(--shadow);
        z-index: 100;
        display: flex;
        gap: 8px;
        align-items: center;
    }

    #text-input {
        padding: 6px 8px;
        border: 1px solid var(--border-color);
        border-radius: 4px;
        font-size: 13px;
        width: 150px;
        background: var(--bg-primary);
        color: var(--text-primary);
    }

    #text-font, #text-size {
        padding: 4px 6px;
        border: 1px solid var(--border-color);
        border-radius: 4px;
        font-size: 12px;
        background: var(--bg-primary);
        color: var(--text-primary);
    }

    #text-apply, #text-cancel {
        padding: 4px 8px;
        border: 1px solid var(--border-color);
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        background: var(--bg-secondary);
        color: var(--text-primary);
    }

    #text-apply:hover {
        background: var(--primary-color);
        color: white;
    }

    #text-cancel:hover {
        background: var(--error-color);
        color: white;
    }
`;

const paintStyle = document.createElement('style');
paintStyle.textContent = paintStyles;
document.head.appendChild(paintStyle);

window.Paint = Paint;
