const fs = require('fs');
const file = 'app/[locale]/dashboard/configuracoes/page.tsx';
let data = fs.readFileSync(file, 'utf8');

data = data.replace(/Pausa de Almoço/g, '{t("lunchBreak")}');
data = data.replace(/>até</g, '>{t("until")}<');

fs.writeFileSync(file, data, 'utf8');
