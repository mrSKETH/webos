// Приложение Настройки
class Settings {
    constructor(container, options = {}) {
        this.container = container;
        this.options = options;
        this.currentPage = options.page || 'general';
        
        this.init();
    }

    init() {
        this.render();
        this.setupEventListeners();
        this.loadSettings();
    }

    render() {
        this.container.innerHTML = `
            <div class="settings-app">
                <div class="settings-sidebar">
                    <button class="settings-category active" data-page="general">
                        <span class="category-icon">⚙️</span>
                        <span class="category-text">Основные</span>
                    </button>
                    <button class="settings-category" data-page="appearance">
                        <span class="category-icon">🎨</span>
                        <span class="category-text">Внешний вид</span>
                    </button>
                    <button class="settings-category" data-page="system">
                        <span class="category-icon">💻</span>
                        <span class="category-text">Система</span>
                    </button>
                    <button class="settings-category" data-page="privacy">
                        <span class="category-icon">🔒</span>
                        <span class="category-text">Конфиденциальность</span>
                    </button>
                    <button class="settings-category" data-page="applications">
                        <span class="category-icon">📱</span>
                        <span class="category-text">Приложения</span>
                    </button>
                    <button class="settings-category" data-page="about">
                        <span class="category-icon">ℹ️</span>
                        <span class="category-text">О системе</span>
                    </button>
                </div>
                
                <div class="settings-content">
                    <div class="settings-page active" id="general-page">
                        <div class="settings-header">
                            <h2>Основные настройки</h2>
                            <p>Основные параметры системы</p>
                        </div>
                        
                        <div class="settings-section">
                            <h3>Язык и регион</h3>
                            <div class="settings-option">
                                <div class="option-label">
                                    <div class="option-title">Язык системы</div>
                                    <div class="option-description">Выберите язык интерфейса</div>
                                </div>
                                <select class="settings-select" id="language-select">
                                    <option value="ru">Русский</option>
                                    <option value="en">English</option>
                                    <option value="de">Deutsch</option>
                                </select>
                            </div>
                            
                            <div class="settings-option">
                                <div class="option-label">
                                    <div class="option-title">Формат даты и времени</div>
                                    <div class="option-description">Формат отображения даты и времени</div>
                                </div>
                                <select class="settings-select" id="datetime-format">
                                    <option value="ru-RU">Россия (дд.мм.гггг)</option>
                                    <option value="en-US">США (мм/дд/гггг)</option>
                                    <option value="de-DE">Германия (дд.мм.гггг)</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="settings-section">
                            <h3>Уведомления</h3>
                            <div class="settings-option">
                                <div class="option-label">
                                    <div class="option-title">Системные уведомления</div>
                                    <div class="option-description">Показывать уведомления от системы и приложений</div>
                                </div>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="notifications-enabled" checked>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                            
                            <div class="settings-option">
                                <div class="option-label">
                                    <div class="option-title">Звук уведомлений</div>
                                    <div class="option-description">Воспроизводить звук при получении уведомлений</div>
                                </div>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="notification-sound" checked>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <div class="settings-page" id="appearance-page">
                        <div class="settings-header">
                            <h2>Внешний вид</h2>
                            <p>Настройте внешний вид системы</p>
                        </div>
                        
                        <div class="settings-section">
                            <h3>Тема</h3>
                            <div class="settings-option">
                                <div class="option-label">
                                    <div class="option-title">Тема системы</div>
                                    <div class="option-description">Выберите цветовую тему интерфейса</div>
                                </div>
                                <div class="theme-selector">
                                    <div class="theme-option theme-light ${webOS.state.settings.theme === 'light' ? 'selected' : ''}" data-theme="light">
                                        <div class="theme-preview"></div>
                                        <div class="theme-name">Светлая</div>
                                    </div>
                                    <div class="theme-option theme-dark ${webOS.state.settings.theme === 'dark' ? 'selected' : ''}" data-theme="dark">
                                        <div class="theme-preview"></div>
                                        <div class="theme-name">Темная</div>
                                    </div>
                                    <div class="theme-option theme-auto ${webOS.state.settings.theme === 'auto' ? 'selected' : ''}" data-theme="auto">
                                        <div class="theme-preview"></div>
                                        <div class="theme-name">Авто</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="settings-section">
                            <h3>Обои рабочего стола</h3>
                            <div class="settings-option">
                                <div class="option-label">
                                    <div class="option-title">Фон рабочего стола</div>
                                    <div class="option-description">Выберите изображение для рабочего стола</div>
                                </div>
                                <div class="wallpaper-selector">
                                    <div class="wallpaper-option" data-wallpaper="default">
                                        <div class="wallpaper-preview gradient-bg"></div>
                                        <div class="wallpaper-name">По умолчанию</div>
                                    </div>
                                    <div class="wallpaper-option" data-wallpaper="nature">
                                        <div class="wallpaper-preview nature-bg"></div>
                                        <div class="wallpaper-name">Природа</div>
                                    </div>
                                    <div class="wallpaper-option" data-wallpaper="abstract">
                                        <div class="wallpaper-preview abstract-bg"></div>
                                        <div class="wallpaper-name">Абстракция</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="settings-section">
                            <h3>Эффекты</h3>
                            <div class="settings-option">
                                <div class="option-label">
                                    <div class="option-title">Анимации</div>
                                    <div class="option-description">Включить анимации и переходы</div>
                                </div>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="animations-enabled" checked>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                            
                            <div class="settings-option">
                                <div class="option-label">
                                    <div class="option-title">Прозрачность</div>
                                    <div class="option-description">Эффекты прозрачности в интерфейсе</div>
                                </div>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="transparency-enabled" checked>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <div class="settings-page" id="system-page">
                        <div class="settings-header">
                            <h2>Система</h2>
                            <p>Настройки производительности и хранения</p>
                        </div>
                        
                        <div class="settings-section">
                            <h3>Производительность</h3>
                            <div class="settings-option">
                                <div class="option-label">
                                    <div class="option-title">Автозапуск приложений</div>
                                    <div class="option-description">Запускать приложения при старте системы</div>
                                </div>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="autostart-enabled">
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                            
                            <div class="settings-option">
                                <div class="option-label">
                                    <div class="option-title">Фоновые процессы</div>
                                    <div class="option-description">Разрешить работу фоновых процессов</div>
                                </div>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="background-processes" checked>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="settings-section">
                            <h3>Хранилище</h3>
                            <div class="storage-info">
                                <div class="storage-bar">
                                    <div class="storage-fill" style="width: 65%"></div>
                                </div>
                                <div class="storage-details">
                                    <span>Использовано: 6.5 ГБ из 10 ГБ</span>
                                    <span class="storage-percent">65%</span>
                                </div>
                            </div>
                            
                            <div class="settings-option">
                                <div class="option-label">
                                    <div class="option-title">Автоматическое освобождение места</div>
                                    <div class="option-description">Автоматически удалять временные файлы</div>
                                </div>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="auto-cleanup">
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="settings-section">
                            <h3>Обновления</h3>
                            <div class="settings-option">
                                <div class="option-label">
                                    <div class="option-title">Автоматические обновления</div>
                                    <div class="option-description">Автоматически загружать и устанавливать обновления</div>
                                </div>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="auto-updates" checked>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                            
                            <button class="settings-action-btn" id="check-updates">
                                Проверить обновления
                            </button>
                        </div>
                    </div>
                    
                    <div class="settings-page" id="privacy-page">
                        <div class="settings-header">
                            <h2>Конфиденциальность</h2>
                            <p>Настройки конфиденциальности и безопасности</p>
                        </div>
                        
                        <div class="settings-section">
                            <h3>Данные приложений</h3>
                            <div class="settings-option">
                                <div class="option-label">
                                    <div class="option-title">Сбор телеметрии</div>
                                    <div class="option-description">Отправлять данные об использовании системы</div>
                                </div>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="telemetry-enabled">
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                            
                            <div class="settings-option">
                                <div class="option-label">
                                    <div class="option-title">Персонализация</div>
                                    <div class="option-description">Использовать данные для персонализации интерфейса</div>
                                </div>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="personalization-enabled" checked>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="settings-section">
                            <h3>Безопасность</h3>
                            <div class="settings-option">
                                <div class="option-label">
                                    <div class="option-title">Защита от вредоносных программ</div>
                                    <div class="option-description">Сканировать файлы на наличие угроз</div>
                                </div>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="malware-protection" checked>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                            
                            <div class="settings-option">
                                <div class="option-label">
                                    <div class="option-title">Брандмауэр</div>
                                    <div class="option-description">Блокировать нежелательные сетевые подключения</div>
                                </div>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="firewall-enabled" checked>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="settings-section">
                            <h3>Очистка данных</h3>
                            <button class="settings-action-btn" id="clear-browser-data">
                                Очистить данные браузера
                            </button>
                            <button class="settings-action-btn" id="clear-app-data">
                                Очистить данные приложений
                            </button>
                            <button class="settings-action-btn warning" id="reset-settings">
                                Сбросить все настройки
                            </button>
                        </div>
                    </div>
                    
                    <div class="settings-page" id="applications-page">
                        <div class="settings-header">
                            <h2>Приложения</h2>
                            <p>Управление установленными приложениями</p>
                        </div>
                        
                        <div class="settings-section">
                            <h3>Установленные приложения</h3>
                            <div class="apps-list">
                                ${Object.values(APP_CONFIG).map(app => `
                                    <div class="app-item">
                                        <div class="app-icon">${app.icon}</div>
                                        <div class="app-info">
                                            <div class="app-name">${app.name}</div>
                                            <div class="app-version">Версия 2.0.0</div>
                                        </div>
                                        <button class="app-action-btn" data-app="${app.component.toLowerCase()}">Управление</button>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div class="settings-section">
                            <h3>Разрешения приложений</h3>
                            <div class="settings-option">
                                <div class="option-label">
                                    <div class="option-title">Уведомления приложений</div>
                                    <div class="option-description">Разрешить приложениям показывать уведомления</div>
                                </div>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="app-notifications" checked>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                            
                            <div class="settings-option">
                                <div class="option-label">
                                    <div class="option-title">Доступ к файлам</div>
                                    <div class="option-description">Разрешить приложениям доступ к файловой системе</div>
                                </div>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="app-file-access" checked>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <div class="settings-page" id="about-page">
                        <div class="settings-header">
                            <h2>О системе</h2>
                            <p>Информация о WebOS и системные ресурсы</p>
                        </div>
                        
                        <div class="about-content">
                            <div class="about-hero">
                                <div class="about-logo">W</div>
                                <div class="about-text">
                                    <h1>WebOS</h1>
                                    <p>Веб-операционная система</p>
                                    <div class="version">Версия 2.0.0</div>
                                </div>
                            </div>
                            
                            <div class="system-info">
                                <div class="info-card">
                                    <div class="info-icon">💻</div>
                                    <div class="info-content">
                                        <div class="info-title">Процессор</div>
                                        <div class="info-value">Виртуальный CPU</div>
                                    </div>
                                </div>
                                
                                <div class="info-card">
                                    <div class="info-icon">🧠</div>
                                    <div class="info-content">
                                        <div class="info-title">Память</div>
                                        <div class="info-value">512 МБ / 1 ГБ</div>
                                        <div class="info-progress">
                                            <div class="progress-bar">
                                                <div class="progress-fill" style="width: 50%"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="info-card">
                                    <div class="info-icon">💾</div>
                                    <div class="info-content">
                                        <div class="info-title">Хранилище</div>
                                        <div class="info-value">6.5 ГБ / 10 ГБ</div>
                                        <div class="info-progress">
                                            <div class="progress-bar">
                                                <div class="progress-fill" style="width: 65%"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="info-card">
                                    <div class="info-icon">🌐</div>
                                    <div class="info-content">
                                        <div class="info-title">Сеть</div>
                                        <div class="info-value">Подключено</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="legal-info">
                                <h3>Правовая информация</h3>
                                <p>WebOS - демонстрационная веб-операционная система. Все права защищены.</p>
                                <p>Система создана для демонстрации возможностей современных веб-технологий.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.showPage(this.currentPage);
    }

    setupEventListeners() {
        // Навигация по категориям
        this.container.querySelectorAll('.settings-category').forEach(category => {
            category.addEventListener('click', () => {
                const page = category.getAttribute('data-page');
                this.showPage(page);
            });
        });

        // Обработчики для переключателей
        this.setupToggleHandlers();
        
        // Обработчики для кнопок действий
        this.setupActionHandlers();
        
        // Обработчики для выбора темы
        this.setupThemeHandlers();
        
        // Обработчики для выбора обоев
        this.setupWallpaperHandlers();
    }

    setupToggleHandlers() {
        const toggles = {
            'notifications-enabled': 'notifications',
            'notification-sound': 'sound',
            'animations-enabled': 'animations',
            'transparency-enabled': 'transparency',
            'autostart-enabled': 'autostart',
            'background-processes': 'backgroundProcesses',
            'auto-cleanup': 'autoCleanup',
            'auto-updates': 'autoUpdates',
            'telemetry-enabled': 'telemetry',
            'personalization-enabled': 'personalization',
            'malware-protection': 'malwareProtection',
            'firewall-enabled': 'firewall',
            'app-notifications': 'appNotifications',
            'app-file-access': 'appFileAccess'
        };

        Object.entries(toggles).forEach(([elementId, settingKey]) => {
            const element = this.container.querySelector(`#${elementId}`);
            if (element) {
                element.addEventListener('change', (e) => {
                    if (webOS) {
                        webOS.state.settings[settingKey] = e.target.checked;
                        webOS.saveSettings();
                        webOS.applySettings();
                    }
                });
            }
        });

        // Выбор языка
        const languageSelect = this.container.querySelector('#language-select');
        if (languageSelect) {
            languageSelect.addEventListener('change', (e) => {
                Utils.showNotification('Настройки', `Язык изменен на: ${e.target.options[e.target.selectedIndex].text}`, 'success');
            });
        }

        // Формат даты и времени
        const datetimeFormat = this.container.querySelector('#datetime-format');
        if (datetimeFormat) {
            datetimeFormat.addEventListener('change', (e) => {
                Utils.showNotification('Настройки', `Формат даты изменен`, 'success');
            });
        }
    }

    setupActionHandlers() {
        // Проверка обновлений
        const checkUpdatesBtn = this.container.querySelector('#check-updates');
        if (checkUpdatesBtn) {
            checkUpdatesBtn.addEventListener('click', () => {
                Utils.showNotification('Обновления', 'Проверка обновлений...', 'info');
                setTimeout(() => {
                    Utils.showNotification('Обновления', 'Система обновлена до последней версии', 'success');
                }, 2000);
            });
        }

        // Очистка данных
        const clearBrowserData = this.container.querySelector('#clear-browser-data');
        if (clearBrowserData) {
            clearBrowserData.addEventListener('click', () => {
                if (confirm('Очистить все данные браузера?')) {
                    Utils.showNotification('Настройки', 'Данные браузера очищены', 'success');
                }
            });
        }

        const clearAppData = this.container.querySelector('#clear-app-data');
        if (clearAppData) {
            clearAppData.addEventListener('click', () => {
                if (confirm('Очистить данные всех приложений?')) {
                    Utils.showNotification('Настройки', 'Данные приложений очищены', 'success');
                }
            });
        }

        const resetSettings = this.container.querySelector('#reset-settings');
        if (resetSettings) {
            resetSettings.addEventListener('click', () => {
                if (confirm('Сбросить все настройки к значениям по умолчанию?')) {
                    if (webOS) {
                        webOS.state.settings = {
                            theme: 'auto',
                            showSeconds: true,
                            autostart: false,
                            animations: true,
                            sound: true
                        };
                        webOS.saveSettings();
                        webOS.applySettings();
                        Utils.showNotification('Настройки', 'Все настройки сброшены', 'success');
                        this.loadSettings();
                    }
                }
            });
        }

        // Управление приложениями
        this.container.querySelectorAll('.app-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const appId = e.target.getAttribute('data-app');
                this.manageApplication(appId);
            });
        });
    }

    setupThemeHandlers() {
        this.container.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', () => {
                const theme = option.getAttribute('data-theme');
                
                // Снимаем выделение со всех вариантов
                this.container.querySelectorAll('.theme-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                
                // Выделяем выбранный вариант
                option.classList.add('selected');
                
                // Применяем тему
                if (webOS) {
                    webOS.state.settings.theme = theme;
                    webOS.saveSettings();
                    webOS.applyTheme();
                }
                
                Utils.showNotification('Настройки', `Тема изменена: ${option.querySelector('.theme-name').textContent}`, 'success');
            });
        });
    }

    setupWallpaperHandlers() {
        this.container.querySelectorAll('.wallpaper-option').forEach(option => {
            option.addEventListener('click', () => {
                const wallpaper = option.getAttribute('data-wallpaper');
                
                // Снимаем выделение со всех вариантов
                this.container.querySelectorAll('.wallpaper-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                
                // Выделяем выбранный вариант
                option.classList.add('selected');
                
                // Применяем обои
                this.applyWallpaper(wallpaper);
                
                Utils.showNotification('Настройки', `Обои изменены: ${option.querySelector('.wallpaper-name').textContent}`, 'success');
            });
        });
    }

    showPage(pageId) {
        // Скрываем все страницы
        this.container.querySelectorAll('.settings-page').forEach(page => {
            page.classList.remove('active');
        });
        
        // Снимаем выделение со всех категорий
        this.container.querySelectorAll('.settings-category').forEach(category => {
            category.classList.remove('active');
        });
        
        // Показываем выбранную страницу
        const pageElement = this.container.querySelector(`#${pageId}-page`);
        if (pageElement) {
            pageElement.classList.add('active');
        }
        
        // Выделяем выбранную категорию
        const categoryElement = this.container.querySelector(`[data-page="${pageId}"]`);
        if (categoryElement) {
            categoryElement.classList.add('active');
        }
        
        this.currentPage = pageId;
    }

    loadSettings() {
        if (!webOS) return;

        // Загружаем значения переключателей
        const toggles = {
            'notifications-enabled': 'notifications',
            'notification-sound': 'sound',
            'animations-enabled': 'animations',
            'transparency-enabled': 'transparency',
            'autostart-enabled': 'autostart',
            'background-processes': 'backgroundProcesses',
            'auto-cleanup': 'autoCleanup',
            'auto-updates': 'autoUpdates',
            'telemetry-enabled': 'telemetry',
            'personalization-enabled': 'personalization',
            'malware-protection': 'malwareProtection',
            'firewall-enabled': 'firewall',
            'app-notifications': 'appNotifications',
            'app-file-access': 'appFileAccess'
        };

        Object.entries(toggles).forEach(([elementId, settingKey]) => {
            const element = this.container.querySelector(`#${elementId}`);
            if (element && webOS.state.settings[settingKey] !== undefined) {
                element.checked = webOS.state.settings[settingKey];
            }
        });
    }

    applyWallpaper(wallpaper) {
        const desktop = document.getElementById('desktop');
        if (!desktop) return;

        const wallpapers = {
            'default': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'nature': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            'abstract': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
        };

        desktop.style.background = wallpapers[wallpaper] || wallpapers.default;
    }

    manageApplication(appId) {
        const appConfig = APP_CONFIG[appId];
        if (!appConfig) return;

        const actions = [
            { text: 'Открыть', action: () => WindowManager.openWindow(appId) },
            { text: 'Закрыть', action: () => this.closeApplication(appId) },
            { separator: true },
            { text: 'О приложении', action: () => this.showAppInfo(appId) },
            { text: 'Сбросить настройки', action: () => this.resetAppSettings(appId) },
            { separator: true },
            { text: 'Удалить', action: () => this.uninstallApp(appId), warning: true }
        ];

        this.showApplicationMenu(actions, appConfig.name);
    }

    showApplicationMenu(actions, appName) {
        const menu = document.createElement('div');
        menu.className = 'settings-context-menu';
        menu.style.cssText = `
            position: fixed;
            background: var(--bg-primary);
            border: 1px solid var(--border-color);
            border-radius: 6px;
            box-shadow: var(--shadow);
            z-index: 1000;
            min-width: 200px;
        `;

        // Заголовок с именем приложения
        const header = document.createElement('div');
        header.className = 'menu-header';
        header.textContent = appName;
        header.style.cssText = `
            padding: 12px;
            font-weight: 600;
            border-bottom: 1px solid var(--border-color);
        `;
        menu.appendChild(header);

        actions.forEach(item => {
            if (item.separator) {
                const separator = document.createElement('div');
                separator.style.cssText = 'height: 1px; background: var(--border-color); margin: 4px 0;';
                menu.appendChild(separator);
            } else {
                const menuItem = document.createElement('div');
                menuItem.className = 'menu-item';
                if (item.warning) menuItem.classList.add('warning');
                menuItem.textContent = item.text;
                menuItem.style.cssText = `
                    padding: 8px 12px;
                    cursor: pointer;
                    transition: background-color 0.2s;
                    font-size: 13px;
                `;
                menuItem.addEventListener('mouseenter', () => {
                    menuItem.style.background = 'var(--bg-secondary)';
                });
                menuItem.addEventListener('mouseleave', () => {
                    menuItem.style.background = 'transparent';
                });
                menuItem.addEventListener('click', () => {
                    item.action();
                    menu.remove();
                });
                menu.appendChild(menuItem);
            }
        });

        document.body.appendChild(menu);

        // Позиционирование
        const rect = menu.getBoundingClientRect();
        menu.style.left = '50%';
        menu.style.top = '50%';
        menu.style.transform = 'translate(-50%, -50%)';

        // Закрытие при клике вне меню
        const closeMenu = (e) => {
            if (!menu.contains(e.target)) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        };
        setTimeout(() => document.addEventListener('click', closeMenu), 100);
    }

    closeApplication(appId) {
        Utils.showNotification('Приложения', `Приложение "${APP_CONFIG[appId]?.name}" закрыто`, 'success');
    }

    showAppInfo(appId) {
        const appConfig = APP_CONFIG[appId];
        if (!appConfig) return;

        const info = `
            <strong>${appConfig.name}</strong><br>
            Версия: 2.0.0<br>
            Разработчик: WebOS Team<br>
            ID: ${appId}<br>
            <br>
            <small>Системное приложение WebOS</small>
        `;
        
        Utils.showNotification('О приложении', info, 'info', 5000);
    }

    resetAppSettings(appId) {
        if (confirm(`Сбросить настройки приложения "${APP_CONFIG[appId]?.name}"?`)) {
            Utils.showNotification('Приложения', 'Настройки приложения сброшены', 'success');
        }
    }

    uninstallApp(appId) {
        if (confirm(`Удалить приложение "${APP_CONFIG[appId]?.name}"?`)) {
            Utils.showNotification('Приложения', 'Приложение удалено', 'success');
        }
    }
}

window.Settings = Settings;
