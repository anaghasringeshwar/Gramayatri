export type Language = 'en' | 'kn';

export interface LocalUser {
  name: string;
  language: Language;
}

export interface Stop {
  id: string;
  name: string;
  nameKn?: string;
  avgTimeFromPrev: number;
  location: google.maps.LatLngLiteral;
}

export interface Route {
  id: string;
  name: string;
  nameKn?: string;
  stops: Stop[];
}

export interface Ping {
  id?: string;
  routeId: string;
  stopId: string;
  timestamp: any;
  userId: string;
  userName: string;
}

export interface Alert {
  id?: string;
  routeId: string;
  type: 'delay' | 'cancel' | 'other';
  message: string;
  timestamp: any;
  userId: string;
  userName: string;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}
