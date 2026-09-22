# Obtener Microsoft Translator GRATIS (2M caracteres/mes)

## 🆓 Plan Gratuito de Microsoft Azure Translator

**Límite gratuito:** 2 millones de caracteres por mes  
**Costo después:** $10 por millón de caracteres  
**Para 18 posts × 3 idiomas:** ~900K-1.8M caracteres = **COMPLETAMENTE GRATIS** ✅

## Pasos para Configurar (5 minutos)

### 1. Crear cuenta en Azure (si no tienes)
- Ve a: https://azure.microsoft.com/free/
- Crea una cuenta gratuita (requiere tarjeta pero no se cobra nada en el plan gratuito)

### 2. Crear recurso Translator
1. Ve a: https://portal.azure.com/
2. Haz clic en **"+ Create a resource"** (Crear un recurso)
3. Busca **"Translator"**
4. Selecciona **"Translator"** de Microsoft
5. Haz clic en **"Create"**

### 3. Configurar el recurso
- **Subscription:** Selecciona tu suscripción (puede ser la gratuita)
- **Resource group:** Crea uno nuevo o usa existente
- **Region:** Cualquiera (ej: "East US")
- **Name:** Un nombre para tu recurso (ej: "blog-translator")
- **Pricing tier:** Selecciona **"Free F0"** (2M caracteres/mes gratis)
- Haz clic en **"Review + create"** y luego **"Create"**

### 4. Obtener las credenciales
1. Una vez creado, ve al recurso
2. En el menú lateral, ve a **"Keys and Endpoint"**
3. Copia:
   - **Key 1** (o Key 2, cualquiera funciona)
   - **Location/Region** (ej: "eastus", "global")
   - **Endpoint** (ej: "https://api.cognitive.microsofttranslator.com")

### 5. Configurar variables de entorno

**Windows PowerShell:**
```powershell
$env:AZURE_TRANSLATOR_KEY="tu-key-aqui"
$env:AZURE_TRANSLATOR_ENDPOINT="https://api.cognitive.microsofttranslator.com"
$env:AZURE_TRANSLATOR_REGION="eastus"  # o "global"
```

**Windows CMD:**
```cmd
set AZURE_TRANSLATOR_KEY=tu-key-aqui
set AZURE_TRANSLATOR_ENDPOINT=https://api.cognitive.microsofttranslator.com
set AZURE_TRANSLATOR_REGION=eastus
```

**Linux/Mac:**
```bash
export AZURE_TRANSLATOR_KEY="tu-key-aqui"
export AZURE_TRANSLATOR_ENDPOINT="https://api.cognitive.microsofttranslator.com"
export AZURE_TRANSLATOR_REGION="eastus"
```

### 6. Ejecutar el script
```bash
npm run translate:blog:free
```

## Comparación de Opciones Gratuitas

| Servicio | Límite Gratuito | Facilidad |
|----------|----------------|-----------|
| **Microsoft Translator** | 2M caracteres/mes | ⭐⭐⭐⭐⭐ Muy fácil |
| Google Cloud Translate | 500K caracteres/mes | ⭐⭐⭐⭐ Fácil |
| DeepL | 500K caracteres/mes | ⭐⭐⭐⭐ Fácil |

## Notas Importantes

- ✅ **No se cobra nada** si te mantienes dentro del límite gratuito
- ✅ **2 millones de caracteres** es suficiente para traducir todos tus posts
- ✅ **Se renueva cada mes** automáticamente
- ⚠️ Azure puede pedir tarjeta de crédito, pero no se cobra en el plan gratuito
- ⚠️ Si excedes el límite, se cobrará automáticamente (puedes configurar alertas)

## Verificar Uso

Puedes verificar tu uso en:
https://portal.azure.com/ → Tu recurso Translator → "Metrics"
