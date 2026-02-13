// Static service and subscription data for INAYA Facility Management
// Used as fallback when the base44 API returns empty results

export const STATIC_CATEGORIES = [
  {
    id: "cat-soft-services",
    name: "Soft Services",
    slug: "soft-services",
    description: "Cleaning, security, pest control, landscaping and more for a comfortable living environment.",
    display_order: 1,
    is_active: true
  },
  {
    id: "cat-hard-services",
    name: "Hard Services",
    slug: "hard-services",
    description: "HVAC, electrical, plumbing, MEP and all technical building maintenance systems.",
    display_order: 2,
    is_active: true
  },
  {
    id: "cat-specialized-services",
    name: "Specialized Services",
    slug: "specialized-services",
    description: "Elevator maintenance, water tank cleaning, facade cleaning and other specialized solutions.",
    display_order: 3,
    is_active: true
  }
];

export const STATIC_SERVICES = [
  // ── Soft Services ──────────────────────────────────────
  {
    id: "svc-general-cleaning",
    name: "General Cleaning",
    slug: "general-cleaning",
    category_id: "cat-soft-services",
    description: "Professional residential cleaning including deep vacuuming, surface wiping, kitchen and bathroom sanitization.",
    price: 150,
    duration_minutes: 120,
    features: ["Deep vacuuming & mopping", "Surface wiping & dusting", "Kitchen & bathroom sanitization"],
    is_active: true,
    available_for_subscription: true,
    image_url: ""
  },
  {
    id: "svc-deep-cleaning",
    name: "Deep Cleaning",
    slug: "deep-cleaning",
    category_id: "cat-soft-services",
    description: "Move-out level deep cleaning covering every corner, appliance interiors, window tracks, and more.",
    price: 350,
    duration_minutes: 240,
    features: ["Move-out level thoroughness", "Appliance interior cleaning", "Window & track cleaning"],
    is_active: true,
    available_for_subscription: true,
    image_url: ""
  },
  {
    id: "svc-pest-control",
    name: "Pest Control",
    slug: "pest-control",
    category_id: "cat-soft-services",
    description: "Comprehensive inspection and treatment using eco-friendly products with a 30-day service warranty.",
    price: 200,
    duration_minutes: 90,
    features: ["Full property inspection", "Eco-friendly treatment products", "30-day service warranty"],
    is_active: true,
    available_for_subscription: true,
    image_url: ""
  },
  {
    id: "svc-landscaping",
    name: "Landscaping & Irrigation",
    slug: "landscaping-irrigation",
    category_id: "cat-soft-services",
    description: "Full garden maintenance including irrigation system checks, tree trimming, and seasonal planting.",
    price: 250,
    duration_minutes: 180,
    features: ["Garden maintenance & planting", "Irrigation system checks", "Tree & hedge trimming"],
    is_active: true,
    available_for_subscription: true,
    image_url: ""
  },
  {
    id: "svc-pool-maintenance",
    name: "Pool Maintenance",
    slug: "pool-maintenance",
    category_id: "cat-soft-services",
    description: "Complete swimming pool care including water testing, chemical balancing, and filter system cleaning.",
    price: 180,
    duration_minutes: 60,
    features: ["Water quality testing", "Chemical balancing", "Filter & pump cleaning"],
    is_active: true,
    available_for_subscription: true,
    image_url: ""
  },
  {
    id: "svc-security-systems",
    name: "Security Systems",
    slug: "security-systems",
    category_id: "cat-soft-services",
    description: "CCTV inspection, alarm testing, and access control system audit to keep your property secure.",
    price: 300,
    duration_minutes: 120,
    features: ["CCTV system check", "Alarm & sensor testing", "Access control audit"],
    is_active: true,
    available_for_subscription: true,
    image_url: ""
  },
  {
    id: "svc-waste-management",
    name: "Waste Management",
    slug: "waste-management",
    category_id: "cat-soft-services",
    description: "Professional waste collection, segregation, and recycling coordination for residential properties.",
    price: 120,
    duration_minutes: 60,
    features: ["Scheduled waste collection", "Waste segregation", "Recycling coordination"],
    is_active: true,
    available_for_subscription: true,
    image_url: ""
  },

  // ── Hard Services ──────────────────────────────────────
  {
    id: "svc-ac-maintenance",
    name: "AC Maintenance",
    slug: "ac-maintenance",
    category_id: "cat-hard-services",
    description: "Complete AC servicing including filter cleaning, gas level check, and performance optimization.",
    price: 199,
    duration_minutes: 90,
    features: ["Filter deep cleaning", "Refrigerant gas check", "Performance optimization"],
    is_active: true,
    available_for_subscription: true,
    image_url: ""
  },
  {
    id: "svc-ac-repair",
    name: "AC Repair",
    slug: "ac-repair",
    category_id: "cat-hard-services",
    description: "Diagnostics and repair for all AC brands including part replacement and coolant recharge.",
    price: 299,
    duration_minutes: 120,
    features: ["Full diagnostics", "Part replacement", "Coolant recharge"],
    is_active: true,
    available_for_subscription: false,
    image_url: ""
  },
  {
    id: "svc-electrical",
    name: "Electrical Services",
    slug: "electrical-services",
    category_id: "cat-hard-services",
    description: "Professional wiring inspection, socket and switch repair, and electrical load balancing.",
    price: 180,
    duration_minutes: 60,
    features: ["Wiring inspection", "Socket & switch repair", "Load balancing check"],
    is_active: true,
    available_for_subscription: true,
    image_url: ""
  },
  {
    id: "svc-plumbing",
    name: "Plumbing Services",
    slug: "plumbing-services",
    category_id: "cat-hard-services",
    description: "Expert leak repair, drain unclogging, and fixture installation by certified plumbers.",
    price: 150,
    duration_minutes: 60,
    features: ["Leak detection & repair", "Drain unclogging", "Fixture installation"],
    is_active: true,
    available_for_subscription: true,
    image_url: ""
  },
  {
    id: "svc-mep-maintenance",
    name: "MEP Maintenance",
    slug: "mep-maintenance",
    category_id: "cat-hard-services",
    description: "Full mechanical, electrical, and plumbing system audit with preventive maintenance and compliance checks.",
    price: 350,
    duration_minutes: 180,
    features: ["Full MEP system audit", "Preventive maintenance", "Compliance verification"],
    is_active: true,
    available_for_subscription: true,
    image_url: ""
  },
  {
    id: "svc-fire-safety",
    name: "Fire & Life Safety",
    slug: "fire-life-safety",
    category_id: "cat-hard-services",
    description: "Fire alarm testing, extinguisher inspection, sprinkler checks, and evacuation plan review.",
    price: 400,
    duration_minutes: 120,
    features: ["Fire alarm testing", "Extinguisher inspection", "Evacuation plan review"],
    is_active: true,
    available_for_subscription: false,
    image_url: ""
  },
  {
    id: "svc-civil-painting",
    name: "Civil & Painting",
    slug: "civil-painting",
    category_id: "cat-hard-services",
    description: "Structural wall repairs, waterproofing, and professional internal and external painting.",
    price: 250,
    duration_minutes: 180,
    features: ["Wall crack repairs", "Waterproofing", "Interior & exterior painting"],
    is_active: true,
    available_for_subscription: false,
    image_url: ""
  },
  {
    id: "svc-bms-controls",
    name: "BMS & Controls",
    slug: "bms-controls",
    category_id: "cat-hard-services",
    description: "Building Management System monitoring, optimization, and energy efficiency audits.",
    price: 500,
    duration_minutes: 120,
    features: ["System monitoring & tuning", "Energy efficiency audit", "Automation optimization"],
    is_active: true,
    available_for_subscription: false,
    image_url: ""
  },

  // ── Specialized Services ───────────────────────────────
  {
    id: "svc-elevator-maintenance",
    name: "Elevator Maintenance",
    slug: "elevator-maintenance",
    category_id: "cat-specialized-services",
    description: "Comprehensive elevator safety inspection, lubrication, and emergency system testing.",
    price: 600,
    duration_minutes: 180,
    features: ["Safety inspection", "Lubrication & adjustment", "Emergency system test"],
    is_active: true,
    available_for_subscription: false,
    image_url: ""
  },
  {
    id: "svc-water-tank-cleaning",
    name: "Water Tank Cleaning",
    slug: "water-tank-cleaning",
    category_id: "cat-specialized-services",
    description: "Complete tank drainage, scrubbing, disinfection, and water quality testing.",
    price: 350,
    duration_minutes: 120,
    features: ["Full drainage & scrubbing", "Disinfection treatment", "Water quality test"],
    is_active: true,
    available_for_subscription: true,
    image_url: ""
  },
  {
    id: "svc-handyman",
    name: "Handyman Services",
    slug: "handyman-services",
    category_id: "cat-specialized-services",
    description: "Versatile handyman for minor repairs, furniture assembly, wall mounting, and odd jobs.",
    price: 120,
    duration_minutes: 60,
    features: ["Minor repairs", "Furniture assembly", "Wall mounting & hanging"],
    is_active: true,
    available_for_subscription: true,
    image_url: ""
  },
  {
    id: "svc-facade-cleaning",
    name: "Facade Cleaning",
    slug: "facade-cleaning",
    category_id: "cat-specialized-services",
    description: "High-rise exterior cleaning using pressure washing and professional glass treatment.",
    price: 800,
    duration_minutes: 240,
    features: ["High-rise rope access cleaning", "Pressure washing", "Glass treatment & coating"],
    is_active: true,
    available_for_subscription: false,
    image_url: ""
  },
  {
    id: "svc-smart-home",
    name: "Smart Home Setup",
    slug: "smart-home-setup",
    category_id: "cat-specialized-services",
    description: "Full smart home device installation, app configuration, and network optimization.",
    price: 450,
    duration_minutes: 180,
    features: ["Device installation", "App configuration", "Network optimization"],
    is_active: true,
    available_for_subscription: false,
    image_url: ""
  }
];

export const STATIC_PACKAGES = [
  {
    id: "pkg-essential-care",
    name: "Essential Care",
    slug: "essential-care",
    description: "Basic coverage for core home systems. Ideal for new homeowners who want peace of mind.",
    monthly_price: 299,
    duration_months: 12,
    package_type: "residential",
    property_type: "all",
    popular: false,
    is_active: true,
    setup_fee: 0,
    discount_percentage: 0,
    services: [
      { service_id: "svc-ac-maintenance", frequency: "biannually" },
      { service_id: "svc-plumbing", frequency: "quarterly" },
      { service_id: "svc-electrical", frequency: "quarterly" }
    ],
    features: [
      "2 AC services per year",
      "Quarterly plumbing & electrical checks",
      "Business hours support (8am-6pm)",
      "5% discount on spare parts",
      "Online booking portal access"
    ]
  },
  {
    id: "pkg-silver-shield",
    name: "Silver Shield",
    slug: "silver-shield",
    description: "Comprehensive care with monthly cleaning and priority support. Our most popular plan.",
    monthly_price: 499,
    duration_months: 12,
    package_type: "residential",
    property_type: "all",
    popular: true,
    is_active: true,
    setup_fee: 0,
    discount_percentage: 10,
    services: [
      { service_id: "svc-ac-maintenance", frequency: "quarterly" },
      { service_id: "svc-plumbing", frequency: "monthly" },
      { service_id: "svc-electrical", frequency: "monthly" },
      { service_id: "svc-pest-control", frequency: "quarterly" },
      { service_id: "svc-general-cleaning", frequency: "monthly" }
    ],
    features: [
      "4 AC services per year",
      "Monthly plumbing & electrical visits",
      "Monthly general cleaning included",
      "Quarterly pest control",
      "Priority booking & scheduling",
      "15% discount on spare parts"
    ]
  },
  {
    id: "pkg-gold-elite",
    name: "Gold Elite",
    slug: "gold-elite",
    description: "Premium all-inclusive plan with dedicated account manager and unlimited callouts.",
    monthly_price: 899,
    duration_months: 12,
    package_type: "residential",
    property_type: "all",
    popular: false,
    is_active: true,
    setup_fee: 0,
    discount_percentage: 15,
    services: [
      { service_id: "svc-ac-maintenance", frequency: "monthly" },
      { service_id: "svc-plumbing", frequency: "monthly" },
      { service_id: "svc-electrical", frequency: "monthly" },
      { service_id: "svc-pest-control", frequency: "monthly" },
      { service_id: "svc-deep-cleaning", frequency: "monthly" },
      { service_id: "svc-handyman", frequency: "monthly" },
      { service_id: "svc-mep-maintenance", frequency: "quarterly" }
    ],
    features: [
      "Monthly AC checkups",
      "Full MEP coverage (quarterly)",
      "Monthly deep cleaning",
      "Unlimited callouts for all services",
      "24/7 dedicated support line",
      "Consumables & filters included",
      "25% discount on spare parts",
      "Dedicated account manager"
    ]
  }
];
