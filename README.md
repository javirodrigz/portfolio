# Portafolio de Javier Rodríguez

Primer borrador estático del rediseño del portafolio. No requiere instalación de dependencias ni proceso de compilación.

La estructura prioriza casos de estudio breves: reto, audiencia, aportación personal, decisión de diseño, proceso y evidencia. Los proyectos corporativos se presentan sin información interna o confidencial.

## Vista local

Abre `index.html` en un navegador o inicia un servidor estático desde este directorio.

## Archivos

- `index.html`: narrativa, casos de estudio, proceso, experiencia y contacto.
- `index-en.html`: versión completa en inglés para oportunidades internacionales.
- `styles.css`: estilo responsivo y variables de color al inicio del archivo.
- `script.js`: navegación, menú móvil, navegación suave y revelado de tarjetas. Los casos utilizan elementos nativos desplegables.
- `hero-puzzle.js`: rompecabezas isométrico con relleno blanco al 80% y contornos del dorado del sitio. Se ensambla al primer desplazamiento hacia abajo, una vez por carga, con un recorrido ease-in por pieza. La última tarda más, crece un 8%, se ilumina en dorado y recupera su estado normal. Respeta la preferencia de movimiento reducido.
- `assets/vendor/gsap-3.12.5.min.js`: GSAP incluido localmente con su aviso de licencia para la animación del Hero; si no está disponible, se muestra la figura ensamblada.
- `assets/`: capturas organizadas por proyecto; cada caso utiliza tres imágenes y carga los videos de Vimeo bajo demanda.

El contenido se basa en el portafolio actual de Javier: diseño instruccional, animación y arte digital; experiencia en Huawei Technologies México, Continental Automotive México y AUMOVIO México; y los proyectos mostrados en el sitio actual.
