// Приложение Календарь
class Calendar {
    constructor(container, options = {}) {
        this.container = container;
        this.options = options;
        this.currentDate = new Date();
        this.selectedDate = new Date();
        this.events = [];
        
        this.init();
    }

    init() {
        this.render();
        this.setupEventListeners();
        this.loadEvents();
        this.renderCalendar();
    }

    render() {
        this.container.innerHTML = `
            <div class="calendar-app">
                <div class="calendar-toolbar">
                    <div class="calendar-nav">
                        <button class="calendar-btn" id="calendar-today">Сегодня</button>
                        <button class="calendar-btn" id="calendar-prev">←</button>
                        <button class="calendar-btn" id="calendar-next">→</button>
                    </div>
                    
                    <div class="calendar-title" id="calendar-title">
                        Январь 2024
                    </div>
                    
                    <div class="calendar-views">
                        <button class="view-btn active" data-view="month">Месяц</button>
                        <button class="view-btn" data-view="week">Неделя</button>
                        <button class="view-btn" data-view="day">День</button>
                    </div>
                    
                    <div class="calendar-actions">
                        <button class="calendar-btn" id="calendar-new-event">+ Событие</button>
                    </div>
                </div>
                
                <div class="calendar-content">
                    <div class="calendar-main" id="calendar-main">
                        <!-- Calendar grid will be rendered here -->
                    </div>
                    
                    <div class="calendar-sidebar">
                        <div class="sidebar-section">
                            <h4>Сегодня</h4>
                            <div class="today-info" id="today-info">
                                <!-- Today's date info -->
                            </div>
                        </div>
                        
                        <div class="sidebar-section">
                            <h4>Ближайшие события</h4>
                            <div class="upcoming-events" id="upcoming-events">
                                <!-- Upcoming events will be shown here -->
                            </div>
                        </div>
                        
                        <div class="sidebar-section">
                            <h4>Мини-календарь</h4>
                            <div class="mini-calendar" id="mini-calendar">
                                <!-- Mini calendar will be rendered here -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="event-modal" id="event-modal" style="display: none;">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 id="modal-title">Новое событие</h3>
                        <button class="modal-close" id="modal-close">✕</button>
                    </div>
                    <div class="modal-body">
                        <form id="event-form">
                            <div class="form-group">
                                <label for="event-title">Название</label>
                                <input type="text" id="event-title" required>
                            </div>
                            <div class="form-group">
                                <label for="event-date">Дата</label>
                                <input type="date" id="event-date" required>
                            </div>
                            <div class="form-group">
                                <label for="event-time">Время</label>
                                <input type="time" id="event-time">
                            </div>
                            <div class="form-group">
                                <label for="event-description">Описание</label>
                                <textarea id="event-description" rows="3"></textarea>
                            </div>
                            <div class="form-group">
                                <label for="event-color">Цвет</label>
                                <select id="event-color">
                                    <option value="#0078d4" selected>Синий</option>
                                    <option value="#107c10">Зеленый</option>
                                    <option value="#d83b01">Оранжевый</option>
                                    <option value="#e81123">Красный</option>
                                    <option value="#b4009e">Фиолетовый</option>
                                </select>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" id="event-cancel">Отмена</button>
                        <button type="submit" form="event-form" id="event-save">Сохранить</button>
                    </div>
                </div>
            </div>
        `;

        this.calendarTitle = this.container.querySelector('#calendar-title');
        this.calendarMain = this.container.querySelector('#calendar-main');
        this.todayInfo = this.container.querySelector('#today-info');
        this.upcomingEvents = this.container.querySelector('#upcoming-events');
        this.miniCalendar = this.container.querySelector('#mini-calendar');
        this.eventModal = this.container.querySelector('#event-modal');
    }

    setupEventListeners() {
        // Навигация
        this.container.querySelector('#calendar-today').addEventListener('click', () => this.goToToday());
        this.container.querySelector('#calendar-prev').addEventListener('click', () => this.previousMonth());
        this.container.querySelector('#calendar-next').addEventListener('click', () => this.nextMonth());
        
        // Переключение видов
        this.container.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.target.getAttribute('data-view');
                this.switchView(view);
            });
        });
        
        // Создание события
        this.container.querySelector('#calendar-new-event').addEventListener('click', () => this.showEventModal());
        
        // Модальное окно события
        this.container.querySelector('#modal-close').addEventListener('click', () => this.hideEventModal());
        this.container.querySelector('#event-cancel').addEventListener('click', () => this.hideEventModal());
        this.container.querySelector('#event-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveEvent();
        });
        
        // Горячие клавиши
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideEventModal();
            } else if (e.ctrlKey && e.key === 'n') {
                e.preventDefault();
                this.showEventModal();
            }
        });
    }

    renderCalendar() {
        this.renderMonthView();
        this.renderTodayInfo();
        this.renderUpcomingEvents();
        this.renderMiniCalendar();
    }

    renderMonthView() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // Обновляем заголовок
        const monthNames = [
            'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
        ];
        this.calendarTitle.textContent = `${monthNames[month]} ${year}`;
        
        // Создаем сетку календаря
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();
        
        // Корректируем начало недели (понедельник)
        const startOffset = startingDay === 0 ? 6 : startingDay - 1;
        
        this.calendarMain.innerHTML = `
            <div class="calendar-grid">
                <div class="calendar-day-header">Пн</div>
                <div class="calendar-day-header">Вт</div>
                <div class="calendar-day-header">Ср</div>
                <div class="calendar-day-header">Чт</div>
                <div class="calendar-day-header">Пт</div>
                <div class="calendar-day-header">Сб</div>
                <div class="calendar-day-header">Вс</div>
                
                ${this.renderEmptyDays(startOffset)}
                ${this.renderMonthDays(year, month, daysInMonth)}
            </div>
        `;
        
        this.setupDayClickHandlers();
    }

    renderEmptyDays(count) {
        return Array.from({ length: count }, (_, i) => 
            `<div class="calendar-day other-month"></div>`
        ).join('');
    }

    renderMonthDays(year, month, daysInMonth) {
        const today = new Date();
        const todayString = today.toDateString();
        const selectedString = this.selectedDate.toDateString();
        
        return Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const date = new Date(year, month, day);
            const dateString = date.toDateString();
            const isToday = dateString === todayString;
            const isSelected = dateString === selectedString;
            const dayEvents = this.getEventsForDate(date);
            
            let dayClass = 'calendar-day';
            if (isToday) dayClass += ' today';
            if (isSelected) dayClass += ' selected';
            if (dayEvents.length > 0) dayClass += ' has-events';
            
            return `
                <div class="${dayClass}" data-date="${date.toISOString()}">
                    <div class="day-number">${day}</div>
                    ${dayEvents.slice(0, 2).map(event => `
                        <div class="day-event" style="background: ${event.color}" title="${event.title}">
                            ${event.title}
                        </div>
                    `).join('')}
                    ${dayEvents.length > 2 ? `<div class="day-more">+${dayEvents.length - 2}</div>` : ''}
                </div>
            `;
        }).join('');
    }

    setupDayClickHandlers() {
        this.calendarMain.querySelectorAll('.calendar-day:not(.other-month)').forEach(day => {
            day.addEventListener('click', () => {
                const dateString = day.getAttribute('data-date');
                this.selectDate(new Date(dateString));
            });
            
            day.addEventListener('dblclick', () => {
                const dateString = day.getAttribute('data-date');
                this.selectedDate = new Date(dateString);
                this.showEventModal();
            });
        });
    }

    renderTodayInfo() {
        const today = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        
        const todayString = today.toLocaleDateString('ru-RU', options);
        const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
        const weekNumber = this.getWeekNumber(today);
        
        this.todayInfo.innerHTML = `
            <div class="today-date">${todayString}</div>
            <div class="today-stats">
                <div>День года: ${dayOfYear}</div>
                <div>Неделя: ${weekNumber}</div>
                <div>Событий сегодня: ${this.getEventsForDate(today).length}</div>
            </div>
        `;
    }

    renderUpcomingEvents() {
        const today = new Date();
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
        
        const upcoming = this.events
            .filter(event => {
                const eventDate = new Date(event.date);
                return eventDate >= today && eventDate <= nextWeek;
            })
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, 5);
        
        if (upcoming.length === 0) {
            this.upcomingEvents.innerHTML = '<p>Нет предстоящих событий</p>';
            return;
        }
        
        this.upcomingEvents.innerHTML = upcoming.map(event => `
            <div class="upcoming-event" data-event-id="${event.id}">
                <div class="event-color" style="background: ${event.color}"></div>
                <div class="event-info">
                    <div class="event-title">${event.title}</div>
                    <div class="event-date">${this.formatEventDate(event.date)}</div>
                </div>
            </div>
        `).join('');
        
        // Обработчики для событий
        this.upcomingEvents.querySelectorAll('.upcoming-event').forEach(eventElement => {
            eventElement.addEventListener('click', () => {
                const eventId = eventElement.getAttribute('data-event-id');
                this.editEvent(eventId);
            });
        });
    }

    renderMiniCalendar() {
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();
        const startOffset = startingDay === 0 ? 6 : startingDay - 1;
        
        this.miniCalendar.innerHTML = `
            <div class="mini-calendar-header">
                <button class="mini-prev">←</button>
                <span class="mini-title">${today.toLocaleDateString('ru-RU', { month: 'short', year: 'numeric' })}</span>
                <button class="mini-next">→</button>
            </div>
            <div class="mini-calendar-grid">
                <div class="mini-day-header">Пн</div>
                <div class="mini-day-header">Вт</div>
                <div class="mini-day-header">Ср</div>
                <div class="mini-day-header">Чт</div>
                <div class="mini-day-header">Пт</div>
                <div class="mini-day-header">Сб</div>
                <div class="mini-day-header">Вс</div>
                
                ${Array.from({ length: startOffset }, () => '<div class="mini-day other-month"></div>').join('')}
                ${Array.from({ length: daysInMonth }, (_, i) => {
                    const day = i + 1;
                    const date = new Date(currentYear, currentMonth, day);
                    const isToday = date.toDateString() === today.toDateString();
                    const dayClass = isToday ? 'mini-day today' : 'mini-day';
                    return `<div class="${dayClass}">${day}</div>`;
                }).join('')}
            </div>
        `;
        
        // Обработчики для мини-календаря
        this.miniCalendar.querySelector('.mini-prev').addEventListener('click', () => this.previousMonth());
        this.miniCalendar.querySelector('.mini-next').addEventListener('click', () => this.nextMonth());
    }

    // Навигация
    goToToday() {
        this.currentDate = new Date();
        this.selectedDate = new Date();
        this.renderCalendar();
    }

    previousMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.renderCalendar();
    }

    nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.renderCalendar();
    }

    switchView(view) {
        // Снимаем активный класс со всех кнопок
        this.container.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Активируем выбранную кнопку
        this.container.querySelector(`[data-view="${view}"]`).classList.add('active');
        
        // В демо-версии показываем только вид месяца
        Utils.showNotification('Календарь', `Режим просмотра: ${view}`, 'info');
    }

    selectDate(date) {
        this.selectedDate = date;
        this.renderCalendar();
        
        const events = this.getEventsForDate(date);
        if (events.length > 0) {
            const eventList = events.map(event => `• ${event.title}`).join('\n');
            Utils.showNotification('Календарь', `События на ${date.toLocaleDateString('ru-RU')}:\n${eventList}`, 'info', 5000);
        }
    }

    // Работа с событиями
    showEventModal(event = null) {
        const modal = this.eventModal;
        const form = modal.querySelector('#event-form');
        const title = modal.querySelector('#modal-title');
        
        if (event) {
            // Редактирование существующего события
            title.textContent = 'Редактировать событие';
            form.querySelector('#event-title').value = event.title;
            form.querySelector('#event-date').value = this.formatDateForInput(event.date);
            form.querySelector('#event-time').value = event.time || '';
            form.querySelector('#event-description').value = event.description || '';
            form.querySelector('#event-color').value = event.color;
            form.setAttribute('data-event-id', event.id);
        } else {
            // Создание нового события
            title.textContent = 'Новое событие';
            form.reset();
            form.querySelector('#event-date').value = this.formatDateForInput(this.selectedDate);
            form.removeAttribute('data-event-id');
        }
        
        modal.style.display = 'flex';
    }

    hideEventModal() {
        this.eventModal.style.display = 'none';
    }

    saveEvent() {
        const form = this.eventModal.querySelector('#event-form');
        const formData = new FormData(form);
        
        const event = {
            id: form.getAttribute('data-event-id') || 'event-' + Date.now(),
            title: formData.get('event-title') || form.querySelector('#event-title').value,
            date: formData.get('event-date') || form.querySelector('#event-date').value,
            time: formData.get('event-time') || form.querySelector('#event-time').value,
            description: formData.get('event-description') || form.querySelector('#event-description').value,
            color: formData.get('event-color') || form.querySelector('#event-color').value
        };
        
        if (!event.title) {
            alert('Введите название события');
            return;
        }
        
        // Сохраняем событие
        const existingIndex = this.events.findIndex(e => e.id === event.id);
        if (existingIndex !== -1) {
            this.events[existingIndex] = event;
        } else {
            this.events.push(event);
        }
        
        this.saveEvents();
        this.renderCalendar();
        this.hideEventModal();
        
        Utils.showNotification('Календарь', `Событие "${event.title}" сохранено`, 'success');
    }

    editEvent(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (event) {
            this.showEventModal(event);
        }
    }

    deleteEvent(eventId) {
        this.events = this.events.filter(e => e.id !== eventId);
        this.saveEvents();
        this.renderCalendar();
        Utils.showNotification('Календарь', 'Событие удалено', 'success');
    }

    getEventsForDate(date) {
        const dateString = this.formatDateForInput(date);
        return this.events.filter(event => event.date === dateString);
    }

    // Вспомогательные методы
    formatDateForInput(date) {
        return date.toISOString().split('T')[0];
    }

    formatEventDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
        });
    }

    getWeekNumber(date) {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    }

    // Сохранение и загрузка
    loadEvents() {
        this.events = Utils.storage.get('calendar-events', [
            {
                id: 'event-1',
                title: 'Встреча с командой',
                date: new Date().toISOString().split('T')[0],
                time: '10:00',
                description: 'Еженедельная встреча разработчиков',
                color: '#0078d4'
            },
            {
                id: 'event-2',
                title: 'Обед с клиентом',
                date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                time: '13:00',
                description: 'Обсуждение нового проекта',
                color: '#107c10'
            }
        ]);
    }

    saveEvents() {
        Utils.storage.set('calendar-events', this.events);
    }
}

// Добавляем CSS для календаря
const calendarStyles = `
    .calendar-app {
        height: 100%;
        display: flex;
        flex-direction: column;
        background: var(--bg-primary);
    }

    .calendar-toolbar {
        display: flex;
        align-items: center;
        padding: 12px 16px;
        border-bottom: 1px solid var(--border-color);
        background: var(--bg-secondary);
        gap: 16px;
    }

    .calendar-nav {
        display: flex;
        gap: 8px;
    }

    .calendar-btn {
        padding: 8px 12px;
        border: 1px solid var(--border-color);
        background: var(--bg-primary);
        border-radius: 4px;
        cursor: pointer;
        font-size: 13px;
        transition: all 0.2s ease;
        color: var(--text-primary);
    }

    .calendar-btn:hover {
        background: var(--bg-tertiary);
        border-color: var(--primary-color);
    }

    .calendar-title {
        flex: 1;
        font-size: 18px;
        font-weight: 600;
        color: var(--text-primary);
    }

    .calendar-views {
        display: flex;
        gap: 4px;
        background: var(--bg-tertiary);
        border-radius: 6px;
        padding: 2px;
    }

    .view-btn {
        padding: 6px 12px;
        border: none;
        background: transparent;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        transition: all 0.2s ease;
        color: var(--text-primary);
    }

    .view-btn.active {
        background: var(--primary-color);
        color: white;
    }

    .calendar-actions {
        display: flex;
        gap: 8px;
    }

    .calendar-content {
        flex: 1;
        display: flex;
        overflow: hidden;
    }

    .calendar-main {
        flex: 1;
        padding: 20px;
        overflow-y: auto;
    }

    .calendar-sidebar {
        width: 300px;
        background: var(--bg-secondary);
        border-left: 1px solid var(--border-color);
        padding: 20px;
        overflow-y: auto;
    }

    .sidebar-section {
        margin-bottom: 24px;
    }

    .sidebar-section h4 {
        margin: 0 0 12px 0;
        font-size: 14px;
        font-weight: 600;
        color: var(--text-primary);
    }

    .calendar-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 1px;
        background: var(--border-color);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        overflow: hidden;
    }

    .calendar-day-header {
        padding: 12px;
        text-align: center;
        font-weight: 600;
        font-size: 12px;
        background: var(--bg-secondary);
        color: var(--text-primary);
    }

    .calendar-day {
        min-height: 100px;
        padding: 8px;
        background: var(--bg-primary);
        cursor: pointer;
        transition: all 0.2s;
        border: 2px solid transparent;
        position: relative;
    }

    .calendar-day:hover {
        background: var(--bg-secondary);
    }

    .calendar-day.selected {
        border-color: var(--primary-color);
        background: rgba(0, 120, 212, 0.05);
    }

    .calendar-day.today {
        background: rgba(0, 120, 212, 0.1);
    }

    .calendar-day.other-month {
        background: var(--bg-tertiary);
        color: var(--text-secondary);
    }

    .day-number {
        font-weight: 600;
        margin-bottom: 4px;
    }

    .day-event {
        font-size: 10px;
        padding: 2px 4px;
        margin-bottom: 2px;
        border-radius: 3px;
        color: white;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .day-more {
        font-size: 10px;
        color: var(--text-secondary);
        margin-top: 2px;
    }

    .today-info {
        background: var(--bg-primary);
        padding: 12px;
        border-radius: 6px;
        border: 1px solid var(--border-color);
    }

    .today-date {
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 8px;
        color: var(--text-primary);
    }

    .today-stats {
        font-size: 12px;
        color: var(--text-secondary);
    }

    .today-stats div {
        margin-bottom: 2px;
    }

    .upcoming-events {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .upcoming-event {
        display: flex;
        align-items: center;
        padding: 8px;
        background: var(--bg-primary);
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.2s;
        gap: 8px;
    }

    .upcoming-event:hover {
        background: var(--bg-tertiary);
    }

    .event-color {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        flex-shrink: 0;
    }

    .event-info {
        flex: 1;
        min-width: 0;
    }

    .event-title {
        font-size: 13px;
        font-weight: 500;
        margin-bottom: 2px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .event-date {
        font-size: 11px;
        color: var(--text-secondary);
    }

    .mini-calendar {
        background: var(--bg-primary);
        border: 1px solid var(--border-color);
        border-radius: 6px;
        overflow: hidden;
    }

    .mini-calendar-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px;
        background: var(--bg-secondary);
        border-bottom: 1px solid var(--border-color);
    }

    .mini-prev, .mini-next {
        padding: 4px;
        border: none;
        background: none;
        cursor: pointer;
        color: var(--text-primary);
        border-radius: 3px;
    }

    .mini-prev:hover, .mini-next:hover {
        background: var(--bg-tertiary);
    }

    .mini-title {
        font-size: 12px;
        font-weight: 500;
    }

    .mini-calendar-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 1px;
        padding: 4px;
    }

    .mini-day-header {
        text-align: center;
        font-size: 10px;
        font-weight: 600;
        padding: 4px 2px;
        color: var(--text-secondary);
    }

    .mini-day {
        text-align: center;
        font-size: 11px;
        padding: 6px 2px;
        cursor: pointer;
        border-radius: 2px;
    }

    .mini-day:hover {
        background: var(--bg-secondary);
    }

    .mini-day.today {
        background: var(--primary-color);
        color: white;
    }

    .mini-day.other-month {
        color: var(--text-secondary);
    }

    .event-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }

    .modal-content {
        background: var(--bg-primary);
        border-radius: 8px;
        width: 400px;
        max-width: 90vw;
        box-shadow: var(--shadow-large);
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        border-bottom: 1px solid var(--border-color);
    }

    .modal-header h3 {
        margin: 0;
        font-size: 16px;
        color: var(--text-primary);
    }

    .modal-close {
        padding: 4px 8px;
        border: none;
        background: none;
        cursor: pointer;
        font-size: 16px;
        color: var(--text-secondary);
        border-radius: 4px;
    }

    .modal-close:hover {
        background: var(--bg-secondary);
    }

    .modal-body {
        padding: 20px;
    }

    .form-group {
        margin-bottom: 16px;
    }

    .form-group label {
        display: block;
        margin-bottom: 6px;
        font-size: 13px;
        font-weight: 500;
        color: var(--text-primary);
    }

    .form-group input,
    .form-group textarea,
    .form-group select {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid var(--border-color);
        border-radius: 4px;
        font-size: 13px;
        background: var(--bg-primary);
        color: var(--text-primary);
    }

    .form-group input:focus,
    .form-group textarea:focus,
    .form-group select:focus {
        outline: none;
        border-color: var(--primary-color);
    }

    .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        padding: 16px 20px;
        border-top: 1px solid var(--border-color);
    }

    .modal-footer button {
        padding: 8px 16px;
        border: 1px solid var(--border-color);
        border-radius: 4px;
        cursor: pointer;
        font-size: 13px;
        transition: all 0.2s;
    }

    #event-cancel {
        background: var(--bg-secondary);
        color: var(--text-primary);
    }

    #event-cancel:hover {
        background: var(--bg-tertiary);
    }

    #event-save {
        background: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
    }

    #event-save:hover {
        background: var(--primary-dark);
    }
`;

const calendarStyle = document.createElement('style');
calendarStyle.textContent = calendarStyles;
document.head.appendChild(calendarStyle);

window.Calendar = Calendar;
