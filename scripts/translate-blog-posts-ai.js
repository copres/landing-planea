import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
      // Si la ruta no tiene prefijo de idioma, agregarlo
      if (!route.startsWith('/es/') && !route.startsWith('/en/') && 
          !route.startsWith('/fr/') && !route.startsWith('/pt/') &&
          route.startsWith('/') && route !== '/') {
        return `[${text}](${prefix}${route})`;
      }
      return match;
    }
  );
  
  return content;
}

// Función para parsear el frontmatter de manera más robusta
function parseFrontmatter(content) {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);
  
  if (!match) {
    return { frontmatter: {}, body: content };
  }
  
  const frontmatterText = match[1];
  const body = match[2];
  const frontmatter = {};
  
  // Parsear el frontmatter de manera más simple
  const lines = frontmatterText.split('\n');
  let currentKey = null;
  let currentValue = [];
  let inArray = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (!line) continue;
    
    // Detectar inicio de clave
    const keyMatch = line.match(/^(\w+):\s*(.*)$/);
    if (keyMatch) {
      // Guardar la clave anterior
      if (currentKey) {
        if (currentValue.length === 1 && !inArray) {
          frontmatter[currentKey] = currentValue[0];
        } else {
          frontmatter[currentKey] = currentValue.join('\n');
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
        if (line === ']') {
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
    if (currentValue.length === 1 && !inArray) {
      frontmatter[currentKey] = currentValue[0];
    } else {
      frontmatter[currentKey] = currentValue.join('\n');
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
      // Escapar comillas y saltos de línea
      const escaped = value.replace(/"/g, '\\"').replace(/\n/g, '\\n');
      if (value.includes(':') || value.includes('"') || value.includes('\n')) {
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

// Función para traducir usando el modelo de IA disponible
// Esta función será llamada por el script principal
async function translateWithAI(text, targetLang, context = '') {
  // Esta es una función placeholder
  // En producción, aquí se integraría con un servicio de traducción real
  // Por ahora, retornamos el texto original para que el usuario pueda
  // reemplazarlo con su propia implementación de traducción
  
  console.log(`  ⚠️  Traducción pendiente: "${text.substring(0, 50)}..." → ${targetLang}`);
  return text;
}

// Función principal para traducir un post
async function translatePost(postPath, targetLang, translateFn) {
  const fileName = path.basename(postPath);
  console.log(`\n📝 Procesando: ${fileName} → ${targetLang}`);
  
  try {
    const content = fs.readFileSync(postPath, 'utf-8');
    const { frontmatter, body } = parseFrontmatter(content);
    
    // Crear frontmatter traducido
    const translatedFrontmatter = { ...frontmatter };
    
    // Traducir título
    if (frontmatter.title) {
      console.log(`  🔄 Traduciendo título...`);
      translatedFrontmatter.title = await translateFn(
        frontmatter.title.replace(/<strong>metroKUBIKO<\/strong>/g, 'metroKUBIKO'),
        targetLang,
        'title'
      ).then(t => t.replace(/metroKUBIKO/g, '<strong>metroKUBIKO</strong>'));
    }
    
    // Traducir descripción
    if (frontmatter.description) {
      console.log(`  🔄 Traduciendo descripción...`);
      translatedFrontmatter.description = await translateFn(
        frontmatter.description.replace(/<strong>metroKUBIKO<\/strong>/g, 'metroKUBIKO'),
        targetLang,
        'description'
      ).then(t => t.replace(/metroKUBIKO/g, '<strong>metroKUBIKO</strong>'));
    }
    
    // Traducir categoría
    if (frontmatter.category) {
      if (categoryTranslations[targetLang]?.[frontmatter.category]) {
        translatedFrontmatter.category = categoryTranslations[targetLang][frontmatter.category];
      } else {
        console.log(`  🔄 Traduciendo categoría...`);
        translatedFrontmatter.category = await translateFn(frontmatter.category, targetLang, 'category');
      }
    }
    
    // Traducir tags
    if (Array.isArray(frontmatter.tags)) {
      console.log(`  🔄 Traduciendo ${frontmatter.tags.length} tags...`);
      translatedFrontmatter.tags = await Promise.all(
        frontmatter.tags.map(tag => translateFn(tag, targetLang, 'tag'))
      );
    }
    
    // Actualizar layout path
    if (frontmatter.layout) {
      translatedFrontmatter.layout = targetLang !== 'es' 
        ? '../../../layouts/BlogPost.astro'
        : '../../layouts/BlogPost.astro';
    }
    
    // Traducir el cuerpo del post (en chunks para mejor manejo)
    console.log(`  🔄 Traduciendo contenido (${body.length} caracteres)...`);
    
    // Dividir el contenido en secciones para traducir mejor
    const sections = body.split(/(?=^#+\s)/m);
    const translatedSections = await Promise.all(
      sections.map(section => {
        if (section.trim()) {
          return translateFn(section, targetLang, 'content');
        }
        return section;
      })
    );
    
    let translatedBody = translatedSections.join('');
    
    // Actualizar enlaces
    translatedBody = updateLinks(translatedBody, targetLang);
    
    // Crear el contenido final
    const translatedContent = `${stringifyFrontmatter(translatedFrontmatter)}\n\n${translatedBody}`;
    
    // Crear la carpeta de destino
    const targetDir = path.join(__dirname, '..', 'src', 'pages', 'blog', targetLang);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
      console.log(`  📁 Creada carpeta: ${targetDir}`);
    }
    
    // Guardar el archivo
    const targetPath = path.join(targetDir, fileName);
    fs.writeFileSync(targetPath, translatedContent, 'utf-8');
    
    console.log(`  ✅ Guardado: ${targetPath}`);
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
  console.log('=' .repeat(50));
  
  // Buscar todos los archivos .md en la carpeta blog (excluyendo subcarpetas de idiomas)
  const postFiles = await glob('*.md', {
    cwd: blogDir,
    ignore: ['**/en/**', '**/fr/**', '**/pt/**']
  });
  
  console.log(`\n📊 Resumen:`);
  console.log(`   - Posts encontrados: ${postFiles.length}`);
  console.log(`   - Idiomas objetivo: ${languages.join(', ')}`);
  console.log(`   - Total de archivos a generar: ${postFiles.length * languages.length}`);
  
  console.log(`\n⚠️  NOTA: Este script requiere una función de traducción.`);
  console.log(`   Por favor, integra tu servicio de traducción en la función translateWithAI().`);
  console.log(`   Opciones:`);
  console.log(`   1. Usar @google-cloud/translate`);
  console.log(`   2. Usar una API REST de traducción`);
  console.log(`   3. Usar un servicio de IA como OpenAI`);
  console.log(`   4. Usar la biblioteca 'translate' de npm\n`);
  
  // Por ahora, usamos la función placeholder
  const translateFn = translateWithAI;
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const postFile of postFiles) {
    const postPath = path.join(blogDir, postFile);
    
    for (const lang of languages) {
      const success = await translatePost(postPath, lang, translateFn);
      if (success) {
        successCount++;
      } else {
        errorCount++;
      }
      
      // Pequeña pausa para no sobrecargar APIs
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  console.log(`\n${'='.repeat(50)}`);
  console.log(`✨ Proceso completado!`);
  console.log(`   ✅ Exitosos: ${successCount}`);
  console.log(`   ❌ Errores: ${errorCount}`);
  console.log(`\n`);
}

// Ejecutar el script
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { translatePost, translateWithAI, parseFrontmatter, stringifyFrontmatter, updateLinks };
