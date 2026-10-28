const fs = require('fs');
const path = require('path');

function search(dir) {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      if (f !== 'node_modules' && f !== '.next') search(full);
    } else if (f.endsWith('.tsx') || f.endsWith('.ts') || f.endsWith('.json')) {
      const c = fs.readFileSync(full, 'utf8');
      if (c.includes('باقات وعروض') || c.includes('announcement') || c.includes('يمكن لمدير الموقع')) {
        console.log('Found match in:', full);
      }
    }
  }
}

search('./src');
