export type City = { name: string; country: string; currency: string };

export type CityGroup = { country: string; currency: string; cities: City[] };

export const CITIES: City[] = [
  // UAE - AED
  { name: "Dubai", country: "UAE", currency: "AED" },
  { name: "Abu Dhabi", country: "UAE", currency: "AED" },
  { name: "Sharjah", country: "UAE", currency: "AED" },
  { name: "Ajman", country: "UAE", currency: "AED" },
  { name: "Ras Al Khaimah", country: "UAE", currency: "AED" },
  { name: "Fujairah", country: "UAE", currency: "AED" },
  { name: "Umm Al Quwain", country: "UAE", currency: "AED" },
  // Saudi Arabia - SAR
  { name: "Riyadh", country: "Saudi Arabia", currency: "SAR" },
  { name: "Jeddah", country: "Saudi Arabia", currency: "SAR" },
  { name: "Mecca", country: "Saudi Arabia", currency: "SAR" },
  { name: "Medina", country: "Saudi Arabia", currency: "SAR" },
  { name: "Dammam", country: "Saudi Arabia", currency: "SAR" },
  { name: "Khobar", country: "Saudi Arabia", currency: "SAR" },
  { name: "Dhahran", country: "Saudi Arabia", currency: "SAR" },
  { name: "Taif", country: "Saudi Arabia", currency: "SAR" },
  { name: "Tabuk", country: "Saudi Arabia", currency: "SAR" },
  { name: "Abha", country: "Saudi Arabia", currency: "SAR" },
  // Qatar - QAR
  { name: "Doha", country: "Qatar", currency: "QAR" },
  { name: "Al Rayyan", country: "Qatar", currency: "QAR" },
  // Kuwait - KWD
  { name: "Kuwait City", country: "Kuwait", currency: "KWD" },
  { name: "Hawalli", country: "Kuwait", currency: "KWD" },
  { name: "Salmiya", country: "Kuwait", currency: "KWD" },
  // Bahrain - BHD
  { name: "Manama", country: "Bahrain", currency: "BHD" },
  { name: "Riffa", country: "Bahrain", currency: "BHD" },
  { name: "Muharraq", country: "Bahrain", currency: "BHD" },
  // Oman - OMR
  { name: "Muscat", country: "Oman", currency: "OMR" },
  { name: "Salalah", country: "Oman", currency: "OMR" },
  { name: "Sohar", country: "Oman", currency: "OMR" },
  { name: "Nizwa", country: "Oman", currency: "OMR" },
  // Egypt - EGP
  { name: "Cairo", country: "Egypt", currency: "EGP" },
  { name: "Alexandria", country: "Egypt", currency: "EGP" },
  { name: "Giza", country: "Egypt", currency: "EGP" },
  { name: "New Cairo", country: "Egypt", currency: "EGP" },
  { name: "6th October City", country: "Egypt", currency: "EGP" },
];

/** Group cities by country for grouped dropdowns. */
export const CITY_GROUPS: CityGroup[] = CITIES.reduce<CityGroup[]>((acc, city) => {
  const group = acc.find((g) => g.country === city.country);
  if (group) {
    group.cities.push(city);
  } else {
    acc.push({ country: city.country, currency: city.currency, cities: [city] });
  }
  return acc;
}, []);

/** City names that have data in salaries.json (the original 9). */
export const CITIES_WITH_DATA = new Set([
  "Dubai", "Abu Dhabi", "Sharjah", "Riyadh", "Jeddah", "Doha", "Kuwait City", "Manama", "Muscat",
]);

export function hasSalaryData(cityName: string): boolean {
  return CITIES_WITH_DATA.has(cityName);
}
