const fs = require('fs');
const path = require('path');

// More descriptive amenities labels for admin settings panel
const amenities = {
  pt: {
    wifi: "Wi-Fi Grátis",
    coffee: "Café Premium",
    parking: "Estacionamento",
    ac: "Ar Condicionado",
    hygiene: "Higiene Total",
    staff: "Profissionais Elite",
    drinks: "Bebidas Incluídas",
    tv: "TV/Media",
    kids: "Atendimento Kids",
    accessible: "Acessível"
  },
  en: {
    wifi: "Free Wi-Fi",
    coffee: "Premium Coffee",
    parking: "Parking",
    ac: "Air Conditioning",
    hygiene: "Full Hygiene",
    staff: "Elite Staff",
    drinks: "Drinks Included",
    tv: "TV/Media",
    kids: "Kids Area",
    accessible: "Accessible"
  },
  es: {
    wifi: "Wi-Fi Gratis",
    coffee: "Café Premium",
    parking: "Estacionamiento",
    ac: "Aire Acondicionado",
    hygiene: "Higiene Total",
    staff: "Profesionales Elite",
    drinks: "Bebidas Incluidas",
    tv: "TV/Medios",
    kids: "Atención Kids",
    accessible: "Accesible"
  },
  fr: {
    wifi: "Wi-Fi Gratuit",
    coffee: "Café Premium",
    parking: "Parking",
    ac: "Climatisation",
    hygiene: "Hygiène Totale",
    staff: "Professionnels Élite",
    drinks: "Boissons Incluses",
    tv: "TV/Médias",
    kids: "Espace Enfants",
    accessible: "Accessible"
  },
  it: {
    wifi: "Wi-Fi Gratuito",
    coffee: "Caffè Premium",
    parking: "Parcheggio",
    ac: "Aria Condizionata",
    hygiene: "Igiene Totale",
    staff: "Staff Elite",
    drinks: "Bevande Incluse",
    tv: "TV/Media",
    kids: "Area Bambini",
    accessible: "Accessibile"
  },
  de: {
    wifi: "Gratis WLAN",
    coffee: "Premium Kaffee",
    parking: "Parkplatz",
    ac: "Klimaanlage",
    hygiene: "Volle Hygiene",
    staff: "Elite Personal",
    drinks: "Getränke Inklusive",
    tv: "TV/Medien",
    kids: "Kinderbereich",
    accessible: "Barrierefrei"
  }
};

['pt','en','es','fr','it','de'].forEach(l => {
  const file = path.join(__dirname, 'messages', `${l}.json`);
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  data.Amenities = amenities[l];
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
  console.log(`Updated Amenities in ${l}.json`);
});
