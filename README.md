# ProyectoIntegrador4toSemestre Grupo ALTF4
 Proyecto Integrador 4to Semestre - Grupo ALTF4📝 

 Descripción del Proyecto 
 Este proyecto es una aplicación web Full Stack desarrollada como requisito final para el final del 4to Semestre. El objetivo es consolidar y aplicar los conocimientos adquiridos en el desarrollo de aplicaciones que requieren la integración de un frontend, un backend y una base de datos.Se trata de ("CHEF EN CLICK es un E-Commerce de comida rapida, ideal para vender un producto de comida rapida.").
 
 
 🛠️ Tecnologías Utilizadas 
 Este proyecto está construido con un stack de tecnologías moderno para aplicaciones web:Frontend JavaScript , HTML, CSS. Backend Node.js con Base de Datos MySQL.
 
⚙️ Instalación y Puesta en Marcha. Sigue estos pasos para levantar el proyecto en tu entorno local.
1. Clonar el Repositorio Bash git clone "https://github.com/PowerSystem2024/ProyectoIntegradorAltF4"
cd ProyectoIntegrador4toSemestre
2. B. Pasos de Instalación
Requisitos:
Tener un servidor MySQL 
Creación de la Base de Datos:
Accede a tu herramienta de administración de MySQL.
Ejecuta el script database.sql. El script se encarga de:
Crear el esquema llamado mydb (aunque el comando USE luego apunta a db_proyecto_final).
Crear y utilizar el esquema db_proyecto_final.
Crear las tablas user, Productos, Pedidos y detalle_pedido, definiendo todas las claves primarias (PK) y claves foráneas (FK).
Nota: Si usas la línea de comandos, puedes ejecutar el archivo directamente:
Bash
mysql -u [tu_usuario] -p < database.sql
 Configuración de Conexión en el Backend
La conexión debe hacerse usando las credenciales de tu servidor MySQL y apuntando a la base de datos db_proyecto_final.

3. Revisa el archivo db.js utilizando tus datos para la configuracion de la base de datos este correcta. 
    host: 'localhost',     
    user: 'root',         
    password: 'admin',
    database: 'db_proyecto_final',       

4. Inicia el server utilizando solo el comando node server.js en la carpeta de BACKEND. Te enviara este mensaje
"Servidor Express corriendo en http://localhost:3000"

EXTRA. Para el pago con MERCADO PAGO
Dejamos los datos de prueba para poder validar el pago.
Mastercard
5031 7557 3453 0604
123
11/30
Nombre: APRO
(DNI) 12345678
TESTUSER398565116028221393@testuser.com

🧑‍💻 Contribuyentes
Este proyecto fue desarrollado por el Grupo ALTF4.
 (Mauro Ulloa.Lider del proyecto, Full Stack Developer)(Juan Ignacio Vera.Desarrollador Frontend)(Lucas Sosa. Desarrollador Backend, Configuración DB)(Horacio Quiles. Desarrollador Full Stack)
