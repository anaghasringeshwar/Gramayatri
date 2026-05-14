import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { OperationType, Route } from './types';
import { handleFirestoreError } from './lib/firestoreUtils';

const DUMMY_ROUTES: Route[] = [
  {
    id: 'bidar-kamalapur',
    name: 'Bidar to Kamalapur',
    stops: [
      { id: 'bidar', name: 'Bidar Central', avgTimeFromPrev: 0, location: { lat: 17.9126, lng: 77.5172 } },
      { id: 'hallikhed', name: 'Hallikhed', avgTimeFromPrev: 25, location: { lat: 17.7818, lng: 77.2917 } },
      { id: 'homnabad', name: 'Homnabad', avgTimeFromPrev: 30, location: { lat: 17.7719, lng: 77.1264 } },
      { id: 'kamalapur', name: 'Kamalapur', avgTimeFromPrev: 40, location: { lat: 17.5878, lng: 77.0142 } },
    ]
  },
  {
    id: 'kalaburagi-afzalpur',
    name: 'Kalaburagi to Afzalpur',
    stops: [
      { id: 'kalaburagi', name: 'Kalaburagi City', avgTimeFromPrev: 0, location: { lat: 17.3297, lng: 76.8343 } },
      { id: 'farhatabad', name: 'Farhatabad', avgTimeFromPrev: 20, location: { lat: 17.2023, lng: 76.8456 } },
      { id: 'sonth', name: 'Sonth', avgTimeFromPrev: 25, location: { lat: 17.1517, lng: 76.7111 } },
      { id: 'afzalpur', name: 'Afzalpur', avgTimeFromPrev: 35, location: { lat: 17.2045, lng: 76.3571 } },
    ]
  },
  {
    id: 'kalaburagi-yadgir',
    name: 'Kalaburagi to Yadgir',
    stops: [
      { id: 'kalaburagi-city', name: 'Kalaburagi City', avgTimeFromPrev: 0, location: { lat: 17.3297, lng: 76.8343 } },
      { id: 'shahabad', name: 'Shahabad', avgTimeFromPrev: 30, location: { lat: 17.1332, lng: 76.9372 } },
      { id: 'wadi', name: 'Wadi Junction', avgTimeFromPrev: 20, location: { lat: 17.0505, lng: 76.9930 } },
      { id: 'yadgir', name: 'Yadgir Central', avgTimeFromPrev: 45, location: { lat: 16.7667, lng: 77.1333 } },
    ]
  },
  {
    id: 'raichur-mantralayam',
    name: 'Raichur to Mantralayam',
    stops: [
      { id: 'raichur', name: 'Raichur Terminal', avgTimeFromPrev: 0, location: { lat: 16.2120, lng: 77.3439 } },
      { id: 'shaktinagar', name: 'Shaktinagar', avgTimeFromPrev: 35, location: { lat: 16.2415, lng: 77.4208 } },
      { id: 'mantralayam', name: 'Mantralayam Road', avgTimeFromPrev: 40, location: { lat: 15.9423, lng: 77.4283 } },
    ]
  },
  {
    id: 'vijayapura-bagalkot',
    name: 'Vijayapura to Bagalkot',
    stops: [
      { id: 'vijayapura', name: 'Vijayapura Hub', avgTimeFromPrev: 0, location: { lat: 16.8302, lng: 75.7100 } },
      { id: 'basavana-bagewadi', name: 'Basavana Bagewadi', avgTimeFromPrev: 45, location: { lat: 16.5828, lng: 75.9754 } },
      { id: 'hungund', name: 'Hungund', avgTimeFromPrev: 40, location: { lat: 16.0667, lng: 76.0500 } },
      { id: 'bagalkot', name: 'Bagalkot Central', avgTimeFromPrev: 35, location: { lat: 16.1817, lng: 75.6958 } },
    ]
  },
  {
    id: 'belagavi-hubli',
    name: 'Belagavi to Hubli',
    stops: [
      { id: 'belagavi', name: 'Belagavi Central', avgTimeFromPrev: 0, location: { lat: 15.8497, lng: 74.4977 } },
      { id: 'kittur', name: 'Kittur Fort', avgTimeFromPrev: 50, location: { lat: 15.6025, lng: 74.7933 } },
      { id: 'hubli', name: 'Hubli Junction', avgTimeFromPrev: 55, location: { lat: 15.3647, lng: 75.1240 } },
    ]
  },
  {
    id: 'hubli-dharwad',
    name: 'Hubli to Dharwad (BRTS)',
    stops: [
      { id: 'hubli-cbt', name: 'Hubli CBT', avgTimeFromPrev: 0, location: { lat: 15.3647, lng: 75.1240 } },
      { id: 'unakal', name: 'Unakal Lake', avgTimeFromPrev: 10, location: { lat: 15.3855, lng: 75.1054 } },
      { id: 'vidyanagar', name: 'Vidyanagar', avgTimeFromPrev: 8, location: { lat: 15.4055, lng: 75.0854 } },
      { id: 'navanagar', name: 'Navanagar', avgTimeFromPrev: 12, location: { lat: 15.4255, lng: 75.0554 } },
      { id: 'dharwad-cbt', name: 'Dharwad CBT', avgTimeFromPrev: 15, location: { lat: 15.4589, lng: 75.0078 } },
    ]
  },
  {
    id: 'shivamogga-sagar',
    name: 'Shivamogga to Sagar',
    stops: [
      { id: 'shivamogga', name: 'Shivamogga Bus Stand', avgTimeFromPrev: 0, location: { lat: 13.9299, lng: 75.5681 } },
      { id: 'ayanur', name: 'Ayanur', avgTimeFromPrev: 25, location: { lat: 14.0044, lng: 75.4389 } },
      { id: 'kumsi', name: 'Kumsi', avgTimeFromPrev: 20, location: { lat: 14.0744, lng: 75.3589 } },
      { id: 'anandapura', name: 'Anandapura', avgTimeFromPrev: 30, location: { lat: 14.1122, lng: 75.1889 } },
      { id: 'sagar', name: 'Sagar City', avgTimeFromPrev: 25, location: { lat: 14.1620, lng: 75.0298 } },
    ]
  },
  {
    id: 'mysuru-madikeri',
    name: 'Mysuru to Madikeri',
    stops: [
      { id: 'mysuru', name: 'Mysuru Palace Gate', avgTimeFromPrev: 0, location: { lat: 12.2958, lng: 76.6394 } },
      { id: 'hunsur', name: 'Hunsur', avgTimeFromPrev: 60, location: { lat: 12.3082, lng: 76.2891 } },
      { id: 'periyapatna', name: 'Periyapatna', avgTimeFromPrev: 35, location: { lat: 12.3424, lng: 76.0967 } },
      { id: 'kushalnagar', name: 'Kushalnagar', avgTimeFromPrev: 40, location: { lat: 12.4439, lng: 75.9619 } },
      { id: 'madikeri', name: 'Madikeri Coorg', avgTimeFromPrev: 50, location: { lat: 12.4244, lng: 75.7382 } },
    ]
  },
  {
    id: 'bidar-basavakalyan',
    name: 'Bidar to Basavakalyan',
    stops: [
      { id: 'bidar-bus-stand', name: 'Bidar Bus Stand', avgTimeFromPrev: 0, location: { lat: 17.9126, lng: 77.5172 } },
      { id: 'manna-ekhelli', name: 'Manna Ekhelli', avgTimeFromPrev: 35, location: { lat: 17.8427, lng: 77.3486 } },
      { id: 'humnabad-cross', name: 'Humnabad Cross', avgTimeFromPrev: 25, location: { lat: 17.7719, lng: 77.1264 } },
      { id: 'basavakalyan', name: 'Basavakalyan City', avgTimeFromPrev: 45, location: { lat: 17.8732, lng: 76.9497 } },
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
