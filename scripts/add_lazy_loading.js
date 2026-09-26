const fs = require('fs');

const files = ['public/index.html', 'public/about.html', 'public/ideas-one.html'];

files.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace <img> tags that are not the header logo with loading="lazy" decoding="async"
  let updatedCount = 0;
  content = content.replace(/<img\b([^>]*)>/gi, (match, attrs) => {
    // Keep header logo eager
    if (attrs.includes('nav-center-brand') || attrs.includes('alt="IDEAS Group Logo"')) {
      return match;
    }
    let newAttrs = attrs;
    if (!/loading=['"]lazy['"]/i.test(newAttrs)) {
      newAttrs += ' loading="lazy"';
      updatedCount++;
    }
    if (!/decoding=['"]async['"]/i.test(newAttrs)) {
      newAttrs += ' decoding="async"';
    }
    return `<img${newAttrs}>`;
  });

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${filePath}: added lazy loading to ${updatedCount} images.`);
});
