const fs = require('fs');
const path = require('path');

const continentMap = {
  "Europe": "Europa",
  "Asia": "Asia",
  "Africa": "África",
  "North America": "América",
  "South America": "América",
  "Oceania": "Oceanía",
  "Antarctica": "Antártida"
};

async function rebuild() {
  console.log("Fetching countries from REST Countries API...");
  try {
    const response = await fetch("https://restcountries.com/v3.1/all?fields=name,translations,cca2,cca3,continents,area,latlng,borders,flags,independent");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const countries = await response.json();
    console.log(`Fetched ${countries.length} countries. Processing...`);

    const result = [];
    for (const c of countries) {
      if (!c.cca3 || !c.cca2) {
        continue;
      }



      // Fallback for name in Spanish
      const name = c.translations?.spa?.common || c.name?.common || c.name?.official || "";
      if (!name) continue;

      // Map continent
      const rawContinent = (c.continents && c.continents[0]) || "";
      const continent = continentMap[rawContinent] || rawContinent || "Otros";

      // Check if local flag exists
      const cca2Lower = c.cca2.toLowerCase();
      const localFlagPath = path.join(__dirname, '../public/assets/banderas', `${cca2Lower}.svg`);
      const hasLocalFlag = fs.existsSync(localFlagPath);
      const flagPath = hasLocalFlag ? `assets/banderas/${cca2Lower}.svg` : (c.flags?.svg || c.flags?.png || "");

      // Lat / Lng fallback
      const lat = (c.latlng && c.latlng[0] !== undefined) ? c.latlng[0] : 0;
      const lng = (c.latlng && c.latlng[1] !== undefined) ? c.latlng[1] : 0;

      result.push({
        id: c.cca3,
        nombre: name,
        continente: continent,
        superficie: c.area || 0,
        rutaBandera: flagPath,
        fronteras: c.borders || [],
        latitud: lat,
        longitud: lng,
        translations: {
          de: c.translations?.deu?.common || c.name?.common || "",
          pl: c.translations?.pol?.common || c.name?.common || "",
          ru: c.translations?.rus?.common || c.name?.common || "",
          pt: c.translations?.por?.common || c.name?.common || ""
        }
      });
    }

    // Sort alphabetically by name
    result.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));

    const destPath = path.join(__dirname, '../public/paises.json');
    fs.writeFileSync(destPath, JSON.stringify(result, null, 2), 'utf-8');
    console.log(`Successfully generated ${destPath} with ${result.length} countries.`);
  } catch (error) {
    console.error("Error fetching/processing countries:", error);
    process.exit(1);
  }
}

rebuild();
