/**
 * Patient Scan History Data
 * Contains scan history with tumor data points for each patient
 * Time entries are in years, tumor counts from actual YOLO detection
 * Images are matched from the yes/no dataset folders
 */

export const PATIENT_SCAN_HISTORY = {
  'John Smith': {
    scans: [
      {
        year: 2019,
        date: '2019-01-10',
        image: '/dataset/no/N5.jpg',
        tumorCount: 0,
        tumorAreaPercent: 0.0,
        status: 'clean',
        confidence: 0.95
      },
      {
        year: 2019,
        date: '2019-06-15',
        image: '/dataset/no/N6.jpg',
        tumorCount: 0,
        tumorAreaPercent: 0.0,
        status: 'clean',
        confidence: 0.95
      },
      {
        year: 2020,
        date: '2020-03-15',
        image: '/dataset/yes/Y1.jpg',
        tumorCount: 1,
        tumorAreaPercent: 2.0,
        status: 'tumour',
        confidence: 0.92
      },
      {
        year: 2021,
        date: '2021-06-20',
        image: '/dataset/yes/Y10.jpg',
        tumorCount: 1,
        tumorAreaPercent: 2.3,
        status: 'tumour',
        confidence: 0.82
      },
      {
        year: 2022,
        date: '2022-09-10',
        image: '/dataset/yes/Y20.jpg',
        tumorCount: 1,
        tumorAreaPercent: 2.6,
        status: 'tumour',
        confidence: 0.86
      },
      {
        year: 2023,
        date: '2023-12-05',
        image: '/dataset/yes/Y30.jpg',
        tumorCount: 1,
        tumorAreaPercent: 2.9,
        status: 'tumour',
        confidence: 0.88
      },
      {
        year: 2024,
        date: '2024-11-15',
        image: '/dataset/yes/Y40.jpg',
        tumorCount: 1,
        tumorAreaPercent: 3.2,
        status: 'tumour',
        confidence: 0.87
      },
    ]
  },
  'Sarah Johnson': {
    scans: [
      {
        year: 2018,
        date: '2018-03-20',
        image: '/dataset/no/N7.jpg',
        tumorCount: 0,
        tumorAreaPercent: 0.0,
        status: 'clean',
        confidence: 0.95
      },
      {
        year: 2018,
        date: '2018-09-15',
        image: '/dataset/no/N8.jpg',
        tumorCount: 0,
        tumorAreaPercent: 0.0,
        status: 'clean',
        confidence: 0.95
      },
      {
        year: 2019,
        date: '2019-05-12',
        image: '/dataset/yes/Y2.jpg',
        tumorCount: 1,
        tumorAreaPercent: 2.0,
        status: 'tumour',
        confidence: 0.84
      },
      {
        year: 2020,
        date: '2020-08-18',
        image: '/dataset/yes/Y11.jpg',
        tumorCount: 1,
        tumorAreaPercent: 2.0,
        status: 'tumour',
        confidence: 0.78
      },
      {
        year: 2021,
        date: '2021-11-25',
        image: '/dataset/yes/Y21.jpg',
        tumorCount: 1,
        tumorAreaPercent: 2.3,
        status: 'tumour',
        confidence: 0.81
      },
      {
        year: 2022,
        date: '2022-02-14',
        image: '/dataset/yes/Y31.jpg',
        tumorCount: 3,
        tumorAreaPercent: 6.6,
        status: 'tumour',
        confidence: 0.59
      },
      {
        year: 2023,
        date: '2023-07-30',
        image: '/dataset/yes/Y41.jpg',
        tumorCount: 1,
        tumorAreaPercent: 2.9,
        status: 'tumour',
        confidence: 0.85
      },
      {
        year: 2024,
        date: '2024-12-01',
        image: '/dataset/yes/Y50.jpg',
        tumorCount: 1,
        tumorAreaPercent: 3.2,
        status: 'tumour',
        confidence: 0.74
      },
    ]
  },
  'Michael Chen': {
    scans: [
      {
        year: 2020,
        date: '2020-01-15',
        image: '/dataset/no/N9.jpg',
        tumorCount: 0,
        tumorAreaPercent: 0.0,
        status: 'clean',
        confidence: 0.95
      },
      {
        year: 2020,
        date: '2020-07-22',
        image: '/dataset/no/N10.jpg',
        tumorCount: 0,
        tumorAreaPercent: 0.0,
        status: 'clean',
        confidence: 0.95
      },
      {
        year: 2021,
        date: '2021-04-08',
        image: '/dataset/yes/Y3.jpg',
        tumorCount: 1,
        tumorAreaPercent: 2.3,
        status: 'tumour',
        confidence: 0.6
      },
      {
        year: 2022,
        date: '2022-07-15',
        image: '/dataset/yes/Y12.jpg',
        tumorCount: 1,
        tumorAreaPercent: 2.6,
        status: 'tumour',
        confidence: 0.67
      },
      {
        year: 2023,
        date: '2023-10-22',
        image: '/dataset/yes/Y22.jpg',
        tumorCount: 1,
        tumorAreaPercent: 2.9,
        status: 'tumour',
        confidence: 0.71
      },
      {
        year: 2024,
        date: '2024-11-20',
        image: '/dataset/yes/Y32.jpg',
        tumorCount: 1,
        tumorAreaPercent: 3.2,
        status: 'tumour',
        confidence: 0.83
      },
    ]
  },
  'Emily Rodriguez': {
    scans: [
      {
        year: 2019,
        date: '2019-04-10',
        image: '/dataset/no/N11.jpg',
        tumorCount: 0,
        tumorAreaPercent: 0.0,
        status: 'clean',
        confidence: 0.95
      },
      {
        year: 2019,
        date: '2019-10-18',
        image: '/dataset/no/N12.jpg',
        tumorCount: 0,
        tumorAreaPercent: 0.0,
        status: 'clean',
        confidence: 0.95
      },
      {
        year: 2020,
        date: '2020-01-20',
        image: '/dataset/yes/Y4.jpg',
        tumorCount: 1,
        tumorAreaPercent: 2.0,
        status: 'tumour',
        confidence: 0.88
      },
      {
        year: 2021,
        date: '2021-04-12',
        image: '/dataset/yes/Y13.jpg',
        tumorCount: 1,
        tumorAreaPercent: 2.3,
        status: 'tumour',
        confidence: 0.86
      },
      {
        year: 2022,
        date: '2022-07-08',
        image: '/dataset/yes/Y23.jpg',
        tumorCount: 1,
        tumorAreaPercent: 2.6,
        status: 'tumour',
        confidence: 0.83
      },
      {
        year: 2023,
        date: '2023-09-25',
        image: '/dataset/yes/Y33.jpg',
        tumorCount: 1,
        tumorAreaPercent: 2.9,
        status: 'tumour',
        confidence: 0.82
      },
      {
        year: 2024,
        date: '2024-10-10',
        image: '/dataset/yes/Y42.jpg',
        tumorCount: 1,
        tumorAreaPercent: 3.2,
        status: 'tumour',
        confidence: 0.87
      },
    ]
  },
  'David Kim': {
    scans: [
      {
        year: 2021,
        date: '2021-06-05',
        image: '/dataset/no/N13.jpg',
        tumorCount: 0,
        tumorAreaPercent: 0.0,
        status: 'clean',
        confidence: 0.95
      },
      {
        year: 2021,
        date: '2021-12-10',
        image: '/dataset/no/N14.jpg',
        tumorCount: 0,
        tumorAreaPercent: 0.0,
        status: 'clean',
        confidence: 0.95
      },
      {
        year: 2022,
        date: '2022-06-15',
        image: '/dataset/yes/Y14.jpg',
        tumorCount: 1,
        tumorAreaPercent: 2.6,
        status: 'tumour',
        confidence: 0.84
      },
      {
        year: 2023,
        date: '2023-01-20',
        image: '/dataset/yes/Y24.jpg',
        tumorCount: 1,
        tumorAreaPercent: 2.9,
        status: 'tumour',
        confidence: 0.55
      },
      {
        year: 2023,
        date: '2023-04-25',
        image: '/dataset/yes/Y34.jpg',
        tumorCount: 1,
        tumorAreaPercent: 2.9,
        status: 'tumour',
        confidence: 0.74
      },
      {
        year: 2024,
        date: '2024-01-15',
        image: '/dataset/yes/Y51.jpg',
        tumorCount: 1,
        tumorAreaPercent: 3.2,
        status: 'tumour',
        confidence: 0.74
      },
      {
        year: 2024,
        date: '2024-04-20',
        image: '/dataset/yes/Y60.jpg',
        tumorCount: 1,
        tumorAreaPercent: 3.2,
        status: 'tumour',
        confidence: 0.79
      },
      {
        year: 2024,
        date: '2024-07-25',
        image: '/dataset/yes/Y70.jpg',
        tumorCount: 1,
        tumorAreaPercent: 3.2,
        status: 'tumour',
        confidence: 0.88
      },
    ]
  },
  'Lisa Anderson': {
    scans: [
      {
        year: 2021,
        date: '2021-02-10',
        image: '/dataset/no/N1.jpeg',
        tumorCount: 0,
        tumorAreaPercent: 0.0,
        status: 'clean',
        confidence: 0.95
      },
      {
        year: 2022,
        date: '2022-05-18',
        image: '/dataset/no/N2.jpeg',
        tumorCount: 0,
        tumorAreaPercent: 0.0,
        status: 'clean',
        confidence: 0.95
      },
      {
        year: 2023,
        date: '2023-08-22',
        image: '/dataset/no/N3.jpg',
        tumorCount: 0,
        tumorAreaPercent: 0.0,
        status: 'clean',
        confidence: 0.95
      },
      {
        year: 2024,
        date: '2024-11-28',
        image: '/dataset/no/N4.jpg',
        tumorCount: 0,
        tumorAreaPercent: 0.0,
        status: 'clean',
        confidence: 0.95
      },
    ]
  },
  'James Wilson': {
    scans: [
      {
        year: 2019,
        date: '2019-02-20',
        image: '/dataset/no/N15.jpg',
        tumorCount: 0,
        tumorAreaPercent: 0.0,
        status: 'clean',
        confidence: 0.95
      },
      {
        year: 2019,
        date: '2019-08-30',
        image: '/dataset/no/N16.jpg',
        tumorCount: 0,
        tumorAreaPercent: 0.0,
        status: 'clean',
        confidence: 0.95
      },
      {
        year: 2020,
        date: '2020-06-15',
        image: '/dataset/yes/Y6.jpg',
        tumorCount: 1,
        tumorAreaPercent: 2.0,
        status: 'tumour',
        confidence: 0.68
      },
      {
        year: 2021,
        date: '2021-09-20',
        image: '/dataset/yes/Y15.jpg',
        tumorCount: 1,
        tumorAreaPercent: 2.3,
        status: 'tumour',
        confidence: 0.74
      },
      {
        year: 2022,
        date: '2022-12-10',
        image: '/dataset/yes/Y25.jpg',
        tumorCount: 1,
        tumorAreaPercent: 2.6,
        status: 'tumour',
        confidence: 0.9
      },
      {
        year: 2023,
        date: '2023-03-18',
        image: '/dataset/yes/Y35.jpg',
        tumorCount: 1,
        tumorAreaPercent: 2.9,
        status: 'tumour',
        confidence: 0.79
      },
      {
        year: 2024,
        date: '2024-12-03',
        image: '/dataset/yes/Y44.jpg',
        tumorCount: 1,
        tumorAreaPercent: 3.2,
        status: 'tumour',
        confidence: 0.86
      },
    ]
  },
  'Maria Garcia': {
    scans: [
      {
        year: 2019,
        date: '2019-03-15',
        image: '/dataset/no/N17.jpg',
        tumorCount: 0,
        tumorAreaPercent: 0.0,
        status: 'clean',
        confidence: 0.95
      },
      {
        year: 2019,
        date: '2019-11-20',
        image: '/dataset/no/N18.jpg',
        tumorCount: 0,
        tumorAreaPercent: 0.0,
        status: 'clean',
        confidence: 0.95
      },
      {
        year: 2020,
        date: '2020-09-12',
        image: '/dataset/yes/Y7.jpg',
        tumorCount: 1,
        tumorAreaPercent: 2.0,
        status: 'tumour',
        confidence: 0.83
      },
      {
        year: 2021,
        date: '2021-12-18',
        image: '/dataset/yes/Y16.jpg',
        tumorCount: 1,
        tumorAreaPercent: 2.3,
        status: 'tumour',
        confidence: 0.74
      },
      {
        year: 2022,
        date: '2022-03-25',
        image: '/dataset/yes/Y26.jpg',
        tumorCount: 1,
        tumorAreaPercent: 2.6,
        status: 'tumour',
        confidence: 0.79
      },
      {
        year: 2023,
        date: '2023-06-30',
        image: '/dataset/yes/Y36.jpg',
        tumorCount: 1,
        tumorAreaPercent: 2.9,
        status: 'tumour',
        confidence: 0.85
      },
      {
        year: 2024,
        date: '2024-11-22',
        image: '/dataset/yes/Y45.jpg',
        tumorCount: 1,
        tumorAreaPercent: 3.2,
        status: 'tumour',
        confidence: 0.59
      },
    ]
  },
};

/**
 * Get scan history for a specific patient
 */
export function getPatientScanHistory(patientName) {
  return PATIENT_SCAN_HISTORY[patientName] || { scans: [] };
}

/**
 * Get chart data for a patient (for tumor count over time)
 */
export function getPatientChartData(patientName) {
  const history = getPatientScanHistory(patientName);
  if (!history.scans || history.scans.length === 0) {
    return [];
  }
  
  return history.scans.map(scan => ({
    year: scan.year,
    date: scan.date,
    tumors: scan.tumorCount,
    areaPercent: scan.tumorAreaPercent,
    confidence: scan.confidence
  }));
}
