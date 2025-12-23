/**
 * Patient User Stories
 * Detailed medical profiles for each patient including age, conditions,
 * and how their conditions may make them more susceptible to brain tumours.
 */

export const PATIENT_STORIES = [
  {
    Name: 'John Smith',
    Age: 62,
    Gender: 'Male',
    Ethnicity: 'Caucasian',
    Narrative: `John Smith is a 62-year-old Caucasian male with a significant family history of brain tumours and multiple risk factors for central nervous system malignancies. His father was diagnosed with glioblastoma at age 68, which increases Mr. Smith's genetic predisposition risk by approximately two to threefold compared to the general population. Additionally, he sustained significant head trauma in a motor vehicle accident in 2015, which resulted in chronic inflammation and glial cell damage that may predispose him to secondary brain tumour development.

Mr. Smith has a 20-year history of occupational exposure to industrial chemicals, including benzene and formaldehyde, which have been epidemiologically linked to increased central nervous system tumour risk. His age of 62 places him in a higher-risk demographic for primary brain tumours, particularly gliomas and meningiomas. He also has a history of Type 2 diabetes mellitus, diagnosed in 2018, and well-controlled hypertension. The chronic inflammatory state associated with diabetes may contribute to alterations in the tumour microenvironment that could facilitate neoplastic growth.

Currently, Mr. Smith is maintained on metformin 500mg twice daily, lisinopril 10mg daily, and aspirin 81mg daily. He is enrolled in a regular surveillance protocol with brain imaging performed every three months. His most recent scan was completed on November 15, 2024, with the next scheduled surveillance scan planned for February 15, 2025. Given the combination of genetic predisposition, environmental exposures, and age-related risk factors, his overall risk level for brain tumour development is classified as moderate to high.`,
    MedicalHistory: [
      'Type 2 Diabetes (diagnosed 2018)',
      'Hypertension (controlled with medication)',
      'Previous head trauma from motor vehicle accident (2015)',
      'Family history of glioblastoma (father)',
      'Long-term occupational exposure to industrial chemicals (20+ years)'
    ],
    CurrentMedications: [
      'Metformin 500mg twice daily',
      'Lisinopril 10mg daily',
      'Aspirin 81mg daily'
    ],
    RiskLevel: 'Moderate-High',
    LastScan: '2024-11-15',
    NextScheduledScan: '2025-02-15'
  },
  {
    Name: 'Sarah Johnson',
    Age: 34,
    Gender: 'Female',
    Ethnicity: 'Caucasian',
    Narrative: `Sarah Johnson is a 34-year-old Caucasian female with a confirmed diagnosis of Neurofibromatosis Type 1 (NF1), which was established in childhood. This autosomal dominant genetic disorder results from mutations in the NF1 tumour suppressor gene, significantly increasing her lifetime risk of central nervous system tumours to approximately 15 to 20 percent. The patient exhibits characteristic features of NF1, including multiple café-au-lait spots and cutaneous neurofibromas.

Ms. Johnson has a significant history of a previous optic pathway glioma that was treated with chemotherapy between 2010 and 2012. This prior tumour development indicates an active tumour predisposition and demonstrates that her genetic condition has already manifested in CNS tumor formation. Patients with NF1 have a well-documented increased risk of developing pilocytic astrocytomas, gliomas, and meningiomas throughout their lifetime. The underlying genetic mutation affects tumour suppressor gene function, leading to dysregulated cell growth and proliferation.

She also has a well-controlled seizure disorder managed with levetiracetam, and she experiences learning disabilities that are secondary to her NF1 diagnosis. Her current medication regimen includes levetiracetam 1000mg twice daily, folic acid supplementation, and vitamin D3 2000 IU daily. Given her young age and the progressive nature of NF1-related tumours, she requires frequent and vigilant monitoring for new tumour development. Her most recent brain imaging was performed on December 1, 2024, with the next surveillance scan scheduled for January 15, 2025. Her risk level for brain tumour development is classified as high.`,
    MedicalHistory: [
      'Neurofibromatosis Type 1 (NF1) - diagnosed in childhood',
      'Multiple café-au-lait spots and neurofibromas',
      'Optic pathway glioma (treated with chemotherapy 2010-2012)',
      'Seizure disorder (well-controlled with levetiracetam)',
      'Learning disabilities secondary to NF1'
    ],
    CurrentMedications: [
      'Levetiracetam 1000mg twice daily',
      'Folic acid supplementation',
      'Vitamin D3 2000 IU daily'
    ],
    RiskLevel: 'High',
    LastScan: '2024-12-01',
    NextScheduledScan: '2025-01-15'
  },
  {
    Name: 'Michael Chen',
    Age: 28,
    Gender: 'Male',
    Ethnicity: 'Asian',
    Narrative: `Michael Chen is a 28-year-old Asian male with Li-Fraumeni Syndrome (LFS), a rare autosomal dominant cancer predisposition syndrome caused by a confirmed TP53 mutation identified through genetic testing. This condition confers an extremely high lifetime risk of developing various cancers, with up to 90 percent of affected individuals developing cancer by age 70, including a 10 to 15 percent risk of developing brain tumours, particularly choroid plexus carcinomas and medulloblastomas.

Mr. Chen's personal cancer history includes a previous osteosarcoma of the left femur that was successfully treated in 2018. His family history is significant for multiple cancers: his mother was diagnosed with breast cancer, and tragically, his sister developed a brain tumor at the age of 12. This pattern is characteristic of Li-Fraumeni Syndrome and demonstrates the profound impact of the TP53 mutation, which impairs critical DNA repair mechanisms, allowing unchecked tumour development across multiple organ systems.

Currently, Mr. Chen has no active malignancies and is not receiving any cancer-directed therapy. His medication regimen is limited to a daily multivitamin and calcium with vitamin D supplementation. However, given his genetic syndrome and previous cancer history, he requires aggressive surveillance with brain imaging performed every three to six months. His most recent scan was completed on November 20, 2024, with the next scheduled surveillance imaging planned for February 20, 2025. His risk level for brain tumour development is classified as very high, necessitating lifelong vigilant monitoring.`,
    MedicalHistory: [
      'Li-Fraumeni Syndrome (TP53 mutation confirmed via genetic testing)',
      'Previous osteosarcoma (left femur, treated 2018)',
      'Family history: mother (breast cancer), sister (brain tumor at age 12)',
      'No current active malignancies',
      'Regular surveillance imaging protocol'
    ],
    CurrentMedications: [
      'No active cancer treatment',
      'Multivitamin daily',
      'Calcium and vitamin D supplementation'
    ],
    RiskLevel: 'Very High',
    LastScan: '2024-11-20',
    NextScheduledScan: '2025-02-20'
  },
  {
    Name: 'Emily Rodriguez',
    Age: 45,
    Gender: 'Female',
    Ethnicity: 'Hispanic',
    Narrative: `Emily Rodriguez is a 45-year-old Hispanic female with a significant history of childhood acute lymphoblastic leukaemia (ALL) that was successfully treated in 1995. As part of her treatment protocol, she received cranial radiation therapy with a total dose of 24 Gy to the cranium. This therapeutic radiation exposure significantly increases her risk of developing secondary brain tumours, with studies demonstrating a 10 to 20-fold increased risk compared to the general population.

The radiation-induced DNA damage from her childhood treatment can lead to the development of meningiomas, gliomas, and other central nervous system tumours, with a typical latency period of 10 to 30 years post-radiation. At age 45, Ms. Rodriguez is currently within the peak risk period for radiation-induced tumour development. Higher radiation doses, particularly those exceeding 20 Gy such as she received, have been shown to correlate with increased tumour risk. She has developed hypothyroidism secondary to her radiation exposure, which is managed with levothyroxine 75mcg daily, and she experiences mild cognitive deficits that are also attributed to her prior radiation treatment.

Ms. Rodriguez has had no recurrence of her leukaemia and remains in complete remission. Her current medication regimen includes levothyroxine 75mcg daily, sertraline 50mg daily for depression, and a daily multivitamin. She is maintained on a regular surveillance protocol with brain imaging performed every three months. Her most recent scan was completed on October 10, 2024, with the next scheduled surveillance imaging planned for January 10, 2025. Given her radiation history and current age, her risk level for brain tumour development is classified as high.`,
    MedicalHistory: [
      'History of childhood leukaemia (ALL, treated with cranial radiation therapy 1995)',
      'Radiation dose: 24 Gy to cranium',
      'Hypothyroidism secondary to radiation (on levothyroxine)',
      'Mild cognitive deficits from radiation exposure',
      'No recurrence of leukaemia'
    ],
    CurrentMedications: [
      'Levothyroxine 75mcg daily',
      'Antidepressant (sertraline 50mg daily)',
      'Multivitamin'
    ],
    RiskLevel: 'High',
    LastScan: '2024-10-10',
    NextScheduledScan: '2025-01-10'
  },
  {
    Name: 'David Kim',
    Age: 71,
    Gender: 'Male',
    Ethnicity: 'Asian',
    Narrative: `David Kim is a 71-year-old Asian male with active metastatic lung adenocarcinoma, initially diagnosed in 2022. His disease has progressed to involve the central nervous system, with brain metastases that were identified and treated with stereotactic radiosurgery in 2023. The presence of brain metastases indicates active metastatic disease, and the existing brain lesions require close and frequent monitoring for progression or the development of new metastatic lesions.

Mr. Kim has a significant smoking history with 40 pack-years of tobacco use, though he successfully quit in 2020. He also has a diagnosis of chronic obstructive pulmonary disease (COPD), which is managed with an albuterol inhaler as needed. His age of 71, combined with his extensive smoking history, increases his risk for both primary and secondary brain tumours. Additionally, the immunosuppressive effects of his active cancer and ongoing treatment may create an environment that allows for tumour growth and progression.

Currently, Mr. Kim is receiving targeted therapy with osimertinib 80mg daily for his lung adenocarcinoma. He is also maintained on prednisone 10mg daily, which is being tapered, and dexamethasone 4mg daily to manage brain oedema associated with his metastases. Given the active nature of his disease, he requires very frequent surveillance with brain imaging performed monthly. His most recent scan was completed on December 5, 2024, with the next scheduled imaging planned for January 5, 2025. It is important to note that his previous radiation treatment for metastases can potentially cause secondary radiation-induced tumours in the future. His risk level for brain tumour development is classified as very high due to active disease.`,
    MedicalHistory: [
      'Metastatic lung adenocarcinoma (diagnosed 2022)',
      'Brain metastases identified and treated with stereotactic radiosurgery (2023)',
      'Currently on targeted therapy (osimertinib)',
      'Chronic obstructive pulmonary disease (COPD)',
      'History of heavy smoking (40 pack-years, quit 2020)'
    ],
    CurrentMedications: [
      'Osimertinib 80mg daily',
      'Albuterol inhaler as needed',
      'Prednisone 10mg daily (tapering)',
      'Dexamethasone 4mg daily (for brain oedema)'
    ],
    RiskLevel: 'Very High (Active Disease)',
    LastScan: '2024-12-05',
    NextScheduledScan: '2025-01-05'
  },
  {
    Name: 'Lisa Anderson',
    Age: 38,
    Gender: 'Female',
    Ethnicity: 'Caucasian',
    Narrative: `Lisa Anderson is a 38-year-old Caucasian female with relapsing-remitting multiple sclerosis (RRMS), diagnosed in 2018. She is currently maintained on disease-modifying therapy with ocrelizumab 600mg administered intravenously every six months. Her MS history includes episodes of optic neuritis in 2019 and 2021, and she experiences mild cognitive impairment that is consistent with her MS diagnosis. Additionally, she has autoimmune thyroiditis (Hashimoto's disease), which is managed with levothyroxine 50mcg daily.

While multiple sclerosis itself does not directly cause brain tumours, there are several factors that make regular brain imaging surveillance important for Ms. Anderson. The immunosuppressive nature of her disease-modifying therapy, particularly ocrelizumab, may slightly increase her risk of certain cancers. Furthermore, the chronic neuroinflammation associated with MS may contribute to glial cell changes over time. From a diagnostic perspective, there is a clinical need to differentiate between MS lesions and potential tumors on imaging studies, as both can present with similar radiographic features.

Her current medication regimen includes ocrelizumab 600mg IV every six months, levothyroxine 50mcg daily, vitamin D3 5000 IU daily, and baclofen 10mg three times daily for spasticity management. It is worth noting that women between the ages of 30 and 50 represent a common demographic for both multiple sclerosis and certain types of brain tumours, which further supports the importance of surveillance. Her most recent brain imaging was performed on November 28, 2024, with the next scheduled scan planned for May 28, 2025. Her risk level for brain tumour development is classified as low to moderate.`,
    MedicalHistory: [
      'Multiple Sclerosis (RRMS, diagnosed 2018)',
      'Currently on disease-modifying therapy (ocrelizumab)',
      'History of optic neuritis (2019, 2021)',
      'Mild cognitive impairment',
      'Autoimmune thyroiditis (Hashimoto\'s)'
    ],
    CurrentMedications: [
      'Ocrelizumab 600mg IV every 6 months',
      'Levothyroxine 50mcg daily',
      'Vitamin D3 5000 IU daily',
      'Baclofen 10mg three times daily (for spasticity)'
    ],
    RiskLevel: 'Low-Moderate',
    LastScan: '2024-11-28',
    NextScheduledScan: '2025-05-28'
  },
  {
    Name: 'James Wilson',
    Age: 55,
    Gender: 'Male',
    Ethnicity: 'Caucasian',
    Narrative: `James Wilson is a 55-year-old Caucasian male with Von Hippel-Lindau (VHL) syndrome, a rare autosomal dominant genetic disorder confirmed through genetic testing that demonstrates a mutation in the VHL tumour suppressor gene. This condition carries a 60 to 80 percent lifetime risk of developing central nervous system haemangioblastomas, which are highly vascular tumours that can occur in the cerebellum, spinal cord, and brainstem.

Mr. Wilson has a significant history of multiple haemangioblastomas involving both the cerebellum and spinal cord. He underwent surgical resection of a cerebellar haemangioblastoma in 2020. His disease also demonstrates the characteristic multi-organ involvement typical of VHL syndrome, including renal cell carcinoma that was treated in 2019, and bilateral retinal haemangioblastomas that were successfully treated with laser therapy. This pattern of involvement across the central nervous system, kidneys, and eyes is pathognomonic for VHL syndrome and reflects the systemic nature of the genetic mutation.

The VHL gene mutation affects tumour suppressor function, leading to the development of these vascular tumours throughout the patient's lifetime. Currently, Mr. Wilson is not receiving active cancer treatment, but he is maintained on losartan for blood pressure management and follows a regular surveillance protocol. Given his previous tumor history and the active disease predisposition inherent to VHL syndrome, he requires lifelong surveillance for new haemangioblastoma development. His most recent brain imaging was performed on December 3, 2024, with the next scheduled surveillance scan planned for March 3, 2025. His risk level for brain tumour development is classified as high.`,
    MedicalHistory: [
      'Von Hippel-Lindau (VHL) syndrome - confirmed genetic mutation',
      'Multiple haemangioblastomas (cerebellum, spinal cord)',
      'Previous surgical resection of cerebellar haemangioblastoma (2020)',
      'Renal cell carcinoma (treated 2019)',
      'Retinal haemangioblastomas (bilateral, treated with laser)'
    ],
    CurrentMedications: [
      'No active cancer treatment',
      'Blood pressure medication (losartan)',
      'Regular surveillance protocol'
    ],
    RiskLevel: 'High',
    LastScan: '2024-12-03',
    NextScheduledScan: '2025-03-03'
  },
  {
    Name: 'Maria Garcia',
    Age: 41,
    Gender: 'Female',
    Ethnicity: 'Hispanic',
    Narrative: `Maria Garcia is a 41-year-old Hispanic female with Tuberous Sclerosis Complex (TSC), a genetic disorder that was diagnosed in childhood. This condition results from mutations in either the TSC1 or TSC2 genes, which cause dysregulation of the mTOR signaling pathway, leading to the formation of various tumours throughout the body, including the central nervous system. Ms. Garcia demonstrates the characteristic features of TSC, including multiple cortical tubers and subependymal nodules visible on neuroimaging.

She has a documented subependymal giant cell astrocytoma (SEGA), which is currently stable on everolimus therapy. While SEGAs are histologically benign, they can grow and cause obstructive hydrocephalus, particularly when located near the foramen of Monro, which is their typical location. Approximately 15 to 20 percent of TSC patients develop SEGAs during their lifetime. Ms. Garcia also has multiple cortical tubers, which increase her seizure risk and require careful differentiation from other potential tumors on imaging studies. Her seizure disorder is well-controlled with lacosamide 200mg twice daily.

The mTOR inhibitor everolimus, which she takes at a dose of 5mg daily, helps control SEGA growth but requires ongoing surveillance to monitor for any changes in tumour size or the development of new lesions. Additionally, she has multiple renal angiomyolipomas that are currently stable. Her current medication regimen also includes blood pressure medication and she follows a regular monitoring protocol. Given the genetic nature of TSC, she faces a lifelong risk of new tumour development. Her most recent brain imaging was performed on November 22, 2024, with the next scheduled surveillance scan planned for February 22, 2025. Her risk level for brain tumour development is classified as high.`,
    MedicalHistory: [
      'Tuberous Sclerosis Complex (TSC) - diagnosed in childhood',
      'Multiple cortical tubers and subependymal nodules',
      'Subependymal giant cell astrocytoma (SEGA) - stable on everolimus',
      'Seizure disorder (partial complex, well-controlled)',
      'Renal angiomyolipomas (multiple, stable)'
    ],
    CurrentMedications: [
      'Everolimus 5mg daily (for SEGA)',
      'Lacosamide 200mg twice daily (for seizures)',
      'Blood pressure medication',
      'Regular monitoring protocol'
    ],
    RiskLevel: 'High',
    LastScan: '2024-11-22',
    NextScheduledScan: '2025-02-22'
  }
];

/**
 * Helper function to get patient story by name
 */
export function getPatientStory(patientName) {
  return PATIENT_STORIES.find(story => story.Name === patientName) || null;
}

/**
 * Get all patient names
 */
export function getAllPatientNames() {
  return PATIENT_STORIES.map(story => story.Name);
}

