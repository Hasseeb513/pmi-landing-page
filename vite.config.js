import { defineConfig } from 'vite';
import { resolve, extname, basename } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// Helper to generate Arabic files automatically
function generateArabicFiles() {
  const rootDir = __dirname;
  const arDir = resolve(rootDir, 'ar');

  // Ensure ar directory exists
  if (!fs.existsSync(arDir)) {
    fs.mkdirSync(arDir);
  }

  // Get all HTML files in root (excluding dist, node_modules, etc.)
  const files = fs.readdirSync(rootDir);
  const htmlFiles = files.filter(file => extname(file) === '.html');

  const rollupInput = {};

  // Translation Dictionary
  const translations = {
    'lang="en"': 'lang="ar" dir="rtl"',
    'SELECTED FOR YOU': 'مختارة لك',
    'If your favourite TEREA is...': 'إذا كانت TEREA المفضلة لديك هي...',
    'Intensity': 'الكثافة',
    'You may also like': 'قد يعجبك أيضاً',
    'READY WHEN YOU ARE': ' جاهزين متى ما كنت جاهز',
    'SHOP YOUR TEREA YOUR WAY': 'تسوق TEREA بطريقتك',
    'Shop TEREA': 'تسوق TEREA',
    'Designed for use with the IQOS ILUMA device. A smoke-free alternative.': 'مصمم للاستخدام مع جهاز IQOS ILUMA. بديل خالٍ من التدخين.',
    'Discover': 'اكتشف',
    'IQOS ILUMA': 'IQOS ILUMA',
    'TEREA flavours': 'نكهات TEREA',
    'Heated tobacco': 'التبغ المسخن',
    'Support': 'الدعم',
    'Contact us': 'اتصل بنا',
    'FAQ': 'الأسئلة الشائعة',
    'Device care': 'رعاية الجهاز',
    'Legal': 'القوانين',
    'Terms & conditions': 'الشروط والأحكام',
    'Privacy notice': 'إشعار الخصوصية',
    'Cookie preferences': 'تفضيلات ملفات تعريف الارتباط',
    'This product is not risk-free and provides nicotine, which is addictive. For adult use only.': 'هذا المنتج ليس خالياً من المخاطر ويحتوي على النيكوتين الذي يسبب الإدمان. للبالغين فقط.',
    'Rich, full-bodied roasted tobacco with a rounded intensity.': 'تبغ محمص غني وكثيف مع حدة متوازنة.',
    'Deep tobacco layered with cocoa and dried fruit.': 'تبغ محمص غني وكثيف مع نكهات الكاكاو والفواكه المجففة.',
    'Roasted tobacco carried by a warm, woody character.': 'تبغ محمص غني بنكهة الخشب الدافئة.',
    'Smooth, refined tobacco with a light aromatic note.': 'تبغ محمص ناعم مع نكهة عطرية خفيفة.',
    'Discover Sienna': 'اكتشف Sienna',
    'Discover Silver': 'اكتشف Silver',
    'Discover Amber': 'اكتشف Amber',
    'Discover Russet': 'اكتشف Russet',
    '<span>4</span>': '<span>٤</span>',
    '<span>5</span>': '<span>٥</span>',
    '<span>6</span>': '<span>٦</span>',
    '<span>8</span>': '<span>٨</span>'
  };

  htmlFiles.forEach(file => {
    const name = basename(file, '.html');
    const enFilePath = resolve(rootDir, file);

    // 1. Auto-update language switcher link in the English source file
    if (name !== 'index') {
      let enContent = fs.readFileSync(enFilePath, 'utf-8');
      if (enContent.includes('href="ar/index.html"')) {
        console.log(`Auto-updating language switcher path in English file: ${file}`);
        enContent = enContent.replace('href="ar/index.html"', `href="ar/${file}"`);
        fs.writeFileSync(enFilePath, enContent, 'utf-8');
      }
    }
    
    // 2. Add English file to rollup inputs
    rollupInput[name] = enFilePath;

    const arFilePath = resolve(arDir, file);

    // 3. If Arabic file doesn't exist in source, auto-generate it
    if (!fs.existsSync(arFilePath)) {
      console.log(`Auto-generating Arabic translation for: ${file}`);
      let content = fs.readFileSync(enFilePath, 'utf-8');

      // Update relative paths to go up one level
      content = content.replace(/href="css\//g, 'href="../css/');
      content = content.replace(/src="images\//g, 'src="../images/');
      content = content.replace(/href="images\//g, 'href="../images/');
      content = content.replace(/href="fonts\//g, 'href="../fonts/');

      // Update language toggles
      content = content.replace(new RegExp(`href="ar/${name}.html"`, 'g'), `href="../${file}"`);
      content = content.replace(/href="ar\/index.html"/g, 'href="../index.html"');
      content = content.replace(/id="lang-switch-to-ar">العربية<\/a>/g, 'id="lang-switch-to-en">English</a>');

      // Apply text translations
      for (const [key, value] of Object.entries(translations)) {
        content = content.replace(new RegExp(key, 'g'), value);
      }

      fs.writeFileSync(arFilePath, content, 'utf-8');
    }

    // 4. Add Arabic file to rollup inputs
    // Vite needs the inputs relative or absolute. We use key: absolute path.
    // In rollup config output, we want to control where it goes.
    // Rollup will write this to dist/ar/[name].html if it's named 'ar/[name]'
    rollupInput[`ar/${name}`] = arFilePath;
  });

  return rollupInput;
}

export default defineConfig({
  build: {
    rollupOptions: {
      input: generateArabicFiles(),
      output: {
        entryFileNames: 'js/[name].js',
        chunkFileNames: 'js/[name].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const extType = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            return 'images/[name][extname]';
          }
          if (/woff2?|eot|ttf|otf/i.test(extType)) {
            return 'fonts/[name][extname]';
          }
          if (/css/i.test(extType)) {
            return 'css/[name][extname]';
          }
          return 'assets/[name][extname]';
        }
      }
    }
  }
});
