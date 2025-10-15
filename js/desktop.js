// Управление рабочим столом
class DesktopManager {
    static init() {
        console.log('🖥️ Менеджер рабочего стола инициализирован');
        this.setupEventListeners();
        this.createDesktopIcons();
        this.setupStartMenu();
        this.setupTaskbar();
        this.setupContextMenu();
    }

    static setupEventListeners() {
        // Клик по рабочему столу
        document.getElementById('desktop').addEventListener('click', (e) => {
            if (e.target.id === 'desktop' || e.target.classList.contains('wallpaper-overlay')) {
                this.hideContextMenu();
                this.closeStartMenu();
                
                // Снимаем выделение с иконок
                this.deselectAllIcons();
            }
        });

        // Правый клик по рабочему столу
        document.getElementById('desktop').addEventListener('contextmenu', (e) => {
            if (e.target.id === 'desktop' || e.target.classList.contains('wallpaper-overlay')) {
                e.preventDefault();
                this.showContextMenu(e.clientX, e.clientY);
            }
        });

        // Обновление по F5
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F5') {
                e.preventDefault();
                this.refreshDesktop();
            }
        });
    }

    static createDesktopIcons() {
        const desktopIcons = document.getElementById('desktop-icons');
        if (!desktopIcons) return;

        desktopIcons.innerHTML = '';

        const icons = [
            { id: 'notepad', icon: '📝', name: 'Блокнот' },
            { id: 'calculator', icon: '🧮', name: 'Калькулятор' },
            { id: 'browser', icon: '🌐', name: 'Браузер' },
            { id: 'explorer', icon: '📁', name: 'Проводник' },
            { id: 'settings', icon: '⚙️', name: 'Настройки' },
            { id: 'paint', icon: '🎨', name: 'Рисование' }
        ];

        icons.forEach(app => {
            const iconElement = document.createElement('div');
            iconElement.className = 'desktop-icon';
            iconElement.setAttribute('data-app', app.id);
            iconElement.innerHTML = `
                <span>${app.icon}</span>
                <span>${app.name}</span>
            `;

            // Обработчики событий
            iconElement.addEventListener('click', (e) => {
                e.stopPropagation();
                this.openApp(app.id);
                this.deselectAllIcons();
                iconElement.classList.add('selected');
            });

            iconElement.addEventListener('dblclick', (e) => {
                e.stopPropagation();
                this.openApp(app.id);
            });

            iconElement.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.deselectAllIcons();
                iconElement.classList.add('selected');
                this.showContextMenu(e.clientX, e.clientY, app.id);
            });

            desktopIcons.appendChild(iconElement);
        });
    }

    static setupStartMenu() {
        const startBtn = document.getElementById('start-btn');
        const startMenu = document.getElementById('start-menu');
        const powerBtn = document.getElementById('power-btn');

        if (startBtn) {
            startBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleStartMenu();
            });
        }

        if (powerBtn) {
            powerBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showShutdownMenu();
            });
        }

        // Закрытие меню при клике вне его
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#start-menu') && !e.target.closest('#start-btn')) {
                this.closeStartMenu();
            }
        });

        // Создаем иконки приложений в меню Пуск
        this.createStartMenuApps();
    }

    static createStartMenuApps() {
        const pinnedApps = document.getElementById('pinned-apps');
        if (!pinnedApps) return;

        pinnedApps.innerHTML = '';

        const apps = [
            { id: 'notepad', icon: '📝', name: 'Блокнот' },
            { id: 'calculator', icon: '🧮', name: 'Калькулятор' },
            { id: 'browser', icon: '🌐', name: 'Браузер' },
            { id: 'explorer', icon: '📁', name: 'Проводник' },
            { id: 'settings', icon: '⚙️', name: 'Настройки' },
            { id: 'calendar', icon: '📅', name: 'Календарь' },
            { id: 'paint', icon: '🎨', name: 'Рисование' },
            { id: 'terminal', icon: '💻', name: 'Терминал' }
        ];

        apps.forEach(app => {
            const appElement = document.createElement('button');
            appElement.className = 'app-icon';
            appElement.setAttribute('data-app', app.id);
            appElement.innerHTML = `
                <span>${app.icon}</span>
                <span>${app.name}</span>
            `;

            appElement.addEventListener('click', () => {
                this.openApp(app.id);
                this.closeStartMenu();
            });

            pinnedApps.appendChild(appElement);
        });
    }

    static setupTaskbar() {
        const quickApps = document.querySelectorAll('.quick-app');
        
        quickApps.forEach(app => {
            app.addEventListener('click', () => {
                const appId = app.getAttribute('data-app');
                this.openApp(appId);
            });
        });

        // Обработчик для переключения темы
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // Обновление времени
        this.updateTaskbarTime();
        setInterval(() => this.updateTaskbarTime(), 1000);
    }

    static updateTaskbarTime() {
        if (webOS) {
            webOS.updateTime();
        }
    }

    static setupContextMenu() {
        const contextItems = {
            'context-refresh': () => this.refreshDesktop(),
            'context-new-folder': () => this.createNewFolder(),
            'context-display': () => this.openDisplaySettings(),
            'context-properties': () => this.showSystemProperties()
        };

        Object.keys(contextItems).forEach(itemId => {
            const item = document.getElementById(itemId);
            if (item) {
                item.addEventListener('click', contextItems[itemId]);
            }
        });
    }

    static toggleStartMenu() {
        const startMenu = document.getElementById('start-menu');
        if (!startMenu) return;

        if (startMenu.style.display === 'block') {
            this.closeStartMenu();
        } else {
            this.openStartMenu();
        }
    }

    static openStartMenu() {
        const startMenu = document.getElementById('start-menu');
        if (startMenu) {
            startMenu.style.display = 'block';
            setTimeout(() => {
                startMenu.classList.add('active');
            }, 10);
        }
    }

    static closeStartMenu() {
        const startMenu = document.getElementById('start-menu');
        if (startMenu) {
            startMenu.classList.remove('active');
            setTimeout(() => {
                startMenu.style.display = 'none';
            }, 300);
        }
    }

    static showContextMenu(x, y, appId = null) {
        const contextMenu = document.getElementById('context-menu');
        if (!contextMenu) return;

        // Позиционирование
        const rect = contextMenu.getBoundingClientRect();
        const viewport = {
            width: window.innerWidth,
            height: window.innerHeight
        };

        // Корректировка позиции, чтобы меню не выходило за границы экрана
        let adjustedX = x;
        let adjustedY = y;

        if (x + rect.width > viewport.width) {
            adjustedX = viewport.width - rect.width - 10;
        }

        if (y + rect.height > viewport.height) {
            adjustedY = viewport.height - rect.height - 10;
        }

        contextMenu.style.left = adjustedX + 'px';
        contextMenu.style.top = adjustedY + 'px';
        contextMenu.style.display = 'block';

        // Сохраняем контекст (какое приложение выбрано)
        contextMenu.setAttribute('data-context', appId || 'desktop');
    }

    static hideContextMenu() {
        const contextMenu = document.getElementById('context-menu');
        if (contextMenu) {
            contextMenu.style.display = 'none';
        }
    }

    static openApp(appId) {
        if (webOS) {
            webOS.openApp(appId);
        } else {
            console.warn('WebOS не инициализирована');
        }
    }

    static refreshDesktop() {
        if (Utils) {
            Utils.showNotification('Рабочий стол', 'Обновление...', 'info', 1000);
        }
        
        // Анимация обновления
        const desktop = document.getElementById('desktop');
        if (desktop) {
            desktop.style.opacity = '0.7';
            setTimeout(() => {
                desktop.style.opacity = '1';
            }, 300);
        }
    }

    static createNewFolder() {
        const desktopIcons = document.getElementById('desktop-icons');
        if (!desktopIcons) return;

        const folderId = 'folder-' + Date.now();
        const folderElement = document.createElement('div');
        folderElement.className = 'desktop-icon';
        folderElement.setAttribute('data-folder', folderId);
        folderElement.innerHTML = `
            <span>📁</span>
            <span contenteditable="true" class="folder-name">Новая папка</span>
        `;

        // Обработчики событий для папки
        folderElement.addEventListener('click', (e) => {
            e.stopPropagation();
            this.deselectAllIcons();
            folderElement.classList.add('selected');
        });

        folderElement.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            this.openFolder(folderId);
        });

        folderElement.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.deselectAllIcons();
            folderElement.classList.add('selected');
            this.showContextMenu(e.clientX, e.clientY, folderId);
        });

        desktopIcons.appendChild(folderElement);
        this.hideContextMenu();

        if (Utils) {
            Utils.showNotification('Рабочий стол', 'Создана новая папка', 'success');
        }
    }

    static openFolder(folderId) {
        // В реальной системе здесь бы открывалось окно проводника
        if (webOS) {
            webOS.openApp('explorer', { folder: folderId });
        }
    }

    static openDisplaySettings() {
        if (webOS) {
            webOS.openApp('settings', { page: 'display' });
        }
    }

    static showSystemProperties() {
        const properties = `
            <strong>WebOS System Information</strong><br>
            Версия: 2.0.0<br>
            Пользователь: ${webOS ? webOS.state.user.name : 'Неизвестно'}<br>
            Темы: ${webOS ? webOS.state.settings.theme : 'auto'}<br>
            Анимации: ${webOS && webOS.state.settings.animations ? 'Вкл' : 'Выкл'}<br>
            <br>
            <small>© 2024 WebOS Project</small>
        `;

        if (Utils) {
            Utils.showNotification('Свойства системы', properties, 'info', 5000);
        }
    }

    static showShutdownMenu() {
        if (Utils) {
            Utils.showModal('shutdown-modal');
            
            // Настройка обработчиков для кнопок
            const shutdownBtn = document.querySelector('.shutdown-btn');
            const restartBtn = document.querySelector('.restart-btn');
            const logoutBtn = document.querySelector('.logout-btn');
            const cancelBtn = document.querySelector('.cancel-btn');
            const closeBtn = document.querySelector('.modal-close');

            const closeModal = () => Utils.hideModal('shutdown-modal');

            if (shutdownBtn) shutdownBtn.addEventListener('click', () => webOS.shutdown());
            if (restartBtn) restartBtn.addEventListener('click', () => webOS.restart());
            if (logoutBtn) logoutBtn.addEventListener('click', () => webOS.logout());
            if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
            if (closeBtn) closeBtn.addEventListener('click', closeModal);
        }
    }

    static toggleTheme() {
        if (!webOS) return;

        const themes = ['auto', 'light', 'dark'];
        const currentIndex = themes.indexOf(webOS.state.settings.theme);
        const nextIndex = (currentIndex + 1) % themes.length;
        
        webOS.state.settings.theme = themes[nextIndex];
        webOS.saveSettings();
        webOS.applyTheme();

        const themeNames = {
            'auto': 'Авто',
            'light': 'Светлая',
            'dark': 'Темная'
        };

        if (Utils) {
            Utils.showNotification(
                'Тема', 
                `Установлена ${themeNames[themes[nextIndex]]} тема`, 
                'success'
            );
        }
    }

    static deselectAllIcons() {
        document.querySelectorAll('.desktop-icon.selected').forEach(icon => {
            icon.classList.remove('selected');
        });
    }

    // Обновление внешнего вида рабочего стола
    static setWallpaper(imageUrl) {
        const desktop = document.getElementById('desktop');
        if (desktop && imageUrl) {
            desktop.style.backgroundImage = `url(${imageUrl})`;
            desktop.style.backgroundSize = 'cover';
            desktop.style.backgroundPosition = 'center';
        }
    }

    static resetWallpaper() {
        const desktop = document.getElementById('desktop');
        if (desktop) {
            desktop.style.backgroundImage = '';
            desktop.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        }
    }
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    DesktopManager.init();
});

// Экспорт для глобального доступа
window.DesktopManager = DesktopManager;
