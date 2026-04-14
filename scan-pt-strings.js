const fs = require('fs');
const file = 'app/[locale]/dashboard/configuracoes/page.tsx';
const data = fs.readFileSync(file, 'utf8');

// Look for JSX text content that's in Portuguese (in between > and <)
const pattern = />([^<{}\n]+)</g;
let match;
const found = [];
while ((match = pattern.exec(data)) !== null) {
  const text = match[1].trim();
  // Filter out empty, purely numeric, english-looking or already-keys
  if (text.length > 3 && !/^[a-zA-Z0-9\s\-_:\/\.@#%+*!$(),\[\]{}'"]+$/.test(text) || 
      /[ãõçéêáàú]/i.test(text)) {
    found.push({ text, index: match.index });
  }
}

found.slice(0, 30).forEach(f => {
  const line = data.substring(0, f.index).split('\n').length;
  console.log(`Line ~${line}: "${f.text}"`);
});
console.log(`Total found: ${found.length}`);
