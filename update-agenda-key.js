const fs = require('fs');
const path = require('path');

// Update the agenda key for each language in Dashboard namespace
const agendaKeys = {
  pt: "Agenda",
  en: "Schedule",
  es: "Agenda",
  fr: "Agenda",
  it: "Agenda",
  de: "Kalender"
};

['pt','en','es','fr','it','de'].forEach(l => {
  const file = path.join(__dirname, 'messages', `${l}.json`);
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  data.Dashboard.agenda = agendaKeys[l];
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
  console.log(`Updated Dashboard.agenda for ${l}: "${agendaKeys[l]}"`);
});
