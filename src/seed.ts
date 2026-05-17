import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { OperationType, Route } from './types';
import { handleFirestoreError } from './lib/firestoreUtils';

const DUMMY_ROUTES: Route[] = [
  {
    id: 'bidar-kamalapur',
    name: 'Bidar to Kamalapur',
    nameKn: 'ಬೀದರ್ - ಕಮಲಾಪುರ',
    stops: [
      { id: 'bidar', name: 'Bidar Central', nameKn: 'ಬೀದರ್ ಕೇಂದ್ರ', avgTimeFromPrev: 0, location: { lat: 17.9126, lng: 77.5172 } },
      { id: 'hallikhed', name: 'Hallikhed', nameKn: 'ಹಳ್ಳಿಕೇಡ್', avgTimeFromPrev: 25, location: { lat: 17.7818, lng: 77.2917 } },
      { id: 'homnabad', name: 'Homnabad', nameKn: 'ಹುಮ್ನಾಬಾದ್', avgTimeFromPrev: 30, location: { lat: 17.7719, lng: 77.1264 } },
      { id: 'kamalapur', name: 'Kamalapur', nameKn: 'ಕಮಲಾಪುರ', avgTimeFromPrev: 40, location: { lat: 17.5878, lng: 77.0142 } },
    ]
  },
  {
    id: 'kalaburagi-afzalpur',
    name: 'Kalaburagi to Afzalpur',
    nameKn: 'ಕಲಬುರಗಿ - ಅಫಜಲಪುರ',
    stops: [
      { id: 'kalaburagi', name: 'Kalaburagi City', nameKn: 'ಕಲಬುರಗಿ ನಗರ', avgTimeFromPrev: 0, location: { lat: 17.3297, lng: 76.8343 } },
      { id: 'farhatabad', name: 'Farhatabad', nameKn: 'ಫರ್ಹತಾಬಾದ್', avgTimeFromPrev: 20, location: { lat: 17.2023, lng: 76.8456 } },
      { id: 'sonth', name: 'Sonth', nameKn: 'ಸೊಂತ', avgTimeFromPrev: 25, location: { lat: 17.1517, lng: 76.7111 } },
      { id: 'afzalpur', name: 'Afzalpur', nameKn: 'ಅಫಜಲಪುರ', avgTimeFromPrev: 35, location: { lat: 17.2045, lng: 76.3571 } },
    ]
  },
  {
    id: 'kalaburagi-yadgir',
    name: 'Kalaburagi to Yadgir',
    nameKn: 'ಕಲಬುರಗಿ - ಯಾದಗಿರಿ',
    stops: [
      { id: 'kalaburagi-city', name: 'Kalaburagi City', nameKn: 'ಕಲಬುರಗಿ ನಗರ', avgTimeFromPrev: 0, location: { lat: 17.3297, lng: 76.8343 } },
      { id: 'shahabad', name: 'Shahabad', nameKn: 'ಶಹಾಬಾದ್', avgTimeFromPrev: 30, location: { lat: 17.1332, lng: 76.9372 } },
      { id: 'wadi', name: 'Wadi Junction', nameKn: 'ವಾಡಿ ಜಂಕ್ಷನ್', avgTimeFromPrev: 20, location: { lat: 17.0505, lng: 76.9930 } },
      { id: 'yadgir', name: 'Yadgir Central', nameKn: 'ಯಾದಗಿರಿ ಕೇಂದ್ರ', avgTimeFromPrev: 45, location: { lat: 16.7667, lng: 77.1333 } },
    ]
  },
  {
    id: 'raichur-mantralayam',
    name: 'Raichur to Mantralayam',
    nameKn: 'ರಾಯಚೂರು - ಮಂತ್ರಾಲಯ',
    stops: [
      { id: 'raichur', name: 'Raichur Terminal', nameKn: 'ರಾಯಚೂರು ಬಸ್ ನಿಲ್ದಾಣ', avgTimeFromPrev: 0, location: { lat: 16.2120, lng: 77.3439 } },
      { id: 'shaktinagar', name: 'Shaktinagar', nameKn: 'ಶಕ್ತಿನಗರ', avgTimeFromPrev: 35, location: { lat: 16.2415, lng: 77.4208 } },
      { id: 'mantralayam', name: 'Mantralayam Road', nameKn: 'ಮಂತ್ರಾಲಯ ರಸ್ತೆ', avgTimeFromPrev: 40, location: { lat: 15.9423, lng: 77.4283 } },
    ]
  },
  {
    id: 'vijayapura-bagalkot',
    name: 'Vijayapura to Bagalkot',
    nameKn: 'ವಿಜಯಪುರ - ಬಾಗಲಕೋಟೆ',
    stops: [
      { id: 'vijayapura', name: 'Vijayapura Hub', nameKn: 'ವಿಜಯಪುರ ಹಬ್', avgTimeFromPrev: 0, location: { lat: 16.8302, lng: 75.7100 } },
      { id: 'basavana-bagewadi', name: 'Basavana Bagewadi', nameKn: 'ಬಸವನ ಬಾಗೇವಾಡಿ', avgTimeFromPrev: 45, location: { lat: 16.5828, lng: 75.9754 } },
      { id: 'hungund', name: 'Hungund', nameKn: 'ಹುನಗುಂದ', avgTimeFromPrev: 40, location: { lat: 16.0667, lng: 76.0500 } },
      { id: 'bagalkot', name: 'Bagalkot Central', nameKn: 'ಬಾಗಲಕೋಟೆ ಕೇಂದ್ರ', avgTimeFromPrev: 35, location: { lat: 16.1817, lng: 75.6958 } },
    ]
  },
  {
    id: 'belagavi-hubli',
    name: 'Belagavi to Hubli',
    nameKn: 'ಬೆಳಗಾವಿ - ಹುಬ್ಬಳ್ಳಿ',
    stops: [
      { id: 'belagavi', name: 'Belagavi Central', nameKn: 'ಬೆಳಗಾವಿ ಕೇಂದ್ರ', avgTimeFromPrev: 0, location: { lat: 15.8497, lng: 74.4977 } },
      { id: 'kittur', name: 'Kittur Fort', nameKn: 'ಕಿತ್ತೂರು ಕೋಟೆ', avgTimeFromPrev: 50, location: { lat: 15.6025, lng: 74.7933 } },
      { id: 'hubli', name: 'Hubli Junction', nameKn: 'ಹುಬ್ಬಳ್ಳಿ ಜಂಕ್ಷನ್', avgTimeFromPrev: 55, location: { lat: 15.3647, lng: 75.1240 } },
    ]
  },
  {
    id: 'hubli-dharwad',
    name: 'Hubli to Dharwad (BRTS)',
    nameKn: 'ಹುಬ್ಬಳ್ಳಿ - ಧಾರವಾಡ (BRTS)',
    stops: [
      { id: 'hubli-cbt', name: 'Hubli CBT', nameKn: 'ಹುಬ್ಬಳ್ಳಿ ಸಿ ಬಿ ಟಿ', avgTimeFromPrev: 0, location: { lat: 15.3647, lng: 75.1240 } },
      { id: 'unakal', name: 'Unakal Lake', nameKn: 'ಉಣಕಲ್ ಕೆರೆ', avgTimeFromPrev: 10, location: { lat: 15.3855, lng: 75.1054 } },
      { id: 'vidyanagar', name: 'Vidyanagar', nameKn: 'ವಿದ್ಯಾನಗರ', avgTimeFromPrev: 8, location: { lat: 15.4055, lng: 75.0854 } },
      { id: 'navanagar', name: 'Navanagar', nameKn: 'ನವನಗರ', avgTimeFromPrev: 12, location: { lat: 15.4255, lng: 75.0554 } },
      { id: 'dharwad-cbt', name: 'Dharwad CBT', nameKn: 'ಧಾರವಾಡ ಸಿ ಬಿ ಟಿ', avgTimeFromPrev: 15, location: { lat: 15.4589, lng: 75.0078 } },
    ]
  },
  {
    id: 'shivamogga-sagar',
    name: 'Shivamogga to Sagar',
    nameKn: 'ಶಿವಮೊಗ್ಗ - ಸಾಗರ',
    stops: [
      { id: 'shivamogga', name: 'Shivamogga Bus Stand', nameKn: 'ಶಿವಮೊಗ್ಗ ಬಸ್ ನಿಲ್ದಾಣ', avgTimeFromPrev: 0, location: { lat: 13.9299, lng: 75.5681 } },
      { id: 'ayanur', name: 'Ayanur', nameKn: 'ಅಯನೂರು', avgTimeFromPrev: 25, location: { lat: 14.0044, lng: 75.4389 } },
      { id: 'kumsi', name: 'Kumsi', nameKn: 'ಕುಮಸಿ', avgTimeFromPrev: 20, location: { lat: 14.0744, lng: 75.3589 } },
      { id: 'anandapura', name: 'Anandapura', nameKn: 'ಆನಂದಪುರ', avgTimeFromPrev: 30, location: { lat: 14.1122, lng: 75.1889 } },
      { id: 'sagar', name: 'Sagar City', nameKn: 'ಸಾಗರ ನಗರ', avgTimeFromPrev: 25, location: { lat: 14.1620, lng: 75.0298 } },
    ]
  },
  {
    id: 'mysuru-madikeri',
    name: 'Mysuru to Madikeri',
    nameKn: 'ಮೈಸೂರು - ಮಡಿಕೇರಿ',
    stops: [
      { id: 'mysuru', name: 'Mysuru Palace Gate', nameKn: 'ಮೈಸೂರು ಅರಮನೆ', avgTimeFromPrev: 0, location: { lat: 12.2958, lng: 76.6394 } },
      { id: 'hunsur', name: 'Hunsur', nameKn: 'ಹುಣಸೂರು', avgTimeFromPrev: 60, location: { lat: 12.3082, lng: 76.2891 } },
      { id: 'periyapatna', name: 'Periyapatna', nameKn: 'ಪಿರಿಯಾಪಟ್ಟಣ', avgTimeFromPrev: 35, location: { lat: 12.3424, lng: 76.0967 } },
      { id: 'kushalnagar', name: 'Kushalnagar', nameKn: 'ಕುಶಾಲನಗರ', avgTimeFromPrev: 40, location: { lat: 12.4439, lng: 75.9619 } },
      { id: 'madikeri', name: 'Madikeri Coorg', nameKn: 'ಮಡಿಕೇರಿ ಕೊಡಗು', avgTimeFromPrev: 50, location: { lat: 12.4244, lng: 75.7382 } },
    ]
  },
  {
    id: 'bidar-basavakalyan',
    name: 'Bidar to Basavakalyan',
    nameKn: 'ಬೀದರ್ - ಬಸವಕಲ್ಯಾಣ',
    stops: [
      { id: 'bidar-bus-stand', name: 'Bidar Bus Stand', nameKn: 'ಬೀದರ್ ಬಸ್ ನಿಲ್ದಾಣ', avgTimeFromPrev: 0, location: { lat: 17.9126, lng: 77.5172 } },
      { id: 'manna-ekhelli', name: 'Manna Ekhelli', nameKn: 'ಮನ್ನಾ ಎಖೆಳ್ಳಿ', avgTimeFromPrev: 35, location: { lat: 17.8427, lng: 77.3486 } },
      { id: 'humnabad-cross', name: 'Humnabad Cross', nameKn: 'ಹುಮ್ನಾಬಾದ್ ಕ್ರಾಸ್', avgTimeFromPrev: 25, location: { lat: 17.7719, lng: 77.1264 } },
      { id: 'basavakalyan', name: 'Basavakalyan City', nameKn: 'ಬಸವಕಲ್ಯಾಣ ನಗರ', avgTimeFromPrev: 45, location: { lat: 17.8732, lng: 76.9497 } },
    ]
  }
];

export async function seedRoutes() {
  const path = 'routes';
  try {
    console.log('Seeding dummy routes...');
    for (const route of DUMMY_ROUTES) {
      await setDoc(doc(db, path, route.id), route);
    }
    console.log('Seeding complete.');
  } catch (error: any) {
    // If it's a permission error, we just log it and continue.
    // This allows non-admin users to still use the app with existing data.
    if (error.code === 'permission-denied') {
      console.warn('Seeding skipped: No permissions to write to routes. This is expected for non-admin users.');
      return;
    }
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
