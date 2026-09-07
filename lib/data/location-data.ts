export interface Country {
  name: string;
  flag: string;
  code: string;
  iso: string;
}

export const countryList: Country[] = [
  { name: "India", flag: "🇮🇳", code: "+91", iso: "IN" },
  { name: "United States", flag: "🇺🇸", code: "+1", iso: "US" },
  { name: "United Kingdom", flag: "🇬🇧", code: "+44", iso: "GB" },
  { name: "United Arab Emirates", flag: "🇦🇪", code: "+971", iso: "AE" },
  { name: "Afghanistan", flag: "🇦🇫", code: "+93", iso: "AF" },
  { name: "Åland Islands", flag: "🇦🇽", code: "+358", iso: "AX" },
  { name: "Albania", flag: "🇦🇱", code: "+355", iso: "AL" },
  { name: "Algeria", flag: "🇩🇿", code: "+213", iso: "DZ" },
  { name: "American Samoa", flag: "🇦🇸", code: "+1-684", iso: "AS" },
  { name: "Andorra", flag: "🇦🇩", code: "+376", iso: "AD" },
  { name: "Angola", flag: "🇦🇴", code: "+244", iso: "AO" },
  { name: "Anguilla", flag: "🇦🇮", code: "+1-264", iso: "AI" },
  { name: "Argentina", flag: "🇦🇷", code: "+54", iso: "AR" },
  { name: "Armenia", flag: "🇦🇲", code: "+374", iso: "AM" },
  { name: "Australia", flag: "🇦🇺", code: "+61", iso: "AU" },
  { name: "Austria", flag: "🇦🇹", code: "+43", iso: "AT" },
  { name: "Bahrain", flag: "🇧🇭", code: "+973", iso: "BH" },
  { name: "Bangladesh", flag: "🇧🇩", code: "+880", iso: "BD" },
  { name: "Belgium", flag: "🇧🇪", code: "+32", iso: "BE" },
  { name: "Brazil", flag: "🇧🇷", code: "+55", iso: "BR" },
  { name: "Canada", flag: "🇨🇦", code: "+1", iso: "CA" },
  { name: "China", flag: "🇨🇳", code: "+86", iso: "CN" },
  { name: "France", flag: "🇫🇷", code: "+33", iso: "FR" },
  { name: "Germany", flag: "🇩🇪", code: "+49", iso: "DE" },
  { name: "Indonesia", flag: "🇮🇩", code: "+62", iso: "ID" },
  { name: "Italy", flag: "🇮🇹", code: "+39", iso: "IT" },
  { name: "Japan", flag: "🇯🇵", code: "+81", iso: "JP" },
  { name: "Malaysia", flag: "🇲🇾", code: "+60", iso: "MY" },
  { name: "Netherlands", flag: "🇳🇱", code: "+31", iso: "NL" },
  { name: "New Zealand", flag: "🇳🇿", code: "+64", iso: "NZ" },
  { name: "Oman", flag: "🇴🇲", code: "+968", iso: "OM" },
  { name: "Qatar", flag: "🇶🇦", code: "+974", iso: "QA" },
  { name: "Saudi Arabia", flag: "🇸🇦", code: "+966", iso: "SA" },
  { name: "Singapore", flag: "🇸🇬", code: "+65", iso: "SG" },
  { name: "South Africa", flag: "🇿🇦", code: "+27", iso: "ZA" },
  { name: "Spain", flag: "🇪🇸", code: "+34", iso: "ES" },
  { name: "Sri Lanka", flag: "🇱🇰", code: "+94", iso: "LK" },
  { name: "Sweden", flag: "🇸🇪", code: "+46", iso: "SE" },
  { name: "Switzerland", flag: "🇨🇭", code: "+41", iso: "CH" },
  { name: "Thailand", flag: "🇹🇭", code: "+66", iso: "TH" },
  { name: "Vietnam", flag: "🇻🇳", code: "+84", iso: "VN" },
];

export const statesList: Record<string, string[]> = {
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad"],
  "Karnataka": ["Bengaluru", "Mysuru", "Hubballi", "Mangaluru", "Belagavi"],
  "Delhi": ["New Delhi", "North Delhi", "South Delhi", "West Delhi"],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Khammam"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot"],
  "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Siliguri"],
  "Uttar Pradesh": ["Noida", "Lucknow", "Kanpur", "Agra", "Varanasi"],
};
