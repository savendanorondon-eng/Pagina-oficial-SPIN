
// 1. VARIABLES Y ELEMENTOS DEL DOM

let currentStep = 1;
const totalSteps = 6;
const formData = {};
let profilePhoto = '';

const steps = document.querySelectorAll('.step');
const panels = document.querySelectorAll('.step-panel');
const banners = document.querySelectorAll('.side-banner');

const btnNext = document.getElementById('btn-next');
const btnNextText = document.getElementById('btn-next-text');
const btnBack = document.getElementById('btn-back');

const profilePhotoArea = document.querySelector('.profile-photo-area');
const photoInput = document.getElementById('photo-input');
const profilePhotoLarge = document.getElementById('profile-photo-large');

const dropdownName = document.getElementById('dropdown-name');
const navAvatar = document.getElementById('nav-avatar');
const dropdownAvatar = document.getElementById('dropdown-avatar');
const avatarBtn = document.getElementById('avatar-btn');
const profileDropdown = document.getElementById('profile-dropdown');

const searchIcon = document.getElementById('search-icon');
const searchInput = document.getElementById('search-input');
const navLinks = document.querySelectorAll('#nav-links a');
const bellIcon = document.getElementById('bell-icon');
const logoutBtn = document.getElementById('logout-btn');



// 2. MOSTRAR Y OCULTAR PASOS DEL FORMULARIO
 
function showStep(step) {
    // Activar el panel del paso actual
    panels.forEach(panel => {
        const panelNumero = Number(panel.dataset.panel);
        if (panelNumero === step) {
            panel.classList.add('active');
        } else {
            panel.classList.remove('active');
        }
    });

    // Actualizar los indicadores de pasos (stepper)
    steps.forEach(stepElement => {
        const numeroPaso = Number(stepElement.dataset.step);

        if (numeroPaso === step) {
            stepElement.classList.add('active');
            stepElement.classList.remove('completed');
        } else if (numeroPaso < step) {
            stepElement.classList.remove('active');
            stepElement.classList.add('completed');
        } else {
            stepElement.classList.remove('active');
            stepElement.classList.remove('completed');
        }
    });

    // Mostrar el banner correspondiente al paso
    banners.forEach(banner => {
        const bannerStep = Number(banner.dataset.banner);
        if (bannerStep === step) {
            banner.classList.remove('hidden');
        } else {
            banner.classList.add('hidden');
        }
    });

    // Ocultar o mostrar el área de foto si estamos en el paso 1
    if (profilePhotoArea) {
        if (step === 1) {
            profilePhotoArea.classList.remove('hidden');
        } else {
            profilePhotoArea.classList.add('hidden');
        }
    }

    // Ocultar botón Volver si estamos en el paso 1
    if (btnBack) {
        if (step === 1) {
            btnBack.style.visibility = 'hidden';
        } else {
            btnBack.style.visibility = 'visible';
        }
    }

    // Cambiar texto del botón en el último paso
    if (btnNextText) {
        if (step === totalSteps) {
            btnNextText.textContent = 'Crear mi perfil';
        } else {
            btnNextText.textContent = 'Siguiente';
        }
    }

    // Subir arriba en la página de forma suave
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}


 
// 3. VALIDACIÓN DE CAMPOS OBLIGATORIOS

function validateStep(step) {
    const panel = document.querySelector(`.step-panel[data-panel="${step}"]`);
    if (!panel) return false;

    // Obtener campos obligatorios del paso actual
    const requiredFields = panel.querySelectorAll('[required]');

    for (let i = 0; i < requiredFields.length; i++) {
        const field = requiredFields[i];

        if (field.type === 'checkbox' && !field.checked) {
            alert('Debes marcar todas las casillas obligatorias.');
            return false;
        }

        if (field.type !== 'checkbox' && field.value.trim() === '') {
            alert('Por favor completa todos los campos obligatorios antes de continuar.');
            field.focus();
            return false;
        }
    }

    // Validación especial del Paso 2 (Pills de Nivel)
    if (step === 2) {
        const pillSeleccionada = document.querySelector('#nivel-group .pill.selected');
        if (!pillSeleccionada) {
            alert('Selecciona tu nivel como entrenador.');
            return false;
        }
    }

    // Validación especial del Paso 3 (Categorías)
    if (step === 3) {
        const categoriasMarcadas = document.querySelectorAll('#categorias-entrenadas input:checked');
        if (categoriasMarcadas.length === 0) {
            alert('Selecciona al menos una categoría que hayas entrenado.');
            return false;
        }
    }

    return true;
}



// 4. GUARDAR DATOS DEL FORMULARIO

function saveStepData(step) {
    const panel = document.querySelector(`.step-panel[data-panel="${step}"]`);
    if (!panel) return;

    const fields = panel.querySelectorAll('input, select, textarea');
    fields.forEach(field => {
        if (field.type !== 'checkbox' && field.type !== 'file') {
            formData[field.id] = field.value;
        }
    });
}

function finishRegistration() {
    // Guardar Nivel
    const pillSeleccionada = document.querySelector('#nivel-group .pill.selected');
    formData.nivel = pillSeleccionada ? pillSeleccionada.dataset.value : '';

    // Guardar Categorías seleccionadas
    const categoriasCheckboxes = document.querySelectorAll('#categorias-entrenadas input:checked');
    formData.categorias = [];
    categoriasCheckboxes.forEach(checkbox => {
        formData.categorias.push(checkbox.value);
    });

    // Guardar foto
    formData.foto = profilePhoto;

    // Guardar Tabla de Disponibilidad
    const availability = [];
    const disponibilidadCheckboxes = document.querySelectorAll('#availability-table input[type="checkbox"]');
    disponibilidadCheckboxes.forEach(checkbox => {
        if (checkbox.checked) {
            availability.push({
                dia: checkbox.dataset.dia,
                turno: checkbox.dataset.turno
            });
        }
    });
    formData.disponibilidad = availability;

    // Guardar todo en LocalStorage
    localStorage.setItem('spinPerfil', JSON.stringify(formData));

    updateProfileUI();

    // Actualizar el correo dinámico en la pantalla de éxito
    const userEmailDisplay = document.getElementById('user-email-display');
    if (userEmailDisplay) {
        userEmailDisplay.textContent = formData.email || formData.correo || 'tu correo registrado';
    }

    // Mostrar pantalla de éxito si existe
    const successScreen = document.getElementById('success-screen');
    if (successScreen) {
        successScreen.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}


 
// 5. ACTUALIZAR INTERFAZ DEL USUARIO (UI)

function updateProfileUI() {
    const nombre = formData.nombre || 'Entrenador';

    if (dropdownName) {
        dropdownName.textContent = nombre;
    }

    if (profilePhoto) {
        if (navAvatar) {
            navAvatar.style.backgroundImage = `url("${profilePhoto}")`;
            navAvatar.classList.add('has-photo');
        }

        if (dropdownAvatar) {
            dropdownAvatar.style.backgroundImage = `url("${profilePhoto}")`;
        }
    }
}


 
// 6. EVENTOS DE LOS BOTONES Y NAVEGACIÓN
 

// Botón Siguiente
if (btnNext) {
    btnNext.addEventListener('click', () => {
        if (!validateStep(currentStep)) {
            return;
        }

        saveStepData(currentStep);

        if (currentStep === totalSteps) {
            finishRegistration();
            return;
        }

        currentStep = currentStep + 1;
        showStep(currentStep);
    });
}

// Botón Atrás
if (btnBack) {
    btnBack.addEventListener('click', () => {
        if (currentStep > 1) {
            currentStep = currentStep - 1;
            showStep(currentStep);
        }
    });
}

// Clic directo en los indicadores de paso superiores
steps.forEach(stepElement => {
    stepElement.addEventListener('click', () => {
        const objetivo = Number(stepElement.dataset.step);
        if (objetivo < currentStep) {
            currentStep = objetivo;
            showStep(currentStep);
        }
    });
});

// Selección de Pills (Nivel de entrenador)
const pillsNivel = document.querySelectorAll('#nivel-group .pill');
pillsNivel.forEach(pill => {
    pill.addEventListener('click', () => {
        // Desmarcar todas
        pillsNivel.forEach(p => p.classList.remove('selected'));
        // Marcar la actual
        pill.classList.add('selected');
        formData.nivel = pill.dataset.value;
    });
});



// 7. BÚSQUEDA Y MENÚ DE NAVEGACIÓN

if (searchIcon && searchInput) {
    searchIcon.addEventListener('click', () => {
        searchInput.classList.toggle('hidden');
        if (!searchInput.classList.contains('hidden')) {
            searchInput.focus();
        }
    });

    searchInput.addEventListener('keyup', event => {
        const termino = searchInput.value.trim().toLowerCase();

        navLinks.forEach(link => link.classList.remove('highlight'));

        if (event.key === 'Enter' && termino !== '') {
            let encontrado = false;

            navLinks.forEach(link => {
                const texto = link.textContent.trim().toLowerCase();
                if (texto.includes(termino)) {
                    link.classList.add('highlight');
                    encontrado = true;
                }
            });

            if (!encontrado) {
                alert(`No se encontraron resultados para "${searchInput.value}".`);
            }
        }
    });
}

if (bellIcon) {
    bellIcon.addEventListener('click', () => {
        alert('No tienes notificaciones nuevas.');
    });
}


 
// 8. SUBIDA DE ARCHIVOS Y FOTO DE PERFIL
 

// Foto de Perfil
if (photoInput) {
    photoInput.addEventListener('change', () => {
        const file = photoInput.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Selecciona una imagen JPG o PNG.');
            photoInput.value = '';
            return;
        }

        if (file.size > 2 * 1024 * 1024) { // 2MB
            alert('La imagen supera el tamaño máximo de 2MB.');
            photoInput.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = event => {
            profilePhoto = event.target.result;

            if (profilePhotoLarge) {
                profilePhotoLarge.innerHTML = `<img src="${profilePhoto}" alt="Foto de perfil">`;
            }

            if (navAvatar) {
                navAvatar.style.backgroundImage = `url("${profilePhoto}")`;
                navAvatar.classList.add('has-photo');
            }

            if (dropdownAvatar) {
                dropdownAvatar.style.backgroundImage = `url("${profilePhoto}")`;
            }
        };

        reader.readAsDataURL(file);
    });
}

// Zona de Arrastrar/Soltar Experiencia (Dropzone)
const fileExp = document.getElementById('file-exp');
const dropzoneExp = document.getElementById('dropzone-exp');
const dropzoneExpText = document.getElementById('dropzone-exp-text');

if (fileExp && dropzoneExp && dropzoneExpText) {
    fileExp.addEventListener('change', () => {
        if (fileExp.files.length > 0) {
            const file = fileExp.files[0];

            if (file.size > 10 * 1024 * 1024) { // 10MB
                alert('El archivo supera el tamaño máximo de 10MB.');
                fileExp.value = '';
                return;
            }

            dropzoneExp.classList.add('has-file');
            dropzoneExpText.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${file.name}`;
        }
    });

    dropzoneExp.addEventListener('dragover', event => {
        event.preventDefault();
        dropzoneExp.classList.add('dragging');
    });

    dropzoneExp.addEventListener('dragleave', () => {
        dropzoneExp.classList.remove('dragging');
    });

    dropzoneExp.addEventListener('drop', event => {
        event.preventDefault();
        dropzoneExp.classList.remove('dragging');

        if (event.dataTransfer.files.length > 0) {
            const file = event.dataTransfer.files[0];
            const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];

            if (!allowedTypes.includes(file.type)) {
                alert('Solo se permiten archivos PDF, JPG o PNG.');
                return;
            }

            if (file.size > 10 * 1024 * 1024) {
                alert('El archivo supera el tamaño máximo de 10MB.');
                return;
            }

            try {
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                fileExp.files = dataTransfer.files;
            } catch (error) {
                console.log('No se pudo asignar el archivo automáticamente.');
            }

            dropzoneExp.classList.add('has-file');
            dropzoneExpText.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${file.name}`;
        }
    });
}

// Subida de Documentos individuales
document.querySelectorAll('.doc-item').forEach(item => {
    const input = item.querySelector('.doc-input');
    const btn = item.querySelector('.doc-upload-btn');

    if (!input || !btn) return;

    input.addEventListener('change', () => {
        if (input.files.length > 0) {
            const file = input.files[0];

            if (file.size > 10 * 1024 * 1024) {
                alert('El archivo supera el tamaño máximo de 10MB.');
                input.value = '';
                return;
            }

            btn.classList.add('uploaded');
            const nombre = file.name.length > 18 ? file.name.substring(0, 15) + '...' : file.name;
            btn.innerHTML = `<i class="fa-solid fa-check"></i> ${nombre}`;
        }
    });
});


 
// 9. CONSTRUIR TABLA DE DISPONIBILIDAD
 
const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const tbody = document.querySelector('#availability-table tbody');

if (tbody) {
    dias.forEach(dia => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${dia}</td>
            <td><input type="checkbox" data-dia="${dia}" data-turno="Mañana"></td>
            <td><input type="checkbox" data-dia="${dia}" data-turno="Tarde"></td>
            <td><input type="checkbox" data-dia="${dia}" data-turno="Noche"></td>
        `;
        tbody.appendChild(row);
    });
}



// 10. MENÚ DE PERFIL Y BOTONES SECUNDARIOS
 
if (avatarBtn && profileDropdown) {
    avatarBtn.addEventListener('click', event => {
        event.stopPropagation();
        profileDropdown.classList.toggle('hidden');
    });

    document.addEventListener('click', event => {
        if (!event.target.closest('.profile-menu')) {
            profileDropdown.classList.add('hidden');
        }
    });
}

if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        const confirmar = confirm('¿Quieres cerrar sesión?');
        if (confirmar) {
            localStorage.removeItem('spinPerfil');
            location.reload();
        }
    });
}

// Botones de alerta "Próximamente"
const profileButton = document.querySelector('.profile-dropdown button:not(.logout-button)');
if (profileButton) {
    profileButton.addEventListener('click', () => alert('Tu perfil estará disponible próximamente.'));
}

const settingsButtons = document.querySelectorAll('.profile-dropdown button');
if (settingsButtons.length >= 2) {
    settingsButtons[1].addEventListener('click', () => alert('La configuración estará disponible próximamente.'));
}

const successPrimary = document.querySelector('.btn-success-primary');
const successSecondary = document.querySelector('.btn-success-secondary');

if (successPrimary) {
    successPrimary.addEventListener('click', () => alert('Tu perfil está listo. Aquí podrás acceder a tu información.'));
}

if (successSecondary) {
    successSecondary.addEventListener('click', () => alert('La comunidad estará disponible próximamente.'));
}


 
// 11. CARGAR PERFIL GUARDADO (AL INICIAR)
 
const perfilGuardado = localStorage.getItem('spinPerfil');

if (perfilGuardado) {
    try {
        const perfil = JSON.parse(perfilGuardado);

        // Copiar datos del perfil guardado
        Object.assign(formData, perfil);
        profilePhoto = perfil.foto || '';

        if (dropdownName) {
            dropdownName.textContent = perfil.nombre || 'Entrenador';
        }

        if (profilePhoto) {
            if (navAvatar) {
                navAvatar.style.backgroundImage = `url("${profilePhoto}")`;
                navAvatar.classList.add('has-photo');
            }

            if (dropdownAvatar) {
                dropdownAvatar.style.backgroundImage = `url("${profilePhoto}")`;
            }

            if (profilePhotoLarge) {
                profilePhotoLarge.innerHTML = `<img src="${profilePhoto}" alt="Foto de perfil">`;
            }
        }
    } catch (error) {
        console.error('No se pudo cargar el perfil guardado.', error);
        localStorage.removeItem('spinPerfil');
    }
    const camposNumericos = document.querySelectorAll('#numero-doc, #celular');

    camposNumericos.forEach(input => {
        input.addEventListener('input', (e) => {
            // Remueve cualquier carácter que no sea número y limita a 10 dígitos
            e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
        });
    });
}

// Iniciar en el paso inicial
showStep(currentStep);