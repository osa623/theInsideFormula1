import * as THREE from 'three'

export interface ExhibitionQRData {
  id: string
  triggerName: string
  boardName: string
  title: string
  subtitle: string
  year: string
  qrImagePath: string
  documentUrl: string
  specs: {
    engine?: string
    power?: string
    weight?: string
    championshipResult?: string
  }
}

export const EXHIBITION_QR_ITEMS: Record<string, ExhibitionQRData> = {
  'Trigger.001': {
    id: 'f1-2017',
    triggerName: 'Trigger.001',
    boardName: 'Naming_Board.001',
    title: '2017 FORMULA 1 TECHNICAL DOSSIER',
    subtitle: 'Wider Track & High-Downforce Aerodynamic Revolution',
    year: '2017',
    qrImagePath: '/images/Exh_QRs/2017_QR.png',
    documentUrl: 'https://f120172021.vercel.app/cars/2017',
    specs: {
      engine: '1.6L V6 Turbo Hybrid (15,000 RPM)',
      power: '950+ BHP (ICE + ERS)',
      weight: '728 kg',
      championshipResult: 'Constructors: Mercedes-AMG | Drivers: Lewis Hamilton',
    },
  },
  'Trigger.002': {
    id: 'f1-2018',
    triggerName: 'Trigger.002',
    boardName: 'Naming_Board.002',
    title: '2018 FORMULA 1 TECHNICAL DOSSIER',
    subtitle: 'Titanium Halo Cockpit Protection & Hyper-Soft Compounds',
    year: '2018',
    qrImagePath: '/images/Exh_QRs/2018_QR.png',
    documentUrl: 'https://f120172021.vercel.app/cars/2018',
    specs: {
      engine: '1.6L V6 Turbo Hybrid + MGU-K & MGU-H',
      power: '980+ BHP',
      weight: '733 kg (incl. 7kg Halo)',
      championshipResult: 'Constructors: Mercedes-AMG | Drivers: Lewis Hamilton',
    },
  },
  'Trigger.003': {
    id: 'f1-2019',
    triggerName: 'Trigger.003',
    boardName: 'Naming_Board.003',
    title: '2019 FORMULA 1 TECHNICAL DOSSIER',
    subtitle: 'Simplified Front Wings & 1000th World Championship Grand Prix',
    year: '2019',
    qrImagePath: '/images/Exh_QRs/2019_QR.png',
    documentUrl: 'https://f120172021.vercel.app/cars/2019',
    specs: {
      engine: '1.6L 90° V6 Turbocharged Hybrid',
      power: '1,000+ BHP (Peak Power)',
      weight: '743 kg',
      championshipResult: 'Constructors: Mercedes-AMG | Drivers: Lewis Hamilton',
    },
  },
  'Trigger.004': {
    id: 'f1-2020',
    triggerName: 'Trigger.004',
    boardName: 'Naming_Board.004',
    title: '2020 FORMULA 1 TECHNICAL DOSSIER',
    subtitle: 'The Fastest F1 Generation in History & Dual-Axis Steering (DAS)',
    year: '2020',
    qrImagePath: '/images/Exh_QRs/2020_QR.png',
    documentUrl: 'https://f120172021.vercel.app/cars/2020',
    specs: {
      engine: 'Mercedes-AMG M11 EQ Performance',
      power: '1,025+ BHP',
      weight: '746 kg',
      championshipResult: 'Record Lap Times: All-Time Track Records across Monza/Silverstone',
    },
  },
  'Trigger.005': {
    id: 'f1-2021',
    triggerName: 'Trigger.005',
    boardName: 'Naming_Board.005',
    title: '2021 FORMULA 1 TECHNICAL DOSSIER',
    subtitle: 'Triangular Floor Cuts & The Legendary Title Showdown',
    year: '2021',
    qrImagePath: '/images/Exh_QRs/2021_QR.png',
    documentUrl: 'https://f120172021.vercel.app/cars/2021',
    specs: {
      engine: 'Honda RA621H / Mercedes-AMG M12',
      power: '1,030+ BHP',
      weight: '752 kg',
      championshipResult: 'Drivers: Max Verstappen (Red Bull) | Constructors: Mercedes',
    },
  },
  'Trigger.000': {
    id: 'senna-mp4-6',
    triggerName: 'Trigger.000',
    boardName: 'Naming_Board.000',
    title: 'AYRTON SENNA McLAREN MP4/6 DOSSIER',
    subtitle: 'Naturally Aspirated Honda V12 & 1991 World Championship Icon',
    year: '1991',
    qrImagePath: '/images/Exh_QRs/senna_QR.png',
    documentUrl: 'https://f120172021.vercel.app/cars/mp4-6',
    specs: {
      engine: 'Honda RA121E 60° 3.5L Naturally Aspirated V12',
      power: '780 BHP @ 14,800 RPM',
      weight: '505 kg (Ultra Lightweight Carbon)',
      championshipResult: 'Drivers: Ayrton Senna (1991 World Drivers Champion)',
    },
  },
}

export interface ExhibitionTriggerPoint {
  id: string
  name: string
  position: THREE.Vector3
  targetBoardName: string
  qrData?: ExhibitionQRData
  isMap?: boolean
  isExit?: boolean
}

export interface ExhibitionBoard {
  name: string
  position: THREE.Vector3
  cameraPosition: THREE.Vector3
  lookAtPosition: THREE.Vector3
}
