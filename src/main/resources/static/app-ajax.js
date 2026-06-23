/**
 * LÓGICA FRONT-END Y PETICIONES AJAX REALES (app-ajax.js)
 * Integración completa: Aspirantes, Carreras y Funciones de compañeros
 */

$(document).ready(function () {

    // =========================================================================
    // --- 1. PÁGINA DE REGISTRO PÚBLICO (index.html) ---
    // =========================================================================
    $('#formRegistroAspirante').on('submit', function (e) {
        e.preventDefault();

        let formData = {
            nombre: $('#nombre').val(),
            telefono: $('#telefono').val(),
            email: $('#email').val(),
            contrasenia: $('#password').val(),
            carrera: $('#carreraInput').val().trim()
        };

        if (formData.carrera === "") {
            alert("Por favor, introduce tu carrera.");
            return;
        }

        validarCorreoUnico(formData.email, function(esValido) {
            if (esValido) {
                registrarAspirante(formData);
            } else {
                alert("Error: El correo electrónico ya está registrado en el sistema.");
            }
        });
    });

    function validarCorreoUnico(email, callback) {
        $.ajax({
            url: `/api/aspirantes/validar-email?email=${email}`,
            type: 'GET',
            success: function(existe) {
                if (existe === true || existe === "true") {
                    callback(false);
                } else {
                    callback(true);
                }
            },
            error: function(xhr) {
                console.error("Error al validar el correo en el servidor:", xhr);
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
                alert("¡Registro exitoso!");
                window.location.href = "/login";
            },
            error: function (xhr) {
                console.error("Error al guardar el aspirante:", xhr);
                alert("Hubo un error al procesar el registro en la base de datos.");
            }
        });
    }

    // =========================================================================
    // --- 2. LOGIN (login.html) ---
    // =========================================================================
    $('#formLogin').on('submit', function(e) {
        e.preventDefault();
        let user = $('#usuario').val();
        let pass = $('#password').val();
        loginUsuario(user, pass);
    });

    function loginUsuario(user, pass) {
        $.ajax({
            url: '/api/usuarios/login',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ usuario: user, contrasenia: pass }),
            success: function () { window.location.href = "/admin"; },
            error: function (xhr) {
                if (xhr.status === 401) {
                    $.ajax({
                        url: '/api/aspirantes/login',
                        type: 'POST',
                        contentType: 'application/json',
                        data: JSON.stringify({ email: user, contrasenia: pass }),
                        success: function () { window.location.href = "/aspirantes"; },
                        error: function () { alert("Usuario o contraseña incorrectos"); }
                    });
                }
            }
        });
    }

    // =========================================================================
    // --- 3. LÓGICA DE CARRERAS (CRUD Conectado al Servidor) ---
    // =========================================================================
    function renderTablaCarreras() {
        $.get('/api/carreras', function(carreras) {
            const tbody = $('#tbody-carreras');
            tbody.empty();

            if(carreras.length === 0) {
                tbody.append('<tr><td colspan="5" class="text-center text-muted py-3">No hay carreras registradas.</td></tr>');
                return;
            }

            carreras.forEach(function(c, i) {
                tbody.append(`
                    <tr data-id="${c.id}">
                        <td>${i + 1}</td>
                        <td><strong>${c.nombre}</strong></td>
                        <td>${c.semestres} semestres</td>
                        <td>${c.observaciones || '—'}</td>
                        <td>
                            <button class="btn btn-sm btn-outline-warning btn-editar-carrera"
                                    data-id="${c.id}"
                                    data-nombre="${c.nombre}"
                                    data-semestres="${c.semestres}"
                                    data-observaciones="${c.observaciones || ''}">
                                <i class="bx bx-edit-alt me-1"></i> Editar
                            </button>
                            <button class="btn btn-sm btn-outline-danger btn-eliminar-carrera"
                                    data-id="${c.id}"
                                    data-nombre="${c.nombre}">
                                <i class="bx bx-trash me-1"></i> Borrar
                            </button>
                        </td>
                    </tr>
                `);
            });
        }).fail(function() {
            $('#tbody-carreras').html('<tr><td colspan="5" class="text-center text-danger py-3">Error al cargar carreras desde el servidor.</td></tr>');
        });
    }

    // Inicializar la tabla si el elemento existe en el DOM
    if ($('#tablaCarreras').length > 0) {
        renderTablaCarreras();
    }

    // Limpiar modal al hacer clic en "Nueva Carrera"
    $('#btn-nueva-carrera').on('click', function() {
        $('#modalCarreraTitulo').text('Nueva Carrera');
        $('#btnGuardarTexto').text('Guardar');
        $('#carreraId').val('');
        $('#nombreCarrera').val('');
        $('#semestresCarrera').val('');
        $('#observacionesCarrera').val('');
    });

    // Delegación de eventos para el botón "Editar" (Mapea los datos al modal)
    $('#tbody-carreras').on('click', '.btn-editar-carrera', function() {
        $('#modalCarreraTitulo').text('Editar Carrera');
        $('#btnGuardarTexto').text('Actualizar');

        $('#carreraId').val($(this).data('id'));
        $('#nombreCarrera').val($(this).data('nombre'));
        $('#semestresCarrera').val($(this).data('semestres'));
        $('#observacionesCarrera').val($(this).data('observaciones'));

        $('#modalCarrera').modal('show');
    });

    // Guardar o Actualizar (Determina dinámicamente si es POST o PUT)
    $('#btnGuardarCarrera').on('click', function(e) {
        e.preventDefault();

        let id = $('#carreraId').val();
        let carreraData = {
            nombre: $('#nombreCarrera').val().trim(),
            semestres: parseInt($('#semestresCarrera').val()),
            observaciones: $('#observacionesCarrera').val().trim()
        };

        if(!carreraData.nombre || !carreraData.semestres) {
            alert("Por favor completa los campos obligatorios (*)");
            return;
        }

        let url = id ? `/api/carreras/${id}` : '/api/carreras';
        let tipoMetodo = id ? 'PUT' : 'POST';

        $.ajax({
            url: url,
            type: tipoMetodo,
            contentType: 'application/json',
            data: JSON.stringify(carreraData),
            success: function() {
                $('#modalCarrera').modal('hide');
                mostrarAlertaCarreras('¡Operación realizada con éxito!', 'alert-success');
                renderTablaCarreras();
            },
            error: function(xhr) {
                alert("Error al procesar la carrera: " + xhr.responseText);
            }
        });
    });

    // Delegación de eventos para el botón "Borrar" (Abre modal de confirmación)
    let idCarreraAEliminar = null;
    $('#tbody-carreras').on('click', '.btn-eliminar-carrera', function() {
        idCarreraAEliminar = $(this).data('id');
        $('#nombreCarreraEliminar').text($(this).data('nombre'));
        $('#modalEliminarCarrera').modal('show');
    });

    // Confirmar eliminación física (DELETE)
    $('#btnConfirmarEliminar').on('click', function() {
        if(idCarreraAEliminar) {
            $.ajax({
                url: `/api/carreras/${idCarreraAEliminar}`,
                type: 'DELETE',
                success: function() {
                    $('#modalEliminarCarrera').modal('hide');
                    mostrarAlertaCarreras('La carrera ha sido eliminada del sistema.', 'alert-warning');
                    renderTablaCarreras();
                    idCarreraAEliminar = null;
                },
                error: function() {
                    alert("No se pudo eliminar la carrera.");
                }
            });
        }
    });

    function mostrarAlertaCarreras(mensaje, claseBootstrap) {
        const alerta = $('#alerta-carreras');
        alerta.removeClass('d-none alert-success alert-warning alert-danger').addClass(claseBootstrap).text(mensaje);
        setTimeout(function() {
            alerta.addClass('d-none');
        }, 4000);
    }

    // =========================================================================
    // --- 4. CARGA DINÁMICA DE ASPIRANTES ---
    // =========================================================================
    if ($('#tablaAspirantes').length > 0) {
        $.get('/api/aspirantes', function(aspirantes) {
            let tbody = $('#tbody-aspirantes');
            tbody.empty();
            aspirantes.forEach(a => {
                tbody.append(`
                    <tr>
                        <td>${a.nombre}</td>
                        <td>${a.email}</td>
                        <td>${a.carrera}</td>
                        <td>
                            <button class="btn btn-sm btn-info btn-correo-indiv" data-id="${a.id}" data-email="${a.email}"><i class="bx bx-envelope"></i></button>
                            <button class="btn btn-sm btn-success btn-ver-detalle"
                                    data-nombre="${a.nombre}"
                                    data-telefono="${a.telefono}"
                                    data-email="${a.email}"
                                    data-carrera="${a.carrera}">
                                <i class="bx bx-show"></i>
                            </button>
                            <button class="btn btn-sm btn-danger btn-descargar-pdf" data-id="${a.id}"><i class="bx bxs-file-pdf"></i></button>
                        </td>
                    </tr>
                `);
            });
            $('#tablaAspirantes').DataTable({ dom: 'Bfrtip', buttons: ['copy', 'csv', 'excel'] });
        });

        $('#tbody-aspirantes').on('click', '.btn-correo-indiv', function () {
            $('#correoAspiranteEmail').val($(this).data('email'));
            $('#modalCorreoIndividual').modal('show');
        });

        $('#tbody-aspirantes').on('click', '.btn-ver-detalle', function () {
            $('#detalleAspiranteContenido').html(`
                <p><strong>Nombre:</strong> ${$(this).data('nombre')}</p>
                <p><strong>Teléfono:</strong> ${$(this).data('telefono')}</p>
                <p><strong>Email:</strong> ${$(this).data('email')}</p>
                <p><strong>Carrera:</strong> ${$(this).data('carrera')}</p>
            `);
            $('#modalVerDetalles').modal('show');
        });

        $('#tbody-aspirantes').on('click', '.btn-descargar-pdf', function () {
            window.location.href = `/api/aspirantes/pdf/${$(this).data('id')}`;
        });
    }

    // =========================================================================
    // --- 5. CORREOS Y ESTADÍSTICAS ---
    // =========================================================================
    $('#btnEnviarCorreoIndividual').on('click', function() {
        $.ajax({
            url: '/api/aspirantes/enviar-correo',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ email: $('#correoAspiranteEmail').val(), asunto: $('#asuntoIndividual').val(), mensaje: $('#mensajeIndividual').val() }),
            success: function() { alert("Correo enviado."); $('#modalCorreoIndividual').modal('hide'); }
        });
    });

    if ($('#stat-aspirantes').length) {
        $.get('/api/aspirantes').done(function(data) { $('#stat-aspirantes').text(data.length); });
    }
    if ($('#stat-carreras').length) {
        $.get('/api/carreras').done(function(data) { $('#stat-carreras').text(data.length); });
    }
    if ($('#stat-constancias').length) {
        $.get('/api/aspirantes').done(function(data) { $('#stat-constancias').text(data.length); });
    }
});