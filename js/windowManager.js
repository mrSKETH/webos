// Менеджер окон
class WindowManager {
    static init() {
        console.log('🪟 Менеджер окон инициализирован');
        
        this.windows = new Map();
        this.zIndex = 100;
        this.activeWindow = null;
        
        this.setupEventListeners();
        this.createWindowTemplates();
    }

    static setupEventListeners() {
        // Глобальные обработчики для управления окнами
        document.addEventListener('mousedown', (e) => {
            // Клик по окну - выводим его на передний план
            const windowElement = e.target.closest('.window');
            if (windowElement && windowElement !== this.activeWindow) {
                this.bringToFront(windowElement);
            }
        });

        // Обработчик для закрытия всех окон при выходе
        window.addEventListener('beforeunload', () => {
            this.saveWindowStates();
        });
    }

    static createWindowTemplates() {
        // Создаем шаблоны окон для каждого приложения
        Object.keys(APP_CONFIG).forEach(appId => {
            this.createWindowTemplate(appId);
        });
    }

    static createWindowTemplate(appId) {
        const appConfig = APP_CONFIG[appId];
        if (!appConfig) return;

        const windowId = `${appId}-window`;
        
        // Проверяем, не существует ли уже такое окно
        if (document.getElementById(windowId)) return;

        const windowElement = document.createElement('div');
        windowElement.className = 'window';
        windowElement.id = windowId;
        windowElement.setAttribute('data-app', appId);

        windowElement.innerHTML = `
            <div class="window-header">
                <div class="window-title">
                    <span>${appConfig.icon}</span>
                    <span>${appConfig.name}</span>
                </div>
                <div class="window-controls">
                    <button class="minimize-btn" title="Свернуть">−</button>
                    <button class="maximize-btn" title="Развернуть">□</button>
                    <button class="close-btn" title="Закрыть">✕</button>
                </div>
            </div>
            <div class="window-content">
                <div class="app-content" id="${appId}-content">
                    <!-- Контент приложения будет загружен динамически -->
                </div>
            </div>
        `;

        document.body.appendChild(windowElement);
        this.setupWindowControls(windowElement);
    }

    static setupWindowControls(windowElement) {
        const header = windowElement.querySelector('.window-header');
        const minimizeBtn = windowElement.querySelector('.minimize-btn');
        const maximizeBtn = windowElement.querySelector('.maximize-btn');
        const closeBtn = windowElement.querySelector('.close-btn');

        // Минимизация
        minimizeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.minimizeWindow(windowElement);
        });

        // Максимизация/восстановление
        maximizeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMaximizeWindow(windowElement);
        });

        // Закрытие
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.closeWindow(windowElement);
        });

        // Перетаскивание
        this.makeDraggable(windowElement, header);

        // Изменение размера
        this.makeResizable(windowElement);
    }

    static openWindow(appId, options = {}) {
        const windowId = `${appId}-window`;
        let windowElement = document.getElementById(windowId);

        // Если окно уже существует, показываем его
        if (windowElement) {
            this.showWindow(windowElement);
            return windowElement;
        }

        // Создаем новое окно
        windowElement = this.createWindow(appId, options);
        this.showWindow(windowElement);
        
        // Инициализируем приложение
        this.initializeApp(appId, windowElement, options);

        return windowElement;
    }

    static createWindow(appId, options = {}) {
        const appConfig = APP_CONFIG[appId];
        if (!appConfig) {
            throw new Error(`Приложение ${appId} не найдено`);
        }

        const windowId = `${appId}-window-${Date.now()}`;
        const windowElement = document.createElement('div');
        windowElement.className = 'window';
        windowElement.id = windowId;
        windowElement.setAttribute('data-app', appId);

        // Позиция и размер из options или по умолчанию
        const left = options.left || (100 + this.windows.size * 30);
        const top = options.top || (100 + this.windows.size * 30);
        const width = options.width || 800;
        const height = options.height || 600;

        windowElement.style.left = left + 'px';
        windowElement.style.top = top + 'px';
        windowElement.style.width = width + 'px';
        windowElement.style.height = height + 'px';

        windowElement.innerHTML = `
            <div class="window-header">
                <div class="window-title">
                    <span>${appConfig.icon}</span>
                    <span>${appConfig.name}</span>
                </div>
                <div class="window-controls">
                    <button class="minimize-btn" title="Свернуть">−</button>
                    <button class="maximize-btn" title="Развернуть">□</button>
                    <button class="close-btn" title="Закрыть">✕</button>
                </div>
            </div>
            <div class="window-content">
                <div class="app-content" id="${windowId}-content">
                    <!-- Контент приложения будет загружен динамически -->
                </div>
            </div>
        `;

        document.body.appendChild(windowElement);
        this.setupWindowControls(windowElement);

        // Сохраняем окно в коллекции
        this.windows.set(windowId, {
            id: windowId,
            element: windowElement,
            appId: appId,
            state: 'normal', // normal, minimized, maximized
            position: { left, top },
            size: { width, height }
        });

        return windowElement;
    }

    static showWindow(windowElement) {
        // Снимаем минимизацию
        windowElement.classList.remove('minimized');
        windowElement.style.display = 'block';
        
        // Анимация появления
        setTimeout(() => {
            windowElement.classList.add('active');
        }, 10);

        // Выводим на передний план
        this.bringToFront(windowElement);

        // Обновляем состояние в коллекции
        const windowId = windowElement.id;
        if (this.windows.has(windowId)) {
            const windowData = this.windows.get(windowId);
            windowData.state = 'normal';
            this.windows.set(windowId, windowData);
        }

        // Обновляем панель задач
        this.updateTaskbar(windowElement, true);
    }

    static minimizeWindow(windowElement) {
        windowElement.classList.add('minimized');
        windowElement.style.display = 'none';

        // Обновляем состояние
        const windowId = windowElement.id;
        if (this.windows.has(windowId)) {
            const windowData = this.windows.get(windowId);
            windowData.state = 'minimized';
            this.windows.set(windowId, windowData);
        }

        // Обновляем панель задач
        this.updateTaskbar(windowElement, false);
    }

    static toggleMaximizeWindow(windowElement) {
        const isMaximized = windowElement.classList.contains('maximized');
        
        if (isMaximized) {
            this.restoreWindow(windowElement);
        } else {
            this.maximizeWindow(windowElement);
        }
    }

    static maximizeWindow(windowElement) {
        // Сохраняем текущие размеры и позицию
        const rect = windowElement.getBoundingClientRect();
        windowElement.setAttribute('data-previous-left', rect.left);
        windowElement.setAttribute('data-previous-top', rect.top);
        windowElement.setAttribute('data-previous-width', rect.width);
        windowElement.setAttribute('data-previous-height', rect.height);

        // Максимизируем
        windowElement.classList.add('maximized');

        // Обновляем состояние
        const windowId = windowElement.id;
        if (this.windows.has(windowId)) {
            const windowData = this.windows.get(windowId);
            windowData.state = 'maximized';
            this.windows.set(windowId, windowData);
        }
    }

    static restoreWindow(windowElement) {
        // Восстанавливаем предыдущие размеры и позицию
        const left = windowElement.getAttribute('data-previous-left');
        const top = windowElement.getAttribute('data-previous-top');
        const width = windowElement.getAttribute('data-previous-width');
        const height = windowElement.getAttribute('data-previous-height');

        if (left && top && width && height) {
            windowElement.style.left = left + 'px';
            windowElement.style.top = top + 'px';
            windowElement.style.width = width + 'px';
            windowElement.style.height = height + 'px';
        }

        windowElement.classList.remove('maximized');

        // Обновляем состояние
        const windowId = windowElement.id;
        if (this.windows.has(windowId)) {
            const windowData = this.windows.get(windowId);
            windowData.state = 'normal';
            this.windows.set(windowId, windowData);
        }
    }

    static closeWindow(windowElement) {
        const windowId = windowElement.id;
        
        // Анимация закрытия
        windowElement.classList.remove('active');
        windowElement.classList.add('window-closing');

        setTimeout(() => {
            if (windowElement.parentNode) {
                windowElement.remove();
            }

            // Удаляем из коллекции
            this.windows.delete(windowId);

            // Удаляем из панели задач
            this.removeFromTaskbar(windowElement);

            // Очищаем активное окно, если это оно
            if (this.activeWindow === windowElement) {
                this.activeWindow = null;
            }

        }, 200);
    }

    static closeAllWindows() {
        this.windows.forEach((windowData, windowId) => {
            this.closeWindow(windowData.element);
        });
    }

    static bringToFront(windowElement) {
        // Увеличиваем z-index
        this.zIndex++;
        windowElement.style.zIndex = this.zIndex;
        this.activeWindow = windowElement;

        // Обновляем состояние в панели задач
        document.querySelectorAll('.taskbar-app').forEach(app => {
            app.classList.remove('active');
        });

        const taskbarApp = document.getElementById(`taskbar-${windowElement.id}`);
        if (taskbarApp) {
            taskbarApp.classList.add('active');
        }
    }

    static makeDraggable(element, handle) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        
        handle.onmousedown = dragMouseDown;

        function dragMouseDown(e) {
            if (element.classList.contains('maximized')) return;
            
            e.preventDefault();
            this.style.cursor = 'grabbing';
            
            // Получаем позицию курсора при начале перетаскивания
            pos3 = e.clientX;
            pos4 = e.clientY;
            
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e.preventDefault();
            
            // Вычисляем новую позицию
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            
            // Устанавливаем новую позицию
            element.style.top = (element.offsetTop - pos2) + "px";
            element.style.left = (element.offsetLeft - pos1) + "px";

            // Обновляем состояние в коллекции
            const windowId = element.id;
            if (WindowManager.windows.has(windowId)) {
                const windowData = WindowManager.windows.get(windowId);
                windowData.position = {
                    left: element.offsetLeft,
                    top: element.offsetTop
                };
                WindowManager.windows.set(windowId, windowData);
            }
        }

        function closeDragElement() {
            document.onmouseup = null;
            document.onmousemove = null;
            handle.style.cursor = 'grab';
        }
    }

    static makeResizable(element) {
        const resizeHandleSize = 10;
        let startX, startY, startWidth, startHeight;

        const createResizeHandle = (position, cursor) => {
            const handle = document.createElement('div');
            handle.style.position = 'absolute';
            handle.style[cursor.split('-')[0]] = '0';
            handle.style[cursor.split('-')[1]] = '0';
            handle.style.width = resizeHandleSize + 'px';
            handle.style.height = resizeHandleSize + 'px';
            handle.style.cursor = cursor + '-resize';
            handle.style.zIndex = '1000';
            handle.style.opacity = '0';

            handle.addEventListener('mousedown', initResize);
            return handle;
        };

        const initResize = (e) => {
            if (element.classList.contains('maximized')) return;

            e.preventDefault();
            e.stopPropagation();

            startX = e.clientX;
            startY = e.clientY;
            startWidth = parseInt(document.defaultView.getComputedStyle(element).width, 10);
            startHeight = parseInt(document.defaultView.getComputedStyle(element).height, 10);

            document.addEventListener('mousemove', resize);
            document.addEventListener('mouseup', stopResize);
        };

        const resize = (e) => {
            const width = startWidth + (e.clientX - startX);
            const height = startHeight + (e.clientY - startY);

            if (width > 400) element.style.width = width + 'px';
            if (height > 300) element.style.height = height + 'px';

            // Обновляем состояние в коллекции
            const windowId = element.id;
            if (this.windows.has(windowId)) {
                const windowData = this.windows.get(windowId);
                windowData.size = { width, height };
                this.windows.set(windowId, windowData);
            }
        };

        const stopResize = () => {
            document.removeEventListener('mousemove', resize);
            document.removeEventListener('mouseup', stopResize);
        };

        // Добавляем ручки изменения размера
        const positions = [
            ['top', 'left', 'nw-resize'],
            ['top', 'right', 'ne-resize'],
            ['bottom', 'left', 'sw-resize'],
            ['bottom', 'right', 'se-resize']
        ];

        positions.forEach(([vertical, horizontal, cursor]) => {
            const handle = createResizeHandle(`${vertical}-${horizontal}`, cursor);
            element.appendChild(handle);
        });
    }

    static updateTaskbar(windowElement, isActive) {
        const appId = windowElement.getAttribute('data-app');
        const appConfig = APP_CONFIG[appId];
        if (!appConfig) return;

        const taskbarApps = document.getElementById('taskbar-apps');
        const taskbarAppId = `taskbar-${windowElement.id}`;

        let taskbarApp = document.getElementById(taskbarAppId);

        if (!taskbarApp) {
            taskbarApp = document.createElement('button');
            taskbarApp.id = taskbarAppId;
            taskbarApp.className = 'taskbar-app';
            taskbarApp.innerHTML = `
                <span>${appConfig.icon}</span>
                <span>${appConfig.name}</span>
            `;

            taskbarApp.addEventListener('click', () => {
                if (windowElement.style.display === 'none') {
                    this.showWindow(windowElement);
                } else {
                    this.minimizeWindow(windowElement);
                }
            });

            if (taskbarApps) {
                taskbarApps.appendChild(taskbarApp);
            }
        }

        if (isActive) {
            taskbarApp.classList.add('active');
        } else {
            taskbarApp.classList.remove('active');
        }
    }

    static removeFromTaskbar(windowElement) {
        const taskbarApp = document.getElementById(`taskbar-${windowElement.id}`);
        if (taskbarApp && taskbarApp.parentNode) {
            taskbarApp.remove();
        }
    }

    static initializeApp(appId, windowElement, options) {
        const appContent = windowElement.querySelector('.app-content');
        if (!appContent) return;

        const appClass = APP_CONFIG[appId]?.component;
        if (!appClass || typeof window[appClass] === 'undefined') {
            appContent.innerHTML = `
                <div style="padding: 20px; text-align: center;">
                    <h3>${APP_CONFIG[appId]?.name || appId}</h3>
                    <p>Приложение загружается...</p>
                </div>
            `;
            return;
        }

        try {
            // Инициализируем приложение
            const appInstance = new window[appClass](appContent, options);
            if (typeof appInstance.init === 'function') {
                appInstance.init();
            }
        } catch (error) {
            console.error(`Ошибка при инициализации приложения ${appId}:`, error);
            appContent.innerHTML = `
                <div style="padding: 20px; text-align: center; color: var(--error-color);">
                    <h3>Ошибка</h3>
                    <p>Не удалось загрузить приложение</p>
                    <small>${error.message}</small>
                </div>
            `;
        }
    }

    static getWindows() {
        return Array.from(this.windows.values());
    }

    static getActiveWindow() {
        return this.activeWindow;
    }

    static saveWindowStates() {
        const states = {};
        this.windows.forEach((windowData, windowId) => {
            states[windowId] = {
                appId: windowData.appId,
                position: windowData.position,
                size: windowData.size,
                state: windowData.state
            };
        });

        Utils.storage.set('webos-window-states', states);
    }

    static loadWindowStates() {
        const states = Utils.storage.get('webos-window-states', {});
        
        Object.keys(states).forEach(windowId => {
            const state = states[windowId];
            this.openWindow(state.appId, {
                left: state.position.left,
                top: state.position.top,
                width: state.size.width,
                height: state.size.height
            });
        });
    }

    // Управление компоновкой окон
    static arrangeWindows(layout = 'cascade') {
        const windows = this.getWindows();
        const viewport = {
            width: window.innerWidth,
            height: window.innerHeight
        };

        switch (layout) {
            case 'cascade':
                this.arrangeCascade(windows, viewport);
                break;
            case 'tile':
                this.arrangeTile(windows, viewport);
                break;
            case 'grid':
                this.arrangeGrid(windows, viewport);
                break;
        }
    }

    static arrangeCascade(windows, viewport) {
        const offset = 30;
        
        windows.forEach((windowData, index) => {
            const element = windowData.element;
            const left = 50 + (index * offset);
            const top = 50 + (index * offset);
            
            if (left + 800 < viewport.width && top + 600 < viewport.height) {
                element.style.left = left + 'px';
                element.style.top = top + 'px';
                this.showWindow(element);
            }
        });
    }

    static arrangeTile(windows, viewport) {
        // Простая плиточная компоновка
        const cols = Math.ceil(Math.sqrt(windows.length));
        const tileWidth = viewport.width / cols;
        
        windows.forEach((windowData, index) => {
            const element = windowData.element;
            const col = index % cols;
            const row = Math.floor(index / cols);
            
            const left = col * tileWidth;
            const top = row * 200;
            
            element.style.left = left + 'px';
            element.style.top = top + 'px';
            element.style.width = tileWidth + 'px';
            element.style.height = '200px';
            
            this.showWindow(element);
        });
    }

    static arrangeGrid(windows, viewport) {
        // Сеточная компоновка
        const aspectRatio = 16 / 9;
        const spacing = 10;
        
        // Вычисляем оптимальное количество столбцов и строк
        const totalArea = viewport.width * viewport.height;
        const windowArea = totalArea / windows.length;
        const cols = Math.floor(viewport.width / Math.sqrt(windowArea * aspectRatio));
        const rows = Math.ceil(windows.length / cols);
        
        const cellWidth = (viewport.width - (cols + 1) * spacing) / cols;
        const cellHeight = cellWidth / aspectRatio;
        
        windows.forEach((windowData, index) => {
            const element = windowData.element;
            const col = index % cols;
            const row = Math.floor(index / cols);
            
            const left = spacing + col * (cellWidth + spacing);
            const top = spacing + row * (cellHeight + spacing);
            
            element.style.left = left + 'px';
            element.style.top = top + 'px';
            element.style.width = cellWidth + 'px';
            element.style.height = cellHeight + 'px';
            
            this.showWindow(element);
        });
    }
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    WindowManager.init();
});

// Экспорт для глобального доступа
window.WindowManager = WindowManager;
