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

    // --- CARRERAS ---

    const CarrerasStore = {
        KEY: 'sireSe_carreras',
        getAll() {
            try { return JSON.parse(localStorage.getItem(this.KEY)) || []; }
            catch(e) { return []; }
        },
        save(lista) { localStorage.setItem(this.KEY, JSON.stringify(lista)); },
        agregar(carrera) {
            const lista = this.getAll();
            if (!carrera.id) carrera.id = 'local_' + Date.now();
            lista.push(carrera);
            this.save(lista);
            return carrera;
        },
        actualizar(id, datos) {
            const lista = this.getAll().map(c =>
                String(c.id) === String(id) ? { ...c, ...datos } : c
            );
            this.save(lista);
        },
        eliminar(id) {
            const lista = this.getAll().filter(c => String(c.id) !== String(id));
            this.save(lista);
        },
        cargarDesdeAPI(apiData) { this.save(apiData); }
    };

    let tablaCarrerasDT = null;
    let carreraIdEliminar = null;

    if ($('#tablaCarreras').length > 0) {

        // Cargar tabla al inicio
        $.get('/api/carreras').done(function(data) {
            if (data && data.length) CarrerasStore.cargarDesdeAPI(data);
            renderTablaCarreras(CarrerasStore.getAll());
        }).fail(function() {
            renderTablaCarreras(CarrerasStore.getAll());
        });

        // Limpiar modal al abrir para nueva carrera
        $('#btn-nueva-carrera').on('click', function() {
            limpiarModalCarrera();
            $('#modalCarreraTitulo').text('Nueva Carrera');
            $('#btnGuardarTexto').text('Guardar');
        });

        // Guardar (crear o editar)
        $('#btnGuardarCarrera').on('click', guardarCarrera);

        // Confirmar eliminación
        $('#btnConfirmarEliminar').on('click', confirmarEliminarCarrera);
    }

    function renderTablaCarreras(carreras) {
        if (tablaCarrerasDT) {
            tablaCarrerasDT.destroy();
            tablaCarrerasDT = null;
        }

        const tbody = $('#tbody-carreras');

        if (!carreras || !carreras.length) {
            tbody.html('<tr><td colspan="5" class="text-center py-4 text-muted">No hay carreras. Haz clic en <strong>Nueva Carrera</strong> para agregar.</td></tr>');
            return;
        }

        let filas = '';
        carreras.forEach(function(c, i) {
            const obs = c.observaciones
                ? `<span class="text-muted small">${c.observaciones}</span>`
                : '<span class="text-muted small">—</span>';
            filas += `<tr data-id="${c.id}">
            <td>${i + 1}</td>
            <td><strong>${c.nombre}</strong></td>
            <td><span class="badge bg-label-secondary">${c.semestres} semestres</span></td>
            <td>${obs}</td>
            <td>
                <button class="btn btn-icon btn-sm btn-outline-warning btn-editar-carrera me-1"
                    data-id="${c.id}"
                    data-nombre="${c.nombre}"
                    data-semestres="${c.semestres}"
                    data-observaciones="${c.observaciones || ''}"
                    title="Editar">
                    <i class="bx bx-edit-alt"></i>
                </button>
                <button class="btn btn-icon btn-sm btn-outline-danger btn-eliminar-carrera"
                    data-id="${c.id}"
                    data-nombre="${c.nombre}"
                    title="Eliminar">
                    <i class="bx bx-trash"></i>
                </button>
            </td>
        </tr>`;
        });
        tbody.html(filas);

        tablaCarrerasDT = $('#tablaCarreras').DataTable({
            dom: 'Bfrtip',
            buttons: ['copy', 'csv', 'excel'],
            language: { url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json' },
            columnDefs: [{ orderable: false, targets: 4 }]
        });

        // Editar
        $('#tablaCarreras').off('click', '.btn-editar-carrera').on('click', '.btn-editar-carrera', function() {
            const btn = $(this);
            $('#carreraId').val(btn.data('id'));
            $('#nombreCarrera').val(btn.data('nombre'));
            $('#semestresCarrera').val(btn.data('semestres'));
            $('#observacionesCarrera').val(btn.data('observaciones'));
            $('#modalCarreraTitulo').text('Editar Carrera');
            $('#btnGuardarTexto').text('Actualizar');
            new bootstrap.Modal(document.getElementById('modalCarrera')).show();
        });

        // Eliminar — abre modal de confirmación
        $('#tablaCarreras').off('click', '.btn-eliminar-carrera').on('click', '.btn-eliminar-carrera', function() {
            carreraIdEliminar = $(this).data('id');
            $('#nombreCarreraEliminar').text($(this).data('nombre'));
            new bootstrap.Modal(document.getElementById('modalEliminarCarrera')).show();
        });
    }

    function limpiarModalCarrera() {
        $('#carreraId').val('');
        $('#nombreCarrera').val('').removeClass('is-invalid');
        $('#semestresCarrera').val('').removeClass('is-invalid');
        $('#observacionesCarrera').val('');
    }

    function guardarCarrera() {
        const id = $('#carreraId').val();
        const nombre = $('#nombreCarrera').val().trim();
        const semestres = parseInt($('#semestresCarrera').val());

        let valido = true;
        if (!nombre) { $('#nombreCarrera').addClass('is-invalid'); valido = false; }
        else { $('#nombreCarrera').removeClass('is-invalid'); }
        if (!semestres || semestres < 1) { $('#semestresCarrera').addClass('is-invalid'); valido = false; }
        else { $('#semestresCarrera').removeClass('is-invalid'); }
        if (!valido) return;

        const datos = {
            nombre: nombre,
            semestres: semestres,
            observaciones: $('#observacionesCarrera').val().trim()
        };

        if (id) {
            // EDITAR
            $.ajax({ url: '/api/carreras/' + id, method: 'PUT', contentType: 'application/json', data: JSON.stringify(datos) })
                .always(function() {
                    CarrerasStore.actualizar(id, datos);
                    bootstrap.Modal.getInstance(document.getElementById('modalCarrera')).hide();
                    mostrarAlerta('#alerta-carreras', 'success', '✓ Carrera actualizada correctamente.');
                    renderTablaCarreras(CarrerasStore.getAll());
                });
        } else {
            // CREAR
            $.ajax({ url: '/api/carreras', method: 'POST', contentType: 'application/json', data: JSON.stringify(datos) })
                .done(function(resp) { CarrerasStore.agregar(resp); })
                .fail(function() { CarrerasStore.agregar(datos); })
                .always(function() {
                    bootstrap.Modal.getInstance(document.getElementById('modalCarrera')).hide();
                    mostrarAlerta('#alerta-carreras', 'success', '✓ Carrera guardada correctamente.');
                    renderTablaCarreras(CarrerasStore.getAll());
                });
        }
    }

    function confirmarEliminarCarrera() {
        if (!carreraIdEliminar) return;
        $.ajax({ url: '/api/carreras/' + carreraIdEliminar, method: 'DELETE' })
            .always(function() {
                CarrerasStore.eliminar(carreraIdEliminar);
                bootstrap.Modal.getInstance(document.getElementById('modalEliminarCarrera')).hide();
                mostrarAlerta('#alerta-carreras', 'success', '✓ Carrera eliminada correctamente.');
                renderTablaCarreras(CarrerasStore.getAll());
                carreraIdEliminar = null;
            });
    }

    function mostrarAlerta(selector, tipo, mensaje) {
        const el = $(selector);
        el.removeClass('d-none alert-success alert-danger')
            .addClass('alert-' + tipo).html(mensaje).show();
        setTimeout(() => el.addClass('d-none'), 4000);
    }

        $('#tablaCarreras tbody').on('click', '.btn-eliminar-carrera', function () {
            if(confirm("¿Estás seguro de eliminar esta carrera?")) {
                tablaCarreras.row($(this).parents('tr')).remove().draw();
                console.log("Carrera eliminada.");
            }
        });

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

    //  ADMIN

    if ($('#stat-aspirantes').length) {
        // Cargar contadores
        $.get('/api/aspirantes').done(function(data) {
            $('#stat-aspirantes').text(data.length);
        }).fail(function() {
            $('#stat-aspirantes').text('—');
        });

        $.get('/api/carreras').done(function(data) {
            const total = data.length || CarrerasStore.getAll().length;
            $('#stat-carreras').text(total);
        }).fail(function() {
            $('#stat-carreras').text(CarrerasStore.getAll().length);
        });

        // Recuadro últimos aspirantes
        $.get('/api/aspirantes').done(function(data) {
            const tbody = $('#tbody-resumen-aspirantes');
            if (!data || !data.length) {
                tbody.html('<tr><td colspan="2" class="text-center text-muted py-3">No hay aspirantes registrados.</td></tr>');
                return;
            }
            let filas = '';
            data.slice(-5).reverse().forEach(function(a) {
                const carreraNombre = a.carrera ? (a.carrera.nombre || a.carrera) : '—';
                filas += `<tr>
                <td><strong>${a.nombre}</strong></td>
                <td><span class="badge bg-label-primary">${carreraNombre}</span></td>
            </tr>`;
            });
            tbody.html(filas);
        }).fail(function() {
            $('#tbody-resumen-aspirantes').html('<tr><td colspan="2" class="text-center text-muted py-3">No se pudo conectar al servidor.</td></tr>');
        });

        // Recuadro carreras
        $.get('/api/carreras').done(function(data) {
            const carreras = data.length ? data : CarrerasStore.getAll();
            renderResumenCarreras(carreras);
        }).fail(function() {
            renderResumenCarreras(CarrerasStore.getAll());
        });

        function renderResumenCarreras(carreras) {
            const tbody = $('#tbody-resumen-carreras');
            if (!carreras || !carreras.length) {
                tbody.html('<tr><td colspan="3" class="text-center text-muted py-3">No hay carreras registradas.</td></tr>');
                return;
            }
            let filas = '';
            carreras.forEach(function(c) {
                filas += `<tr>
                <td><strong>${c.nombre}</strong></td>
                <td><span class="badge bg-label-secondary">${c.semestres} sem.</span></td>
                <td>—</td>
            </tr>`;
            });
            tbody.html(filas);
        }
    }

    $('#btnEnviarCorreoMasivo').click(function() {
        console.log("Enviando correo masivo con asunto:", $('#asuntoMasivo').val());
        alert("Correos enviados exitosamente.");
        $('#modalCorreoMasivo').modal('hide');
    });

});
