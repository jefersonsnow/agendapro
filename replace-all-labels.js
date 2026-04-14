const fs = require('fs');

const file = 'app/[locale]/dashboard/configuracoes/page.tsx';
let data = fs.readFileSync(file, 'utf8');

// Map of exact strings to replace with translation keys
const replacements = [
  // Slogan label
  [/Descrição Curta \(Slogan\)/g, '{t("slogan")}'],
  // Language hint
  [/Idioma automático padrão que será mostrado na sua Landing Page e Painel\./g, '{t("languageDesc")}'],
  // Slogan placeholder
  [/Ex: O melhor corte da cidade com o conforto que merece\.\.\./g, 't("sloganHolder")'],
  // Visual Identity card header (not yet translated)
  [/>Identidade Visual</g, '>{t("visuals")}<'],
  [/>O logótipo e a capa que tornam a sua página única e profissional</g, '>{t("visualsDesc")}<'],
  // Logo URL label
  [/URL do Logótipo \(PNG ou JPG\)/g, '{t("logoUrlLabel")}'],
  // Cover URL label  
  [/URL da Imagem de Capa/g, '{t("coverUrlLabel")}'],

  // Banner format dropdown values (amenities_layout)
  [/>Grelha \(Várias Linhas\)</g, '>{t("amGrid")}<'],
  [/>Linha Única \(Auto\)</g, '>{t("amSingle")}<'],
  [/>Carrossel \(Slide\)</g, '>{t("amCarousel")}<'],
  [/>Ticker \(Movimento Infinito\)</g, '>{t("amTicker")}<'],
  
  // Visual style dropdown values (amenities_style)
  [/>Card Arredondado</g, '>{t("amCard")}<'],
  [/>Minimalista</g, '>{t("amMinimal")}<'],
  [/>Pílula \(Badge\)</g, '>{t("amBadge")}<'],
  
  // Services layout dropdown values
  [/>Grelha Clássica \(Ideal para Desktop\)</g, '>{t("servGrid")}<'],
  [/>Carrossel de Cartões \(Otimizado Mobile\)</g, '>{t("servCarousel")}<'],
  [/>Lista Compacta \(Vertical\)</g, '>{t("servList")}<'],
  [/O modo 'Carrossel' permite que os clientes deslizem lateralmente pelos serviços\./g, '{t("servCarouselHint")}'],
  
  // Card type dropdown values
  [/>Card Detalhado \(Grande\)</g, '>{t("servCard")}<'],
  [/>Compacto Moderno \(Menor\)</g, '>{t("servCompact")}<'],
  
  // General model (theme) dropdown values
  [/>Padrão</g, '>{t("themeDefault")}<'],
  [/>Dark</g, '>{t("themeDark")}<'],
  [/>Barbearia Retro</g, '>{t("themeRetro")}<'],
  [/>Feminino Moderno</g, '>{t("themeFeminine")}<'],
  [/>Luxo Extremo</g, '>{t("themeLuxury")}<'],
  
  // Save button
  [/"A GUARDAR\.\.\."/g, '"saving..."'],
  [/"GUARDAR CONFIGURAÇÕES"/g, '{t("saveBtn")}'],
  
  // QR Code dialog  
  [/>QR Code do seu Salão</g, '>{t("qrTitle")}<'],
  [/>Scan para Reservar</g, '>{t("qrScan")}<'],
  [/Imprimir QR Code/g, '{t("printQr")}'],
];

let count = 0;
for (const [pattern, replacement] of replacements) {
  const before = data;
  data = data.replace(pattern, replacement);
  if (data !== before) count++;
}

fs.writeFileSync(file, data, 'utf8');
console.log(`Done! Applied ${count}/${replacements.length} replacements.`);
