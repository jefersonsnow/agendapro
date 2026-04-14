const fs = require('fs');
const file = 'app/[locale]/dashboard/configuracoes/page.tsx';
let data = fs.readFileSync(file, 'utf8');

// Fix the broken placeholder - the script replaced the inner quotes making it invalid
// The current broken form: placeholder="t("sloganHolder")"
// The correct form: placeholder={t("sloganHolder")}
data = data.replace(/placeholder="t\("sloganHolder"\)"/g, 'placeholder={t("sloganHolder")}');

// Also add missing "saving" key reference value  
data = data.replace(/t\("saving"\)/g, '"saving..."');

fs.writeFileSync(file, data, 'utf8');
console.log('Fixed!');
