export { default } from './country.json';

export interface Country {
  continent: string;
  country: string;
  income: number;
  life_exp: number;
  population: number;
}

export type CountryData = {
  countries: Country[];
  year: string;
}[];
