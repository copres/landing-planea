# Obtener API Key de Google Cloud Translate

## Pasos Rápidos

### 1. Ir a Google Cloud Console
https://console.cloud.google.com/

### 2. Crear o Seleccionar un Proyecto
- Si no tienes proyecto, crea uno nuevo
- Anota el **Project ID**

### 3. Habilitar la API de Translation
1. Ve a: https://console.cloud.google.com/apis/library/translate.googleapis.com
2. Selecciona tu proyecto
3. Haz clic en **"Enable"** (Habilitar)

### 4. Crear una API Key
1. Ve a: https://console.cloud.google.com/apis/credentials
2. Haz clic en **"+ CREATE CREDENTIALS"**
3. Selecciona **"API key"**
4. Se generará una API Key
5. **Copia la API Key** (se mostrará solo una vez)

### 5. (Opcional) Restringir la API Key
Para mayor seguridad, puedes restringir la API Key:
1. Haz clic en la API Key recién creada
2. En "API restrictions", selecciona "Restrict key"
3. Selecciona "Cloud Translation API"
4. Guarda los cambios

### 6. Usar la API Key

**Windows PowerShell:**
```powershell
$env:GOOGLE_TRANSLATE_API_KEY="tu-api-key-aqui"
npm run translate:blog:apikey
```

**Windows CMD:**
```cmd
set GOOGLE_TRANSLATE_API_KEY=tu-api-key-aqui
npm run translate:blog:apikey
```

**Linux/Mac:**
```bash
export GOOGLE_TRANSLATE_API_KEY="tu-api-key-aqui"
npm run translate:blog:apikey
```

## Costos

- **Plan gratuito:** 500,000 caracteres por mes
- **Después:** $20 por millón de caracteres

Para 18 posts traducidos a 3 idiomas, estimamos aproximadamente:
- ~50,000-100,000 caracteres por post
- Total: ~900,000-1,800,000 caracteres
- **Costo estimado: $0-20 USD**

## Seguridad

⚠️ **IMPORTANTE:** Nunca subas tu API Key a Git. Úsala solo como variable de entorno.
