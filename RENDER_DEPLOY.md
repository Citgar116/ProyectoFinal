# Despliegue en Render — SiReSe (ProyectoFinal)

Guía para subir este proyecto Spring Boot a [Render](https://render.com) usando el `Dockerfile` incluido.

---

## 1. Base de datos MySQL (¡importante!)

Render **no ofrece MySQL gestionado**, solo PostgreSQL. Este proyecto usa un
**MySQL externo en Aiven** (`defaultdb`), que es justo lo recomendado.

Los valores reales de conexión (host, puerto, usuario, contraseña) están en el
archivo **`.env`** del proyecto, que **NO se sube a git** (.gitignore). Úsalos
tanto para correr en local como para configurar Render.

> La app crea las tablas sola al arrancar (`spring.jpa.hibernate.ddl-auto=update`) y siembra un **admin** y unas **carreras** de ejemplo si la BD está vacía (ver `DataInitializer.java`).
>
> La URL JDBC usa `sslMode=REQUIRED` porque Aiven exige conexión cifrada.

---

## 2. Variables de entorno en Render

En el panel del servicio → **Environment** → **Environment Variables**, agrega
las 3 variables. **Copia los valores exactos desde el archivo `.env`** (no los
pongo aquí porque este archivo sí se sube a git):

| Variable      | De dónde sale                                                   | Obligatoria |
|---------------|-----------------------------------------------------------------|-------------|
| `DB_URL`      | `.env` → `jdbc:mysql://...aivencloud.com:28250/defaultdb?sslMode=REQUIRED&serverTimezone=UTC` | ✅ |
| `DB_USER`     | `.env` → `avnadmin`                                             | ✅ |
| `DB_PASSWORD` | `.env` (la contraseña de Aiven)                                | ✅ |
| `PORT`        | **No la pongas** — Render la asigna automáticamente            | ❌ |

(SMTP/correo es opcional — ver sección 5.)

---

## 3. Crear el servicio en Render

1. Sube este repo a GitHub (ya está en `Citgar116/ProyectoFinal`).
2. En Render: **New +** → **Web Service** → conecta el repositorio.
3. Render detecta el `Dockerfile` automáticamente (Runtime: **Docker**).
4. Define las variables de entorno de la sección 2.
5. **Create Web Service** y espera el build (tarda unos minutos en compilar con Maven).

---

## 4. Credenciales iniciales

Al primer arranque, si la tabla `usuarios` está vacía, se crea:

- **Usuario:** `admin`
- **Contraseña:** `admin123`

> Cámbialas insertando otro usuario en la BD o editando `DataInitializer.java` antes de desplegar.

Los aspirantes se crean desde la página pública de **Registro** (`/registro`).

---

## 5. (Opcional) Habilitar correos SMTP

El envío de correos está **deshabilitado** por defecto (los botones de correo no enviarán nada real). Para activarlo:

1. Agrega al final de `src/main/resources/application.properties`:
   ```properties
   spring.mail.host=${MAIL_HOST}
   spring.mail.port=${MAIL_PORT:587}
   spring.mail.username=${MAIL_USERNAME}
   spring.mail.password=${MAIL_PASSWORD}
   spring.mail.properties.mail.smtp.auth=true
   spring.mail.properties.mail.smtp.starttls.enable=true
   ```
2. Agrega en Render las variables `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`.
   (Con Gmail usa una *contraseña de aplicación*, no tu contraseña normal.)

---

## 6. Notas / pendientes conocidos

- No hay autenticación real: las rutas `/admin`, `/carreras`, etc. son accesibles directamente (decisión consciente para la entrega).
- Las contraseñas se guardan en texto plano.
- `spring.jpa.show-sql=true` deja logs verbosos; puedes ponerlo en `false` para producción.
