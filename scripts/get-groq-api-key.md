# Obtener API Key de Groq (GRATIS, sin tarjeta)

## 🆓 Groq - Completamente Gratis

**Ventajas:**
- ✅ **Sin tarjeta de crédito** requerida
- ✅ **Límite generoso** en el plan gratuito
- ✅ **Ultra-rápido** - Inferencia en milisegundos
- ✅ **Modelos avanzados** - Llama 3.1, Mixtral, etc.

## Pasos para Obtener API Key (2 minutos)

### 1. Crear cuenta en Groq
1. Ve a: https://console.groq.com/
2. Haz clic en **"Sign Up"** o **"Get Started"**
3. Crea una cuenta (puedes usar Google, GitHub, o email)
4. **NO se requiere tarjeta de crédito** ✅

### 2. Crear API Key
1. Una vez dentro del dashboard, ve a: https://console.groq.com/keys
2. Haz clic en **"Create API Key"**
3. Dale un nombre (ej: "blog-translator")
4. **Copia la API Key** (se mostrará solo una vez)
5. ⚠️ **Guárdala en un lugar seguro**

### 3. Configurar y Ejecutar

**Windows PowerShell:**
```powershell
$env:GROQ_API_KEY="tu-api-key-aqui"
npm run translate:blog:groq
```

**Windows CMD:**
```cmd
set GROQ_API_KEY=tu-api-key-aqui
npm run translate:blog:groq
```

**Linux/Mac:**
```bash
export GROQ_API_KEY="tu-api-key-aqui"
npm run translate:blog:groq
```

## Límites del Plan Gratuito

Groq ofrece un plan gratuito generoso:
- **Requests por minuto:** Varía según el modelo
- **Modelo usado:** Llama 3.1 70B (muy rápido y preciso)
- **Sin límite de caracteres** en el plan gratuito (solo límites de rate)

Para 18 posts traducidos a 3 idiomas, debería funcionar perfectamente dentro del plan gratuito.

## Modelos Disponibles

El script usa `llama-3.1-70b-versatile` que es:
- ✅ Gratis
- ✅ Muy rápido
- ✅ Excelente para traducción
- ✅ Preserva formato markdown

## Seguridad

⚠️ **IMPORTANTE:** Nunca subas tu API Key a Git. Úsala solo como variable de entorno.

## Troubleshooting

### Error: "Invalid API Key"
- Verifica que copiaste la API Key completa
- Asegúrate de que la variable de entorno esté configurada correctamente

### Error: "Rate limit exceeded"
- Espera unos minutos y vuelve a intentar
- El plan gratuito tiene límites de rate, pero son generosos

### Error: "Model not found"
- El script usa `llama-3.1-70b-versatile` que debería estar disponible
- Si hay problemas, puedes cambiar el modelo en el script
