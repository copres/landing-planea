import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración - Microsoft Translator (Azure) - GRATIS hasta 2M caracteres/mes
const AZURE_TRANSLATOR_KEY = process.env.AZURE_TRANSLATOR_KEY || '';
const AZURE_TRANSLATOR_ENDPOINT = process.env.AZURE_TRANSLATOR_ENDPOINT || 'https://api.cognitive.microsofttranslator.com';
const AZURE_TRANSLATOR_REGION = process.env.AZURE_TRANSLATOR_REGION || 'global';

if (!AZURE_TRANSLATOR_KEY) {
  console.error('❌ Error: AZURE_TRANSLATE_KEY no está configurada');
  console.log('\n💡 Para usar este script GRATIS con Microsoft Translator:');
  console.log('   1. Ve a: https://portal.azure.com/');
  console.log('   2. Crea un recurso "Translator" (gratis hasta 2M caracteres/mes)');
  console.log('   3. Obtén la Key y Endpoint');
  console.log('   4. Configura las variables:');
  console.log('      $env:AZURE_TRANSLATOR_KEY="tu-key"');
  console.log('      $env:AZURE_TRANSLATOR_ENDPOINT="tu-endpoint"');
  console.log('      $env:AZURE_TRANSLATOR_REGION="tu-region"');
  console.log('   5. Ejecuta: npm run translate:blog:free\n');
  process.exit(1);
}

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

// Mapeo de códigos de idioma para Microsoft Translator
const languageCodes = {
  'en': 'en',
  'fr': 'fr',
  'pt': 'pt'
};

// Función para traducir usando Microsoft Translator API (GRATIS)
async function translateText(text, targetLang, context = '') {
  if (!text || !text.trim()) {
    return text;
  }
  
  const targetLanguageCode = languageCodes[targetLang] || targetLang;
  
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
    
    // Llamar a Microsoft Translator API
    const url = `${AZURE_TRANSLATOR_ENDPOINT}/translate?api-version=3.0&from=es&to=${targetLanguageCode}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': AZURE_TRANSLATOR_KEY,
        'Ocp-Apim-Subscription-Region': AZURE_TRANSLATOR_REGION,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([{ text: textToTranslate }])
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    const translatedText = result[0]?.translations[0]?.text || textToTranslate;
    
    // Restaurar los placeholders
    let finalText = translatedText
      .replace(new RegExp(placeholders.metroKUBIKO, 'gi'), 'metroKUBIKO')
      .replace(new RegExp(placeholders.strongOpen, 'g'), '<strong>')
      .replace(new RegExp(placeholders.strongClose, 'g'), '</strong>');
    
    // Pequeña pausa para evitar rate limits
    await new Promise(resolve => setTimeout(resolve, 100));
    
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
  
  console.log('\n🚀 Script de Traducción GRATIS (Microsoft Translator)');
  console.log('='.repeat(60));
  console.log('💰 GRATIS: Hasta 2 millones de caracteres por mes');
  
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
      await new Promise(resolve => setTimeout(resolve, 200));
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
