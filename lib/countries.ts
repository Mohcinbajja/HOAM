
export interface CityData {
  name: string;
  lat: number;
  lon: number;
}

export interface CountryData {
  code: string;
  name: string;
  currency: {
    code: string;
    name: string;
  };
  lat: number;
  lon: number;
  cities?: CityData[];
}

export const countries: CountryData[] = [
    { code: 'AF', name: 'Afghanistan', currency: { code: 'AFN', name: 'Afghan afghani' }, lat: 33, lon: 65, cities: [
        { name: 'Kabul', lat: 34.5281, lon: 69.1723 },
        { name: 'Kandahar', lat: 31.6133, lon: 65.7101 },
        { name: 'Herat', lat: 34.3481, lon: 62.1997 },
        { name: 'Mazar-i-Sharif', lat: 36.7090, lon: 67.1109 },
        { name: 'Jalalabad', lat: 34.4265, lon: 70.4515 },
        { name: 'Kunduz', lat: 36.7289, lon: 68.8570 },
    ]},
    { code: 'AL', name: 'Albania', currency: { code: 'ALL', name: 'Albanian lek' }, lat: 41, lon: 20, cities: [
        { name: 'Tirana', lat: 41.3275, lon: 19.8187 },
        { name: 'Durrës', lat: 41.3133, lon: 19.4544 },
        { name: 'Vlorë', lat: 40.4667, lon: 19.4833 },
        { name: 'Shkodër', lat: 42.0694, lon: 19.5126 },
        { name: 'Elbasan', lat: 41.1125, lon: 20.0822 },
    ]},
    { code: 'DZ', name: 'Algeria', currency: { code: 'DZD', name: 'Algerian dinar' }, lat: 28, lon: 3, cities: [
        { name: 'Algiers', lat: 36.7754, lon: 3.0588 },
        { name: 'Oran', lat: 35.6911, lon: -0.6417 },
        { name: 'Constantine', lat: 36.3650, lon: 6.6147 },
        { name: 'Annaba', lat: 36.9000, lon: 7.7667 },
        { name: 'Blida', lat: 36.4700, lon: 2.8300 },
    ]},
    { code: 'AD', name: 'Andorra', currency: { code: 'EUR', name: 'Euro' }, lat: 42.5, lon: 1.5, cities: [
        { name: 'Andorra la Vella', lat: 42.5063, lon: 1.5218 },
        { name: 'Escaldes-Engordany', lat: 42.5095, lon: 1.5334 },
    ]},
    { code: 'AO', name: 'Angola', currency: { code: 'AOA', name: 'Angolan kwanza' }, lat: -12.5, lon: 18.5, cities: [
        { name: 'Luanda', lat: -8.8399, lon: 13.2894 },
        { name: 'Huambo', lat: -12.7761, lon: 15.7392 },
        { name: 'Lobito', lat: -12.3481, lon: 13.5456 },
    ]},
    { code: 'AR', name: 'Argentina', currency: { code: 'ARS', name: 'Argentine peso' }, lat: -34, lon: -64, cities: [
        { name: 'Buenos Aires', lat: -34.6037, lon: -58.3816 },
        { name: 'Córdoba', lat: -31.4201, lon: -64.1888 },
        { name: 'Rosario', lat: -32.9441, lon: -60.6393 },
        { name: 'Mendoza', lat: -32.8902, lon: -68.8458 },
        { name: 'La Plata', lat: -34.9205, lon: -57.9536 },
        { name: 'Tucumán', lat: -26.8083, lon: -65.2176 },
        { name: 'Mar del Plata', lat: -38.0055, lon: -57.5426 },
        { name: 'Salta', lat: -24.7821, lon: -65.4232 },
    ]},
    { code: 'AM', name: 'Armenia', currency: { code: 'AMD', name: 'Armenian dram' }, lat: 40, lon: 45, cities: [
        { name: 'Yerevan', lat: 40.1792, lon: 44.4991 },
        { name: 'Gyumri', lat: 40.7891, lon: 43.8436 },
    ]},
    { code: 'AU', name: 'Australia', currency: { code: 'AUD', name: 'Australian Dollar' }, lat: -25.2744, lon: 133.7751, cities: [
        { name: 'Sydney', lat: -33.8688, lon: 151.2093 },
        { name: 'Melbourne', lat: -37.8136, lon: 144.9631 },
        { name: 'Brisbane', lat: -27.4698, lon: 153.0251 },
        { name: 'Perth', lat: -31.9505, lon: 115.8605 },
        { name: 'Adelaide', lat: -34.9285, lon: 138.6007 },
        { name: 'Gold Coast', lat: -28.0167, lon: 153.4000 },
        { name: 'Canberra', lat: -35.2809, lon: 149.1300 },
        { name: 'Newcastle', lat: -32.9283, lon: 151.7817 },
        { name: 'Wollongong', lat: -34.4278, lon: 150.8931 },
        { name: 'Hobart', lat: -42.8821, lon: 147.3272 },
        { name: 'Geelong', lat: -38.1499, lon: 144.3617 },
        { name: 'Townsville', lat: -19.2590, lon: 146.8169 },
        { name: 'Cairns', lat: -16.9203, lon: 145.7710 },
        { name: 'Darwin', lat: -12.4634, lon: 130.8456 },
    ]},
    { code: 'AT', name: 'Austria', currency: { code: 'EUR', name: 'Euro' }, lat: 47.3333, lon: 13.3333, cities: [
        { name: 'Vienna', lat: 48.2082, lon: 16.3738 },
        { name: 'Graz', lat: 47.0707, lon: 15.4395 },
        { name: 'Linz', lat: 48.3069, lon: 14.2858 },
        { name: 'Salzburg', lat: 47.8095, lon: 13.0550 },
        { name: 'Innsbruck', lat: 47.2692, lon: 11.4041 },
    ]},
    { code: 'AZ', name: 'Azerbaijan', currency: { code: 'AZN', name: 'Azerbaijani manat' }, lat: 40.5, lon: 47.5, cities: [
        { name: 'Baku', lat: 40.4093, lon: 49.8671 },
        { name: 'Ganja', lat: 40.6828, lon: 46.3606 },
    ]},
    { code: 'BH', name: 'Bahrain', currency: { code: 'BHD', name: 'Bahraini dinar' }, lat: 26, lon: 50.55, cities: [
        { name: 'Manama', lat: 26.2285, lon: 50.5860 },
        { name: 'Riffa', lat: 26.1308, lon: 50.5558 },
    ]},
    { code: 'BD', name: 'Bangladesh', currency: { code: 'BDT', name: 'Bangladeshi taka' }, lat: 24, lon: 90, cities: [
        { name: 'Dhaka', lat: 23.8103, lon: 90.4125 },
        { name: 'Chittagong', lat: 22.3569, lon: 91.7832 },
        { name: 'Khulna', lat: 22.8456, lon: 89.5403 },
    ]},
    { code: 'BY', name: 'Belarus', currency: { code: 'BYN', name: 'Belarusian ruble' }, lat: 53, lon: 28, cities: [
        { name: 'Minsk', lat: 53.9045, lon: 27.5615 },
        { name: 'Gomel', lat: 52.4345, lon: 30.9754 },
    ]},
    { code: 'BE', name: 'Belgium', currency: { code: 'EUR', name: 'Euro' }, lat: 50.8333, lon: 4, cities: [
        { name: 'Brussels', lat: 50.8503, lon: 4.3517 },
        { name: 'Antwerp', lat: 51.2194, lon: 4.4025 },
        { name: 'Ghent', lat: 51.0543, lon: 3.7174 },
        { name: 'Charleroi', lat: 50.4107, lon: 4.4446 },
        { name: 'Liège', lat: 50.6326, lon: 5.5797 },
        { name: 'Bruges', lat: 51.2093, lon: 3.2247 },
    ]},
    { code: 'BT', name: 'Bhutan', currency: { code: 'BTN', name: 'Bhutanese ngultrum' }, lat: 27.5, lon: 90.5, cities: [
        { name: 'Thimphu', lat: 27.4728, lon: 89.6390 },
    ]},
    { code: 'BO', name: 'Bolivia', currency: { code: 'BOB', name: 'Bolivian boliviano' }, lat: -17, lon: -65, cities: [
        { name: 'Sucre', lat: -19.0196, lon: -65.2619 },
        { name: 'La Paz', lat: -16.4897, lon: -68.1193 },
        { name: 'Santa Cruz de la Sierra', lat: -17.7833, lon: -63.1812 },
        { name: 'Cochabamba', lat: -17.3895, lon: -66.1568 },
    ]},
    { code: 'BA', name: 'Bosnia and Herzegovina', currency: { code: 'BAM', name: 'Bosnia and Herzegovina convertible mark' }, lat: 44, lon: 18, cities: [
        { name: 'Sarajevo', lat: 43.8563, lon: 18.4131 },
        { name: 'Banja Luka', lat: 44.7722, lon: 17.1910 },
    ]},
    { code: 'BW', name: 'Botswana', currency: { code: 'BWP', name: 'Botswana pula' }, lat: -22, lon: 24, cities: [
        { name: 'Gaborone', lat: -24.6282, lon: 25.9231 },
    ]},
    { code: 'BR', name: 'Brazil', currency: { code: 'BRL', name: 'Brazilian real' }, lat: -10, lon: -55, cities: [
        { name: 'São Paulo', lat: -23.5505, lon: -46.6333 },
        { name: 'Rio de Janeiro', lat: -22.9068, lon: -43.1729 },
        { name: 'Brasília', lat: -15.8267, lon: -47.9218 },
        { name: 'Salvador', lat: -12.9777, lon: -38.5016 },
        { name: 'Fortaleza', lat: -3.7319, lon: -38.5267 },
        { name: 'Belo Horizonte', lat: -19.9167, lon: -43.9345 },
        { name: 'Manaus', lat: -3.1190, lon: -60.0217 },
        { name: 'Curitiba', lat: -25.4284, lon: -49.2733 },
        { name: 'Recife', lat: -8.0476, lon: -34.8770 },
        { name: 'Porto Alegre', lat: -30.0346, lon: -51.2177 },
    ]},
    { code: 'BG', name: 'Bulgaria', currency: { code: 'BGN', name: 'Bulgarian lev' }, lat: 43, lon: 25, cities: [
        { name: 'Sofia', lat: 42.6977, lon: 23.3219 },
        { name: 'Plovdiv', lat: 42.1354, lon: 24.7453 },
        { name: 'Varna', lat: 43.2141, lon: 27.9147 },
    ]},
    { code: 'KH', name: 'Cambodia', currency: { code: 'KHR', name: 'Cambodian riel' }, lat: 13, lon: 105, cities: [
        { name: 'Phnom Penh', lat: 11.5564, lon: 104.9282 },
        { name: 'Siem Reap', lat: 13.3614, lon: 103.8612 },
    ]},
    { code: 'CM', name: 'Cameroon', currency: { code: 'XAF', name: 'Central African CFA franc' }, lat: 6, lon: 12, cities: [
        { name: 'Yaoundé', lat: 3.8480, lon: 11.5021 },
        { name: 'Douala', lat: 4.0511, lon: 9.7679 },
    ]},
    { code: 'CA', name: 'Canada', currency: { code: 'CAD', name: 'Canadian Dollar' }, lat: 56.1304, lon: -106.3468, cities: [
        { name: 'Toronto', lat: 43.6532, lon: -79.3832 },
        { name: 'Montreal', lat: 45.5017, lon: -73.5673 },
        { name: 'Vancouver', lat: 49.2827, lon: -123.1207 },
        { name: 'Calgary', lat: 51.0447, lon: -114.0719 },
        { name: 'Edmonton', lat: 53.5461, lon: -113.4938 },
        { name: 'Ottawa', lat: 45.4215, lon: -75.6972 },
        { name: 'Mississauga', lat: 43.5890, lon: -79.6441 },
        { name: 'Winnipeg', lat: 49.8951, lon: -97.1384 },
        { name: 'Hamilton', lat: 43.2557, lon: -79.8711 },
        { name: 'Quebec City', lat: 46.8139, lon: -71.2080 },
        { name: 'Brampton', lat: 43.6833, lon: -79.7667 },
        { name: 'Surrey', lat: 49.1913, lon: -122.8490 },
        { name: 'Halifax', lat: 44.6488, lon: -63.5752 },
        { name: 'Laval', lat: 45.5784, lon: -73.7124 },
        { name: 'London', lat: 42.9849, lon: -81.2453 },
        { name: 'Markham', lat: 43.8561, lon: -79.3370 },
        { name: 'Vaughan', lat: 43.8361, lon: -79.5085 },
        { name: 'Gatineau', lat: 45.4765, lon: -75.7013 },
        { name: 'Saskatoon', lat: 52.1332, lon: -106.6700 },
        { name: 'Longueuil', lat: 45.5333, lon: -73.5167 },
        { name: 'Kitchener', lat: 43.4516, lon: -80.4925 },
        { name: 'Burnaby', lat: 49.2460, lon: -122.9944 },
        { name: 'Windsor', lat: 42.3149, lon: -83.0364 },
        { name: 'Regina', lat: 50.4452, lon: -104.6189 },
        { name: 'Richmond', lat: 49.1666, lon: -123.1336 },
    ]},
    { code: 'CL', name: 'Chile', currency: { code: 'CLP', name: 'Chilean peso' }, lat: -30, lon: -71, cities: [
        { name: 'Santiago', lat: -33.4489, lon: -70.6693 },
        { name: 'Valparaíso', lat: -33.0472, lon: -71.6127 },
        { name: 'Concepción', lat: -36.8269, lon: -73.0498 },
    ]},
    { code: 'CN', name: 'China', currency: { code: 'CNY', name: 'Chinese yuan' }, lat: 35, lon: 105, cities: [
        { name: 'Shanghai', lat: 31.2304, lon: 121.4737 },
        { name: 'Beijing', lat: 39.9042, lon: 116.4074 },
        { name: 'Chongqing', lat: 29.5630, lon: 106.5516 },
        { name: 'Tianjin', lat: 39.0842, lon: 117.2009 },
        { name: 'Guangzhou', lat: 23.1291, lon: 113.2644 },
        { name: 'Shenzhen', lat: 22.5431, lon: 114.0579 },
        { name: 'Chengdu', lat: 30.5728, lon: 104.0668 },
        { name: 'Nanjing', lat: 32.0603, lon: 118.7969 },
        { name: 'Wuhan', lat: 30.5928, lon: 114.3055 },
        { name: 'Hangzhou', lat: 30.2741, lon: 120.1551 },
    ]},
    { code: 'CO', name: 'Colombia', currency: { code: 'COP', name: 'Colombian peso' }, lat: 4, lon: -72, cities: [
        { name: 'Bogotá', lat: 4.7110, lon: -74.0721 },
        { name: 'Medellín', lat: 6.2476, lon: -75.5658 },
        { name: 'Cali', lat: 3.4516, lon: -76.5320 },
        { name: 'Barranquilla', lat: 10.9639, lon: -74.7964 },
        { name: 'Cartagena', lat: 10.3910, lon: -75.4794 },
    ]},
    { code: 'CR', name: 'Costa Rica', currency: { code: 'CRC', name: 'Costa Rican colón' }, lat: 10, lon: -84, cities: [
        { name: 'San José', lat: 9.9281, lon: -84.0907 },
    ]},
    { code: 'HR', name: 'Croatia', currency: { code: 'EUR', name: 'Euro' }, lat: 45.1667, lon: 15.5, cities: [
        { name: 'Zagreb', lat: 45.8150, lon: 15.9819 },
        { name: 'Split', lat: 43.5081, lon: 16.4402 },
        { name: 'Rijeka', lat: 45.3271, lon: 14.4422 },
    ]},
    { code: 'CU', name: 'Cuba', currency: { code: 'CUP', name: 'Cuban peso' }, lat: 21.5, lon: -80, cities: [
        { name: 'Havana', lat: 23.1136, lon: -82.3666 },
        { name: 'Santiago de Cuba', lat: 20.0208, lon: -75.8292 },
    ]},
    { code: 'CY', name: 'Cyprus', currency: { code: 'EUR', name: 'Euro' }, lat: 35, lon: 33, cities: [
        { name: 'Nicosia', lat: 35.1856, lon: 33.3823 },
        { name: 'Limassol', lat: 34.6750, lon: 33.0417 },
    ]},
    { code: 'CZ', name: 'Czech Republic', currency: { code: 'CZK', name: 'Czech koruna' }, lat: 49.75, lon: 15.5, cities: [
        { name: 'Prague', lat: 50.0755, lon: 14.4378 },
        { name: 'Brno', lat: 49.1951, lon: 16.6068 },
        { name: 'Ostrava', lat: 49.8209, lon: 18.2625 },
    ]},
    { code: 'DK', name: 'Denmark', currency: { code: 'DKK', name: 'Danish krone' }, lat: 56, lon: 10, cities: [
        { name: 'Copenhagen', lat: 55.6761, lon: 12.5683 },
        { name: 'Aarhus', lat: 56.1629, lon: 10.2039 },
        { name: 'Odense', lat: 55.3959, lon: 10.3883 },
    ]},
    { code: 'EC', name: 'Ecuador', currency: { code: 'USD', name: 'United States dollar' }, lat: -2, lon: -77.5, cities: [
        { name: 'Quito', lat: -0.1807, lon: -78.4678 },
        { name: 'Guayaquil', lat: -2.1710, lon: -79.9224 },
        { name: 'Cuenca', lat: -2.9001, lon: -79.0055 },
    ]},
    { code: 'EG', name: 'Egypt', currency: { code: 'EGP', name: 'Egyptian pound' }, lat: 27, lon: 30, cities: [
        { name: 'Cairo', lat: 30.0444, lon: 31.2357 },
        { name: 'Alexandria', lat: 31.2001, lon: 29.9187 },
        { name: 'Giza', lat: 29.987, lon: 31.2018 },
    ]},
    { code: 'EE', name: 'Estonia', currency: { code: 'EUR', name: 'Euro' }, lat: 59, lon: 26, cities: [
        { name: 'Tallinn', lat: 59.4370, lon: 24.7536 },
        { name: 'Tartu', lat: 58.3759, lon: 26.7290 },
    ]},
    { code: 'ET', name: 'Ethiopia', currency: { code: 'ETB', name: 'Ethiopian birr' }, lat: 8, lon: 38, cities: [
        { name: 'Addis Ababa', lat: 9.0300, lon: 38.7400 },
    ]},
    { code: 'FJ', name: 'Fiji', currency: { code: 'FJD', name: 'Fijian dollar' }, lat: -18, lon: 175, cities: [
        { name: 'Suva', lat: -18.1416, lon: 178.4419 },
    ]},
    { code: 'FI', name: 'Finland', currency: { code: 'EUR', name: 'Euro' }, lat: 64, lon: 26, cities: [
        { name: 'Helsinki', lat: 60.1699, lon: 24.9384 },
        { name: 'Tampere', lat: 61.4978, lon: 23.7610 },
        { name: 'Turku', lat: 60.4518, lon: 22.2666 },
        { name: 'Oulu', lat: 65.0121, lon: 25.4651 },
    ]},
    { code: 'FR', name: 'France', currency: { code: 'EUR', name: 'Euro' }, lat: 46.2276, lon: 2.2137, cities: [
        { name: 'Paris', lat: 48.8566, lon: 2.3522 },
        { name: 'Marseille', lat: 43.2965, lon: 5.3698 },
        { name: 'Lyon', lat: 45.7640, lon: 4.8357 },
        { name: 'Toulouse', lat: 43.6047, lon: 1.4442 },
        { name: 'Nice', lat: 43.7102, lon: 7.2620 },
        { name: 'Nantes', lat: 47.2184, lon: -1.5536 },
        { name: 'Strasbourg', lat: 48.5734, lon: 7.7521 },
        { name: 'Montpellier', lat: 43.6108, lon: 3.8767 },
        { name: 'Bordeaux', lat: 44.8378, lon: -0.5792 },
        { name: 'Lille', lat: 50.6292, lon: 3.0573 },
    ]},
    { code: 'DE', name: 'Germany', currency: { code: 'EUR', name: 'Euro' }, lat: 51.1657, lon: 10.4515, cities: [
        { name: 'Berlin', lat: 52.5200, lon: 13.4050 },
        { name: 'Hamburg', lat: 53.5511, lon: 9.9937 },
        { name: 'Munich', lat: 48.1351, lon: 11.5820 },
        { name: 'Cologne', lat: 50.9375, lon: 6.9603 },
        { name: 'Frankfurt', lat: 50.1109, lon: 8.6821 },
        { name: 'Stuttgart', lat: 48.7758, lon: 9.1829 },
        { name: 'Düsseldorf', lat: 51.2277, lon: 6.7735 },
        { name: 'Dortmund', lat: 51.5136, lon: 7.4653 },
        { name: 'Essen', lat: 51.4556, lon: 7.0116 },
        { name: 'Leipzig', lat: 51.3397, lon: 12.3731 },
        { name: 'Bremen', lat: 53.0793, lon: 8.8017 },
        { name: 'Dresden', lat: 51.0504, lon: 13.7373 },
        { name: 'Hanover', lat: 52.3759, lon: 9.7320 },
        { name: 'Nuremberg', lat: 49.4521, lon: 11.0767 },
    ]},
    { code: 'GH', name: 'Ghana', currency: { code: 'GHS', name: 'Ghanaian cedi' }, lat: 8, lon: -2, cities: [
        { name: 'Accra', lat: 5.6037, lon: -0.1870 },
        { name: 'Kumasi', lat: 6.6885, lon: -1.6244 },
    ]},
    { code: 'GR', name: 'Greece', currency: { code: 'EUR', name: 'Euro' }, lat: 39, lon: 22, cities: [
        { name: 'Athens', lat: 37.9838, lon: 23.7275 },
        { name: 'Thessaloniki', lat: 40.6401, lon: 22.9444 },
        { name: 'Patras', lat: 38.2466, lon: 21.7346 },
        { name: 'Heraklion', lat: 35.3387, lon: 25.1442 },
    ]},
    { code: 'HU', name: 'Hungary', currency: { code: 'HUF', name: 'Hungarian forint' }, lat: 47, lon: 20, cities: [
        { name: 'Budapest', lat: 47.4979, lon: 19.0402 },
        { name: 'Debrecen', lat: 47.5316, lon: 21.6273 },
    ]},
    { code: 'IS', name: 'Iceland', currency: { code: 'ISK', name: 'Icelandic króna' }, lat: 65, lon: -18, cities: [
        { name: 'Reykjavík', lat: 64.1466, lon: -21.9426 },
    ]},
    { code: 'IN', name: 'India', currency: { code: 'INR', name: 'Indian rupee' }, lat: 20, lon: 77, cities: [
        { name: 'Delhi', lat: 28.7041, lon: 77.1025 },
        { name: 'Mumbai', lat: 19.0760, lon: 72.8777 },
        { name: 'Bangalore', lat: 12.9716, lon: 77.5946 },
        { name: 'Kolkata', lat: 22.5726, lon: 88.3639 },
        { name: 'Chennai', lat: 13.0827, lon: 80.2707 },
        { name: 'Hyderabad', lat: 17.3850, lon: 78.4867 },
        { name: 'Pune', lat: 18.5204, lon: 73.8567 },
        { name: 'Ahmedabad', lat: 23.0225, lon: 72.5714 },
        { name: 'Surat', lat: 21.1702, lon: 72.8311 },
        { name: 'Jaipur', lat: 26.9124, lon: 75.7873 },
    ]},
    { code: 'ID', name: 'Indonesia', currency: { code: 'IDR', name: 'Indonesian rupiah' }, lat: -5, lon: 120, cities: [
        { name: 'Jakarta', lat: -6.2088, lon: 106.8456 },
        { name: 'Surabaya', lat: -7.2575, lon: 112.7521 },
        { name: 'Bandung', lat: -6.9175, lon: 107.6191 },
        { name: 'Medan', lat: 3.5952, lon: 98.6722 },
    ]},
    { code: 'IR', name: 'Iran', currency: { code: 'IRR', name: 'Iranian rial' }, lat: 32, lon: 53, cities: [
        { name: 'Tehran', lat: 35.6892, lon: 51.3890 },
        { name: 'Mashhad', lat: 36.2970, lon: 59.6062 },
        { name: 'Isfahan', lat: 32.6546, lon: 51.6680 },
    ]},
    { code: 'IQ', name: 'Iraq', currency: { code: 'IQD', name: 'Iraqi dinar' }, lat: 33, lon: 44, cities: [
        { name: 'Baghdad', lat: 33.3152, lon: 44.3661 },
        { name: 'Mosul', lat: 36.3400, lon: 43.1300 },
    ]},
    { code: 'IE', name: 'Ireland', currency: { code: 'EUR', name: 'Euro' }, lat: 53, lon: -8, cities: [
        { name: 'Dublin', lat: 53.3498, lon: -6.2603 },
        { name: 'Cork', lat: 51.8969, lon: -8.4863 },
        { name: 'Limerick', lat: 52.6680, lon: -8.6305 },
        { name: 'Galway', lat: 53.2707, lon: -9.0568 },
    ]},
    { code: 'IL', name: 'Israel', currency: { code: 'ILS', name: 'Israeli new shekel' }, lat: 31.5, lon: 34.75, cities: [
        { name: 'Jerusalem', lat: 31.7683, lon: 35.2137 },
        { name: 'Tel Aviv', lat: 32.0853, lon: 34.7818 },
        { name: 'Haifa', lat: 32.7940, lon: 34.9896 },
    ]},
    { code: 'IT', name: 'Italy', currency: { code: 'EUR', name: 'Euro' }, lat: 42.8333, lon: 12.8333, cities: [
        { name: 'Rome', lat: 41.9028, lon: 12.4964 },
        { name: 'Milan', lat: 45.4642, lon: 9.1900 },
        { name: 'Naples', lat: 40.8518, lon: 14.2681 },
        { name: 'Turin', lat: 45.0703, lon: 7.6869 },
        { name: 'Palermo', lat: 38.1157, lon: 13.3615 },
        { name: 'Genoa', lat: 44.4056, lon: 8.9463 },
        { name: 'Bologna', lat: 44.4949, lon: 11.3426 },
        { name: 'Florence', lat: 43.7696, lon: 11.2558 },
    ]},
    { code: 'JP', name: 'Japan', currency: { code: 'JPY', name: 'Japanese Yen' }, lat: 36.2048, lon: 138.2529, cities: [
        { name: 'Tokyo', lat: 35.6895, lon: 139.6917 },
        { name: 'Yokohama', lat: 35.4437, lon: 139.6380 },
        { name: 'Osaka', lat: 34.6937, lon: 135.5023 },
        { name: 'Nagoya', lat: 35.1815, lon: 136.9066 },
        { name: 'Sapporo', lat: 43.0618, lon: 141.3545 },
        { name: 'Fukuoka', lat: 33.5904, lon: 130.4017 },
        { name: 'Kobe', lat: 34.6901, lon: 135.1955 },
        { name: 'Kyoto', lat: 35.0116, lon: 135.7681 },
        { name: 'Kawasaki', lat: 35.5308, lon: 139.7025 },
        { name: 'Saitama', lat: 35.8617, lon: 139.6455 },
    ]},
    { code: 'JO', name: 'Jordan', currency: { code: 'JOD', name: 'Jordanian dinar' }, lat: 31, lon: 36, cities: [
        { name: 'Amman', lat: 31.9454, lon: 35.9284 },
    ]},
    { code: 'KZ', name: 'Kazakhstan', currency: { code: 'KZT', name: 'Kazakhstani tenge' }, lat: 48, lon: 68, cities: [
        { name: 'Nur-Sultan', lat: 51.1694, lon: 71.4491 },
        { name: 'Almaty', lat: 43.2220, lon: 76.8512 },
    ]},
    { code: 'KE', name: 'Kenya', currency: { code: 'KES', name: 'Kenyan shilling' }, lat: 1, lon: 38, cities: [
        { name: 'Nairobi', lat: -1.2921, lon: 36.8219 },
        { name: 'Mombasa', lat: -4.0435, lon: 39.6682 },
    ]},
    { code: 'KW', name: 'Kuwait', currency: { code: 'KWD', name: 'Kuwaiti dinar' }, lat: 29.5, lon: 45.75, cities: [
        { name: 'Kuwait City', lat: 29.3759, lon: 47.9774 },
    ]},
    { code: 'LV', name: 'Latvia', currency: { code: 'EUR', name: 'Euro' }, lat: 57, lon: 25, cities: [
        { name: 'Riga', lat: 56.9496, lon: 24.1052 },
    ]},
    { code: 'LB', name: 'Lebanon', currency: { code: 'LBP', name: 'Lebanese pound' }, lat: 33.8333, lon: 35.8333, cities: [
        { name: 'Beirut', lat: 33.8938, lon: 35.5018 },
    ]},
    { code: 'LT', name: 'Lithuania', currency: { code: 'EUR', name: 'Euro' }, lat: 56, lon: 24, cities: [
        { name: 'Vilnius', lat: 54.6872, lon: 25.2797 },
        { name: 'Kaunas', lat: 54.8985, lon: 23.9036 },
    ]},
    { code: 'LU', name: 'Luxembourg', currency: { code: 'EUR', name: 'Euro' }, lat: 49.75, lon: 6.1667, cities: [
        { name: 'Luxembourg', lat: 49.6116, lon: 6.1319 },
    ]},
    { code: 'MY', name: 'Malaysia', currency: { code: 'MYR', name: 'Malaysian ringgit' }, lat: 2.5, lon: 112.5, cities: [
        { name: 'Kuala Lumpur', lat: 3.1390, lon: 101.6869 },
        { name: 'George Town', lat: 5.4141, lon: 100.3288 },
        { name: 'Johor Bahru', lat: 1.4927, lon: 103.7414 },
    ]},
    { code: 'MT', name: 'Malta', currency: { code: 'EUR', name: 'Euro' }, lat: 35.8333, lon: 14.5833, cities: [
        { name: 'Valletta', lat: 35.8989, lon: 14.5146 },
    ]},
    { code: 'MX', name: 'Mexico', currency: { code: 'MXN', name: 'Mexican peso' }, lat: 23, lon: -102, cities: [
        { name: 'Mexico City', lat: 19.4326, lon: -99.1332 },
        { name: 'Guadalajara', lat: 20.6597, lon: -103.3496 },
        { name: 'Monterrey', lat: 25.6866, lon: -100.3161 },
        { name: 'Puebla', lat: 19.0414, lon: -98.2063 },
        { name: 'Tijuana', lat: 32.5149, lon: -117.0382 },
        { name: 'León', lat: 21.1619, lon: -101.6565 },
        { name: 'Juárez', lat: 31.7386, lon: -106.4870 },
    ]},
    { code: 'MD', name: 'Moldova', currency: { code: 'MDL', name: 'Moldovan leu' }, lat: 47, lon: 29, cities: [
        { name: 'Chișinău', lat: 47.0105, lon: 28.8638 },
    ]},
    { code: 'MC', name: 'Monaco', currency: { code: 'EUR', name: 'Euro' }, lat: 43.7333, lon: 7.4, cities: [
        { name: 'Monaco', lat: 43.7384, lon: 7.4246 },
    ]},
    { code: 'MN', name: 'Mongolia', currency: { code: 'MNT', name: 'Mongolian tögrög' }, lat: 46, lon: 105, cities: [
        { name: 'Ulaanbaatar', lat: 47.9185, lon: 106.9176 },
    ]},
    { code: 'ME', name: 'Montenegro', currency: { code: 'EUR', name: 'Euro' }, lat: 42.5, lon: 19.3, cities: [
        { name: 'Podgorica', lat: 42.4304, lon: 19.2594 },
    ]},
    { code: 'MA', name: 'Morocco', currency: { code: 'MAD', name: 'Moroccan Dirham' }, lat: 31.7917, lon: -7.0926, cities: [
        { name: 'Rabat', lat: 34.0209, lon: -6.8417 },
        { name: 'Casablanca', lat: 33.5731, lon: -7.5898 },
        { name: 'Marrakech', lat: 31.6295, lon: -7.9811 },
        { name: 'Fez', lat: 34.0181, lon: -5.0078 },
        { name: 'Tangier', lat: 35.7595, lon: -5.8340 },
        { name: 'Agadir', lat: 30.4278, lon: -9.5981 },
        { name: 'Meknes', lat: 33.8935, lon: -5.5473 },
    ]},
    { code: 'NP', name: 'Nepal', currency: { code: 'NPR', name: 'Nepalese rupee' }, lat: 28, lon: 84, cities: [
        { name: 'Kathmandu', lat: 27.7172, lon: 85.3240 },
    ]},
    { code: 'NL', name: 'Netherlands', currency: { code: 'EUR', name: 'Euro' }, lat: 52.5, lon: 5.75, cities: [
        { name: 'Amsterdam', lat: 52.3676, lon: 4.9041 },
        { name: 'Rotterdam', lat: 51.9244, lon: 4.4777 },
        { name: 'The Hague', lat: 52.0705, lon: 4.3007 },
        { name: 'Utrecht', lat: 52.0907, lon: 5.1214 },
        { name: 'Eindhoven', lat: 51.4416, lon: 5.4697 },
    ]},
    { code: 'NZ', name: 'New Zealand', currency: { code: 'NZD', name: 'New Zealand dollar' }, lat: -41, lon: 174, cities: [
        { name: 'Wellington', lat: -41.2865, lon: 174.7762 },
        { name: 'Auckland', lat: -36.8485, lon: 174.7633 },
        { name: 'Christchurch', lat: -43.5321, lon: 172.6362 },
        { name: 'Hamilton', lat: -37.7870, lon: 175.2793 },
    ]},
    { code: 'NG', name: 'Nigeria', currency: { code: 'NGN', name: 'Nigerian naira' }, lat: 10, lon: 8, cities: [
        { name: 'Lagos', lat: 6.5244, lon: 3.3792 },
        { name: 'Abuja', lat: 9.0765, lon: 7.3986 },
        { name: 'Kano', lat: 12.0022, lon: 8.5920 },
        { name: 'Ibadan', lat: 7.3776, lon: 3.9470 },
    ]},
    { code: 'MK', name: 'North Macedonia', currency: { code: 'MKD', name: 'Macedonian denar' }, lat: 41.8333, lon: 22, cities: [
        { name: 'Skopje', lat: 41.9981, lon: 21.4254 },
    ]},
    { code: 'NO', name: 'Norway', currency: { code: 'NOK', name: 'Norwegian krone' }, lat: 62, lon: 10, cities: [
        { name: 'Oslo', lat: 59.9139, lon: 10.7522 },
        { name: 'Bergen', lat: 60.3913, lon: 5.3221 },
        { name: 'Trondheim', lat: 63.4305, lon: 10.3951 },
    ]},
    { code: 'OM', name: 'Oman', currency: { code: 'OMR', name: 'Omani rial' }, lat: 21, lon: 57, cities: [
        { name: 'Muscat', lat: 23.5859, lon: 58.4059 },
    ]},
    { code: 'PK', name: 'Pakistan', currency: { code: 'PKR', name: 'Pakistani rupee' }, lat: 30, lon: 70, cities: [
        { name: 'Karachi', lat: 24.8607, lon: 67.0011 },
        { name: 'Lahore', lat: 31.5820, lon: 74.3294 },
        { name: 'Islamabad', lat: 33.6844, lon: 73.0479 },
        { name: 'Faisalabad', lat: 31.4504, lon: 73.1350 },
    ]},
    { code: 'PA', name: 'Panama', currency: { code: 'PAB', name: 'Panamanian balboa' }, lat: 9, lon: -80, cities: [
        { name: 'Panama City', lat: 8.9824, lon: -79.5199 },
    ]},
    { code: 'PY', name: 'Paraguay', currency: { code: 'PYG', name: 'Paraguayan guaraní' }, lat: -23, lon: -58, cities: [
        { name: 'Asunción', lat: -25.2637, lon: -57.5759 },
    ]},
    { code: 'PE', name: 'Peru', currency: { code: 'PEN', name: 'Peruvian sol' }, lat: -10, lon: -76, cities: [
        { name: 'Lima', lat: -12.0464, lon: -77.0428 },
        { name: 'Arequipa', lat: -16.4090, lon: -71.5375 },
        { name: 'Cusco', lat: -13.5320, lon: -71.9675 },
    ]},
    { code: 'PH', name: 'Philippines', currency: { code: 'PHP', name: 'Philippine peso' }, lat: 13, lon: 122, cities: [
        { name: 'Manila', lat: 14.5995, lon: 120.9842 },
        { name: 'Quezon City', lat: 14.6760, lon: 121.0437 },
        { name: 'Davao City', lat: 7.1907, lon: 125.4553 },
    ]},
    { code: 'PL', name: 'Poland', currency: { code: 'PLN', name: 'Polish złoty' }, lat: 52, lon: 20, cities: [
        { name: 'Warsaw', lat: 52.2297, lon: 21.0122 },
        { name: 'Kraków', lat: 50.0647, lon: 19.9450 },
        { name: 'Łódź', lat: 51.7592, lon: 19.4560 },
        { name: 'Wrocław', lat: 51.1079, lon: 17.0385 },
        { name: 'Poznań', lat: 52.4064, lon: 16.9252 },
    ]},
    { code: 'PT', name: 'Portugal', currency: { code: 'EUR', name: 'Euro' }, lat: 39.5, lon: -8, cities: [
        { name: 'Lisbon', lat: 38.7223, lon: -9.1393 },
        { name: 'Porto', lat: 41.1579, lon: -8.6291 },
    ]},
    { code: 'QA', name: 'Qatar', currency: { code: 'QAR', name: 'Qatari riyal' }, lat: 25.5, lon: 51.25, cities: [
        { name: 'Doha', lat: 25.2854, lon: 51.5310 },
    ]},
    { code: 'RO', name: 'Romania', currency: { code: 'RON', name: 'Romanian leu' }, lat: 46, lon: 25, cities: [
        { name: 'Bucharest', lat: 44.4268, lon: 26.1025 },
        { name: 'Cluj-Napoca', lat: 46.7712, lon: 23.6236 },
    ]},
    { code: 'RU', name: 'Russia', currency: { code: 'RUB', name: 'Russian ruble' }, lat: 60, lon: 100, cities: [
        { name: 'Moscow', lat: 55.7558, lon: 37.6173 },
        { name: 'Saint Petersburg', lat: 59.9343, lon: 30.3351 },
        { name: 'Novosibirsk', lat: 55.0084, lon: 82.9357 },
        { name: 'Yekaterinburg', lat: 56.8389, lon: 60.6057 },
        { name: 'Kazan', lat: 55.8304, lon: 49.0661 },
    ]},
    { code: 'SA', name: 'Saudi Arabia', currency: { code: 'SAR', name: 'Saudi riyal' }, lat: 25, lon: 45, cities: [
        { name: 'Riyadh', lat: 24.7136, lon: 46.6753 },
        { name: 'Jeddah', lat: 21.4858, lon: 39.1925 },
        { name: 'Mecca', lat: 21.3891, lon: 39.8579 },
        { name: 'Medina', lat: 24.4686, lon: 39.6142 },
    ]},
    { code: 'RS', name: 'Serbia', currency: { code: 'RSD', name: 'Serbian dinar' }, lat: 44, lon: 21, cities: [
        { name: 'Belgrade', lat: 44.7866, lon: 20.4489 },
    ]},
    { code: 'SG', name: 'Singapore', currency: { code: 'SGD', name: 'Singapore dollar' }, lat: 1.3667, lon: 103.8, cities: [
        { name: 'Singapore', lat: 1.3521, lon: 103.8198 },
    ]},
    { code: 'SK', name: 'Slovakia', currency: { code: 'EUR', name: 'Euro' }, lat: 48.6667, lon: 19.5, cities: [
        { name: 'Bratislava', lat: 48.1486, lon: 17.1077 },
    ]},
    { code: 'SI', name: 'Slovenia', currency: { code: 'EUR', name: 'Euro' }, lat: 46.1167, lon: 14.8167, cities: [
        { name: 'Ljubljana', lat: 46.0569, lon: 14.5058 },
    ]},
    { code: 'ZA', name: 'South Africa', currency: { code: 'ZAR', name: 'South African rand' }, lat: -29, lon: 24, cities: [
        { name: 'Johannesburg', lat: -26.2041, lon: 28.0473 },
        { name: 'Cape Town', lat: -33.9249, lon: 18.4241 },
        { name: 'Durban', lat: -29.8587, lon: 31.0218 },
        { name: 'Pretoria', lat: -25.7479, lon: 28.2293 },
        { name: 'Port Elizabeth', lat: -33.9608, lon: 25.6022 },
    ]},
    { code: 'KR', name: 'South Korea', currency: { code: 'KRW', name: 'South Korean won' }, lat: 37, lon: 127.5, cities: [
        { name: 'Seoul', lat: 37.5665, lon: 126.9780 },
        { name: 'Busan', lat: 35.1796, lon: 129.0756 },
        { name: 'Incheon', lat: 37.4563, lon: 126.7052 },
        { name: 'Daegu', lat: 35.8714, lon: 128.6014 },
    ]},
    { code: 'ES', name: 'Spain', currency: { code: 'EUR', name: 'Euro' }, lat: 40, lon: -4, cities: [
        { name: 'Madrid', lat: 40.4168, lon: -3.7038 },
        { name: 'Barcelona', lat: 41.3851, lon: 2.1734 },
        { name: 'Valencia', lat: 39.4699, lon: -0.3763 },
        { name: 'Seville', lat: 37.3891, lon: -5.9845 },
        { name: 'Zaragoza', lat: 41.6488, lon: -0.8891 },
        { name: 'Málaga', lat: 36.7213, lon: -4.4214 },
        { name: 'Murcia', lat: 37.9922, lon: -1.1307 },
    ]},
    { code: 'LK', name: 'Sri Lanka', currency: { code: 'LKR', name: 'Sri Lankan rupee' }, lat: 7, lon: 81, cities: [
        { name: 'Colombo', lat: 6.9271, lon: 79.8612 },
    ]},
    { code: 'SE', name: 'Sweden', currency: { code: 'SEK', name: 'Swedish krona' }, lat: 62, lon: 15, cities: [
        { name: 'Stockholm', lat: 59.3293, lon: 18.0686 },
        { name: 'Gothenburg', lat: 57.7089, lon: 11.9746 },
        { name: 'Malmö', lat: 55.6050, lon: 13.0038 },
    ]},
    { code: 'CH', name: 'Switzerland', currency: { code: 'CHF', name: 'Swiss Franc' }, lat: 46.8182, lon: 8.2275, cities: [
        { name: 'Zurich', lat: 47.3769, lon: 8.5417 },
        { name: 'Geneva', lat: 46.2044, lon: 6.1432 },
        { name: 'Basel', lat: 47.5596, lon: 7.5886 },
        { name: 'Bern', lat: 46.9480, lon: 7.4474 },
        { name: 'Lausanne', lat: 46.5197, lon: 6.6323 },
    ]},
    { code: 'TW', name: 'Taiwan', currency: { code: 'TWD', name: 'New Taiwan dollar' }, lat: 23.5, lon: 121, cities: [
        { name: 'Taipei', lat: 25.0330, lon: 121.5654 },
        { name: 'Kaohsiung', lat: 22.6273, lon: 120.3014 },
        { name: 'Taichung', lat: 24.1477, lon: 120.6736 },
    ]},
    { code: 'TZ', name: 'Tanzania', currency: { code: 'TZS', name: 'Tanzanian shilling' }, lat: -6, lon: 35, cities: [
        { name: 'Dodoma', lat: -6.1630, lon: 35.7516 },
        { name: 'Dar es Salaam', lat: -6.7924, lon: 39.2083 },
    ]},
    { code: 'TH', name: 'Thailand', currency: { code: 'THB', name: 'Thai baht' }, lat: 15, lon: 100, cities: [
        { name: 'Bangkok', lat: 13.7563, lon: 100.5018 },
        { name: 'Chiang Mai', lat: 18.7883, lon: 98.9853 },
        { name: 'Phuket', lat: 7.8804, lon: 98.3923 },
    ]},
    { code: 'TR', name: 'Turkey', currency: { code: 'TRY', name: 'Turkish lira' }, lat: 39, lon: 35, cities: [
        { name: 'Istanbul', lat: 41.0082, lon: 28.9784 },
        { name: 'Ankara', lat: 39.9334, lon: 32.8597 },
        { name: 'İzmir', lat: 38.4237, lon: 27.1428 },
        { name: 'Bursa', lat: 40.1885, lon: 29.0610 },
        { name: 'Antalya', lat: 36.8969, lon: 30.7133 },
    ]},
    { code: 'UG', name: 'Uganda', currency: { code: 'UGX', name: 'Ugandan shilling' }, lat: 1, lon: 32, cities: [
        { name: 'Kampala', lat: 0.3476, lon: 32.5825 },
    ]},
    { code: 'UA', name: 'Ukraine', currency: { code: 'UAH', name: 'Ukrainian hryvnia' }, lat: 49, lon: 32, cities: [
        { name: 'Kyiv', lat: 50.4501, lon: 30.5234 },
        { name: 'Kharkiv', lat: 49.9935, lon: 36.2304 },
        { name: 'Odesa', lat: 46.4825, lon: 30.7233 },
    ]},
    { code: 'AE', name: 'United Arab Emirates', currency: { code: 'AED', name: 'UAE Dirham' }, lat: 23.4241, lon: 53.8478, cities: [
        { name: 'Dubai', lat: 25.2048, lon: 55.2708 },
        { name: 'Abu Dhabi', lat: 24.4539, lon: 54.3773 },
        { name: 'Sharjah', lat: 25.3463, lon: 55.4209 },
    ]},
    { code: 'GB', name: 'United Kingdom', currency: { code: 'GBP', name: 'British Pound Sterling' }, lat: 55.3781, lon: -3.4360, cities: [
        { name: 'London', lat: 51.5074, lon: -0.1278 },
        { name: 'Manchester', lat: 53.4839, lon: -2.2446 },
        { name: 'Birmingham', lat: 52.4862, lon: -1.8904 },
        { name: 'Glasgow', lat: 55.8642, lon: -4.2518 },
        { name: 'Liverpool', lat: 53.4084, lon: -2.9916 },
        { name: 'Bristol', lat: 51.4545, lon: -2.5879 },
        { name: 'Sheffield', lat: 53.3811, lon: -1.4701 },
        { name: 'Leeds', lat: 53.8008, lon: -1.5491 },
        { name: 'Edinburgh', lat: 55.9533, lon: -3.1883 },
        { name: 'Leicester', lat: 52.6369, lon: -1.1398 },
        { name: 'Coventry', lat: 52.4068, lon: -1.5121 },
        { name: 'Cardiff', lat: 51.4816, lon: -3.1791 },
        { name: 'Belfast', lat: 54.5973, lon: -5.9301 },
    ]},
    { code: 'US', name: 'United States', currency: { code: 'USD', name: 'United States Dollar' }, lat: 37.0902, lon: -95.7129, cities: [
        { name: 'New York', lat: 40.7128, lon: -74.0060 },
        { name: 'Los Angeles', lat: 34.0522, lon: -118.2437 },
        { name: 'Chicago', lat: 41.8781, lon: -87.6298 },
        { name: 'Houston', lat: 29.7604, lon: -95.3698 },
        { name: 'Phoenix', lat: 33.4484, lon: -112.0740 },
        { name: 'Philadelphia', lat: 39.9526, lon: -75.1652 },
        { name: 'San Antonio', lat: 29.4241, lon: -98.4936 },
        { name: 'San Diego', lat: 32.7157, lon: -117.1611 },
        { name: 'Dallas', lat: 32.7767, lon: -96.7970 },
        { name: 'San Jose', lat: 37.3382, lon: -121.8863 },
        { name: 'Austin', lat: 30.2672, lon: -97.7431 },
        { name: 'Jacksonville', lat: 30.3322, lon: -81.6557 },
        { name: 'Fort Worth', lat: 32.7555, lon: -97.3308 },
        { name: 'Columbus', lat: 39.9612, lon: -82.9988 },
        { name: 'San Francisco', lat: 37.7749, lon: -122.4194 },
        { name: 'Charlotte', lat: 35.2271, lon: -80.8431 },
        { name: 'Indianapolis', lat: 39.7684, lon: -86.1581 },
        { name: 'Seattle', lat: 47.6062, lon: -122.3321 },
        { name: 'Denver', lat: 39.7392, lon: -104.9903 },
        { name: 'Washington', lat: 38.9072, lon: -77.0369 },
        { name: 'Boston', lat: 42.3601, lon: -71.0589 },
        { name: 'El Paso', lat: 31.7619, lon: -106.4850 },
        { name: 'Nashville', lat: 36.1627, lon: -86.7816 },
        { name: 'Detroit', lat: 42.3314, lon: -83.0458 },
        { name: 'Oklahoma City', lat: 35.4676, lon: -97.5164 },
        { name: 'Portland', lat: 45.5051, lon: -122.6750 },
        { name: 'Las Vegas', lat: 36.1699, lon: -115.1398 },
        { name: 'Memphis', lat: 35.1495, lon: -90.0490 },
        { name: 'Louisville', lat: 38.2527, lon: -85.7585 },
        { name: 'Baltimore', lat: 39.2904, lon: -76.6122 },
    ]},
    { code: 'UY', name: 'Uruguay', currency: { code: 'UYU', name: 'Uruguayan peso' }, lat: -33, lon: -56, cities: [
        { name: 'Montevideo', lat: -34.9011, lon: -56.1645 },
    ]},
    { code: 'UZ', name: 'Uzbekistan', currency: { code: 'UZS', name: 'Uzbekistani soʻm' }, lat: 41, lon: 64, cities: [
        { name: 'Tashkent', lat: 41.2995, lon: 69.2401 },
    ]},
    { code: 'VE', name: 'Venezuela', currency: { code: 'VES', name: 'Venezuelan bolívar soberano' }, lat: 8, lon: -66, cities: [
        { name: 'Caracas', lat: 10.4806, lon: -66.9036 },
        { name: 'Maracaibo', lat: 10.6428, lon: -71.6125 },
        { name: 'Valencia', lat: 10.1620, lon: -68.0077 },
    ]},
    { code: 'VN', name: 'Vietnam', currency: { code: 'VND', name: 'Vietnamese đồng' }, lat: 16.1667, lon: 107.8333, cities: [
        { name: 'Ho Chi Minh City', lat: 10.8231, lon: 106.6297 },
        { name: 'Hanoi', lat: 21.0285, lon: 105.8542 },
        { name: 'Da Nang', lat: 16.0544, lon: 108.2022 },
    ]},
    { code: 'ZM', name: 'Zambia', currency: { code: 'ZMW', name: 'Zambian kwacha' }, lat: -15, lon: 30, cities: [
        { name: 'Lusaka', lat: -15.3875, lon: 28.3228 },
    ]},
    { code: 'ZW', name: 'Zimbabwe', currency: { code: 'ZWL', name: 'Zimbabwean dollar' }, lat: -20, lon: 30, cities: [
        { name: 'Harare', lat: -17.8252, lon: 31.0335 },
    ]},
];

export const getCountryByCode = (code: string | undefined) => countries.find(c => c.code === code);
