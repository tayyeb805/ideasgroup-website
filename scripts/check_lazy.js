const fs = require('fs');

['public/index.html', 'public/about.html', 'public/ideas-one.html'].forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const imgs = content.match(/<img\b[^>]*>/gi) || [];
  let lazyCount = 0;
  imgs.forEach(img => {
    if (/loading=['"]lazy['"]/i.test(img)) lazyCount++;
  });
  console.log(f, 'Total images:', imgs.length, 'Lazy loaded:', lazyCount);
});
