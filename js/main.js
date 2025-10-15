// Основной файл инициализации системы
class WebOS {
    constructor() {
        this.state = {
            booted: false,
            loggedIn: false,
            apps: {},
            windows: {},
            settings: {
                theme: 'auto',
                showSeconds: true,
                autostart: false,
                animations: true,
                sound: true
            },
            user: {
                name: 'Пользователь',
                avatar: '👤'
            },
            recentApps: []
        };
        
        this.init();
    }

    async init() {
        console.log('🚀 WebOS инициализируется...');
        
        // Загружаем настройки
        this.loadSettings();
        
        // Инициализируем модули
        await this.initModules();
        
        // Запускаем процесс загрузки
        await bootSystem();
        
        console.log('✅ WebOS готова к работе');
    }

    async initModules() {
        // Инициализация утилит
        if (typeof Utils !== 'undefined') {
            Utils.init();
        }
        
        // Инициализация менеджера окон
        if (typeof WindowManager !== 'undefined') {
            WindowManager.init();
        }
        
        // Инициализация приложений
        await this.initApps();
    }

    async initApps() {
        const appInitializers = [
            'Calculator', 'Notepad', 'Browser', 'Explorer', 
            'Settings', 'Calendar', 'Paint', 'Terminal'
        ];

        for (const appName of appInitializers) {
            try {
                if (typeof window[appName] !== 'undefined') {
                    this.state.apps[appName.toLowerCase()] = window[appName];
                    console.log(`✅ Приложение ${appName} загружено`);
                }
            } catch (error) {
                console.warn(`⚠️ Не удалось загрузить приложение ${appName}:`, error);
            }
        }
    }

    loadSettings() {
        const savedSettings = localStorage.getItem('webos-settings');
        const savedUser = localStorage.getItem('webos-user');
        const savedRecent = localStorage.getItem('webos-recent-apps');

        if (savedSettings) {
            this.state.settings = { ...this.state.settings, ...JSON.parse(savedSettings) };
        }
        
        if (savedUser) {
            this.state.user = { ...this.state.user, ...JSON.parse(savedUser) };
        }
        
        if (savedRecent) {
            this.state.recentApps = JSON.parse(savedRecent);
        }

        this.applySettings();
    }

    saveSettings() {
        localStorage.setItem('webos-settings', JSON.stringify(this.state.settings));
        localStorage.setItem('webos-user', JSON.stringify(this.state.user));
        localStorage.setItem('webos-recent-apps', JSON.stringify(this.state.recentApps));
    }

    applySettings() {
        // Применяем тему
        this.applyTheme();
        
        // Применяем другие настройки
        this.updateTime();
        
        // Обновляем интерфейс
        this.updateUI();
    }

    applyTheme() {
        const { theme } = this.state.settings;
        const html = document.documentElement;
        
        html.classList.remove('light-theme', 'dark-theme', 'auto-theme');
        
        if (theme === 'auto') {
            html.classList.add('auto-theme');
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                html.classList.add('dark-theme');
            } else {
                html.classList.add('light-theme');
            }
        } else {
            html.classList.add(`${theme}-theme`);
        }
    }

    updateTime() {
        const now = new Date();
        const timeOptions = { hour: '2-digit', minute: '2-digit' };
        
        if (this.state.settings.showSeconds) {
            timeOptions.second = '2-digit';
        }
        
        const timeString = now.toLocaleTimeString('ru-RU', timeOptions);
        const dateString = now.toLocaleDateString('ru-RU', {
            weekday: 'short',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        
        const timeElement = document.getElementById('time');
        const dateElement = document.getElementById('date');
        
        if (timeElement) timeElement.textContent = timeString;
        if (dateElement) dateElement.textContent = dateString;
    }

    updateUI() {
        // Обновляем имя пользователя
        const userNameElement = document.getElementById('user-name');
        if (userNameElement) {
            userNameElement.textContent = this.state.user.name;
        }
        
        // Обновляем аватар
        const userAvatarElement = document.querySelector('.user-avatar');
        if (userAvatarElement) {
            userAvatarElement.textContent = this.state.user.avatar;
        }
        
        // Обновляем недавние приложения
        this.updateRecentApps();
    }

    updateRecentApps() {
        const recentAppsElement = document.getElementById('recent-apps');
        if (!recentAppsElement) return;

        recentAppsElement.innerHTML = '';
        
        this.state.recentApps.slice(0, 5).forEach(app => {
            const appElement = document.createElement('button');
            appElement.className = 'app-list-item';
            appElement.innerHTML = `
                <span>${app.icon}</span>
                <span>${app.name}</span>
            `;
            appElement.addEventListener('click', () => {
                this.openApp(app.id);
            });
            recentAppsElement.appendChild(appElement);
        });
    }

    addToRecentApps(app) {
        const existingIndex = this.state.recentApps.findIndex(a => a.id === app.id);
        
        if (existingIndex !== -1) {
            this.state.recentApps.splice(existingIndex, 1);
        }
        
        this.state.recentApps.unshift(app);
        
        // Сохраняем только последние 10 приложений
        if (this.state.recentApps.length > 10) {
            this.state.recentApps = this.state.recentApps.slice(0, 10);
        }
        
        this.saveSettings();
        this.updateRecentApps();
    }

    openApp(appId, options = {}) {
        console.log(`📱 Открываем приложение: ${appId}`);
        
        const appConfig = APP_CONFIG[appId];
        if (!appConfig) {
            this.showNotification('Ошибка', `Приложение "${appId}" не найдено.`, 'error');
            return;
        }
        
        // Добавляем в недавние приложения
        this.addToRecentApps({
            id: appId,
            name: appConfig.name,
            icon: appConfig.icon
        });
        
        // Открываем приложение через менеджер окон
        if (WindowManager) {
            WindowManager.openWindow(appId, options);
        } else {
            console.error('Менеджер окон не инициализирован');
        }
    }

    showNotification(title, message, type = 'info', duration = 5000) {
        if (typeof Utils !== 'undefined') {
            Utils.showNotification(title, message, type, duration);
        } else {
            console.log(`📢 ${title}: ${message}`);
        }
    }

    shutdown() {
        this.showNotification('Система', 'Завершение работы...', 'info');
        
        // Сохраняем состояние
        this.saveSettings();
        
        // Закрываем все приложения
        if (WindowManager) {
            WindowManager.closeAllWindows();
        }
        
        // Показываем анимацию выключения
        setTimeout(() => {
            document.body.innerHTML = `
                <div style="
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: #000;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    color: white;
                    font-size: 24px;
                    z-index: 10000;
                ">
                    <div style="text-align: center;">
                        <div style="font-size: 48px; margin-bottom: 20px;">⚡</div>
                        <div>Система завершила работу</div>
                    </div>
                </div>
            `;
        }, 1000);
    }

    restart() {
        this.showNotification('Система', 'Перезагрузка...', 'info');
        
        // Сохраняем состояние
        this.saveSettings();
        
        // Закрываем все приложения
        if (WindowManager) {
            WindowManager.closeAllWindows();
        }
        
        // Перезагружаем страницу
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }

    logout() {
        this.showNotification('Система', 'Выход из системы...', 'info');
        
        // Сохраняем состояние
        this.saveSettings();
        
        // Закрываем все приложения
        if (WindowManager) {
            WindowManager.closeAllWindows();
        }
        
        // Показываем экран входа
        setTimeout(() => {
            document.getElementById('desktop').style.display = 'none';
            document.getElementById('login-screen').style.display = 'flex';
            this.state.loggedIn = false;
        }, 1000);
    }
}

// Конфигурация приложений
const APP_CONFIG = {
    notepad: {
        name: 'Блокнот',
        icon: '📝',
        component: 'Notepad'
    },
    calculator: {
        name: 'Калькулятор',
        icon: '🧮',
        component: 'Calculator'
    },
    browser: {
        name: 'Браузер',
        icon: '🌐',
        component: 'Browser'
    },
    explorer: {
        name: 'Проводник',
        icon: '📁',
        component: 'Explorer'
    },
    settings: {
        name: 'Настройки',
        icon: '⚙️',
        component: 'Settings'
    },
    calendar: {
        name: 'Календарь',
        icon: '📅',
        component: 'Calendar'
    },
    paint: {
        name: 'Рисование',
        icon: '🎨',
        component: 'Paint'
    },
    terminal: {
        name: 'Терминал',
        icon: '💻',
        component: 'Terminal'
    }
};

// Глобальный экземпляр системы
let webOS;

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    webOS = new WebOS();
});

// Экспорт для глобального доступа
window.WebOS = webOS;
window.APP_CONFIG = APP_CONFIG;
