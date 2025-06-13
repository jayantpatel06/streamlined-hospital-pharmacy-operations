export const medicineDatabase = [
  { id: 'med001', name: 'Paracetamol 500mg', category: 'Pain Relief', dosage: '500mg', form: 'Tablet' },
  { id: 'med002', name: 'Ibuprofen 400mg', category: 'Pain Relief', dosage: '400mg', form: 'Tablet' },
  { id: 'med003', name: 'Aspirin 75mg', category: 'Pain Relief', dosage: '75mg', form: 'Tablet' },
  { id: 'med004', name: 'Diclofenac 50mg', category: 'Pain Relief', dosage: '50mg', form: 'Tablet' },
  { id: 'med005', name: 'Amoxicillin 250mg', category: 'Antibiotics', dosage: '250mg', form: 'Capsule' },
  { id: 'med006', name: 'Amoxicillin 500mg', category: 'Antibiotics', dosage: '500mg', form: 'Capsule' },
  { id: 'med007', name: 'Azithromycin 500mg', category: 'Antibiotics', dosage: '500mg', form: 'Tablet' },
  { id: 'med008', name: 'Ciprofloxacin 500mg', category: 'Antibiotics', dosage: '500mg', form: 'Tablet' },
  { id: 'med009', name: 'Cephalexin 500mg', category: 'Antibiotics', dosage: '500mg', form: 'Capsule' },
  { id: 'med010', name: 'Lisinopril 10mg', category: 'Cardiovascular', dosage: '10mg', form: 'Tablet' },
  { id: 'med011', name: 'Amlodipine 5mg', category: 'Cardiovascular', dosage: '5mg', form: 'Tablet' },
  { id: 'med012', name: 'Metoprolol 25mg', category: 'Cardiovascular', dosage: '25mg', form: 'Tablet' },
  { id: 'med013', name: 'Atorvastatin 20mg', category: 'Cardiovascular', dosage: '20mg', form: 'Tablet' },
  { id: 'med014', name: 'Metformin 500mg', category: 'Diabetes', dosage: '500mg', form: 'Tablet' },
  { id: 'med015', name: 'Metformin 850mg', category: 'Diabetes', dosage: '850mg', form: 'Tablet' },
  { id: 'med016', name: 'Glimepiride 2mg', category: 'Diabetes', dosage: '2mg', form: 'Tablet' },
  { id: 'med017', name: 'Insulin Glargine', category: 'Diabetes', dosage: '100 units/mL', form: 'Injection' },
  { id: 'med018', name: 'Salbutamol Inhaler', category: 'Respiratory', dosage: '100mcg/dose', form: 'Inhaler' },
  { id: 'med019', name: 'Prednisolone 5mg', category: 'Respiratory', dosage: '5mg', form: 'Tablet' },
  { id: 'med020', name: 'Montelukast 10mg', category: 'Respiratory', dosage: '10mg', form: 'Tablet' },
  { id: 'med021', name: 'Omeprazole 20mg', category: 'Gastrointestinal', dosage: '20mg', form: 'Capsule' },
  { id: 'med022', name: 'Pantoprazole 40mg', category: 'Gastrointestinal', dosage: '40mg', form: 'Tablet' },
  { id: 'med023', name: 'Domperidone 10mg', category: 'Gastrointestinal', dosage: '10mg', form: 'Tablet' },
  { id: 'med024', name: 'Loperamide 2mg', category: 'Gastrointestinal', dosage: '2mg', form: 'Tablet' },
  { id: 'med025', name: 'Sertraline 50mg', category: 'Mental Health', dosage: '50mg', form: 'Tablet' },
  { id: 'med026', name: 'Fluoxetine 20mg', category: 'Mental Health', dosage: '20mg', form: 'Capsule' },
  { id: 'med027', name: 'Lorazepam 1mg', category: 'Mental Health', dosage: '1mg', form: 'Tablet' },
  { id: 'med028', name: 'Adrenaline 1mg/mL', category: 'Emergency', dosage: '1mg/mL', form: 'Injection' },
  { id: 'med029', name: 'Atropine 1mg/mL', category: 'Emergency', dosage: '1mg/mL', form: 'Injection' },
  { id: 'med030', name: 'Furosemide 40mg', category: 'Emergency', dosage: '40mg', form: 'Tablet' },
  { id: 'med031', name: 'Morphine 10mg/mL', category: 'Emergency', dosage: '10mg/mL', form: 'Injection' },
  { id: 'med032', name: 'Vitamin D3 1000 IU', category: 'Vitamins', dosage: '1000 IU', form: 'Tablet' },
  { id: 'med033', name: 'Vitamin B12 1000mcg', category: 'Vitamins', dosage: '1000mcg', form: 'Tablet' },
  { id: 'med034', name: 'Folic Acid 5mg', category: 'Vitamins', dosage: '5mg', form: 'Tablet' },
  { id: 'med035', name: 'Iron 65mg', category: 'Vitamins', dosage: '65mg', form: 'Tablet' }
];

export const commonDosageInstructions = [
  'Once daily',
  'Twice daily',
  'Three times daily',
  'Four times daily',
  'Once daily at bedtime',
  'Twice daily with meals',
  'Three times daily with meals',
  'As needed for pain',
  'As needed for nausea',
  'Every 4 hours as needed',
  'Every 6 hours as needed',
  'Every 8 hours',
  'Every 12 hours',
  'Weekly',
  'Monthly'
];

export const commonQuantities = [
  '7 tablets',
  '14 tablets',
  '21 tablets',
  '28 tablets',
  '30 tablets',
  '60 tablets',
  '90 tablets',
  '7 capsules',
  '14 capsules',
  '21 capsules',
  '28 capsules',
  '30 capsules',
  '1 inhaler',
  '1 vial',
  '10mL vial',
  '30mL bottle',
  '100mL bottle'
];

export const commonDurations = [
  '3 days',
  '5 days',
  '7 days',
  '10 days',
  '14 days',
  '21 days',
  '1 month',
  '2 months',
  '3 months',
  '6 months',
  'Ongoing',
  'As needed',
  'Until finished'
];

export const getMedicinesByCategory = (category) => {
  return medicineDatabase.filter(med => med.category === category);
};

export const searchMedicines = (searchTerm) => {
  return medicineDatabase.filter(med => 
    med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.category.toLowerCase().includes(searchTerm.toLowerCase())
  );
};

export const getMedicineCategories = () => {
  return [...new Set(medicineDatabase.map(med => med.category))];
};
