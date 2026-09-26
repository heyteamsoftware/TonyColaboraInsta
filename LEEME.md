# Colabora con Instagram · CIFP Tony Gallardo

Web simple para subir fotos y vídeos a una carpeta de Google Drive.

## Puesta en marcha (10 min)

1. **Carpeta en Drive**: crea una carpeta y copia su ID (lo que aparece tras `/folders/` en la URL).
2. **Apps Script**: entra en https://script.google.com → *Nuevo proyecto*, pega el contenido de `Code.gs` y pon el `FOLDER_ID`.
   - En *Configuración del proyecto* activa "Mostrar el archivo de manifiesto appsscript.json" y asegúrate de que contiene:
     ```json
     "oauthScopes": [
       "https://www.googleapis.com/auth/drive",
       "https://www.googleapis.com/auth/script.external_request"
     ]
     ```
3. **Implementar** → *Nueva implementación* → tipo *Aplicación web*:
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier usuario**
   - Autoriza los permisos y copia la URL que termina en `/exec`.
4. En `index.html`, pega esa URL en `API_URL`.
5. Publica `index.html` en cualquier hosting estático (GitHub Pages, Netlify, o el servidor del centro).

## Notas

- Los archivos se guardan en tu Drive con la fecha delante del nombre; ocupan tu cuota.
- Los vídeos van directos del navegador a Drive, así que no hay límite pequeño de Apps Script (tope en la web: 500 MB, cambiable en `MAX_MB`).
- Cualquiera con el enlace de la web puede subir. Si hace falta moderación, revisa la carpeta periódicamente.
- Si cambias el dominio de la web, la subida sigue funcionando (el origen se envía en cada petición).
