# TechSolutions S.A. - Backend API 🚀

Sistema de gestión para prestación de servicios tecnológicos y consultoría empresarial.

## 🛠️ Tecnologías utilizadas
* **Runtime:** Node.js
* **Framework:** Express.js
* **Base de Datos:** Supabase (PostgreSQL)
* **Seguridad:** JSON Web Tokens (JWT), Bcrypt, Helmet, Express Rate Limit.

## 🔐 Características de Seguridad
* **Autenticación:** Implementación de JWT para protección de rutas privadas.
* **Seguridad de Headers:** Uso de Helmet para prevenir ataques comunes.
* **Limitación de Tasa:** Protección contra ataques de fuerza bruta mediante Rate Limiting.
* **Cifrado:** Contraseñas y respuestas de seguridad encriptadas con Bcrypt.

## 📌 Endpoints Principales
* `POST /api/users/login` - Inicio de sesión y generación de Token.
* `GET /api/projects` - Listado de proyectos (Protegido).
* `GET /api/project_team` - Integrantes por proyecto (Protegido).
* `POST /api/logs` - Registro de bitácora (Protegido).

## 🚀 Instalación Local
1. Clonar el repositorio.
2. Ejecutar `npm install`.
3. Configurar las variables de entorno en un archivo `.env`.
4. Iniciar con `npm start`.
5.
