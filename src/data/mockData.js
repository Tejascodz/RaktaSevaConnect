// ===== Simulated Mock Data =====
export const MOCK_DONORS = [
  { id:1, name:'Arjun Patil', blood:'O+', phone:'98765xxxxx', lat:18.52, lng:73.86, lastDonation:'2026-01-10', available:true, distance:2.3 },
  { id:2, name:'Priya Sharma', blood:'A+', phone:'98234xxxxx', lat:18.53, lng:73.87, lastDonation:'2026-04-20', available:false, distance:1.1 },
  { id:3, name:'Rahul Deshmukh', blood:'B+', phone:'97654xxxxx', lat:18.51, lng:73.85, lastDonation:'2025-12-05', available:true, distance:4.7 },
  { id:4, name:'Sneha Kulkarni', blood:'AB+', phone:'99876xxxxx', lat:18.54, lng:73.88, lastDonation:'2025-11-15', available:true, distance:3.2 },
  { id:5, name:'Vikram Joshi', blood:'O-', phone:'98123xxxxx', lat:18.50, lng:73.84, lastDonation:'2026-03-01', available:true, distance:6.8 },
  { id:6, name:'Meera Nair', blood:'A-', phone:'97890xxxxx', lat:18.55, lng:73.89, lastDonation:'2025-10-20', available:true, distance:1.5 },
  { id:7, name:'Amit Rao', blood:'B-', phone:'98456xxxxx', lat:18.49, lng:73.83, lastDonation:'2026-02-14', available:true, distance:8.1 },
  { id:8, name:'Kavita Gaikwad', blood:'AB-', phone:'99012xxxxx', lat:18.56, lng:73.90, lastDonation:'2025-09-30', available:true, distance:5.4 },
  { id:9, name:'Suresh Bhosale', blood:'O+', phone:'98567xxxxx', lat:18.48, lng:73.82, lastDonation:'2026-04-01', available:true, distance:3.9 },
  { id:10, name:'Deepa Iyer', blood:'A+', phone:'97345xxxxx', lat:18.57, lng:73.91, lastDonation:'2025-08-15', available:true, distance:7.2 },
  { id:11, name:'Ravi Kumar', blood:'O+', phone:'99888xxxxx', lat:18.515, lng:73.855, lastDonation:'2025-06-01', available:true, distance:2.8 },
  { id:12, name:'Anita Desai', blood:'B+', phone:'98777xxxxx', lat:18.525, lng:73.865, lastDonation:'2025-07-20', available:true, distance:4.1 },
];

export const MOCK_REQUESTS = [
  { id:1, blood:'O+', units:2, hospital:'Sahyadri Hospital, Pune', urgency:'critical', time:'12 min ago', distance:'2.3 km', contact:'Dr. Mehta', accepted:[] },
  { id:2, blood:'AB-', units:1, hospital:'Ruby Hall Clinic', urgency:'high', time:'34 min ago', distance:'5.1 km', contact:'Dr. Joshi', accepted:[] },
  { id:3, blood:'B+', units:3, hospital:'KEM Hospital, Pune', urgency:'critical', time:'1 hr ago', distance:'3.8 km', contact:'Dr. Desai', accepted:[] },
  { id:4, blood:'A+', units:2, hospital:'Deenanath Mangeshkar Hospital', urgency:'high', time:'2 hrs ago', distance:'6.2 km', contact:'Dr. Sinha', accepted:[] },
];

export const MOCK_NOTIFICATIONS = [
  { id:1, type:'emergency', title:'Urgent: O+ Blood Needed', desc:'Sahyadri Hospital needs 2 units of O+ blood immediately.', time:'12 min ago', unread:true },
  { id:2, type:'success', title:'Donor Found!', desc:'Arjun Patil accepted your blood request.', time:'2 hrs ago', unread:true },
  { id:3, type:'info', title:'Donation Reminder', desc:'You are eligible to donate again. Update availability!', time:'1 day ago', unread:false },
  { id:4, type:'emergency', title:'Critical: AB- Required', desc:'Ruby Hall Clinic urgently needs 1 unit of AB-.', time:'34 min ago', unread:true },
];

export function isDonorAvailable(donor) {
  if (!donor.available) return false;
  const daysSince = (Date.now() - new Date(donor.lastDonation).getTime()) / (1000*60*60*24);
  return daysSince >= 90;
}

export function daysSinceDonation(dateStr) {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000*60*60*24));
}

export function getInitials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase();
}

export const BLOOD_GROUPS = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];
