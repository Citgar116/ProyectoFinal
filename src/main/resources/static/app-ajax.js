/**
 * LÓGICA FRONT-END Y PETICIONES AJAX REALES (app-ajax.js)
 * Integración completa: Aspirantes, Carreras y Constancias
 */

$(document).ready(function () {

    // ==========================================================
    // 1. REGISTRO PÚBLICO DE ASPIRANTES (index.html)
    // ==========================================================

    // Cargar carreras disponibles en el <select> de registro
    if ($('#carrera').length > 0) {
        $.get('/api/carreras', function (carreras) {
            const select = $('#carrera');
            select.empty().append('<option value="" disabled selected>Selecciona una carrera</option>');
            (carreras || []).forEach(function (c) {
                select.append(`<option value="${c.nombre}">${c.nombre}</option>`);
            });
        });
    }

    $('#formRegistroAspirante').on('submit', function (e) {
        e.preventDefault();
        let formData = {
            nombre: $('#nombre').val(),
            telefono: $('#telefono').val(),
            email: $('#email').val(),
            contrasenia: $('#password').val(),
            carrera: $('#carrera').val()
        };
        if (!formData.carrera) {
            alert("Por favor selecciona una carrera.");
            return;
        }
        validarCorreoUnico(formData.email, function (esValido) {
            if (esValido) { registrarAspirante(formData); }
            else { alert("Error: El correo electrónico ya está registrado."); }
        });
    });

    function validarCorreoUnico(email, callback) {
        $.ajax({
            url: `/api/aspirantes/validar-email?email=${encodeURIComponent(email)}`,
            type: 'GET',
            success: function (existe) { callback(!existe); },
            error: function () { console.error("Error al validar el correo."); callback(false); }
        });
    }

    function registrarAspirante(formData) {
        $.ajax({
            url: '/api/aspirantes',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(formData),
            success: function () { alert("¡Registro exitoso!"); window.location.href = "/login"; },
            error: function () { alert("Hubo un error al procesar el registro."); }
        });
    }

    // ==========================================================
    // 2. LOGIN (login.html)
    // ==========================================================
    $('#formLogin').on('submit', function (e) {
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
                } else {
                    alert("Error al iniciar sesión. Intenta de nuevo.");
                }
            }
        });
    }

    // ==========================================================
    // 3. GESTIÓN DE CARRERAS (CRUD contra la API real)
    // ==========================================================
    const API_CARRERAS = '/api/carreras';
    let carreraAEliminar = null;

    if ($('#tablaCarreras').length > 0) {
        cargarCarreras();

        $('#btn-nueva-carrera').on('click', resetFormCarrera);
        $('#btnGuardarCarrera').on('click', guardarCarrera);

        // Editar: cargar datos en el modal
        $('#tbody-carreras').on('click', '.btn-editar-carrera', function () {
            const id = $(this).data('id');
            $.get(`${API_CARRERAS}/${id}`, function (c) {
                $('#carreraId').val(c.id);
                $('#nombreCarrera').val(c.nombre);
                $('#semestresCarrera').val(c.semestres);
                $('#observacionesCarrera').val(c.observaciones || '');
                $('#modalCarreraTitulo').text('Editar Carrera');
                $('#modalCarrera').modal('show');
            });
        });

        // Eliminar: abrir confirmación
        $('#tbody-carreras').on('click', '.btn-eliminar-carrera', function () {
            carreraAEliminar = $(this).data('id');
            $('#nombreCarreraEliminar').text($(this).data('nombre'));
            $('#modalEliminarCarrera').modal('show');
        });

        // Confirmar eliminación
        $('#btnConfirmarEliminar').on('click', function () {
            if (!carreraAEliminar) return;
            $.ajax({
                url: `${API_CARRERAS}/${carreraAEliminar}`,
                type: 'DELETE',
                success: function () {
                    $('#modalEliminarCarrera').modal('hide');
                    carreraAEliminar = null;
                    cargarCarreras();
                    mostrarAlertaCarrera('Carrera eliminada correctamente.', 'success');
                },
                error: function () { mostrarAlertaCarrera('No se pudo eliminar la carrera.', 'danger'); }
            });
        });
    }

    function cargarCarreras() {
        $.get(API_CARRERAS)
            .done(function (data) { renderTablaCarreras(data || []); })
            .fail(function () { mostrarAlertaCarrera('Error al cargar las carreras.', 'danger'); });
    }

    function renderTablaCarreras(carreras) {
        const tbody = $('#tbody-carreras');
        tbody.empty();
        if (!carreras.length) {
            tbody.append('<tr><td colspan="5" class="text-center text-muted py-4">No hay carreras registradas.</td></tr>');
            return;
        }
        carreras.forEach(function (c, i) {
            tbody.append(`
                <tr data-id="${c.id}">
                    <td>${i + 1}</td>
                    <td><strong>${c.nombre}</strong></td>
                    <td>${c.semestres}</td>
                    <td>${c.observaciones || '—'}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-warning btn-editar-carrera" data-id="${c.id}" title="Editar"><i class="bx bx-edit"></i></button>
                        <button class="btn btn-sm btn-outline-danger btn-eliminar-carrera" data-id="${c.id}" data-nombre="${c.nombre}" title="Eliminar"><i class="bx bx-trash"></i></button>
                    </td>
                </tr>
            `);
        });
    }

    function resetFormCarrera() {
        $('#carreraId').val('');
        $('#nombreCarrera').val('');
        $('#semestresCarrera').val('');
        $('#observacionesCarrera').val('');
        $('#modalCarreraTitulo').text('Nueva Carrera');
    }

    function guardarCarrera() {
        const id = $('#carreraId').val();
        const carrera = {
            nombre: $('#nombreCarrera').val().trim(),
            semestres: parseInt($('#semestresCarrera').val(), 10),
            observaciones: $('#observacionesCarrera').val().trim()
        };
        if (!carrera.nombre || !carrera.semestres) {
            mostrarAlertaCarrera('Completa el nombre y los semestres.', 'warning');
            return;
        }
        const esEdicion = id && id !== '';
        $.ajax({
            url: esEdicion ? `${API_CARRERAS}/${id}` : API_CARRERAS,
            type: esEdicion ? 'PUT' : 'POST',
            contentType: 'application/json',
            data: JSON.stringify(carrera),
            success: function () {
                $('#modalCarrera').modal('hide');
                cargarCarreras();
                mostrarAlertaCarrera(esEdicion ? 'Carrera actualizada.' : 'Carrera creada.', 'success');
            },
            error: function () { mostrarAlertaCarrera('Error al guardar la carrera.', 'danger'); }
        });
    }

    function mostrarAlertaCarrera(msg, tipo) {
        const alerta = $('#alerta-carreras');
        if (!alerta.length) return;
        alerta.removeClass('d-none alert-success alert-danger alert-warning')
              .addClass('alert-' + tipo).text(msg);
        setTimeout(() => alerta.addClass('d-none'), 4000);
    }

    // ==========================================================
    // 4. LISTADO DE ASPIRANTES (aspirantes.html)
    // ==========================================================
    if ($('#tablaAspirantes').length > 0) {
        $.get('/api/aspirantes', function (aspirantes) {
            let tbody = $('#tbody-aspirantes');
            tbody.empty();
            aspirantes.forEach(a => {
                tbody.append(`
                    <tr>
                        <td>${a.nombre}</td>
                        <td>${a.email}</td>
                        <td>${a.carrera || '—'}</td>
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

        // Correo individual
        $('#tbody-aspirantes').on('click', '.btn-correo-indiv', function () {
            $('#correoAspiranteEmail').val($(this).data('email'));
            $('#correoAspiranteNombre').text($(this).data('email'));
            $('#modalCorreoIndividual').modal('show');
        });

        // Ver detalle
        $('#tbody-aspirantes').on('click', '.btn-ver-detalle', function () {
            $('#detalleAspiranteContenido').html(`
                <p><strong>Nombre:</strong> ${$(this).data('nombre')}</p>
                <p><strong>Teléfono:</strong> ${$(this).data('telefono')}</p>
                <p><strong>Email:</strong> ${$(this).data('email')}</p>
                <p><strong>Carrera:</strong> ${$(this).data('carrera')}</p>
            `);
            $('#modalVerDetalles').modal('show');
        });

        // Descargar PDF de constancia
        $('#tbody-aspirantes').on('click', '.btn-descargar-pdf', function () {
            window.location.href = `/api/aspirantes/pdf/${$(this).data('id')}`;
        });
    }

    // ==========================================================
    // 5. CORREOS (individual y masivo)
    // ==========================================================
    $('#btnEnviarCorreoIndividual').on('click', function () {
        $.ajax({
            url: '/api/aspirantes/enviar-correo',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                email: $('#correoAspiranteEmail').val(),
                asunto: $('#asuntoIndividual').val(),
                mensaje: $('#mensajeIndividual').val()
            }),
            success: function () { alert("Correo enviado."); $('#modalCorreoIndividual').modal('hide'); },
            error: function () { alert("No se pudo enviar el correo. Verifica la configuración SMTP."); }
        });
    });

    $('#btnEnviarCorreoMasivo').on('click', function () {
        $.ajax({
            url: '/api/aspirantes/correo-masivo',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                asunto: $('#asuntoMasivo').val(),
                mensaje: $('#mensajeMasivo').val()
            }),
            success: function () { alert("Correos masivos enviados."); $('#modalCorreoMasivo').modal('hide'); },
            error: function () { alert("No se pudieron enviar los correos. Verifica la configuración SMTP."); }
        });
    });

    // ==========================================================
    // 6. DASHBOARD (admin.html): contadores y resúmenes
    // ==========================================================
    if ($('#stat-aspirantes').length || $('#tbody-resumen-aspirantes').length) {
        $.get('/api/aspirantes').done(function (data) {
            data = data || [];
            $('#stat-aspirantes').text(data.length);
            $('#stat-constancias').text(data.length);

            const resumen = $('#tbody-resumen-aspirantes');
            if (resumen.length) {
                resumen.empty();
                const ultimos = data.slice(-5).reverse();
                if (!ultimos.length) {
                    resumen.append('<tr><td colspan="2" class="text-center text-muted py-3">Sin aspirantes.</td></tr>');
                } else {
                    ultimos.forEach(a => resumen.append(`<tr><td>${a.nombre}</td><td>${a.carrera || '—'}</td></tr>`));
                }
            }

            const constancias = $('#tbody-resumen-constancias');
            if (constancias.length) {
                constancias.empty();
                const ultimos = data.slice(-5).reverse();
                if (!ultimos.length) {
                    constancias.append('<tr><td colspan="4" class="text-center text-muted py-3">Sin constancias.</td></tr>');
                } else {
                    ultimos.forEach(a => constancias.append(
                        `<tr><td>${a.nombre}</td><td>${a.carrera || '—'}</td><td>${a.fechaRegistro || '—'}</td><td><span class="badge bg-label-success">Disponible</span></td></tr>`
                    ));
                }
            }
        });
    }

    if ($('#stat-carreras').length || $('#tbody-resumen-carreras').length) {
        $.get('/api/carreras').done(function (data) {
            data = data || [];
            $('#stat-carreras').text(data.length);

            const resumen = $('#tbody-resumen-carreras');
            if (resumen.length) {
                resumen.empty();
                if (!data.length) {
                    resumen.append('<tr><td colspan="3" class="text-center text-muted py-3">Sin carreras.</td></tr>');
                } else {
                    data.forEach(c => resumen.append(`<tr><td>${c.nombre}</td><td>${c.semestres}</td><td>—</td></tr>`));
                }
            }
        });
    }
});
