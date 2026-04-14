const fs = require('fs');
const path = require('path');

const saving = {
  pt: "A GUARDAR...",
  en: "SAVING...",
  es: "GUARDANDO...",
  fr: "SAUVEGARDE...",
  it: "SALVATAGGIO...",
  de: "SPEICHERN..."
};

['pt','en','es','fr','it','de'].forEach(l => {
  const file = path.join(__dirname, 'messages', `${l}.json`);
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  data.DashboardSettings.saving = saving[l];
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
});

// Fix the saving reference in page
const page = 'app/[locale]/dashboard/configuracoes/page.tsx';
let code = fs.readFileSync(page, 'utf8');
code = code.replace(/"saving\.\.\."(?=\s*:\s*t\("saveBtn"\))/g, 't("saving")');
fs.writeFileSync(page, code, 'utf8');
console.log('Done!');
