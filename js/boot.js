// Процесс загрузки системы
class BootManager {
    static async boot() {
        console.log('🔌 Начинается загрузка системы...');
        
        // Показываем анимацию загрузки
        this.showBootAnimation();
        
        try {
            // Имитация процесса загрузки
            await this.simulateBootProcess();
            
            // Завершаем загрузку
            await this.finishBoot();
            
        } catch (error) {
            console.error('❌ Ошибка при загрузке системы:', error);
            this.showBootError(error);
        }
    }

    static showBootAnimation() {
        const bootScreen = document.getElementById('boot-animation');
        if (bootScreen) {
            bootScreen.style.display = 'flex';
        }
    }

    static async simulateBootProcess() {
        const steps = [
            { name: 'Инициализация ядра', duration: 800 },
            { name: 'Загрузка драйверов', duration: 600 },
            { name: 'Запуск системных служб', duration: 1000 },
            { name: 'Подготовка рабочей среды', duration: 700 },
            { name: 'Проверка обновлений', duration: 500 }
        ];

        const progressBar = document.getElementById('boot-progress');
        const progressText = document.querySelector('#boot-animation p');

        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            const progress = ((i + 1) / steps.length) * 100;
            
            // Обновляем текст
            if (progressText) {
                progressText.textContent = step.name + '...';
            }
            
            // Обновляем прогресс
            if (progressBar) {
                progressBar.style.width = `${progress}%`;
            }
            
            // Ждем завершения шага
            await this.delay(step.duration);
        }
    }

    static async finishBoot() {
        // Завершаем анимацию прогресса
        const progressBar = document.getElementById('boot-progress');
        if (progressBar) {
            progressBar.style.width = '100%';
        }

        // Показываем завершающее сообщение
        const progressText = document.querySelector('#boot-animation p');
        if (progressText) {
            progressText.textContent = 'Система готова к работе!';
        }

        // Анимация завершения
        await this.delay(1000);

        // Скрываем экран загрузки с анимацией
        const bootScreen = document.getElementById('boot-animation');
        if (bootScreen) {
            bootScreen.style.opacity = '0';
            bootScreen.style.transition = 'opacity 0.5s ease';
            
            setTimeout(() => {
                bootScreen.style.display = 'none';
                this.showLoginScreen();
            }, 500);
        }
    }

    static showBootError(error) {
        const bootScreen = document.getElementById('boot-animation');
        if (bootScreen) {
            bootScreen.innerHTML = `
                <div style="text-align: center; color: white;">
                    <div style="font-size: 48px; margin-bottom: 20px;">❌</div>
                    <h2 style="margin-bottom: 10px;">Ошибка загрузки</h2>
                    <p style="margin-bottom: 20px; opacity: 0.8;">${error.message || 'Неизвестная ошибка'}</p>
                    <button onclick="location.reload()" style="
                        padding: 10px 20px;
                        background: white;
                        border: none;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 14px;
                    ">Перезагрузить</button>
                </div>
            `;
        }
    }

    static showLoginScreen() {
        const loginScreen = document.getElementById('login-screen');
        const loginContainer = document.querySelector('.login-container');
        
        if (loginScreen && loginContainer) {
            loginScreen.style.display = 'flex';
            
            // Анимация появления
            setTimeout(() => {
                loginContainer.classList.add('loaded');
            }, 100);
        }
    }

    static delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Функции для глобального доступа
async function bootSystem() {
    await BootManager.boot();
}

function showLoginScreen() {
    BootManager.showLoginScreen();
}

// Экспорт для использования в других модулях
window.BootManager = BootManager;
window.bootSystem = bootSystem;
window.showLoginScreen = showLoginScreen;
