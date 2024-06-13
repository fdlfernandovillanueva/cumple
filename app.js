document.addEventListener('DOMContentLoaded', function () {
    const birthdayForm = document.getElementById('birthdayForm');
    const toggleSavedBirthdaysButton = document.getElementById('toggleSavedBirthdays');
    const savedBirthdaysSection = document.getElementById('savedBirthdaysSection');
    const savedBirthdayList = document.getElementById('savedBirthdayList');
    let birthdays = JSON.parse(localStorage.getItem('birthdays')) || [];
    let savedBirthdays = JSON.parse(localStorage.getItem('savedBirthdays')) || [];
    let isEditing = false;
    let currentEditIndex = null;

    birthdayForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const birthdate = document.getElementById('birthdate').value;

        if (isEditing) {
            birthdays[currentEditIndex] = { name, birthdate };
            isEditing = false;
            currentEditIndex = null;
        } else {
            const birthday = { name, birthdate };
            birthdays.push(birthday);
        }

        localStorage.setItem('birthdays', JSON.stringify(birthdays));
        birthdayForm.reset();
    });

    toggleSavedBirthdaysButton.addEventListener('click', function () {
        savedBirthdays = [...birthdays];
        displaySavedBirthdays();
        savedBirthdaysSection.style.display = savedBirthdaysSection.style.display === 'none' ? 'block' : 'none';
        localStorage.setItem('savedBirthdays', JSON.stringify(savedBirthdays));
    });

    function displaySavedBirthdays() {
        savedBirthdayList.innerHTML = '';
        savedBirthdays.forEach(function (birthday, index) {
            const age = calculateAge(birthday.birthdate);
            const li = document.createElement('li');
            li.innerHTML = `
                ${birthday.name} - ${formatDate(birthday.birthdate)} - ${age} años
                <div class="actions">
                    <button class="edit" data-index="${index}">Edit</button>
                    <button class="delete" data-index="${index}">Delete</button>
                </div>
            `;
            savedBirthdayList.appendChild(li);
        });

        document.querySelectorAll('.edit').forEach(button => {
            button.addEventListener('click', handleEdit);
        });

        document.querySelectorAll('.delete').forEach(button => {
            button.addEventListener('click', handleDelete);
        });
    }

    function handleEdit(event) {
        const index = event.target.getAttribute('data-index');
        const birthday = savedBirthdays[index];

        document.getElementById('name').value = birthday.name;
        document.getElementById('birthdate').value = birthday.birthdate;

        isEditing = true;
        currentEditIndex = index;
    }

    function handleDelete(event) {
        const index = event.target.getAttribute('data-index');
        savedBirthdays.splice(index, 1);
        localStorage.setItem('savedBirthdays', JSON.stringify(savedBirthdays));
        displaySavedBirthdays();
    }

    function formatDate(date) {
        const d = new Date(date + 'T00:00:00');
        return d.toLocaleDateString();
    }

    function calculateAge(birthdate) {
        const birthDate = new Date(birthdate + 'T00:00:00');
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }

    function checkBirthdays() {
        const today = new Date();
        const todayDate = today.toISOString().split('T')[0];
        const notificationTime = new Date(today.setHours(10, 0, 0, 0)).getTime();
        const currentTime = new Date().getTime();

        savedBirthdays.forEach(function (birthday) {
            if (birthday.birthdate === todayDate && currentTime <= notificationTime) {
                const age = calculateAge(birthday.birthdate);
                scheduleNotification(`Hoy es el cumpleaños de ${birthday.name}! Cumple ${age} años.`, notificationTime - currentTime);
            }
        });
    }

    function scheduleNotification(message, delay) {
        if (Notification.permission === 'granted') {
            setTimeout(() => {
                new Notification(message);
            }, delay);
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    setTimeout(() => {
                        new Notification(message);
                    }, delay);
                }
            });
        }
    }

    if (Notification.permission !== 'granted') {
        Notification.requestPermission();
    }

    displaySavedBirthdays();
    checkBirthdays();
    setInterval(checkBirthdays, 60000); // Comprobar cada minuto si hay cumpleaños hoy
});
