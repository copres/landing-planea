import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';
import Groq from 'groq-sdk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración - Groq API (GRATIS, sin tarjeta de crédito)
// Intenta leer desde .env si existe
let GROQ_API_KEY = process.env.GROQ_API_KEY || '';

// Si no está en variables de entorno, intentar leer desde .env
if (!GROQ_API_KEY) {
  try {
    const envPath = path.join(__dirname, '..', '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      const match = envContent.match(/GROQ_API_KEY=(.+)/);
      if (match) {
        GROQ_API_KEY = match[1].trim().replace(/^["']|["']$/g, '');
      }
    }
  } catch (e) {
    // Ignorar errores al leer .env
  }
}

if (!GROQ_API_KEY) {
  console.error('❌ Error: GROQ_API_KEY no está configurada');
  console.log('\n💡 Opciones para configurar:');
  console.log('\n   Opción 1: Variable de entorno (temporal):');
  console.log('   PowerShell: $env:GROQ_API_KEY="tu-api-key"');
  console.log('   CMD:        set GROQ_API_KEY=tu-api-key');
  console.log('   Linux/Mac:  export GROQ_API_KEY="tu-api-key"');
  console.log('\n   Opción 2: Archivo .env (permanente):');
  console.log('   Crea un archivo .env en la raíz del proyecto con:');
  console.log('   GROQ_API_KEY=tu-api-key');
  console.log('\n   Para obtener tu API Key:');
  console.log('   1. Ve a: https://console.groq.com/');
  console.log('   2. Ve a API Keys y crea una nueva key');
  console.log('   3. Copia la key y configúrala\n');
  process.exit(1);
}

// Inicializar Groq
const groq = new Groq({
  apiKey: GROQ_API_KEY,
});

// Mapeo de categorías a diferentes idiomas
const categoryTranslations = {
  'en': {
    'Gestión de Equipos': 'Team Management',
    'Implementación': 'Implementation',
    'Capacitación y adopción': 'Training and Adoption',
    'Presupuestos': 'Budgets',
    'Programación': 'Scheduling',
    'Control de Obras': 'Construction Control',
    'Software': 'Software',
    'Análisis de Precios': 'Price Analysis',
  },
  'fr': {
    'Gestión de Equipos': 'Gestion d\'Équipe',
    'Implementación': 'Implémentation',
    'Capacitación y adopción': 'Formation et Adoption',
    'Presupuestos': 'Budgets',
    'Programación': 'Planification',
    'Control de Obras': 'Contrôle de Chantier',
    'Software': 'Logiciel',
    'Análisis de Precios': 'Analyse des Prix',
  },
  'pt': {
    'Gestión de Equipos': 'Gestão de Equipes',
    'Implementación': 'Implementação',
    'Capacitación y adopción': 'Treinamento e Adoção',
    'Presupuestos': 'Orçamentos',
    'Programación': 'Programação',
    'Control de Obras': 'Controle de Obras',
    'Software': 'Software',
    'Análisis de Precios': 'Análise de Preços',
  }
};

// Mapeo de nombres de idiomas
const languageNames = {
  'en': 'English',
  'fr': 'French',
  'pt': 'Portuguese'
};

// Mapeo de nombres de idiomas completos para el prompt
const languageNamesFull = {
  'en': 'English',
  'fr': 'French',
  'pt': 'Portuguese (Brazilian)'
};

// Función para traducir usando Groq (Llama 3.1)
async function translateText(text, targetLang, context = '') {
  if (!text || !text.trim()) {
    return text;
  }
  
  const targetLanguageName = languageNamesFull[targetLang] || targetLang;
  
  try {
    // Preservar el nombre metroKUBIKO y tags HTML
    const placeholders = {
      metroKUBIKO: 'METROKUBIKO_PLACEHOLDER',
      strongOpen: 'STRONG_OPEN_PLACEHOLDER',
      strongClose: 'STRONG_CLOSE_PLACEHOLDER'
    };
    
    let textToTranslate = text
      .replace(/metroKUBIKO/gi, placeholders.metroKUBIKO)
      .replace(/<strong>/g, placeholders.strongOpen)
      .replace(/<\/strong>/g, placeholders.strongClose);
    
    // Crear prompt para traducción
    const prompt = `Translate the following text from Spanish to ${targetLanguageName}. 
Preserve all markdown formatting, HTML tags (like STRONG_OPEN_PLACEHOLDER and STRONG_CLOSE_PLACEHOLDER), 
links, code blocks, and special terms. Keep METROKUBIKO_PLACEHOLDER as is. 
Only translate the content, do not add explanations or comments.

Text to translate:
${textToTranslate}`;

    // Llamar a Groq API
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a professional translator specializing in construction and software terminology. 
Translate accurately while preserving all formatting, HTML tags, and technical terms.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'llama-3.3-70b-versatile', // Modelo actualizado y gratuito de Groq
      temperature: 0.3, // Baja temperatura para traducciones más consistentes
      max_tokens: 4000,
    });
    
    const translatedText = completion.choices[0]?.message?.content || textToTranslate;
    
    // Restaurar los placeholders
    let finalText = translatedText
      .replace(new RegExp(placeholders.metroKUBIKO, 'gi'), 'metroKUBIKO')
      .replace(new RegExp(placeholders.strongOpen, 'g'), '<strong>')
      .replace(new RegExp(placeholders.strongClose, 'g'), '</strong>');
    
    // Limpiar el texto (remover posibles explicaciones del modelo)
    finalText = finalText.trim();
    // Si el modelo agregó algo antes o después, intentar extraer solo la traducción
    if (finalText.includes('Text to translate:') || finalText.includes('Translation:')) {
      const lines = finalText.split('\n');
      const translationStart = lines.findIndex(line => 
        line.toLowerCase().includes('translation') || 
        !line.toLowerCase().includes('translate') && line.trim().length > 0
      );
      if (translationStart !== -1) {
        finalText = lines.slice(translationStart + 1).join('\n').trim();
      }
    }
    
    // Pequeña pausa para evitar rate limits
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return finalText;
  } catch (error) {
    console.error(`  ⚠️  Error traduciendo a ${targetLang}:`, error.message);
    // En caso de error, retornar el texto original
    return text;
  }
}

// Función para actualizar enlaces internos según el idioma
function updateLinks(content, targetLang) {
  const routeMap = {
    'es': '/es',
    'en': '/en',
    'fr': '/fr',
    'pt': '/pt'
  };
  
  const prefix = routeMap[targetLang] || '';
  
  // Actualizar enlaces markdown [texto](/ruta)
  content = content.replace(
    /\[([^\]]+)\]\((\/[^\)]+)\)/g,
    (match, text, route) => {
      // Si la ruta no tiene prefijo de idioma y no es una ruta absoluta externa
      if (!route.startsWith('/es/') && !route.startsWith('/en/') && 
          !route.startsWith('/fr/') && !route.startsWith('/pt/') &&
          !route.startsWith('http') && route.startsWith('/') && route !== '/') {
        return `[${text}](${prefix}${route})`;
      }
      return match;
    }
  );
  
  return content;
}

// Función para parsear el frontmatter
function parseFrontmatter(content) {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);
  
  if (!match) {
    return { frontmatter: {}, body: content };
  }
  
  const frontmatterText = match[1];
  const body = match[2];
  const frontmatter = {};
  
  // Parsear el frontmatter línea por línea
  const lines = frontmatterText.split('\n');
  let currentKey = null;
  let currentValue = [];
  let inArray = false;
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    const trimmed = line.trim();
    
    if (!trimmed) continue;
    
    // Detectar inicio de clave
    const keyMatch = trimmed.match(/^(\w+):\s*(.*)$/);
    if (keyMatch) {
      // Guardar la clave anterior
      if (currentKey) {
        const value = currentValue.join('\n').trim();
        if (inArray) {
          try {
            frontmatter[currentKey] = JSON.parse(value + (value.endsWith(']') ? '' : ']'));
          } catch (e) {
            frontmatter[currentKey] = value;
          }
        } else {
          frontmatter[currentKey] = value;
        }
      }
      
      currentKey = keyMatch[1];
      const value = keyMatch[2].trim();
      
      if (value.startsWith('[') && value.endsWith(']')) {
        // Array en una línea
        try {
          frontmatter[currentKey] = JSON.parse(value);
        } catch (e) {
          frontmatter[currentKey] = value;
        }
        currentKey = null;
        currentValue = [];
        inArray = false;
      } else if (value.startsWith('[') && !value.endsWith(']')) {
        // Array multilínea
        inArray = true;
        currentValue = [value];
      } else if (value.startsWith('"') && value.endsWith('"')) {
        // String con comillas
        frontmatter[currentKey] = value.slice(1, -1).replace(/\\"/g, '"');
        currentKey = null;
        currentValue = [];
      } else if (value) {
        currentValue = [value];
        inArray = false;
      } else {
        currentValue = [];
        inArray = false;
      }
    } else if (currentKey) {
      // Continuación del valor
      if (inArray) {
        if (trimmed === ']') {
          inArray = false;
          try {
            frontmatter[currentKey] = JSON.parse(currentValue.join('') + ']');
          } catch (e) {
            frontmatter[currentKey] = currentValue.join('\n');
          }
          currentKey = null;
          currentValue = [];
        } else {
          currentValue.push(line);
        }
      } else {
        currentValue.push(line);
      }
    }
  }
  
  // Guardar la última clave
  if (currentKey) {
    const value = currentValue.join('\n').trim();
    if (inArray) {
      try {
        frontmatter[currentKey] = JSON.parse(value + (value.endsWith(']') ? '' : ']'));
      } catch (e) {
        frontmatter[currentKey] = value;
      }
    } else {
      frontmatter[currentKey] = value;
    }
  }
  
  return { frontmatter, body };
}

// Función para generar el frontmatter
function stringifyFrontmatter(frontmatter) {
  const lines = ['---'];
  
  for (const [key, value] of Object.entries(frontmatter)) {
    if (value === null || value === undefined) continue;
    
    if (Array.isArray(value)) {
      lines.push(`${key}: ${JSON.stringify(value)}`);
    } else if (typeof value === 'object') {
      lines.push(`${key}: ${JSON.stringify(value)}`);
    } else if (typeof value === 'string') {
      // Si contiene caracteres especiales, usar comillas
      if (value.includes(':') || value.includes('"') || value.includes('\n') || value.includes('[')) {
        const escaped = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
        lines.push(`${key}: "${escaped}"`);
      } else {
        lines.push(`${key}: ${value}`);
      }
    } else {
      lines.push(`${key}: ${value}`);
    }
  }
  
  lines.push('---');
  return lines.join('\n');
}

// Función principal para traducir un post
async function translatePost(postPath, targetLang) {
  const fileName = path.basename(postPath);
  console.log(`\n📝 ${fileName} → ${languageNames[targetLang] || targetLang}`);
  
  try {
    const content = fs.readFileSync(postPath, 'utf-8');
    const { frontmatter, body } = parseFrontmatter(content);
    
    // Crear frontmatter traducido
    const translatedFrontmatter = { ...frontmatter };
    
    // Traducir título
    if (frontmatter.title) {
      const titleWithoutTags = frontmatter.title.replace(/<strong>metroKUBIKO<\/strong>/g, 'metroKUBIKO');
      const translatedTitle = await translateText(titleWithoutTags, targetLang, 'title');
      translatedFrontmatter.title = translatedTitle.replace(/metroKUBIKO/g, '<strong>metroKUBIKO</strong>');
    }
    
    // Traducir descripción
    if (frontmatter.description) {
      const descWithoutTags = frontmatter.description.replace(/<strong>metroKUBIKO<\/strong>/g, 'metroKUBIKO');
      const translatedDesc = await translateText(descWithoutTags, targetLang, 'description');
      translatedFrontmatter.description = translatedDesc.replace(/metroKUBIKO/g, '<strong>metroKUBIKO</strong>');
    }
    
    // Traducir categoría
    if (frontmatter.category) {
      if (categoryTranslations[targetLang]?.[frontmatter.category]) {
        translatedFrontmatter.category = categoryTranslations[targetLang][frontmatter.category];
      } else {
        translatedFrontmatter.category = await translateText(frontmatter.category, targetLang, 'category');
      }
    }
    
    // Traducir tags
    if (Array.isArray(frontmatter.tags)) {
      translatedFrontmatter.tags = await Promise.all(
        frontmatter.tags.map(tag => translateText(tag, targetLang, 'tag'))
      );
    }
    
    // Actualizar layout path
    if (frontmatter.layout) {
      translatedFrontmatter.layout = targetLang !== 'es' 
        ? '../../../layouts/BlogPost.astro'
        : '../../layouts/BlogPost.astro';
    }
    
    // Traducir el cuerpo del post
    // Dividir en párrafos para mejor manejo
    const paragraphs = body.split(/\n\n+/);
    const translatedParagraphs = await Promise.all(
      paragraphs.map(async (para) => {
        if (!para.trim()) return para;
        return await translateText(para, targetLang, 'content');
      })
    );
    
    let translatedBody = translatedParagraphs.join('\n\n');
    
    // Actualizar enlaces
    translatedBody = updateLinks(translatedBody, targetLang);
    
    // Crear el contenido final
    const translatedContent = `${stringifyFrontmatter(translatedFrontmatter)}\n\n${translatedBody}`;
    
    // Crear la carpeta de destino
    const targetDir = path.join(__dirname, '..', 'src', 'pages', 'blog', targetLang);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    // Guardar el archivo
    const targetPath = path.join(targetDir, fileName);
    fs.writeFileSync(targetPath, translatedContent, 'utf-8');
    
    console.log(`  ✅ Guardado en: blog/${targetLang}/${fileName}`);
    return true;
  } catch (error) {
    console.error(`  ❌ Error: ${error.message}`);
    return false;
  }
}

// Función principal
async function main() {
  const blogDir = path.join(__dirname, '..', 'src', 'pages', 'blog');
  const languages = ['en', 'fr', 'pt'];
  
  console.log('\n🚀 Script de Traducción GRATIS con Groq');
  console.log('='.repeat(60));
  console.log('💰 GRATIS: Sin tarjeta de crédito, límite generoso');
  console.log('⚡ Rápido: Inferencia ultra-rápida con Llama 3.1');
  
  // Buscar todos los archivos .md en la carpeta blog (excluyendo subcarpetas de idiomas)
  const postFiles = await glob('*.md', {
    cwd: blogDir,
    ignore: ['**/en/**', '**/fr/**', '**/pt/**']
  });
  
  console.log(`\n📊 Resumen:`);
  console.log(`   Posts encontrados: ${postFiles.length}`);
  console.log(`   Idiomas objetivo: ${languages.map(l => languageNames[l] || l).join(', ')}`);
  console.log(`   Total de archivos: ${postFiles.length * languages.length}`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const postFile of postFiles) {
    const postPath = path.join(blogDir, postFile);
    
    for (const lang of languages) {
      const success = await translatePost(postPath, lang);
      if (success) {
        successCount++;
      } else {
        errorCount++;
      }
      
      // Pequeña pausa para no sobrecargar APIs
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`✨ Proceso completado!`);
  console.log(`   ✅ Exitosos: ${successCount}`);
  console.log(`   ❌ Errores: ${errorCount}`);
  console.log(`\n`);
}

// Ejecutar el script
main().catch(console.error);
