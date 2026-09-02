/**
 * Shopping-region configuration — countries and their administrative regions.
 *
 * This is the single source of truth for the RegionSelector UI. Add a country by
 * appending an entry here (no component changes needed). `states` values are
 * realistic placeholders for development; swap for authoritative lists as needed.
 *
 * NOTE: `currency` / `language` are stored for future international expansion but
 * the selector currently keeps the display fixed at the US defaults.
 */
export interface CountryData {
  code: string;
  name: string;
  flag: string;
  /** Reserved for future use — display stays fixed for now. */
  currency: string;
  /** Reserved for future use — display stays fixed for now. */
  language: string;
  states: string[];
}

export const COUNTRIES: CountryData[] = [
  {
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    currency: 'USD ($)',
    language: 'English',
    states: ['California', 'Texas', 'Florida', 'New York', 'Illinois', 'Washington', 'Arizona', 'Nevada', 'Massachusetts', 'Colorado'],
  },
  {
    code: 'CA',
    name: 'Canada',
    flag: '🇨🇦',
    currency: 'CAD ($)',
    language: 'English',
    states: ['Ontario', 'British Columbia', 'Alberta', 'Quebec', 'Manitoba', 'Nova Scotia'],
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    flag: '🇬🇧',
    currency: 'GBP (£)',
    language: 'English',
    states: ['England', 'Scotland', 'Wales', 'Northern Ireland'],
  },
  {
    code: 'AU',
    name: 'Australia',
    flag: '🇦🇺',
    currency: 'AUD ($)',
    language: 'English',
    states: ['New South Wales', 'Victoria', 'Queensland', 'Western Australia', 'South Australia', 'Tasmania'],
  },
  {
    code: 'NZ',
    name: 'New Zealand',
    flag: '🇳🇿',
    currency: 'NZD ($)',
    language: 'English',
    states: ['Auckland', 'Wellington', 'Canterbury', 'Otago', 'Waikato'],
  },
  {
    code: 'DE',
    name: 'Germany',
    flag: '🇩🇪',
    currency: 'EUR (€)',
    language: 'German',
    states: ['Bavaria', 'Berlin', 'Hamburg', 'Hesse', 'Saxony', 'North Rhine-Westphalia'],
  },
  {
    code: 'FR',
    name: 'France',
    flag: '🇫🇷',
    currency: 'EUR (€)',
    language: 'French',
    states: ['Île-de-France', 'Provence-Alpes-Côte d’Azur', 'Auvergne-Rhône-Alpes', 'Occitanie', 'Nouvelle-Aquitaine'],
  },
  {
    code: 'IT',
    name: 'Italy',
    flag: '🇮🇹',
    currency: 'EUR (€)',
    language: 'Italian',
    states: ['Lombardy', 'Lazio', 'Tuscany', 'Veneto', 'Sicily', 'Campania'],
  },
  {
    code: 'ES',
    name: 'Spain',
    flag: '🇪🇸',
    currency: 'EUR (€)',
    language: 'Spanish',
    states: ['Madrid', 'Catalonia', 'Andalusia', 'Valencia', 'Basque Country', 'Galicia'],
  },
  {
    code: 'NL',
    name: 'Netherlands',
    flag: '🇳🇱',
    currency: 'EUR (€)',
    language: 'Dutch',
    states: ['North Holland', 'South Holland', 'Utrecht', 'North Brabant', 'Gelderland'],
  },
  {
    code: 'IN',
    name: 'India',
    flag: '🇮🇳',
    currency: 'INR (₹)',
    language: 'English',
    states: ['Maharashtra', 'Delhi', 'Karnataka', 'Gujarat', 'Rajasthan', 'Tamil Nadu', 'Uttar Pradesh'],
  },
  {
    code: 'JP',
    name: 'Japan',
    flag: '🇯🇵',
    currency: 'JPY (¥)',
    language: 'Japanese',
    states: ['Tokyo', 'Osaka', 'Kyoto', 'Hokkaido', 'Aichi', 'Fukuoka'],
  },
  {
    code: 'SG',
    name: 'Singapore',
    flag: '🇸🇬',
    currency: 'SGD ($)',
    language: 'English',
    states: ['Central', 'East', 'North', 'North-East', 'West'],
  },
];

/** Current default experience — United States / California. */
export const DEFAULT_COUNTRY_CODE = 'US';
export const DEFAULT_STATE = 'California';

/** Currency / language display is kept fixed at the US defaults for now. */
export const DEFAULT_CURRENCY = 'USD ($)';
export const DEFAULT_LANGUAGE = 'English';

export function getCountry(code: string): CountryData {
  return COUNTRIES.find((c) => c.code === code) ?? COUNTRIES[0];
}
