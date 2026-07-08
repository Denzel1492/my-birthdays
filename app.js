// Стартовый список (загрузится один раз при самом первом запуске)
const initialBirthdays = [
    { id: "1", name: "Таня Абдыльманова", date: "2000-01-02" },
    { id: "2", name: "Саня Фокин", date: "2000-01-11" },
    { id: "3", name: "дядя Лёша", date: "2000-01-19" },
    { id: "4", name: "Серега Кудряшов", date: "2000-01-27" },
    { id: "5", name: "Макар Суворов", date: "2000-02-05" },
    { id: "6", name: "Милена Суворова", date: "2000-02-08" },
    { id: "7", name: "Таня Березнева", date: "2000-03-10" },
    { id: "8", name: "ДЖОСС", date: "2000-03-15" },
    { id: "9", name: "Кристина Суворова", date: "2000-03-18" },
    { id: "10", name: "баба Лена", date: "2000-03-21" },
    { id: "11", name: "СЕВА", date: "2000-03-28" },
    { id: "12", name: "Серега Дроздов", date: "2000-04-12" },
    { id: "13", name: "ДЕНИС", date: "2000-04-14" },
    { id: "14", name: "Серега Суворов", date: "2000-04-18" },
    { id: "15", name: "бабушка Мария", date: "2000-05-01" },
    { id: "16", name: "Дарина Кудряшова", date: "2000-05-20" },
    { id: "17", name: "Макар Смолов", date: "2000-05-18" },
    { id: "18", name: "Ксюша Кудряшова", date: "2000-06-14" },
    { id: "19", name: "Макс Дармель", date: "2000-07-05" },
    { id: "20", name: "баба Наташа", date: "2000-07-11" },
    { id: "21", name: "Асхат Абдыльманов", date: "2000-08-10" },
    { id: "22", name: "Ваня Морозов", date: "2000-08-18" },
    { id: "23", name: "дядя Дима", date: "2000-08-23" },
    { id: "24", name: "Тима", date: "2000-09-09" },
    { id: "25", name: "Лера", date: "2000-09-16" },
    { id: "26", name: "деда Саня", date: "2000-09-23" },
    { id: "27", name: "ИГНАТ", date: "2000-10-16" },
    { id: "28", name: "Ярослав Суворов", date: "2000-10-21" },
    { id: "29", name: "Арман Абдыльманов", date: "2000-10-24" },
    { id: "30", name: "Макс Bugai", date: "2000-10-29" },
    { id: "31", name: "ИРА", date: "2000-11-27" },
    { id: "32", name: "Таня Горская", date: "2000-12-05" },
    { id: "33", name: "Лида Фокина", date: "2000-12-07" },
    { id: "34", name: "тётя Ира", date: "2000-12-13" },
    { id: "35", name: "Лев Суворов", date: "2000-12-14" }
];

// Инициализация базы данных из localStorage
let birthdaysData = JSON.parse(localStorage.getItem('my_birthdays_list'));
if (!birthdaysData) {
    birthdaysData = initialBirthdays;
    localStorage.setItem('my_birthdays_list', JSON.stringify(birthdaysData));
}

const monthsNames = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
}

// Расчет дней до ДР
function getDaysUntil(dateString) {
    const today = new Date();
    const todayZero = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const parts = dateString.split('-');
    const month = parseInt(parts[1]) - 1;
    const day = parseInt(parts[2]);
    
    let bday = new Date(today.getFullYear(), month, day);
    if (todayZero > bday) {
        bday.setFullYear(today.getFullYear() + 1);
    }
    
    const diffTime = bday - todayZero;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function formatDateDisplay(dateString) {
    const parts = dateString.split('-');
    const month = parseInt(parts[1]) - 1;
    const day = parseInt(parts[2]);
    return `${day} ${monthsNames[month]}`;
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

    const sorted = [...birthdaysData].sort((a, b) => getDaysUntil(a.date) - getDaysUntil(b.date));

    sorted.forEach(person => {
        const daysLeft = getDaysUntil(person.date);
        const parts = person.date.split('-');
        const isToday = today.getDate() === parseInt(parts[2]) && today.getMonth() === (parseInt(parts[1]) - 1);

        const card = document.createElement('div');
        card.className = 'birthday-card';
        card.innerHTML = `
            <div>
                <div class="name">${person.name}</div>
                <div class="date">${formatDateDisplay(person.date)}</div>
            </div>
            <div class="card-actions">
                <div class="days-left">${isToday ? 'Сегодня!' : 'через ' + daysLeft + ' дн.'}</div>
                <button class="edit-btn" onclick="openEditModal('${person.id}')">✏️</button>
                <button class="delete-btn" onclick="deletePerson('${person.id}')">❌</button>
            </div>
        `;

        if (isToday) {
            todayList.appendChild(card);
            hasToday = true;
        } else {
            birthdaysList.appendChild(card);
        }
    });

    if (hasToday) todayContainer.classList.remove('hidden');
    else todayContainer.classList.add('hidden');
}

// Работа с модальным окном
const modal = document.getElementById('form-modal');
document.getElementById('open-add-modal').addEventListener('click', () => {
    document.getElementById('modal-title').innerText = "Добавить именинника";
    document.getElementById('edit-id').value = "";
    document.getElementById('person-name').value = "";
    document.getElementById('person-date').value = "";
    modal.classList.remove('hidden');
});

document.getElementById('close-modal').addEventListener('click', () => modal.classList.add('hidden'));

function openEditModal(id) {
    const person = birthdaysData.find(p => p.id === id);
    if (!person) return;
    
    document.getElementById('modal-title').innerText = "Редактировать";
    document.getElementById('edit-id').value = person.id;
    document.getElementById('person-name').value = person.name;
    document.getElementById('person-date').value = person.date;
    modal.classList.remove('hidden');
}

// Сохранение изменений
document.getElementById('save-person').addEventListener('click', () => {
    const id = document.getElementById('edit-id').value;
    const name = document.getElementById('person-name').value.trim();
    const date = document.getElementById('person-date').value;

    if (!name || !date) {
        alert('Заполните все поля!');
        return;
    }

    if (id) {
        // Редактирование существующего
        const person = birthdaysData.find(p => p.id === id);
        if (person) { person.name = name; person.date = date; }
    } else {
        // Добавление нового
        birthdaysData.push({ id: Date.now().toString(), name, date });
    }

    localStorage.setItem('my_birthdays_list', JSON.stringify(birthdaysData));
    modal.classList.add('hidden');
    renderLists();
});

// Удаление именинника
window.deletePerson = function(id) {
    if (confirm('Вы уверены, что хотите удалить этого человека?')) {
        birthdaysData = birthdaysData.filter(p => p.id !== id);
        localStorage.setItem('my_birthdays_list', JSON.stringify(birthdaysData));
        renderLists();
    }
}

// Логика напоминаний ровно в 10:00
function scheduleDailyCheck() {
    const now = new Date();
    let checkTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0, 0);
    if (now > checkTime) checkTime.setDate(checkTime.getDate() + 1);
    
    setTimeout(() => {
        checkTodayBirthdays();
        setInterval(checkTodayBirthdays, 24 * 60 * 60 * 1000);
    }, checkTime - now);
}

function checkTodayBirthdays() {
    const today = new Date();
    birthdaysData.forEach(person => {
        const parts = person.date.split('-');
        if (today.getDate() === parseInt(parts[2]) && today.getMonth() === (parseInt(parts[1]) - 1)) {
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

document.getElementById('enable-notifications').addEventListener('click', () => {
    Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
            alert('Уведомления успешно включены на 10:00.');
            scheduleDailyCheck();
        }
    });
});

window.onload = () => {
    renderLists();
    if (Notification.permission === 'granted') scheduleDailyCheck();
};
