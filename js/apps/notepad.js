// Приложение Блокнот
class Notepad {
    constructor(container, options = {}) {
        this.container = container;
        this.options = options;
        this.filename = options.filename || 'Новый документ.txt';
        this.isModified = false;
        this.autoSaveInterval = null;
        
        this.init();
    }

    init() {
        this.render();
        this.setupEventListeners();
        this.loadContent();
        this.startAutoSave();
    }

    render() {
        this.container.innerHTML = `
            <div class="notepad-app">
                <div class="notepad-toolbar">
                    <button class="notepad-btn" id="new-file" title="Новый файл">📄 Новый</button>
                    <button class="notepad-btn" id="open-file" title="Открыть файл">📂 Открыть</button>
                    <button class="notepad-btn" id="save-file" title="Сохранить файл">💾 Сохранить</button>
                    <button class="notepad-btn" id="save-as" title="Сохранить как">💾 Сохранить как</button>
                    
                    <div class="toolbar-separator"></div>
                    
                    <button class="notepad-btn" id="undo" title="Отменить">↶ Отменить</button>
                    <button class="notepad-btn" id="redo" title="Повторить">↷ Повторить</button>
                    
                    <div class="toolbar-separator"></div>
                    
                    <button class="notepad-btn" id="find" title="Найти">🔍 Найти</button>
                    <button class="notepad-btn" id="replace" title="Заменить">🔁 Заменить</button>
                    
                    <div class="toolbar-separator"></div>
                    
                    <select class="notepad-font-size" id="font-size" title="Размер шрифта">
                        <option value="12">12px</option>
                        <option value="14" selected>14px</option>
                        <option value="16">16px</option>
                        <option value="18">18px</option>
                        <option value="20">20px</option>
                        <option value="24">24px</option>
                    </select>
                    
                    <select class="notepad-font-family" id="font-family" title="Шрифт">
                        <option value="Arial">Arial</option>
                        <option value="'Courier New'">Courier New</option>
                        <option value="'Times New Roman'">Times New Roman</option>
                        <option value="Verdana">Verdana</option>
                        <option value="Georgia">Georgia</option>
                        <option value="'Segoe UI'" selected>Segoe UI</option>
                    </select>
                </div>
                
                <div class="notepad-statusbar">
                    <span id="status-line">Строка: 1, Колонка: 1</span>
                    <span id="status-encoding">UTF-8</span>
                    <span id="status-modified" style="color: var(--error-color); display: none;">● Изменен</span>
                </div>
                
                <textarea class="notepad-textarea" id="notepad-textarea" 
                          placeholder="Начните печатать..." spellcheck="false"></textarea>
                
                <div class="notepad-find-replace" id="find-replace-panel" style="display: none;">
                    <div class="find-replace-content">
                        <input type="text" id="find-input" placeholder="Найти..." class="find-input">
                        <input type="text" id="replace-input" placeholder="Заменить на..." class="replace-input">
                        <button id="find-next" class="find-btn">Найти далее</button>
                        <button id="find-prev" class="find-btn">Найти ранее</button>
                        <button id="replace-btn" class="replace-btn">Заменить</button>
                        <button id="replace-all" class="replace-btn">Заменить все</button>
                        <button id="close-find" class="close-btn">✕</button>
                    </div>
                </div>
            </div>
        `;

        this.textarea = this.container.querySelector('#notepad-textarea');
        this.statusLine = this.container.querySelector('#status-line');
        this.statusModified = this.container.querySelector('#status-modified');
        this.findReplacePanel = this.container.querySelector('#find-replace-panel');
    }

    setupEventListeners() {
        // Кнопки тулбара
        this.setupToolbarEvents();
        
        // События текстового поля
        this.textarea.addEventListener('input', () => {
            this.setModified(true);
            this.updateStatusBar();
        });

        this.textarea.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        this.textarea.addEventListener('scroll', () => {
            this.updateStatusBar();
        });

        // События изменения размера шрифта
        const fontSizeSelect = this.container.querySelector('#font-size');
        const fontFamilySelect = this.container.querySelector('#font-family');
        
        fontSizeSelect.addEventListener('change', (e) => {
            this.textarea.style.fontSize = e.target.value + 'px';
        });

        fontFamilySelect.addEventListener('change', (e) => {
            this.textarea.style.fontFamily = e.target.value;
        });

        // Загрузка сохраненных настроек
        this.loadSettings();
    }

    setupToolbarEvents() {
        const buttons = {
            'new-file': () => this.newFile(),
            'open-file': () => this.openFile(),
            'save-file': () => this.saveFile(),
            'save-as': () => this.saveAs(),
            'undo': () => this.undo(),
            'redo': () => this.redo(),
            'find': () => this.showFindPanel(),
            'replace': () => this.showReplacePanel(),
            'find-next': () => this.findNext(),
            'find-prev': () => this.findPrev(),
            'replace-btn': () => this.replace(),
            'replace-all': () => this.replaceAll(),
            'close-find': () => this.hideFindPanel()
        };

        Object.keys(buttons).forEach(id => {
            const element = this.container.querySelector(`#${id}`);
            if (element) {
                element.addEventListener('click', buttons[id]);
            }
        });
    }

    handleKeyboardShortcuts(e) {
        // Ctrl+S - Сохранить
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            this.saveFile();
        }
        // Ctrl+O - Открыть
        else if (e.ctrlKey && e.key === 'o') {
            e.preventDefault();
            this.openFile();
        }
        // Ctrl+N - Новый файл
        else if (e.ctrlKey && e.key === 'n') {
            e.preventDefault();
            this.newFile();
        }
        // Ctrl+F - Найти
        else if (e.ctrlKey && e.key === 'f') {
            e.preventDefault();
            this.showFindPanel();
        }
        // Ctrl+H - Заменить
        else if (e.ctrlKey && e.key === 'h') {
            e.preventDefault();
            this.showReplacePanel();
        }
        // Ctrl+Z - Отменить
        else if (e.ctrlKey && e.key === 'z') {
            if (!e.shiftKey) {
                e.preventDefault();
                this.undo();
            }
        }
        // Ctrl+Y или Ctrl+Shift+Z - Повторить
        else if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) {
            e.preventDefault();
            this.redo();
        }
        // Escape - Закрыть панель поиска
        else if (e.key === 'Escape') {
            this.hideFindPanel();
        }
    }

    newFile() {
        if (this.isModified) {
            if (!confirm('Сохранить изменения в текущем файле?')) {
                return;
            }
            this.saveFile();
        }

        this.textarea.value = '';
        this.filename = 'Новый документ.txt';
        this.setModified(false);
        this.updateWindowTitle();
        this.textarea.focus();
    }

    openFile() {
        // Создаем виртуальный файловый диалог
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.txt,.text,.md,.js,.html,.css,.json';
        
        fileInput.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                this.readFile(file);
            }
        };
        
        fileInput.click();
    }

    readFile(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            this.textarea.value = e.target.result;
            this.filename = file.name;
            this.setModified(false);
            this.updateWindowTitle();
            Utils.showNotification('Блокнот', `Файл "${file.name}" загружен`, 'success');
        };
        
        reader.onerror = () => {
            Utils.showNotification('Блокнот', 'Ошибка при чтении файла', 'error');
        };
        
        reader.readAsText(file);
    }

    saveFile() {
        if (this.filename === 'Новый документ.txt') {
            this.saveAs();
            return;
        }

        this.saveContent();
    }

    saveAs() {
        // Создаем виртуальный диалог сохранения
        const filename = prompt('Введите имя файла:', this.filename);
        if (filename) {
            this.filename = filename;
            this.saveContent();
        }
    }

    saveContent() {
        try {
            // В реальном приложении здесь бы было сохранение на сервер
            const content = this.textarea.value;
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = this.filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.setModified(false);
            Utils.showNotification('Блокнот', `Файл "${this.filename}" сохранен`, 'success');
        } catch (error) {
            Utils.showNotification('Блокнот', 'Ошибка при сохранении файла', 'error');
        }
    }

    undo() {
        document.execCommand('undo');
        this.updateStatusBar();
    }

    redo() {
        document.execCommand('redo');
        this.updateStatusBar();
    }

    showFindPanel() {
        this.findReplacePanel.style.display = 'block';
        const findInput = this.container.querySelector('#find-input');
        findInput.focus();
        findInput.select();
    }

    showReplacePanel() {
        this.findReplacePanel.style.display = 'block';
        const replaceInput = this.container.querySelector('#replace-input');
        replaceInput.focus();
        replaceInput.select();
    }

    hideFindPanel() {
        this.findReplacePanel.style.display = 'none';
        this.textarea.focus();
    }

    findNext() {
        this.findText(false);
    }

    findPrev() {
        this.findText(true);
    }

    findText(backwards = false) {
        const findInput = this.container.querySelector('#find-input');
        const searchText = findInput.value;
        
        if (!searchText) return;

        const text = this.textarea.value;
        let startPos = this.textarea.selectionStart;
        
        if (backwards) {
            // Поиск назад
            const textBefore = text.substring(0, startPos);
            const foundIndex = textBefore.lastIndexOf(searchText);
            
            if (foundIndex !== -1) {
                this.textarea.setSelectionRange(foundIndex, foundIndex + searchText.length);
                this.textarea.focus();
            } else {
                Utils.showNotification('Блокнот', 'Текст не найден', 'warning');
            }
        } else {
            // Поиск вперед
            startPos = Math.max(startPos, this.textarea.selectionEnd);
            const foundIndex = text.indexOf(searchText, startPos);
            
            if (foundIndex !== -1) {
                this.textarea.setSelectionRange(foundIndex, foundIndex + searchText.length);
                this.textarea.focus();
            } else {
                // Поиск с начала
                const foundFromStart = text.indexOf(searchText);
                if (foundFromStart !== -1) {
                    this.textarea.setSelectionRange(foundFromStart, foundFromStart + searchText.length);
                    this.textarea.focus();
                } else {
                    Utils.showNotification('Блокнот', 'Текст не найден', 'warning');
                }
            }
        }
    }

    replace() {
        const findInput = this.container.querySelector('#find-input');
        const replaceInput = this.container.querySelector('#replace-input');
        const searchText = findInput.value;
        const replaceText = replaceInput.value;
        
        if (!searchText) return;

        const selectedText = this.textarea.value.substring(
            this.textarea.selectionStart,
            this.textarea.selectionEnd
        );

        if (selectedText === searchText) {
            this.textarea.setRangeText(replaceText);
            this.setModified(true);
            this.findNext();
        } else {
            this.findNext();
        }
    }

    replaceAll() {
        const findInput = this.container.querySelector('#find-input');
        const replaceInput = this.container.querySelector('#replace-input');
        const searchText = findInput.value;
        const replaceText = replaceInput.value;
        
        if (!searchText) return;

        const regex = new RegExp(this.escapeRegex(searchText), 'g');
        this.textarea.value = this.textarea.value.replace(regex, replaceText);
        this.setModified(true);
        Utils.showNotification('Блокнот', 'Все вхождения заменены', 'success');
    }

    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    updateStatusBar() {
        const text = this.textarea.value;
        const cursorPos = this.textarea.selectionStart;
        
        // Вычисляем строку и колонку
        const textBeforeCursor = text.substring(0, cursorPos);
        const lines = textBeforeCursor.split('\n');
        const currentLine = lines.length;
        const currentColumn = lines[lines.length - 1].length + 1;
        
        this.statusLine.textContent = `Строка: ${currentLine}, Колонка: ${currentColumn}`;
    }

    updateWindowTitle() {
        const windowElement = this.container.closest('.window');
        if (windowElement) {
            const titleElement = windowElement.querySelector('.window-title span:last-child');
            if (titleElement) {
                titleElement.textContent = `Блокнот - ${this.filename}${this.isModified ? ' *' : ''}`;
            }
        }
    }

    setModified(modified) {
        this.isModified = modified;
        this.statusModified.style.display = modified ? 'inline' : 'none';
        this.updateWindowTitle();
    }

    loadContent() {
        const savedContent = Utils.storage.get('notepad-content');
        if (savedContent) {
            this.textarea.value = savedContent;
        } else {
            this.textarea.value = 'Добро пожаловать в блокнот WebOS!\n\n' +
                                'Возможности:\n' +
                                '• Создание и редактирование текстовых файлов\n' +
                                '• Сохранение и открытие файлов\n' +
                                '• Поиск и замена текста\n' +
                                '• Настройка шрифта и размера текста\n' +
                                '• Горячие клавиши (Ctrl+S, Ctrl+O, Ctrl+F и др.)\n\n' +
                                'Начните печатать...';
        }
        
        this.updateStatusBar();
        this.textarea.focus();
    }

    saveSettings() {
        Utils.storage.set('notepad-font-size', this.textarea.style.fontSize);
        Utils.storage.set('notepad-font-family', this.textarea.style.fontFamily);
    }

    loadSettings() {
        const fontSize = Utils.storage.get('notepad-font-size', '14px');
        const fontFamily = Utils.storage.get('notepad-font-family', "'Segoe UI'");
        
        this.textarea.style.fontSize = fontSize;
        this.textarea.style.fontFamily = fontFamily;
        
        // Устанавливаем значения в селекты
        const fontSizeSelect = this.container.querySelector('#font-size');
        const fontFamilySelect = this.container.querySelector('#font-family');
        
        if (fontSizeSelect) fontSizeSelect.value = parseInt(fontSize);
        if (fontFamilySelect) fontFamilySelect.value = fontFamily;
    }

    startAutoSave() {
        this.autoSaveInterval = setInterval(() => {
            if (this.isModified) {
                Utils.storage.set('notepad-content', this.textarea.value);
                this.saveSettings();
            }
        }, 30000); // Автосохранение каждые 30 секунд
    }

    destroy() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }
        
        // Сохраняем при закрытии
        if (this.isModified) {
            Utils.storage.set('notepad-content', this.textarea.value);
            this.saveSettings();
        }
    }
}

// Добавляем CSS для блокнота
const notepadStyles = `
    .notepad-app {
        height: 100%;
        display: flex;
        flex-direction: column;
        background: var(--bg-primary);
    }

    .notepad-toolbar {
        display: flex;
        align-items: center;
        padding: 8px 12px;
        border-bottom: 1px solid var(--border-color);
        background: var(--bg-secondary);
        flex-wrap: wrap;
        gap: 6px;
    }

    .notepad-btn {
        padding: 6px 12px;
        border: 1px solid var(--border-color);
        background: var(--bg-primary);
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        transition: all 0.2s ease;
        color: var(--text-primary);
        display: flex;
        align-items: center;
        gap: 4px;
    }

    .notepad-btn:hover {
        background: var(--bg-tertiary);
        border-color: var(--primary-color);
    }

    .toolbar-separator {
        width: 1px;
        height: 20px;
        background: var(--border-color);
        margin: 0 4px;
    }

    .notepad-font-size,
    .notepad-font-family {
        padding: 4px 8px;
        border: 1px solid var(--border-color);
        background: var(--bg-primary);
        border-radius: 4px;
        font-size: 12px;
        color: var(--text-primary);
        min-width: 80px;
    }

    .notepad-statusbar {
        display: flex;
        justify-content: space-between;
        padding: 4px 12px;
        border-top: 1px solid var(--border-color);
        background: var(--bg-secondary);
        font-size: 11px;
        color: var(--text-secondary);
    }

    .notepad-textarea {
        flex: 1;
        border: none;
        resize: none;
        padding: 12px;
        font-family: inherit;
        font-size: 14px;
        line-height: 1.5;
        background: var(--bg-primary);
        color: var(--text-primary);
        outline: none;
        tab-size: 4;
    }

    .notepad-textarea::placeholder {
        color: var(--text-secondary);
    }

    .notepad-find-replace {
        position: absolute;
        top: 45px;
        right: 20px;
        background: var(--bg-primary);
        border: 1px solid var(--border-color);
        border-radius: 6px;
        box-shadow: var(--shadow);
        z-index: 100;
        min-width: 400px;
    }

    .find-replace-content {
        padding: 12px;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        align-items: center;
    }

    .find-input,
    .replace-input {
        grid-column: 1 / -1;
        padding: 6px 8px;
        border: 1px solid var(--border-color);
        border-radius: 4px;
        font-size: 12px;
        background: var(--bg-primary);
        color: var(--text-primary);
    }

    .find-btn,
    .replace-btn {
        padding: 4px 8px;
        border: 1px solid var(--border-color);
        background: var(--bg-secondary);
        border-radius: 4px;
        cursor: pointer;
        font-size: 11px;
        color: var(--text-primary);
    }

    .find-btn:hover,
    .replace-btn:hover {
        background: var(--bg-tertiary);
    }

    .close-btn {
        padding: 4px 8px;
        border: 1px solid var(--border-color);
        background: var(--error-color);
        color: white;
        border-radius: 4px;
        cursor: pointer;
        font-size: 11px;
        grid-column: 1 / -1;
        justify-self: end;
        width: auto;
    }

    .close-btn:hover {
        background: #c50f1f;
    }
`;

const notepadStyle = document.createElement('style');
notepadStyle.textContent = notepadStyles;
document.head.appendChild(notepadStyle);

window.Notepad = Notepad;
