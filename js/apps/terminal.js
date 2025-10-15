// Приложение Терминал
class Terminal {
    constructor(container, options = {}) {
        this.container = container;
        this.options = options;
        
        this.history = [];
        this.historyIndex = -1;
        this.currentDirectory = '/home/user';
        this.commands = {};
        this.output = [];
        
        this.init();
    }

    init() {
        this.render();
        this.setupEventListeners();
        this.registerCommands();
        this.showWelcomeMessage();
        this.focusInput();
    }

    render() {
        this.container.innerHTML = `
            <div class="terminal-app">
                <div class="terminal-header">
                    <div class="terminal-title">
                        <span>💻</span>
                        <span>Терминал</span>
                    </div>
                    <div class="terminal-controls">
                        <button class="terminal-control-btn" id="terminal-clear" title="Очистить">🗑️</button>
                        <button class="terminal-control-btn" id="terminal-settings" title="Настройки">⚙️</button>
                    </div>
                </div>
                
                <div class="terminal-content" id="terminal-content">
                    <!-- Terminal output will be here -->
                </div>
                
                <div class="terminal-input-line">
                    <span class="terminal-prompt" id="terminal-prompt">user@webos:~$</span>
                    <input type="text" class="terminal-input" id="terminal-input" autocomplete="off" spellcheck="false">
                </div>
            </div>
        `;

        this.terminalContent = this.container.querySelector('#terminal-content');
        this.terminalInput = this.container.querySelector('#terminal-input');
        this.terminalPrompt = this.container.querySelector('#terminal-prompt');
    }

    setupEventListeners() {
        // Ввод команд
        this.terminalInput.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'Enter':
                    e.preventDefault();
                    this.executeCommand();
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.navigateHistory(-1);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.navigateHistory(1);
                    break;
                case 'Tab':
                    e.preventDefault();
                    this.autoComplete();
                    break;
            }
        });

        // Кнопки управления
        this.container.querySelector('#terminal-clear').addEventListener('click', () => this.clearTerminal());
        this.container.querySelector('#terminal-settings').addEventListener('click', () => this.showSettings());

        // Фокус на ввод при клике в любом месте терминала
        this.container.addEventListener('click', () => this.focusInput());

        // Горячие клавиши
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'l') {
                e.preventDefault();
                this.clearTerminal();
            } else if (e.ctrlKey && e.key === 'c') {
                if (this.terminalInput.value) {
                    e.preventDefault();
                    this.addOutput('^C', 'error');
                    this.terminalInput.value = '';
                }
            }
        });
    }

    registerCommands() {
        this.commands = {
            'help': {
                description: 'Показать список доступных команд',
                execute: () => this.showHelp()
            },
            'clear': {
                description: 'Очистить терминал',
                execute: () => this.clearTerminal()
            },
            'echo': {
                description: 'Вывести текст',
                execute: (args) => this.echo(args)
            },
            'ls': {
                description: 'Показать содержимое директории',
                execute: () => this.listDirectory()
            },
            'cd': {
                description: 'Сменить директорию',
                execute: (args) => this.changeDirectory(args)
            },
            'pwd': {
                description: 'Показать текущую директорию',
                execute: () => this.showCurrentDirectory()
            },
            'whoami': {
                description: 'Показать текущего пользователя',
                execute: () => this.whoami()
            },
            'date': {
                description: 'Показать текущую дату и время',
                execute: () => this.showDate()
            },
            'neofetch': {
                description: 'Показать информацию о системе',
                execute: () => this.showSystemInfo()
            },
            'calc': {
                description: 'Простой калькулятор',
                execute: (args) => this.calculate(args)
            },
            'weather': {
                description: 'Показать погоду',
                execute: () => this.showWeather()
            },
            'history': {
                description: 'Показать историю команд',
                execute: () => this.showHistory()
            },
            'exit': {
                description: 'Выйти из терминала',
                execute: () => this.exitTerminal()
            }
        };
    }

    executeCommand() {
        const input = this.terminalInput.value.trim();
        
        if (!input) {
            this.addOutput('');
            this.terminalInput.value = '';
            return;
        }

        // Добавляем в историю
        this.history.push(input);
        this.historyIndex = this.history.length;

        // Показываем команду в выводе
        this.addOutput(`<span class="command-line">${this.getPrompt()} ${input}</span>`);

        // Обрабатываем команду
        const [command, ...args] = input.split(' ');
        const commandHandler = this.commands[command];

        if (commandHandler) {
            try {
                commandHandler.execute(args);
            } catch (error) {
                this.addOutput(`Ошибка: ${error.message}`, 'error');
            }
        } else {
            this.addOutput(`Команда не найдена: ${command}. Введите 'help' для списка команд.`, 'error');
        }

        this.terminalInput.value = '';
        this.scrollToBottom();
    }

    navigateHistory(direction) {
        if (this.history.length === 0) return;

        this.historyIndex = Math.max(0, Math.min(this.history.length, this.historyIndex + direction));
        
        if (this.historyIndex < this.history.length) {
            this.terminalInput.value = this.history[this.historyIndex];
        } else {
            this.terminalInput.value = '';
        }
    }

    autoComplete() {
        const input = this.terminalInput.value;
        const availableCommands = Object.keys(this.commands).filter(cmd => 
            cmd.startsWith(input)
        );

        if (availableCommands.length === 1) {
            this.terminalInput.value = availableCommands[0] + ' ';
        } else if (availableCommands.length > 1) {
            this.addOutput(availableCommands.join('  '));
        }
    }

    // Команды
    showHelp() {
        const helpText = Object.entries(this.commands)
            .map(([cmd, info]) => `<div class="help-line"><span class="command-name">${cmd}</span> - ${info.description}</div>`)
            .join('');
        
        this.addOutput('<div class="help-section">Доступные команды:</div>' + helpText);
    }

    echo(args) {
        this.addOutput(args.join(' '));
    }

    listDirectory() {
        const files = {
            '/home/user': [
                { name: 'documents', type: 'directory', size: '4.0K' },
                { name: 'downloads', type: 'directory', size: '4.0K' },
                { name: 'pictures', type: 'directory', size: '4.0K' },
                { name: 'readme.txt', type: 'file', size: '1.2K' },
                { name: 'script.js', type: 'file', size: '2.4K' }
            ],
            '/home/user/documents': [
                { name: 'project', type: 'directory', size: '4.0K' },
                { name: 'notes.md', type: 'file', size: '3.1K' },
                { name: 'report.pdf', type: 'file', size: '15.2K' }
            ]
        };

        const currentFiles = files[this.currentDirectory] || [];
        
        if (currentFiles.length === 0) {
            this.addOutput('Директория пуста');
            return;
        }

        const fileList = currentFiles.map(file => 
            `<div class="file-line">
                <span class="file-type">${file.type === 'directory' ? 'd' : '-'}</span>
                <span class="file-permissions">rw-r--r--</span>
                <span class="file-owner">user</span>
                <span class="file-group">user</span>
                <span class="file-size">${file.size}</span>
                <span class="file-name ${file.type}">${file.name}</span>
            </div>`
        ).join('');

        this.addOutput(fileList);
    }

    changeDirectory(args) {
        if (args.length === 0) {
            this.currentDirectory = '/home/user';
        } else {
            const target = args[0];
            
            if (target === '..') {
                if (this.currentDirectory !== '/home/user') {
                    this.currentDirectory = this.currentDirectory.split('/').slice(0, -1).join('/') || '/home/user';
                }
            } else if (target === '~') {
                this.currentDirectory = '/home/user';
            } else if (target.startsWith('/')) {
                this.currentDirectory = target;
            } else {
                const newPath = `${this.currentDirectory}/${target}`;
                if (['/home/user', '/home/user/documents'].includes(newPath)) {
                    this.currentDirectory = newPath;
                } else {
                    this.addOutput(`cd: ${target}: Директория не существует`, 'error');
                }
            }
        }
        
        this.updatePrompt();
    }

    showCurrentDirectory() {
        this.addOutput(this.currentDirectory);
    }

    whoami() {
        this.addOutput('user');
    }

    showDate() {
        this.addOutput(new Date().toString());
    }

    showSystemInfo() {
        const art = `
            <pre class="ascii-art">
${' '.repeat(15)}###
${' '.repeat(14)}#######
${' '.repeat(13)}###########
${' '.repeat(12)}###############
${' '.repeat(11)}#################
${' '.repeat(10)}###################
${' '.repeat(9)}#####################
${' '.repeat(8)}#######################
${' '.repeat(7)}#########################
${' '.repeat(6)}###########################
${' '.repeat(5)}#############################
${' '.repeat(4)}###############################
${' '.repeat(3)}#################################
${' '.repeat(2)}###################################
${' '.repeat(1)}#####################################
            </pre>
        `;

        const info = `
            <div class="system-info">
                <div><span class="info-label">Пользователь:</span> user@webos</div>
                <div><span class="info-label">ОС:</span> WebOS 2.0</div>
                <div><span class="info-label">Ядро:</span> 5.15.0-webos</div>
                <div><span class="info-label">Оболочка:</span> webos-sh 2.0.0</div>
                <div><span class="info-label">Терминал:</span> webos-terminal</div>
                <div><span class="info-label">ЦП:</span> Virtual CPU</div>
                <div><span class="info-label">Память:</span> 512M / 1G</div>
            </div>
        `;

        this.addOutput(art + info);
    }

    calculate(args) {
        if (args.length === 0) {
            this.addOutput('Использование: calc <выражение>', 'error');
            return;
        }

        try {
            const expression = args.join(' ');
            // Безопасная оценка выражения
            const result = this.safeEval(expression);
            this.addOutput(`${expression} = ${result}`);
        } catch (error) {
            this.addOutput('Ошибка вычисления', 'error');
        }
    }

    safeEval(expression) {
        // Простая безопасная оценка математических выражений
        const cleanExpression = expression.replace(/[^0-9+\-*/().]/g, '');
        return Function(`"use strict"; return (${cleanExpression})`)();
    }

    showWeather() {
        const weather = `
            <div class="weather-info">
                <div class="weather-city">📍 Москва, Россия</div>
                <div class="weather-temp">🌡️ Температура: +5°C</div>
                <div class="weather-desc">☁️  Облачно</div>
                <div class="weather-humidity">💧 Влажность: 75%</div>
                <div class="weather-wind">💨 Ветер: 3 м/с, СЗ</div>
            </div>
        `;
        this.addOutput(weather);
    }

    showHistory() {
        if (this.history.length === 0) {
            this.addOutput('История команд пуста');
            return;
        }

        const historyList = this.history
            .map((cmd, index) => `<div class="history-line">${index + 1}  ${cmd}</div>`)
            .join('');
        
        this.addOutput(historyList);
    }

    exitTerminal() {
        if (confirm('Закрыть терминал?')) {
            WindowManager.closeWindow(this.container.closest('.window'));
        }
    }

    // Вспомогательные методы
    addOutput(text, type = 'normal') {
        const outputElement = document.createElement('div');
        outputElement.className = `terminal-line ${type}`;
        outputElement.innerHTML = text;
        this.terminalContent.appendChild(outputElement);
    }

    clearTerminal() {
        this.terminalContent.innerHTML = '';
        this.addOutput('Терминал очищен', 'info');
    }

    showWelcomeMessage() {
        const welcome = `
            <div class="welcome-message">
                Добро пожаловать в WebOS Terminal v2.0.0
                <br>
                Введите 'help' для списка доступных команд
                <br><br>
            </div>
        `;
        this.addOutput(welcome);
    }

    showSettings() {
        const settings = `
            <div class="terminal-settings">
                <h4>Настройки терминала</h4>
                <div class="setting-option">
                    <label>Цветовая схема:</label>
                    <select id="theme-select">
                        <option value="default">По умолчанию</option>
                        <option value="dark">Темная</option>
                        <option value="light">Светлая</option>
                        <option value="green">Зеленая</option>
                    </select>
                </div>
                <div class="setting-option">
                    <label>Размер шрифта:</label>
                    <input type="range" id="font-size" min="12" max="24" value="14">
                    <span id="font-size-value">14px</span>
                </div>
                <button id="apply-settings">Применить</button>
            </div>
        `;

        this.addOutput(settings);
        
        // Обработчики для настроек
        setTimeout(() => {
            const themeSelect = this.container.querySelector('#theme-select');
            const fontSizeSlider = this.container.querySelector('#font-size');
            const fontSizeValue = this.container.querySelector('#font-size-value');
            const applyBtn = this.container.querySelector('#apply-settings');

            if (themeSelect && fontSizeSlider && fontSizeValue && applyBtn) {
                themeSelect.addEventListener('change', (e) => {
                    this.applyTheme(e.target.value);
                });

                fontSizeSlider.addEventListener('input', (e) => {
                    fontSizeValue.textContent = `${e.target.value}px`;
                    this.terminalContent.style.fontSize = `${e.target.value}px`;
                });

                applyBtn.addEventListener('click', () => {
                    this.addOutput('Настройки применены', 'success');
                });
            }
        }, 100);
    }

    applyTheme(theme) {
        const themes = {
            'default': { bg: '#1e1e1e', text: '#00ff00' },
            'dark': { bg: '#000000', text: '#ffffff' },
            'light': { bg: '#ffffff', text: '#000000' },
            'green': { bg: '#002b36', text: '#859900' }
        };

        const selectedTheme = themes[theme] || themes.default;
        this.terminalContent.style.background = selectedTheme.bg;
        this.terminalContent.style.color = selectedTheme.text;
    }

    updatePrompt() {
        const dir = this.currentDirectory === '/home/user' ? '~' : 
                   this.currentDirectory.replace('/home/user/', '');
        this.terminalPrompt.textContent = `user@webos:${dir}$`;
    }

    getPrompt() {
        return this.terminalPrompt.textContent;
    }

    focusInput() {
        this.terminalInput.focus();
    }

    scrollToBottom() {
        this.terminalContent.scrollTop = this.terminalContent.scrollHeight;
    }
}

// Добавляем CSS для терминала
const terminalStyles = `
    .terminal-app {
        height: 100%;
        display: flex;
        flex-direction: column;
        background: #1e1e1e;
        color: #00ff00;
        font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
        font-size: 14px;
    }

    .terminal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 12px;
        background: #2d2d2d;
        border-bottom: 1px solid #444;
    }

    .terminal-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
    }

    .terminal-controls {
        display: flex;
        gap: 4px;
    }

    .terminal-control-btn {
        padding: 4px 8px;
        border: none;
        background: #444;
        color: #ccc;
        border-radius: 3px;
        cursor: pointer;
        font-size: 12px;
        transition: background-color 0.2s;
    }

    .terminal-control-btn:hover {
        background: #555;
    }

    .terminal-content {
        flex: 1;
        padding: 12px;
        overflow-y: auto;
        background: #1e1e1e;
        color: #00ff00;
        line-height: 1.4;
    }

    .terminal-line {
        margin-bottom: 2px;
        word-wrap: break-word;
    }

    .terminal-line.error {
        color: #ff5555;
    }

    .terminal-line.info {
        color: #5555ff;
    }

    .terminal-line.success {
        color: #55ff55;
    }

    .command-line {
        color: #00ff00;
    }

    .terminal-input-line {
        display: flex;
        align-items: center;
        padding: 8px 12px;
        background: #2d2d2d;
        border-top: 1px solid #444;
    }

    .terminal-prompt {
        margin-right: 8px;
        color: #55ff55;
        font-weight: 600;
        user-select: none;
    }

    .terminal-input {
        flex: 1;
        background: transparent;
        border: none;
        color: #00ff00;
        font-family: inherit;
        font-size: inherit;
        outline: none;
    }

    .terminal-input::placeholder {
        color: #666;
    }

    /* Стили для вывода команд */
    .help-section {
        margin-bottom: 8px;
        font-weight: 600;
        color: #55ffff;
    }

    .help-line {
        margin-bottom: 4px;
    }

    .command-name {
        color: #ffff55;
        font-weight: 600;
    }

    .file-line {
        display: flex;
        gap: 8px;
        margin-bottom: 2px;
    }

    .file-type {
        color: #ff5555;
        width: 10px;
    }

    .file-permissions {
        color: #5555ff;
        width: 80px;
    }

    .file-owner, .file-group {
        color: #ff55ff;
        width: 60px;
    }

    .file-size {
        color: #55ffff;
        width: 60px;
        text-align: right;
    }

    .file-name {
        color: #ffffff;
    }

    .file-name.directory {
        color: #5555ff;
        font-weight: 600;
    }

    .ascii-art {
        color: #ff5555;
        margin: 0;
        line-height: 1;
    }

    .system-info {
        margin-top: 10px;
    }

    .info-label {
        color: #ffff55;
        font-weight: 600;
    }

    .weather-info {
        line-height: 1.6;
    }

    .weather-city {
        font-weight: 600;
        color: #55ffff;
    }

    .history-line {
        margin-bottom: 2px;
    }

    .welcome-message {
        color: #55ffff;
        line-height: 1.6;
    }

    .terminal-settings {
        background: #2d2d2d;
        padding: 12px;
        border-radius: 4px;
        margin: 8px 0;
    }

    .terminal-settings h4 {
        margin: 0 0 12px 0;
        color: #55ffff;
    }

    .setting-option {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
    }

    .setting-option label {
        min-width: 120px;
        color: #cccccc;
    }

    .setting-option select,
    .setting-option input {
        background: #1e1e1e;
        border: 1px solid #444;
        color: #00ff00;
        padding: 4px 8px;
        border-radius: 3px;
    }

    #apply-settings {
        background: #0078d4;
        color: white;
        border: none;
        padding: 6px 12px;
        border-radius: 3px;
        cursor: pointer;
    }

    #apply-settings:hover {
        background: #106ebe;
    }

    /* Полоса прокрутки */
    .terminal-content::-webkit-scrollbar {
        width: 8px;
    }

    .terminal-content::-webkit-scrollbar-track {
        background: #2d2d2d;
    }

    .terminal-content::-webkit-scrollbar-thumb {
        background: #555;
        border-radius: 4px;
    }

    .terminal-content::-webkit-scrollbar-thumb:hover {
        background: #666;
    }
`;

const terminalStyle = document.createElement('style');
terminalStyle.textContent = terminalStyles;
document.head.appendChild(terminalStyle);

window.Terminal = Terminal;
