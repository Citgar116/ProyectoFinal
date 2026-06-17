/**
 * LÓGICA FRONT-END Y PETICIONES AJAX SIMULADAS (app-ajax.js)
 * Archivo principal para la gestión de las operaciones de SiReSe
 */

$(document).ready(function () {
    
    // --- 1. PÁGINA DE REGISTRO PÚBLICO (index.html) ---
    
    $('#formRegistroAspirante').on('submit', function (e) {
        e.preventDefault();
        
        let formData = {
            nombre: $('#nombre').val(),
            telefono: $('#telefono').val(),
            email: $('#email').val(),
            carrera_id: $('#carrera').val()
        };
        
        validarCorreoUnico(formData.email, function(esValido) {
            if (esValido) {
                registrarAspirante(formData);
            } else {
                alert("Error: El correo electrónico ya está registrado.");
            }
        });
    });

    function validarCorreoUnico(email, callback) {
        // Simulación de petición AJAX al backend
        console.log(`Verificando unicidad del correo: ${email}`);
        setTimeout(() => {
            // Simulamos que "test@test.com" ya existe
            let existe = (email === "test@test.com"); 
            callback(!existe); 
        }, 500);
    }

    function registrarAspirante(formData) {
        // Simulación de envío AJAX
        console.log("Enviando datos al servidor:", formData);
        setTimeout(() => {
            alert("¡Registro exitoso! Tus datos han sido guardados.");
            console.log("Simulando envío de correo al administrador notificando el nuevo registro...");
            $('#formRegistroAspirante')[0].reset(); // Limpiar formulario
        }, 800);
    }

    // --- 2. LOGIN DE ADMINISTRADOR (login.html) ---
    
    $('#formLogin').on('submit', function(e) {
        e.preventDefault();
        let user = $('#usuario').val();
        let pass = $('#password').val();
        loginAdmin(user, pass);
    });

    function loginAdmin(user, pass) {
        console.log(`Intentando login para el usuario: ${user}`);
        // Simulación de AJAX
        setTimeout(() => {
            if (user === "admin" && pass === "1234") {
                alert("Bienvenido, Administrador");
                window.location.href = "admin.html"; // Redirigir al dashboard
            } else {
                alert("Usuario o contraseña incorrectos");
            }
        }, 500);
    }

    // --- 3. INICIALIZACIÓN DE DATATABLES (carreras.html y aspirantes.html) ---
    
    if ($('#tablaCarreras').length > 0) {
        let tablaCarreras = $('#tablaCarreras').DataTable({
            dom: 'Bfrtip',
            buttons: ['copy', 'csv', 'excel'],
            language: { url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json' }
        });

        // Simular eliminación en la tabla en caliente
        $('#tablaCarreras tbody').on('click', '.btn-eliminar-carrera', function () {
            if(confirm("¿Estás seguro de eliminar esta carrera?")) {
                tablaCarreras.row($(this).parents('tr')).remove().draw();
                console.log("Carrera eliminada simuladamente.");
            }
        });
    }

    if ($('#tablaAspirantes').length > 0) {
        let tablaAspirantes = $('#tablaAspirantes').DataTable({
            dom: 'Bfrtip',
            buttons: ['copy', 'csv', 'excel'],
            language: { url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json' }
        });

        // Eventos para los botones de la tabla
        $('#tablaAspirantes tbody').on('click', '.btn-correo-indiv', function () {
            let tr = $(this).closest('tr');
            let rowData = tablaAspirantes.row(tr).data();
            let nombre = rowData[0]; // asumiendo nombre en col 0
            $('#correoAspiranteNombre').text(nombre);
            $('#modalCorreoIndividual').modal('show');
        });

        $('#tablaAspirantes tbody').on('click', '.btn-ver-detalle', function () {
            $('#modalVerDetalles').modal('show');
        });

        $('#tablaAspirantes tbody').on('click', '.btn-descargar-pdf', function () {
            $('#modalConstanciaPDF').modal('show');
        });
    }

    // --- SIMULACIÓN GUARDAR MODALES ---
    $('#btnGuardarCarrera').click(function() {
        console.log("Simulando guardado de carrera:", $('#nombreCarrera').val());
        $('#modalCarrera').modal('hide');
        // Aquí normalmente harías tablaCarreras.row.add([...]).draw(); o recargarías
    });

    $('#btnEnviarCorreoMasivo').click(function() {
        console.log("Enviando correo masivo con asunto:", $('#asuntoMasivo').val());
        alert("Correos enviados exitosamente.");
        $('#modalCorreoMasivo').modal('hide');
    });

});
