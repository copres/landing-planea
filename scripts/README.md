# Scripts de Traducción de Blog

Este directorio contiene scripts para automatizar la traducción de los posts del blog a múltiples idiomas.

## Scripts Disponibles

### `translate-blog-posts.js`
Script principal para traducir todos los posts del blog a los idiomas configurados (inglés, francés, portugués).

**Uso:**
```bash
npm run translate:blog
```

**Características:**
- Lee todos los posts en español de `src/pages/blog/*.md`
- Traduce el frontmatter (título, descripción, categoría, tags)
- Traduce el contenido del post
- Actualiza enlaces internos según el idioma
- Guarda los archivos traducidos en `src/pages/blog/{lang}/`

**Requisitos:**
- Necesitas implementar la función `translateText()` con tu servicio de traducción preferido
- Opciones recomendadas:
  - Google Cloud Translate API
  - DeepL API
  - OpenAI API
  - Cualquier servicio REST de traducción

### `translate-blog-posts-ai.js`
Versión alternativa del script con mejor manejo de arrays y estructuras complejas en el frontmatter.

## Configuración

### ✅ Google Cloud Translate (Ya Configurado)

El script ya está configurado para usar Google Cloud Translate. Solo necesitas:

1. **Instalar la dependencia:**
```bash
npm install @google-cloud/translate
```

2. **Configurar las credenciales:**
   - Opción A: Variable de entorno `GOOGLE_APPLICATION_CREDENTIALS` apuntando a tu archivo JSON
   - Opción B: Variable de entorno `GOOGLE_CLOUD_PROJECT` con tu project ID
   - Opción C: Usar `gcloud auth application-default login`

3. **Ver instrucciones detalladas en:** `scripts/setup-google-translate.md`

**Ejemplo rápido:**
```bash
# Windows PowerShell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\credentials.json"
$env:GOOGLE_CLOUD_PROJECT="tu-project-id"

# Linux/Mac
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/credentials.json"
export GOOGLE_CLOUD_PROJECT="tu-project-id"
```

### Opción 2: Usar DeepL

1. Instala la dependencia:
```bash
npm install deepl-node
```

2. Modifica `translateText()`:
```javascript
import * as deepl from 'deepl-node';

const translator = new deepl.Translator('tu-api-key');

async function translateText(text, targetLang) {
  const langMap = { 'en': 'en-US', 'fr': 'fr', 'pt': 'pt-BR' };
  const result = await translator.translateText(text, 'es', langMap[targetLang]);
  return result.text;
}
```

### Opción 3: Usar OpenAI

1. Instala la dependencia:
```bash
npm install openai
```

2. Modifica `translateText()`:
```javascript
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: 'tu-api-key' });

async function translateText(text, targetLang) {
  const langMap = { 'en': 'English', 'fr': 'French', 'pt': 'Portuguese' };
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{
      role: 'system',
      content: `Translate the following text to ${langMap[targetLang]}. Preserve markdown formatting, HTML tags like <strong>metroKUBIKO</strong>, and technical terms.`
    }, {
      role: 'user',
      content: text
    }]
  });
  return response.choices[0].message.content;
}
```

## Estructura de Archivos

Después de ejecutar el script, la estructura será:

```
src/pages/blog/
├── *.md                    # Posts originales en español
├── en/
│   └── *.md               # Posts traducidos al inglés
├── fr/
│   └── *.md               # Posts traducidos al francés
└── pt/
    └── *.md               # Posts traducidos al portugués
```

## Notas

- El script preserva el formato markdown
- Los enlaces internos se actualizan automáticamente según el idioma
- Las categorías tienen traducciones predefinidas
- El nombre "metroKUBIKO" se preserva en todas las traducciones
- Los tags HTML como `<strong>` se mantienen intactos

## Troubleshooting

Si encuentras errores:

1. Verifica que todas las dependencias estén instaladas
2. Asegúrate de tener credenciales válidas para tu servicio de traducción
3. Revisa los límites de rate de tu API
4. Verifica que las carpetas de destino existan o tengan permisos de escritura
