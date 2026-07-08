// База данных из вашего календаря
const birthdaysData = [
    { name: "Таня Абдыльманова", day: 2, month: 0 },
    { name: "Саня Фокин", day: 11, month: 0 },
    { name: "дядя Лёша", day: 19, month: 0 },
    { name: "Серега Кудряшов", day: 27, month: 0 },
    { name: "Макар Суворов", day: 5, month: 1 },
    { name: "Милена Суворова", day: 8, month: 1 },
    { name: "Таня Березнева", day: 10, month: 2 },
    { name: "ДЖОСС", day: 15, month: 2 },
    { name: "Кристина Суворова", day: 18, month: 2 },
    { name: "баба Лена", day: 21, month: 2 },
    { name: "СЕВА", day: 28, month: 2 },
    { name: "Серега Дроздов", day: 12, month: 3 },
    { name: "ДЕНИС", day: 14, month: 3 },
    { name: "Серега Суворов", day: 18, month: 3 },
    { name: "бабушка Мария", day: 1, month: 4 },
    { name: "Дарина Кудряшова", day: 20, month: 4 },
    { name: "Макар Смолов", day: 18, month: 4 },
    { name: "Ксюша Кудряшова", day: 14, month: 5 },
    { name: "Макс Дармель", day: 5, month: 6 },
    { name: "баба Наташа", day: 11, month: 6 },
    { name: "Асхат Абдыльманов", day: 10, month: 7 },
    { name: "Ваня Морозов", day: 18, month: 7 },
    { name: "дядя Дима", day: 23, month: 7 },
    { name: "Тима", day: 9, month: 8 },
    { name: "Лера", day: 16, month: 8 },
    { name: "деда Саня", day: 23, month: 8 },
    { name: "ИГНАТ", day: 16, month: 9 },
    { name: "Ярослав Суворов", day: 21, month: 9 },
    { name: "Арман Абдыльманов", day: 24, month: 9 },
    { name: "Макс Bugai", day: 29, month: 9 },
    { name: "ИРА", day: 27, month: 10 },
    { name: "Таня Горская", day: 5, month: 11 },
    { name: "Лида Фокина", day: 7, month: 11 },
    { name: "тётя Ира", day: 13, month: 11 },
    { name: "Лев Суворов", day: 14, month: 11 }
];

const monthsNames = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];

// Регистрация сервис-воркера для PWA
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').then(() => console.log('Service Worker зарегистрирован'));
}

// Расчет дней до ДР
function getDaysUntil(day, month) {
    const today = new Date();
    let bday = new Date(today.getFullYear(), month, day);
    if (today > bday && today.getDate() !== day && today.getMonth() !== month) {
        bday.setFullYear(today.getFullYear() + 1);
    }
    const diffTime = bday - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Отображение списков
function renderLists() {
    const today = new Date();
    const todayList = document.getElementById('today-list');
    const todayContainer = document.getElementById('today-container');
    const birthdaysList = document.getElementById('birthdays-list');
    
    todayList.innerHTML = '';
    birthdaysList.innerHTML = '';
    
    let hasToday = false;

    // Сортировка по приближению даты
    const sorted = [...birthdaysData].sort((a, b) => getDaysUntil(a.day, a.month) - getDaysUntil(b.day, b.month));

    sorted.forEach(person => {
        const daysLeft = getDaysUntil(person.day, person.month);
        const isToday = today.getDate() === person.day && today.getMonth() === person.month;

        const card = document.createElement('div');
        card.className = 'birthday-card';
        card.innerHTML = `
            <div>
                <div class="name">${person.name}</div>
                <div class="date">${person.day} ${monthsNames[person.month]}</div>
            </div>
            <div class="days-left">${isToday ? 'Сегодня!' : 'через ' + daysLeft + ' дн.'}</div>
        `;

        if (isToday) {
            todayList.appendChild(card);
            hasToday = true;
        } else {
            birthdaysList.appendChild(card);
        }
    });

    if (hasToday) todayContainer.classList.remove('hidden');
}

// Логика напоминаний ровно в 10:00
function scheduleDailyCheck() {
    const now = new Date();
    let checkTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0, 0);
    
    if (now > checkTime) {
        checkTime.setDate(checkTime.getDate() + 1);
    }
    
    const timeToWait = checkTime - now;
    
    setTimeout(() => {
        checkTodayBirthdays();
        setInterval(checkTodayBirthdays, 24 * 60 * 60 * 1000); // Повторять каждые 24 часа
    }, timeToWait);
}

function checkTodayBirthdays() {
    const today = new Date();
    birthdaysData.forEach(person => {
        if (today.getDate() === person.day && today.getMonth() === person.month) {
            sendNotification(person.name);
        }
    });
}

function sendNotification(name) {
    if (Notification.permission === 'granted') {
        navigator.serviceWorker.ready.then(registration => {
            registration.showNotification('🎂 День Рождения!', {
                body: `Сегодня празднует: ${name}. Не забудьте поздравить!`,
                icon: 'icon.png'
            });
        });
    }
}

// Запрос прав на уведомления
document.getElementById('enable-notifications').addEventListener('click', () => {
    Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
            alert('Отлично! Напоминания включены на 10:00.');
            scheduleDailyCheck();
        }
    });
});

window.onload = () => {
    renderLists();
    if (Notification.permission === 'granted') scheduleDailyCheck();
};
