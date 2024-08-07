document.addEventListener('DOMContentLoaded', function () {
    const birthdayForm = document.getElementById('birthdayForm');
    const toggleSavedBirthdaysButton = document.getElementById('toggleSavedBirthdays');
    const savedBirthdaysSection = document.getElementById('savedBirthdaysSection');
    const savedBirthdayList = document.getElementById('savedBirthdayList');
    const submitButton = birthdayForm.querySelector('button[type="submit"]');

    let savedBirthdays = JSON.parse(localStorage.getItem('savedBirthdays')) || [];
    let isEditing = false;
    let currentEditIndex = null;

    // Función para mostrar los cumpleaños guardados
    function displaySavedBirthdays() {
        savedBirthdayList.innerHTML = '';
        savedBirthdays.forEach((birthday, index) => {
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

    // Función para manejar la edición de cumpleaños
    function handleEdit(event) {
        const index = event.target.getAttribute('data-index');
        const birthday = savedBirthdays[index];
        document.getElementById('name').value = birthday.name;
        document.getElementById('birthdate').value = birthday.birthdate;
        isEditing = true;
        currentEditIndex = index;
        submitButton.textContent = 'Guardar'; // Cambiar texto del botón a "Guardar"

    }

    // Función para manejar la eliminación de cumpleaños
    function handleDelete(event) {
        const index = event.target.getAttribute('data-index');
        savedBirthdays.splice(index, 1);
        localStorage.setItem('savedBirthdays', JSON.stringify(savedBirthdays));
        displaySavedBirthdays();
        sortBirthdays(); // Asegúrate de ordenar después de eliminar
    }

    // Función para formatear la fecha
    function formatDate(date) {
        const d = new Date(date + 'T00:00:00');
        return d.toLocaleDateString();
    }

    // Función para calcular la edad
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

    // Función para verificar y notificar cumpleaños
    function checkBirthdays() {
        const today = new Date();
        const todayMonthDay = `${today.getMonth() + 1}-${today.getDate()}`; // Formato MM-DD
        const notificationTime = new Date(today.setHours(10, 0, 0, 0)).getTime(); // a las 10 AM
        const currentTime = new Date().getTime();

        savedBirthdays.forEach(birthday => {
            const birthdayDate = new Date(birthday.birthdate);
            const birthdayMonthDay = `${birthdayDate.getMonth() + 1}-${birthdayDate.getDate()}`; // Formato MM-DD

            if (birthdayMonthDay === todayMonthDay && currentTime <= notificationTime) {
                const age = calculateAge(birthday.birthdate);
                scheduleNotification(`Hoy es el cumpleaños de ${birthday.name}! Cumple ${age} años.`, notificationTime - currentTime);
            }
        });
    }

    // Función para programar notificaciones
    function scheduleNotification(message, delay) {
        if (Notification.permission === 'granted') {
            setTimeout(() => new Notification(message), delay);
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    setTimeout(() => new Notification(message), delay);
                }
            });
        }
    }

    // Función para ordenar los cumpleaños
    function sortBirthdays() {
        savedBirthdays.sort((a, b) => {
            const dateA = new Date(a.birthdate);
            const dateB = new Date(b.birthdate);
            const monthDayA = (dateA.getMonth() + 1) * 100 + dateA.getDate();
            const monthDayB = (dateB.getMonth() + 1) * 100 + dateB.getDate();
            return monthDayA - monthDayB;
        });
        localStorage.setItem('savedBirthdays', JSON.stringify(savedBirthdays));
        displaySavedBirthdays();
    }

    // Evento al enviar el formulario
    birthdayForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const birthdate = document.getElementById('birthdate').value;

        if (isEditing) {
            savedBirthdays[currentEditIndex] = { name, birthdate };
            localStorage.setItem('savedBirthdays', JSON.stringify(savedBirthdays));
            isEditing = false;
            currentEditIndex = null;
            submitButton.textContent = 'Agregar'; // Restablecer el texto del botón a "Agregar"
        } else {
            savedBirthdays.push({ name, birthdate });
            localStorage.setItem('savedBirthdays', JSON.stringify(savedBirthdays));
        }

        sortBirthdays();
        birthdayForm.reset();

         // Recargar la página para reflejar los cambios
         location.reload();
    });

    // Evento al hacer clic en el botón de alternar la lista de cumpleaños guardados
    toggleSavedBirthdaysButton.addEventListener('click', function () {
        savedBirthdaysSection.style.display = savedBirthdaysSection.style.display === 'none' ? 'block' : 'none';
        displaySavedBirthdays();
    });

    // Solicitar permiso de notificaciones si aún no se ha concedido
    if (Notification.permission !== 'granted') {
        Notification.requestPermission();
    }

    // Mostrar la lista de cumpleaños guardados al cargar la página
    displaySavedBirthdays();
    checkBirthdays();
    setInterval(checkBirthdays, 60000); // Comprobar cada minuto si hay cumpleaños hoy
});
