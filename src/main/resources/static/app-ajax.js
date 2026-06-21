/**
 * LÓGICA FRONT-END Y PETICIONES AJAX REALES (app-ajax.js)
 * Archivo principal conectado al Backend de Spring Boot para SiReSe
 */

$(document).ready(function () {

    // --- 1. PÁGINA DE REGISTRO PÚBLICO (index.html) ---

    $('#formRegistroAspirante').on('submit', function (e) {
        e.preventDefault();

        // Creamos el objeto JSON con los campos actuales del formulario e index.html
        let formData = {
            nombre: $('#nombre').val(),
            telefono: $('#telefono').val(),
            email: $('#email').val(),
            contrasenia: $('#password').val() // Captura la contraseña nueva
        };

        // Validamos si el correo es único haciendo una petición real al backend
        validarCorreoUnico(formData.email, function(esValido) {
            if (esValido) {
                registrarAspirante(formData);
            } else {
                alert("Error: El correo electrónico ya está registrado.");
            }
        });
    });

    function validarCorreoUnico(email, callback) {
        $.ajax({
            url: `/api/aspirantes/validar-email?email=${email}`,
            type: 'GET',
            success: function(existe) {
                // Si existe es true, el correo NO es único (no es válido)
                callback(!existe);
            },
            error: function() {
                console.error("Error al validar el correo electrónico.");
                callback(false);
            }
        });
    }

    function registrarAspirante(formData) {
        $.ajax({
            url: '/api/aspirantes',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(formData),
            success: function (response) {
                alert("¡Registro exitoso! Tus datos han sido guardados.");
                $('#formRegistroAspirante')[0].reset(); // Limpiar formulario
                window.location.href = "/login"; // Redirigir al login automáticamente
            },
            error: function (xhr) {
                alert("Hubo un error al procesar el registro. Inténtalo de nuevo.");
            }
        });
    }

    // --- 2. LOGIN CON DOBLE ROL: ADMIN O ASPIRANTE (login.html) ---

    $('#formLogin').on('submit', function(e) {
        e.preventDefault();
        let user = $('#usuario').val();
        let pass = $('#password').val();
        loginUsuario(user, pass);
    });

    function loginUsuario(user, pass) {
        // 1. Intentamos loguear primero como Administrador en /api/usuarios/login
        $.ajax({
            url: '/api/usuarios/login',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                usuario: user,
                contrasenia: pass
            }),
            success: function (response) {
                alert("¡Bienvenido, Administrador!");
                window.location.href = "/admin"; // Redirige a tu vista mapeada de admin
            },
            error: function (xhr) {
                // 2. Si las credenciales no corresponden a un Admin (401), intentamos como Aspirante
                if (xhr.status === 401) {
                    $.ajax({
                        url: '/api/aspirantes/login',
                        type: 'POST',
                        contentType: 'application/json',
                        data: JSON.stringify({
                            email: user, // El input de usuario sirve como correo para el aspirante
                            contrasenia: pass
                        }),
                        success: function (response) {
                            alert("¡Inicio de sesión exitoso como Aspirante!");
                            window.location.href = "/aspirantes"; // Cambia esto a la pestaña que deba ver el aspirante
                        },
                        error: function () {
                            alert("Usuario/Correo o contraseña incorrectos");
                        }
                    });
                } else {
                    alert("Error al conectar con el servidor.");
                }
            }
        });
    }

    // --- 3. INICIALIZACIÓN DE DATATABLES (carreras.html y aspirantes.html) ---

    if ($('#tablaCarreras').length > 0) {
        let tablaCarreras = $('#tablaCarreras').DataTable({
            dom: 'Bfrtip',
            buttons: ['copy', 'csv', 'excel'],
            language: { url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json' }
        });

        $('#tablaCarreras tbody').on('click', '.btn-eliminar-carrera', function () {
            if(confirm("¿Estás seguro de eliminar esta carrera?")) {
                tablaCarreras.row($(this).parents('tr')).remove().draw();
                console.log("Carrera eliminada.");
            }
        });
    }

    if ($('#tablaAspirantes').length > 0) {
        let tablaAspirantes = $('#tablaAspirantes').DataTable({
            dom: 'Bfrtip',
            buttons: ['copy', 'csv', 'excel'],
            language: { url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json' }
        });

        $('#tablaAspirantes tbody').on('click', '.btn-correo-indiv', function () {
            let tr = $(this).closest('tr');
            let rowData = tablaAspirantes.row(tr).data();
            let nombre = rowData[0];
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

    // --- GUARDAR MODALES ---
    $('#btnGuardarCarrera').click(function() {
        console.log("Guardando carrera:", $('#nombreCarrera').val());
        $('#modalCarrera').modal('hide');
    });

    $('#btnEnviarCorreoMasivo').click(function() {
        console.log("Enviando correo masivo con asunto:", $('#asuntoMasivo').val());
        alert("Correos enviados exitosamente.");
        $('#modalCorreoMasivo').modal('hide');
    });

});