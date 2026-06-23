/**
 * LÓGICA FRONT-END Y PETICIONES AJAX REALES (app-ajax.js)
 * Integración completa: Aspirantes, Carreras y Funciones de compañeros
 */

$(document).ready(function () {

// --- 1. PÁGINA DE REGISTRO PÚBLICO (index.html) ---
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

        // Llamamos a la validación
        validarCorreoUnico(formData.email, function(esValido) {
            console.log("¿El correo es apto para registrar?:", esValido);
            if (esValido) {
                registrarAspirante(formData);
            } else {
                alert("El sistema detectó que el correo ya existe o la validación falló.");
            }
        });
    });

    function validarCorreoUnico(email, callback) {
        $.ajax({
            url: `/api/aspirantes/validar-email?email=${email}`,
            type: 'GET',
            success: function(existe) {
                console.log("Respuesta del servidor /validar-email (existe):", existe);
                // Si 'existe' viene como true (un booleano o string "true"), significa que YA está registrado.
                // Por lo tanto, el correo NO es válido para un nuevo registro (!existe).
                if (existe === true || existe === "true") {
                    callback(false);
                } else {
                    callback(true);
                }
            },
            error: function(xhr) {
                console.error("ERROR CRÍTICO: El endpoint /validar-email falló o no existe.", xhr);
                // Cambiamos temporalmente a true para que, si tu backend aún no tiene este método, te deje registrar.
                console.warn("Saltando validación por error en el servidor...");
                callback(true);
            }
        });
    }

    function registrarAspirante(formData) {
        console.log("Enviando datos al backend...", formData);
        $.ajax({
            url: '/api/aspirantes',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(formData),
            success: function (response) {
                console.log("Servidor guardó con éxito:", response);
                alert("¡Registro exitoso!");
                window.location.href = "/login";
            },
            error: function (xhr) {
                console.error("Error al guardar el aspirante en el servidor:", xhr);
                alert("Hubo un error al procesar el registro en la base de datos: " + xhr.responseText);
            }
        });
    }

    // --- 2. LOGIN (login.html) ---
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

    // --- 3. LÓGICA DE CARRERAS (Integrada) ---
    const CarrerasStore = {
        KEY: 'sireSe_carreras',
        getAll() { try { return JSON.parse(localStorage.getItem(this.KEY)) || []; } catch(e) { return []; } },
        save(lista) { localStorage.setItem(this.KEY, JSON.stringify(lista)); },
        agregar(carrera) { const lista = this.getAll(); if (!carrera.id) carrera.id = 'local_' + Date.now(); lista.push(carrera); this.save(lista); return carrera; },
        actualizar(id, datos) { const lista = this.getAll().map(c => String(c.id) === String(id) ? { ...c, ...datos } : c); this.save(lista); },
        eliminar(id) { const lista = this.getAll().filter(c => String(c.id) !== String(id)); this.save(lista); },
        cargarDesdeAPI(apiData) { this.save(apiData); }
    };

    if ($('#tablaCarreras').length > 0) {
        $.get('/api/carreras').done(function(data) { if (data && data.length) CarrerasStore.cargarDesdeAPI(data); renderTablaCarreras(CarrerasStore.getAll()); });
        $('#btnGuardarCarrera').on('click', guardarCarrera);
    }

    function renderTablaCarreras(carreras) {
        const tbody = $('#tbody-carreras');
        tbody.empty();
        carreras.forEach(function(c, i) {
            tbody.append(`<tr data-id="${c.id}"><td>${i + 1}</td><td><strong>${c.nombre}</strong></td><td>${c.semestres}</td><td>${c.observaciones || '—'}</td><td><button class="btn btn-sm btn-outline-warning btn-editar-carrera" data-id="${c.id}">Editar</button></td></tr>`);
        });
    }

    // --- 4. CARGA DINÁMICA DE ASPIRANTES ---
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

        // Eventos delegados
        $('#tbody-aspirantes').on('click', '.btn-correo-indiv', function () {
            $('#correoAspiranteEmail').val($(this).data('email'));
            $('#modalCorreoIndividual').modal('show');
        });

        // Lógica del botón ver detalle (Ojo)
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

    // --- 5. CORREOS Y ESTADÍSTICAS ---
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
});