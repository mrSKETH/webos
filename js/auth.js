// Система аутентификации
class AuthManager {
    static init() {
        console.log('🔐 Система аутентификации инициализирована');
        this.setupEventListeners();
    }

    static setupEventListeners() {
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Автозаполнение для демо
        this.setupDemoCredentials();
    }

    static setupDemoCredentials() {
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        
        if (usernameInput && passwordInput) {
            // Автозаполнение демо-данных
            usernameInput.value = 'user';
            passwordInput.value = '123';
        }
    }

    static async handleLogin() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const loginBtn = document.querySelector('.login-btn');

        if (!username || !password) {
            this.showLoginError('Заполните все поля');
            return;
        }

        // Показываем индикатор загрузки
        this.showLoading(loginBtn);

        try {
            // Имитация проверки учетных данных
            const result = await this.authenticate(username, password);
            
            if (result.success) {
                // Успешный вход
                await this.handleSuccessfulLogin(result.user);
            } else {
                throw new Error('Неверное имя пользователя или пароль');
            }
            
        } catch (error) {
            this.showLoginError(error.message);
        } finally {
            this.hideLoading(loginBtn);
        }
    }

    static async authenticate(username, password) {
        // Имитация задержки сети
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

        // Простая проверка демо-учетных данных
        const validUsers = {
            'user': '123',
            'admin': 'admin123',
            'demo': 'demo'
        };

        if (validUsers[username] && validUsers[username] === password) {
            return {
                success: true,
                user: {
                    name: username === 'admin' ? 'Администратор' : 
                          username === 'demo' ? 'Демо-пользователь' : 'Пользователь',
                    username: username,
                    avatar: '👤',
                    role: username === 'admin' ? 'admin' : 'user'
                }
            };
        } else {
            throw new Error('Неверное имя пользователя или пароль');
        }
    }

    static async handleSuccessfulLogin(userData) {
        // Сохраняем информацию о пользователе
        if (window.webOS) {
            webOS.state.user = userData;
            webOS.state.loggedIn = true;
            webOS.saveSettings();
        }

        // Анимация успешного входа
        await this.showSuccessAnimation();

        // Переходим на рабочий стол
        this.showDesktop();
    }

    static async showSuccessAnimation() {
        const loginContainer = document.querySelector('.login-container');
        if (loginContainer) {
            loginContainer.style.transform = 'translateY(-20px)';
            loginContainer.style.opacity = '0';
            
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    static showDesktop() {
        const loginScreen = document.getElementById('login-screen');
        const desktop = document.getElementById('desktop');
        
        if (loginScreen) loginScreen.style.display = 'none';
        if (desktop) {
            desktop.style.display = 'block';
            
            // Запускаем обновление времени
            if (window.webOS) {
                webOS.updateTime();
                setInterval(() => webOS.updateTime(), 1000);
            }
            
            // Показываем приветственное уведомление
            if (window.Utils && window.webOS) {
                Utils.showNotification(
                    'Добро пожаловать!', 
                    `Рады видеть вас в WebOS, ${webOS.state.user.name}!`,
                    'success'
                );
            }
        }
    }

    static showLoading(button) {
        if (button) {
            button.classList.add('loading');
            button.disabled = true;
        }
    }

    static hideLoading(button) {
        if (button) {
            button.classList.remove('loading');
            button.disabled = false;
        }
    }

    static showLoginError(message) {
        // Показываем уведомление
        if (window.Utils) {
            Utils.showNotification('Ошибка входа', message, 'error');
        } else {
            alert('Ошибка входа: ' + message);
        }
        
        // Анимация ошибки
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.classList.add('error-shake');
            setTimeout(() => {
                loginForm.classList.remove('error-shake');
            }, 500);
        }
    }

    static logout() {
        if (window.webOS) {
            webOS.logout();
        }
    }

    static getCurrentUser() {
        return window.webOS ? webOS.state.user : null;
    }

    static isLoggedIn() {
        return window.webOS ? webOS.state.loggedIn : false;
    }

    static hasPermission(permission) {
        const user = this.getCurrentUser();
        if (!user) return false;
        
        if (user.role === 'admin') return true;
        
        const permissions = {
            'user': ['open_apps', 'change_settings'],
            'demo': ['open_apps']
        };
        
        return permissions[user.role]?.includes(permission) || false;
    }
}

// CSS для анимации ошибки
const errorStyles = `
    .error-shake {
        animation: shake 0.5s ease-in-out;
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }
`;

// Добавляем стили в документ
const styleSheet = document.createElement('style');
styleSheet.textContent = errorStyles;
document.head.appendChild(styleSheet);

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    AuthManager.init();
});

// Экспорт для глобального доступа
window.AuthManager = AuthManager;
