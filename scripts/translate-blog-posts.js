import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';
import { v2 as translateV2 } from '@google-cloud/translate';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Inicializar Google Cloud Translate
// Puedes configurarlo de varias maneras:
// 1. Variable de entorno GOOGLE_APPLICATION_CREDENTIALS apuntando a tu archivo JSON de credenciales
// 2. Variable de entorno GOOGLE_CLOUD_PROJECT con tu project ID
// 3. Pasando opciones directamente al constructor

let translateClient = null;

try {
  // Intentar inicializar con credenciales del entorno
  const projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT;
  const keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  
  if (projectId || keyFilename) {
    translateClient = new translateV2.Translate({
      projectId: projectId,
      keyFilename: keyFilename,
    });
    console.log('✅ Google Cloud Translate inicializado correctamente');
  } else {
    console.log('⚠️  Google Cloud Translate no configurado. Usando variables de entorno por defecto.');
    // Intentar inicializar sin opciones (usará las credenciales por defecto de gcloud)
    translateClient = new translateV2.Translate();
  }
} catch (error) {
  console.error('❌ Error inicializando Google Cloud Translate:', error.message);
  console.log('💡 Asegúrate de tener configuradas las credenciales de Google Cloud');
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

// Mapeo de códigos de idioma para Google Translate
const languageCodes = {
  'en': 'en',
  'fr': 'fr',
  'pt': 'pt'
};

// Función para traducir texto usando Google Cloud Translate
async function translateText(text, targetLang, context = '') {
  if (!translateClient) {
    throw new Error('Google Cloud Translate no está inicializado');
  }
  
  // Si el texto está vacío, retornar vacío
  if (!text || !text.trim()) {
    return text;
  }
  
  // Obtener el código de idioma
  const targetLanguageCode = languageCodes[targetLang] || targetLang;
  
  try {
    // Preservar el nombre metroKUBIKO y tags HTML
    // Reemplazar temporalmente para que no se traduzca
    const placeholders = {
      metroKUBIKO: 'METROKUBIKO_PLACEHOLDER',
      strongOpen: 'STRONG_OPEN_PLACEHOLDER',
      strongClose: 'STRONG_CLOSE_PLACEHOLDER'
    };
    
    let textToTranslate = text
      .replace(/metroKUBIKO/gi, placeholders.metroKUBIKO)
      .replace(/<strong>/g, placeholders.strongOpen)
      .replace(/<\/strong>/g, placeholders.strongClose);
    
    // Traducir el texto
    const [translation] = await translateClient.translate(textToTranslate, targetLanguageCode);
    
    // Restaurar los placeholders
    let translatedText = translation
      .replace(new RegExp(placeholders.metroKUBIKO, 'gi'), 'metroKUBIKO')
      .replace(new RegExp(placeholders.strongOpen, 'g'), '<strong>')
      .replace(new RegExp(placeholders.strongClose, 'g'), '</strong>');
    
    // Pequeña pausa para evitar rate limits
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return translatedText;
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
        // Preservar encabezados y listas
        if (para.match(/^#+\s/) || para.match(/^[-*+]\s/) || para.match(/^\d+\.\s/)) {
          return await translateText(para, targetLang, 'content');
        }
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
  
  console.log('\n🚀 Script de Traducción de Posts del Blog');
  console.log('='.repeat(60));
  
  // Buscar todos los archivos .md en la carpeta blog (excluyendo subcarpetas de idiomas)
  const postFiles = await glob('*.md', {
    cwd: blogDir,
    ignore: ['**/en/**', '**/fr/**', '**/pt/**']
  });
  
  console.log(`\n📊 Resumen:`);
  console.log(`   Posts encontrados: ${postFiles.length}`);
  console.log(`   Idiomas objetivo: ${languages.map(l => languageNames[l] || l).join(', ')}`);
  console.log(`   Total de archivos: ${postFiles.length * languages.length}`);
  
  console.log(`\n✅ Google Cloud Translate configurado`);
  console.log(`   Usando: ${process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT || 'credenciales por defecto'}\n`);
  
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
