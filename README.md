# CineList
CineList es una aplicación full-stack de seguimiento de cine inspirada en Letterboxd. Califica, reseña y gestiona tu lista de películas. Desarrollada con Vanilla JS, Bootstrap y Node.js. 🎬🍿

## 📂 Estructura del Proyecto

```text
cine-project/
├── backend/                # Lógica del servidor (Node.js/Express)
│   ├── controllers/        # Funciones que procesan las peticiones (Lógica de negocio)
│   ├── models/             # Estructura de los datos (Usuarios, Reviews, Películas)
│   ├── routes/             # Definición de los endpoints de la API (/api/movies, etc.)
│   ├── middleware/         # Funciones de seguridad y validación (ej. Auth)
│   ├── data/               # Archivos JSON locales o configuración de base de datos
│   └── server.js           # Punto de entrada principal del servidor
├── frontend/               # Lógica del cliente y diseño
│   ├── assets/             # Recursos estáticos
│   │   ├── css/            # Estilos personalizados (además de Bootstrap)
│   │   └── img/            # Imágenes, logos y placeholders
│   ├── pages/              # Archivos HTML adicionales
│   ├──scripts/             # Scripts de js utilizados en el frontend
│   │  ├── services/        # Funciones para peticiones
│   │  ├── utils/           # Utilidades (formateo de fechas, etc.)
│   │  ├── auth.js          # Logica de autenticación
│   │  └── main.js          # Manipulación del DOM y lógica principal
│   └── index.html          # Punto de entrada principal (Home)
├── .gitignore              # Archivos y carpetas omitidos por Git (node_modules, .env)
├── package.json            # Gestión de dependencias y scripts del proyecto
└── README.md               # Documentación general del proyecto
