# Configuración de Google Cloud Translate

Este documento explica cómo configurar Google Cloud Translate para el script de traducción de posts.

## Opción 1: Usar Archivo de Credenciales JSON (Recomendado)

### Paso 1: Crear un Proyecto en Google Cloud

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Anota el **Project ID**

### Paso 2: Habilitar la API de Translation

1. Ve a [API Library](https://console.cloud.google.com/apis/library)
2. Busca "Cloud Translation API"
3. Haz clic en "Enable"

### Paso 3: Crear una Cuenta de Servicio

1. Ve a [Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts)
2. Haz clic en "Create Service Account"
3. Dale un nombre (ej: "blog-translator")
4. Haz clic en "Create and Continue"
5. Asigna el rol "Cloud Translation API User"
6. Haz clic en "Done"

### Paso 4: Crear y Descargar la Clave JSON

1. Haz clic en la cuenta de servicio que acabas de crear
2. Ve a la pestaña "Keys"
3. Haz clic en "Add Key" → "Create new key"
4. Selecciona "JSON"
5. Descarga el archivo JSON

### Paso 5: Configurar las Variables de Entorno

**Windows (PowerShell):**
```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\ruta\completa\al\archivo.json"
$env:GOOGLE_CLOUD_PROJECT="tu-project-id"
```

**Windows (CMD):**
```cmd
set GOOGLE_APPLICATION_CREDENTIALS=C:\ruta\completa\al\archivo.json
set GOOGLE_CLOUD_PROJECT=tu-project-id
```

**Linux/Mac:**
```bash
export GOOGLE_APPLICATION_CREDENTIALS="/ruta/completa/al/archivo.json"
export GOOGLE_CLOUD_PROJECT="tu-project-id"
```

**O crear un archivo `.env` en la raíz del proyecto:**
```
GOOGLE_APPLICATION_CREDENTIALS=./path/to/credentials.json
GOOGLE_CLOUD_PROJECT=tu-project-id
```

## Opción 2: Usar gcloud CLI (Alternativa)

Si tienes `gcloud` CLI instalado y configurado:

```bash
# Autenticarse
gcloud auth application-default login

# Establecer el proyecto
gcloud config set project tu-project-id
```

El script detectará automáticamente las credenciales de gcloud.

## Verificar la Configuración

Ejecuta el script y deberías ver:

```
✅ Google Cloud Translate inicializado correctamente
✅ Google Cloud Translate configurado
   Usando: tu-project-id
```

## Costos

Google Cloud Translate tiene un [plan gratuito](https://cloud.google.com/translate/pricing):
- **500,000 caracteres por mes** gratis
- Después: $20 por millón de caracteres

Para 18 posts traducidos a 3 idiomas, estimamos aproximadamente:
- ~50,000-100,000 caracteres por post
- Total: ~900,000-1,800,000 caracteres
- **Costo estimado: $0-20 USD** (dependiendo del tamaño de los posts)

## Troubleshooting

### Error: "Could not load the default credentials"

**Solución:** Asegúrate de que la variable `GOOGLE_APPLICATION_CREDENTIALS` apunte al archivo JSON correcto.

### Error: "Permission denied"

**Solución:** Verifica que la cuenta de servicio tenga el rol "Cloud Translation API User".

### Error: "API not enabled"

**Solución:** Asegúrate de haber habilitado la "Cloud Translation API" en tu proyecto.

### Error: "Quota exceeded"

**Solución:** Has excedido el límite gratuito. Espera hasta el próximo mes o actualiza tu plan de facturación.

## Seguridad

⚠️ **IMPORTANTE:** Nunca subas el archivo de credenciales JSON a Git. Agrégalo a `.gitignore`:

```
# Google Cloud credentials
*.json
!package.json
!package-lock.json
credentials/
```
