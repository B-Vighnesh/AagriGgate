const statesAndDistricts = {
  "Andaman and Nicobar": ["Nicobar", "North and Middle Andaman", "South Andaman"],
  Karnataka: [
    "Bagalkot", "Bangalore", "Belgaum", "Bellary", "Bidar", "Bijapur", "Chamrajnagar",
    "Chikmagalur", "Chitradurga", "Davangere", "Dharwad", "Gadag", "Hassan", "Haveri",
    "Kalburgi", "Karwar(Uttar Kannad)", "Kolar", "Koppal", "Madikeri(Kodagu)", "Mandya",
    "Mangalore(Dakshin Kannad)", "Mysore", "Raichur", "Shimoga", "Tumkur", "Udupi", "Yadgiri"
  ],
  "Andhra Pradesh": [
    "Anantapur", "Chittor", "Cuddapah", "East Godavari", "Guntur", "Krishna",
    "Kurnool", "Nellore", "Prakasam", "Srikakulam", "Vijayanagaram", 
    "Visakhapatnam", "West Godavari"
  ],
  "Arunachal Pradesh": [
    "Anjaw", "Changlang", "Dibang Valley", "East Kameng", "East Siang", "Kamle", 
    "Kra Daadi", "Kurung Kumey", "Lepa Rada", "Lohit", "Longding", "Lower Dibang Valley", 
    "Lower Siang", "Lower Subansiri", "Namsai", "Pakke Kessang", "Papum Pare", 
    "Shi Yomi", "Siang", "Tawang", "Tirap", "Upper Siang", "Upper Subansiri", 
    "West Kameng", "West Siang"
  ],
  Assam: [
    "Bongaigaon", "Barpeta", "Cachar", "Darrang", "Dhemaji", "Dhubri", 
    "Dibrugarh", "Goalpara", "Golaghat", "Hailakandi", "Jorhat", "Kamrup", 
    "Karbi Anglong", "Karimganj", "Kokrajhar", "Lakhimpur", "Morigaon", 
    "Nagaon", "Nalbari", "Sibsagar", "Sonitpur", "Tinsukia"
  ],
  Bihar: [
    "Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur", 
    "Bhojpur", "Buxar", "Chhapra", "Darbhanga", "East Champaran/ Motihari", 
    "Gaya", "Gopalgang", "Jamui", "Jehanabad", "Kaimur/Bhabhua", "Kaithar", 
    "Khagaria", "Kishanganj", "Luckeesarai", "Madhepura", "Madhubani", 
    "Munghair", "Muzaffarpur", "Nalanda", "Nawada", "Patna", "Purnea", 
    "Rohtas", "Saharsa", "Samastipur", "Saran", "Sheikhpura", "Sheohar", 
    "Sitamarhi", "Siwan", "Supaul", "Vaishali", "West Chambaran"
  ],
  Chandigarh: ["Chandigarh"],
  Chhattisgarh: [
    "Balod", "Balodabazar", "Balrampur", "Bastar", "Bemetara", "Bijapur", 
    "Bilaspur", "Dantewada", "Dhamtari", "Durg", "Gariyaband", "Janjgir", 
    "Jashpur", "Kabirdham", "Kanker", "Kondagaon", "Korba", "Koria", 
    "Mahasamund", "Mungeli", "Narayanpur", "Raigarh", "Raipur", 
    "Rajnandgaon", "Sukma", "Surajpur", "Surguja"
  ],
  Goa: ["North Goa", "South Goa"],
  Gujarat: [
    "Ahmedabad", "Amreli", "Anand", "Banaskanth", "Bharuch", "Bhavnagar", "Botad",
    "Chhota Udaipur", "Dahod", "Dang", "Devbhumi Dwarka", "Gandhinagar", 
    "Gir Somnath", "Jamnagar", "Junagarh", "Kachchh", "Kheda", "Mehsana", 
    "Morbi", "Narmada", "Navsari", "Panchmahals", "Patan", "Porbandar", "Rajkot", 
    "Sabarkantha", "Surat", "Surendranagar", "The Dangs", "Vadodara(Baroda)", "Valsad"
  ],
  Haryana: [
    "Ambala", "Bhiwani", "Faridabad", "Fatehabad", "Gurgaon", "Hissar", 
    "Jhajar", "Jind", "Kaithal", "Karnal", "Kurukshetra", "Mahendragarh-Narnaul", 
    "Mewat", "Palwal", "Panchkula", "Panipat", "Rewari", "Rohtak", "Sirsa", 
    "Sonipat", "Yamuna Nagar"
  ],
  "Himachal Pradesh": [
    "Bilaspur", "Chamba", "Hamirpur", "Kangra", "Kullu", "Mandi", "Shimla", 
    "Sirmore", "Solan", "Una"
  ],
  "Jammu and Kashmir": [
    "Anantnag", "Badgam", "Baramulla", "Jammu", "Kathua", "Kupwara", 
    "Pulwama", "Rajouri", "Srinagar", "Udhampur"
  ],
  Jharkhand: [
    "Bokaro", "Deogarh", "Dhanbad", "Dumka", "East Singhbhum", "Garhwa", 
    "Giridih", "Godda", "Gumla", "Hazaribagh", "Jamtara", "Koderma", 
    "Latehar", "Lohardaga", "Pakur", "Palamu", "Ranchi", "Sahebgang", 
    "Saraikela(Kharsanwa)", "Simdega", "West Singbhum"
  ],
  Kerala: [
    "Alappuzha", "Alleppey", "Ernakulam", "Idukki", "Kannur", "Kasargod", 
    "Kollam", "Kottayam", "Kozhikode(Calicut)", "Malappuram", "Palakad", 
    "Pathanamthitta", "Thirssur", "Thiruvananthapuram", "Wayanad"
  ],
  "Madhya Pradesh": [
    "Agar Malwa", "Alirajpur", "Anupur", "Ashoknagar", "Badwani", "Balaghat", 
    "Betul", "Bhind", "Bhopal", "Burhanpur", "Chhatarpur", "Chhindwara", 
    "Damoh", "Datia", "Dewas", "Dhar", "Dindori", "Guna", "Gwalior", "Harda", 
    "Hoshangabad", "Indore", "Jabalpur", "Jhabua", "Katni", "Khandwa", 
    "Khargone", "Mandla", "Mandsaur", "Morena", "Narsinghpur", "Neemuch", 
    "Panna", "Raisen", "Rajgarh", "Ratlam", "Rewa", "Sagar", "Satna", "Sehore", 
    "Seoni", "Shajapur", "Shehdol", "Sheopur", "Shivpuri", "Sidhi", "Singroli", 
    "Tikamgarh", "Ujjain", "Umariya", "Vidisha"
  ],
  Maharashtra: [
    "Ahmednagar", "Akola", "Amarawati", "Beed", "Bhandara", "Buldhana", 
    "Chandrapur", "Chattrapati Sambhajinagar", "Dharashiv(Usmanabad)", 
    "Dhule", "Gadchiroli", "Gondiya", "Hingoli", "Jalana", "Jalgaon", 
    "Kolhapur", "Latur", "Mumbai", "Murum", "Nagpur", "Nanded", "Nandurbar", 
    "Nashik", "Parbhani", "Pune", "Raigad", "Ratnagiri", "Sangli", "Satara", 
    "Sholapur", "Thane", "Vashim", "Wardha", "Yavatmal"
  ],
  "Manipur": [
  "Bishnupur", "Imphal East", "Imphal West", "Kakching", "Thoubal"
],
"Meghalaya": [
  "East Garo Hills", "East Jaintia Hills", "East Khasi Hills", 
  "Nongpoh (R-Bhoi)", "South Garo Hills", "South West Garo Hills", 
  "South West Khasi Hills", "West Garo Hills", "West Jaintia Hills", 
  "West Khasi Hills"
],
"Mizoram": [
  "Aizawl", "Lungli"
],
"Delhi": [
  "Delhi"
],
"Nagaland": [
  "Dimapur", "Kiphire", "Kohima", "Longleng", "Mokokchung", "Mon", 
  "Peren", "Phek", "Tsemenyu", "Tuensang", "Wokha", "Zunheboto"
]
,
"Odisha": [
  "Angul", "Balasore", "Bargarh", "Bhadrak", "Bolangir", "Boudh", 
  "Cuttack", "Deogarh", "Dhenkanal", "Gajapati", "Ganjam", "Jagatsinghpur", 
  "Jajpur", "Jharsuguda", "Kalahandi", "Kandhamal", "Kendrapara", "Keonjhar", 
  "Khurda", "Koraput", "Malkangiri", "Mayurbhanja", "Nayagarh", "Nowarangpur", 
  "Nuapada", "Puri", "Rayagada", "Sambalpur", "Sonepur", "Sundergarh"
],
"Pondicherry": [
  "Karaikal", "Pondicherry"
],
"Punjab": [
  "Amritsar", "Barnala", "Bhatinda", "Faridkot", "Fatehgarh", "Fazilka", 
  "Ferozpur", "Gurdaspur", "Hoshiarpur", "Jalandhar", "Ludhiana", "Mansa", 
  "Moga", "Mohali", "Muktsar", "Nawanshahr", "Pathankot", "Patiala", 
  "Ropar (Rupnagar)", "Sangrur", "Tarntaran", "Kapurthala"
]
,
"Rajasthan": [
  "Jhunjhunu", "Ajmer", "Alwar", "Anupgarh", "Balotra", "Banswara", 
  "Baran", "Barmer", "Beawar", "Bharatpur", "Bhilwara", "Bikaner", 
  "Bundi", "Chittorgarh", "Churu", "Dausa", "Deedwana Kuchaman", "Deeg", 
  "Dholpur", "Dudu", "Dungarpur", "Ganganagar", "Gangapur City", "Hanumangarh", 
  "Jaipur", "Jaipur Rural", "Jaisalmer", "Jalore", "Jhalawar", "Jhunjunu", 
  "Jodhpur", "Jodhpur Rural", "Karauli", "Kekri", "Khairthal Tijara", "Kota", 
  "Kotputli- Behror", "Nagaur", "Neem Ka Thana", "Pali", "Phalodi", "Pratapgarh", 
  "Rajasamand", "Rajsamand", "Sanchore", "Sikar", "Sirohi", "Swai Madhopur", 
  "Tonk", "Udaipur"
]
,
"Sikkim": [
  "East", "South Sikkim (Namchi)", "West Sikkim (Gyalsing)"
]
,"Tamil Nadu": [
  "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri", 
  "Dindigul", "Erode", "Kallakuruchi", "Kancheepuram", "Karur", "Krishnagiri", 
  "Madurai", "Nagapattinam", "Nagercoil (Kannyiakumari)", "Namakkal", "Perambalur", 
  "Pudukkottai", "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi", 
  "Thanjavur", "The Nilgiris", "Theni", "Thiruchirappalli", "Thirunelveli", 
  "Thirupathur", "Thirupur", "Thiruvannamalai", "Thiruvarur", "Thiruvellore", 
  "Tuticorin", "Vellore", "Villupuram", "Virudhunagar"
],Tripura: [
    "Dhalai", "Gomati", "Khowai", "North Tripura", "Sepahijala", 
    "South District", "Unokoti", "West District"
  ],"Uttar Pradesh": [
    "Agra", "Aligarh", "Ambedkarnagar", "Amethi", "Amroha", "Auraiya", "Ayodhya", 
    "Azamgarh", "Badaun", "Baghpat", "Bahraich", "Ballia", "Balrampur", "Banda", 
    "Barabanki", "Bareilly", "Basti", "Bhadohi(Sant Ravi Nagar)", "Bijnor", "Bulandshahar", 
    "Chandauli", "Chitrakut", "Deoria", "Etah", "Etawah", "Farukhabad", "Fatehpur", "Firozabad", 
    "Gautam Budh Nagar", "Ghaziabad", "Ghazipur", "Gonda", "Gorakhpur", "Hamirpur", "Hapur", 
    "Hardoi", "Hathras", "Jalaun (Orai)", "Jaunpur", "Jhansi", "Kannuj", "Kanpur", "Kanpur Dehat", 
    "Kasganj", "Kaushambi", "Khiri (Lakhimpur)", "Kushinagar", "Lakhimpur", "Lalitpur", "Lucknow", 
    "Maharajganj", "Mahoba", "Mainpuri", "Mathura", "Mau(Maunathbhanjan)", "Meerut", "Mirzapur", 
    "Muzaffarnagar", "Pillibhit", "Pratapgarh", "Prayagraj", "Raebarelli", "Rampur", "Saharanpur", 
    "Sambhal", "Sant Kabir Nagar", "Shahjahanpur", "Shamli", "Shravasti", "Siddharth Nagar", 
    "Sitapur", "Sonbhadra", "Unnao", "Varanasi"
  ],"Uttarakhand": [
    "Champawat", "Dehradoon", "Garhwal (Pauri)", "Haridwar", "Nanital", "UdhamSinghNagar"
  ], "West Bengal": [
    "Alipurduar", "Bankura", "Birbhum", "Burdwan", "Coochbehar", "Dakshin Dinajpur", 
    "Darjeeling", "Hooghly", "Howrah", "Jalpaiguri", "Jhargram", "Kalimpong", 
    "Kolkata", "Malda", "Medinipur(E)", "Medinipur(W)", "Murshidabad", "Nadia", 
    "North 24 Parganas", "Paschim Bardhaman", "Purba Bardhaman", "Puruliya", 
    "Sounth 24 Parganas", "Uttar Dinajpur"
  ]

};

export default statesAndDistricts;