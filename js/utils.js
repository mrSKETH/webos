// Утилиты и вспомогательные функции
class Utils {
    static init() {
        console.log('🔧 Утилиты инициализированы');
        this.setupGlobalListeners();
    }

    static setupGlobalListeners() {
        // Обработчик для клавиатуры
        document.addEventListener('keydown', (e) => {
            // Alt + Tab для переключения между приложениями
            if (e.altKey && e.key === 'Tab') {
                e.preventDefault();
                this.switchBetweenApps();
            }
            
            // Win + D для показа рабочего стола
            if (e.key === 'd' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                this.showDesktop();
            }
            
            // F11 для полноэкранного режима
            if (e.key === 'F11') {
                e.preventDefault();
                this.toggleFullscreen();
            }
        });

        // Обработчик изменения системной темы
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (window.webOS && webOS.state.settings.theme === 'auto') {
                    webOS.applyTheme();
                }
            });
        }
    }

    static switchBetweenApps() {
        if (!window.WindowManager) return;
        
        const windows = WindowManager.getWindows();
        if (windows.length === 0) return;
        
        const activeWindow = WindowManager.getActiveWindow();
        const currentIndex = windows.findIndex(w => w === activeWindow);
        const nextIndex = (currentIndex + 1) % windows.length;
        
        WindowManager.bringToFront(windows[nextIndex]);
    }

    static showDesktop() {
        if (!window.WindowManager) return;
        
        const windows = WindowManager.getWindows();
        windows.forEach(window => {
            WindowManager.minimizeWindow(window);
        });
    }

    static toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log('Ошибка при переходе в полноэкранный режим:', err);
            });
        } else {
            document.exitFullscreen();
        }
    }

    // Анимации
    static animateElement(element, animation, duration = 300) {
        return new Promise((resolve) => {
            element.classList.add(animation);
            
            setTimeout(() => {
                element.classList.remove(animation);
                resolve();
            }, duration);
        });
    }

    static fadeIn(element, duration = 300) {
        return this.animateElement(element, 'animate-fadeIn', duration);
    }

    static fadeOut(element, duration = 300) {
        return this.animateElement(element, 'animate-fadeOut', duration);
    }

    static slideIn(element, duration = 300) {
        return this.animateElement(element, 'animate-slideInUp', duration);
    }

    static slideOut(element, duration = 300) {
        return this.animateElement(element, 'animate-slideOut', duration);
    }

    // Уведомления
    static showNotification(title, message, type = 'info', duration = 5000) {
        const notifications = document.getElementById('notifications');
        if (!notifications) {
            console.log(`📢 ${title}: ${message}`);
            return null;
        }

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icons = {
            info: 'ℹ️',
            success: '✅',
            warning: '⚠️',
            error: '❌'
        };

        notification.innerHTML = `
            <div class="notification-header">
                <span class="notification-title">
                    <span style="margin-right: 8px;">${icons[type] || icons.info}</span>
                    ${title}
                </span>
                <button class="notification-close">✕</button>
            </div>
            <div class="notification-message">${message}</div>
        `;

        notifications.appendChild(notification);

        // Анимация появления
        setTimeout(() => {
            notification.classList.add('notification-show');
        }, 10);

        // Закрытие уведомления
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            this.hideNotification(notification);
        });

        // Автоматическое закрытие
        if (duration > 0) {
            setTimeout(() => {
                if (notification.parentNode) {
                    this.hideNotification(notification);
                }
            }, duration);
        }

        return notification;
    }

    static hideNotification(notification) {
        notification.classList.remove('notification-show');
        notification.classList.add('notification-hide');
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }

    // Модальные окна
    static showModal(modalId) {
        const overlay = document.getElementById('modal-overlay');
        const modal = document.getElementById(modalId);
        
        if (!overlay || !modal) return;
        
        overlay.style.display = 'flex';
        modal.classList.add('active');
        
        // Анимация появления
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
    }

    static hideModal(modalId) {
        const overlay = document.getElementById('modal-overlay');
        const modal = document.getElementById(modalId);
        
        if (!overlay || !modal) return;
        
        modal.classList.remove('active');
        
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 300);
    }

    // Работа с локальным хранилищем
    static storage = {
        get(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (error) {
                console.error('Ошибка при чтении из localStorage:', error);
                return defaultValue;
            }
        },

        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (error) {
                console.error('Ошибка при записи в localStorage:', error);
                return false;
            }
        },

        remove(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (error) {
                console.error('Ошибка при удалении из localStorage:', error);
                return false;
            }
        },

        clear() {
            try {
                localStorage.clear();
                return true;
            } catch (error) {
                console.error('Ошибка при очистке localStorage:', error);
                return false;
            }
        }
    };

    // Форматирование данных
    static formatFileSize(bytes) {
        if (bytes === 0) return '0 Б';
        
        const k = 1024;
        const sizes = ['Б', 'КБ', 'МБ', 'ГБ', 'ТБ'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    static formatDate(date, options = {}) {
        const defaultOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        };
        
        return new Date(date).toLocaleDateString('ru-RU', { ...defaultOptions, ...options });
    }

    static formatTime(date, options = {}) {
        const defaultOptions = {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        };
        
        return new Date(date).toLocaleTimeString('ru-RU', { ...defaultOptions, ...options });
    }

    // Валидация
    static isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Генерация ID
    static generateId(length = 8) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        return result;
    }

    // Дебаунс
    static debounce(func, wait, immediate) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
        };
    }

    // Троттлинг
    static throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Клонирование объектов
    static deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj);
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        if (obj instanceof Object) {
            const clonedObj = {};
            Object.keys(obj).forEach(key => {
                clonedObj[key] = this.deepClone(obj[key]);
            });
            return clonedObj;
        }
    }

    // Случайные числа
    static randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static randomColor() {
        return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    }

    // Анимация загрузки
    static showLoading(text = 'Загрузка...') {
        const loadingEl = document.createElement('div');
        loadingEl.id = 'global-loading';
        loadingEl.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            color: white;
            font-size: 18px;
            z-index: 10000;
            backdrop-filter: blur(10px);
        `;
        loadingEl.innerHTML = `
            <div style="text-align: center;">
                <div class="boot-logo" style="margin: 0 auto 20px;">
                    <span>W</span>
                </div>
                <div>${text}</div>
            </div>
        `;
        document.body.appendChild(loadingEl);
    }

    static hideLoading() {
        const loadingEl = document.getElementById('global-loading');
        if (loadingEl) {
            loadingEl.remove();
        }
    }

    // Проверка поддержки функций
    static supports = {
        localStorage: () => {
            try {
                localStorage.setItem('test', 'test');
                localStorage.removeItem('test');
                return true;
            } catch (e) {
                return false;
            }
        },
        
        sessionStorage: () => {
            try {
                sessionStorage.setItem('test', 'test');
                sessionStorage.removeItem('test');
                return true;
            } catch (e) {
                return false;
            }
        },
        
        fullscreen: () => {
            return !!(
                document.fullscreenEnabled ||
                document.webkitFullscreenEnabled ||
                document.mozFullScreenEnabled ||
                document.msFullscreenEnabled
            );
        },
        
        notifications: () => {
            return 'Notification' in window;
        },
        
        serviceWorker: () => {
            return 'serviceWorker' in navigator;
        }
    };

    // Работа с файлами
    static readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = e => reject(e);
            reader.readAsText(file);
        });
    }

    static readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = e => reject(e);
            reader.readAsDataURL(file);
        });
    }

    static downloadFile(content, filename, contentType = 'text/plain') {
        const blob = new Blob([content], { type: contentType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Воспроизведение звуков
    static playSound(type = 'click') {
        // Простая заглушка для звуков
        console.log(`🔊 Воспроизведение звука: ${type}`);
    }
}

// Экспорт для глобального доступа
window.Utils = Utils;
