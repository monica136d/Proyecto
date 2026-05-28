# Ceniza & Oro - Proyecto Final

## Autores
Guillermo Lobo Ahumado.
Mônica Canal Ceballos.

Web de un restaurante con sistema de reservas y panel de administración.


## Tecnologías usadas

- HTML5, CSS3, JavaScript
- PHP 8 (con PDO)
- MySQL
- Servidor local: WAMP

## Requisitos

- Tener instalado WAMP .
- Que estén Apache y MySQL en ejecución.
- Un navegador (Chrome, Edge, Firefox).

## Cómo desplegarlo

### 1-- Copiar el proyecto

Copiar la carpeta entera del proyecto dentro de la carpeta "www" de WAMP.
La ruta queda así:

    C:\wamp64\www\Proyecto

### 2-- Importar la base de datos este se llama "restaurante".

1. Arrancar WAMP "icono verde en la bandeja" .
2. Abrir "http://localhost/phpmyadmin" en el navegador.
3. Crear una base de datos nueva con el nombre "restaurante".
4. Seleccionar la base de datos "restaurante".
5. Pulsar la pestaña "Importar".
6. Elegir el archivo "restaurante.sql" que se entrega junto al proyecto.
7. Pulsar "Continuar".

### 3--Comprobar la conexión

El archivo "php/db.php" tiene los datos de conexión:

- Host: "localhost"
- Base de datos: "restaurante"
- Usuario: "root"
- Contraseña: vacía, espacio por defecto de WAMP.


### 4--Abrir la web

En el navegador escribir:

    http://localhost/Proyecto/index.html

## Usuarios de prueba

La base de datos viene con varios usuarios. Aquí dejo los que se usan
para probar el login y el panel admin:

| Usuario        | Email             | Contraseña    | Rol     |
|----------------|-------------------|---------------|---------|
| Administrador  | admin@gmail.com   | [Admin2026!]  | admin   |
| tomas          | tomas@gmail.com   | [user123]     | cliente |





 Nota: las contraseñas están encriptadas con "password_hash" en la base
 de datos. Si se olvida alguna, ver la sección "Cambiar la contraseña
 de un usuario" más abajo.

## Estructura de carpetas

- "html/" - Páginas HTML (login, registro, reservar, admin, menús...).
- "css/" - Hojas de estilo.
- "js/" - JavaScript (validaciones, AJAX, panel admin).
- "php/" - Backend (login, registro, CRUD, sesiones).
- "assets/" - Imágenes del restaurante y de los menús.
- "prueba_menu/" - Datos de ejemplo para la defensa (opcional).
- "menus_no_estaticos/" - Páginas antiguas guardadas como respaldo.

## Funcionalidades principales

- Registro y login de usuarios con contraseña encriptada (password_hash).
- Reservas online con elección de fecha, hora y comensales.
- Validación: solo se aceptan reservas de jueves a domingo.
- Panel de administrador con CRUD de menús, reservas y usuarios.
- Historial de actividad reciente (quién hizo qué y cuándo).
- Toasts de confirmación al guardar o registrar.

## Cosas a tener en cuenta que  a veces se olvidan.

- El admin necesita estar logueado como rol "admin" para entrar al panel.
- Si la base de datos no se importa bien, no funcionará el login.
- Las imágenes de los menús están en "assets/". Si subes un menú nuevo
  desde el panel, debes poner una ruta de imagen que exista .
- Si Apache o MySQL no están en ejecución, la web no responde.










## Cambiar la contraseña de un usuario (si se olvida)

Como la web no tiene "recuperar contraseña", si un usuario olvida la suya
hay que cambiarla a mano. La contraseña se guarda encriptada con
"password_hash", por eso no se puede escribir directamente en
phpMyAdmin: hay que generar el hash primero.

### Pasos

1. Abrir Visual con el proyecto.

2. Crear un archivo temporal en `php/` llamado `hash.php` con este código:

   ```php
   <?php
   $nueva = 'minueva123';
   echo password_hash($nueva, PASSWORD_DEFAULT);
   ```

   Cambiar `minueva123` por la contraseña que quieras poner.

3. Abrir en el navegador:

       http://localhost/Proyecto/php/hash.php

   Aparecerá un texto largo que empieza por `$2y$10$...`. Ese es el hash.
   Copiarlo entero.

4. Ir a `http://localhost/phpmyadmin`, base de datos `restaurante`,
   tabla `usuario`.

5. Pulsar "Editar" en la fila del usuario al que le quieras cambiar la
   contraseña.

6. Pegar el hash copiado en la columna `Password` y pulsar "Continuar".

7. **Borrar el archivo `hash.php`** del proyecto. No debe quedarse ahí
   por seguridad.

8. Probar el login con la nueva contraseña en `login.html`.



## Autores
Guillermo Lobo Ahumado.
Mônica Canal Ceballos.

