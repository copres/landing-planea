/**
 * Interfaces para los archivos de locale (en.json, es.json, pt.json, fr.json).
 * Basado en la estructura de src/i18n/locales/en.json
 */

// --- Nav & Common ---
export interface NavLocale {
  home: string;
  nosotros: string;
  software: string;
  utilidades: string;
  precios: string;
  contacto: string;
  blog: string;
  theme_toggle_light: string;
  theme_toggle_dark: string;
}

export interface CommonLocale {
  ingresa: string;
  registrate: string;
}

// --- Meta ---
export interface MetaLocale {
  title?: string;
  description?: string;
}

// --- Pricing ---
export interface PricingPlanFeatures {
  users: string;
  projects: string;
  apu_databases: string;
  storage: string;
  budget_scheduling: string;
  training: string;
  labor_management?: string;
  materials_management?: string;
  project_management?: string;
  integrations?: string;
  priority_support?: string;
}

export interface PricingPlan {
  name: string;
  description: string;
  features: PricingPlanFeatures;
}

export interface PricingPlans {
  emprendedor: PricingPlan;
  pymes: PricingPlan;
  corporativo: PricingPlan;
}

export interface PricingLocale {
  title: string;
  subtitle: string;
  toggle_label: string;
  monthly: string;
  annual: string;
  discount_annual_monthly_view: string;
  discount_annual_view: string;
  buy_now: string;
  cost_control_title: string;
  integrations_title: string;
  per_month: string;
  per_year: string;
  plans: PricingPlans;
}

// --- Footer ---
export interface FooterLinksLocale {
  create_budgets: string;
  apus: string;
  unit_price_analysis: string;
  construction_budgets: string;
  construction_scheduling: string;
  construction_platforms: string;
  construction_software: string;
  software_for_contractor: string;
  software_colombia: string;
  software_contractors: string;
  construction_control_software: string;
}

export interface FooterLocale {
  description: string;
  copyright: string;
  links: FooterLinksLocale;
}

// --- CTA ---
export interface CtaSharedLocale {
  title: string;
  description: string;
  button: string;
}

export interface CtaLocale {
  title: string;
  description: string;
  button: string;
  shared: CtaSharedLocale;
}

// --- Utilities ---
export interface UtilitySectionLocale {
  name: string;
  description: string;
  button?: string;
  proveedores?: string;
  contratistas?: string;
  trabajadores?: string;
}

export interface UtilitiesSectionsLocale {
  apus: UtilitySectionLocale;
  proyecto: UtilitySectionLocale;
  terceros: UtilitySectionLocale;
}

export interface UtilitiesLocale {
  title: string;
  description: string;
  download_brochure: string;
  meta: MetaLocale;
  sections: UtilitiesSectionsLocale;
}

// --- Software (módulos) ---
export interface SoftwareModuleLocale {
  name: string;
  description: string;
  items?: string[];
  callToAction?: string;
}

export interface SoftwareModulesLocale {
  createAccount: SoftwareModuleLocale;
  myAccount: SoftwareModuleLocale;
  databases: SoftwareModuleLocale;
  projects: SoftwareModuleLocale;
  budget: SoftwareModuleLocale;
  scheduling: SoftwareModuleLocale;
  warehouse: SoftwareModuleLocale;
  laborContracts: SoftwareModuleLocale;
  payroll: SoftwareModuleLocale;
  utilities: SoftwareModuleLocale;
  management: SoftwareModuleLocale;
  integrations: SoftwareModuleLocale;
}

export interface SoftwareLocale {
  title: string;
  description: string;
  modules: SoftwareModulesLocale;
}

// --- Not found ---
export interface NotFoundLocale {
  title: string;
  description: string;
  button: string;
}

// --- Home ---
export interface HomeMetaLocale {
  description: string;
  title: string;
}

export interface HomeHeroLocale {
  title: string;
  description: string;
  cta: string;
}

export interface HomeServiceItemLocale {
  name: string;
  description: string;
}

export interface HomeServicesLocale {
  title: string;
  read_more: string;
  items: HomeServiceItemLocale[];
}

export interface HomeAboutLocale {
  title: string;
  paragraph1: string;
  paragraph2: string;
  paragraph3: string;
  button: string;
}

export interface HomeCallToActionLocale {
  title: string;
  description: string;
  button: string;
  subtext: string;
}

export interface HomeGestionObraFeatureLocale {
  name: string;
  description: string;
}

export interface HomeGestionObraLocale {
  title: string;
  subtitle: string;
  imageAlt: string;
  features: Record<string, HomeGestionObraFeatureLocale>;
}

export interface HomeBlogLocale {
  title: string;
  description: string;
  button: string;
}

export interface HomeCtaLocale {
  quote: string;
  button: string;
}

export interface HomeTestimonialItemLocale {
  role: string;
  message: string;
}

export interface HomeTestimonialsLocale {
  items: HomeTestimonialItemLocale[];
}

export interface HomePresupuestoIAFormLocale {
  title: string;
  project_type: string;
  project_types: Record<string, string>;
  built_area: string;
  built_area_placeholder: string;
  location: string;
  location_placeholder: string;
  detail_level: string;
  detail_levels: Record<string, string>;
  button: string;
}

export interface HomePresupuestoIALocale {
  title: string;
  subtitle: string;
  powered_by: string;
  automatic_budgets: string;
  form: HomePresupuestoIAFormLocale;
  how_it_works: {
    title: string;
    step1: string;
    step2: string;
    step3: string;
  };
  placeholder: {
    title: string;
    description: string;
  };
}

export interface HomeAiBudgetSectionLocale {
  title: string;
  description: string;
  primary_cta: string;
  secondary_cta: string;
  image_alt: string;
}

export interface HomeAiBudgetStepsLocale {
  title: string;
  items: Array<{ icon: string; title: string; description: string }>;
  note: string;
}

export interface HomeAiBudgetFormLocale {
  title: string;
  project_type_label: string;
  project_type_options: Record<string, string>;
  custom_project: { specifications_label: string; specifications_placeholder: string };
  house: Record<string, string>;
  building: Record<string, string>;
  buildingComplex: Record<string, string>;
  bridge: Record<string, string>;
  submit: string;
}

export interface HomeAiBudgetPreviewLocale {
  title: string;
  description: string;
  fullscreen_title: string;
  fullscreen_aria: string;
  close_fullscreen_aria: string;
}

export interface HomeAiBudgetLocale {
  section: HomeAiBudgetSectionLocale;
  hero: HomeAiBudgetSectionLocale & { background_alt?: string };
  steps: HomeAiBudgetStepsLocale;
  form: HomeAiBudgetFormLocale;
  preview: HomeAiBudgetPreviewLocale;
}

export interface HomeLauraSectionLocale {
  badge: string;
  title: string;
  description: string;
  capabilities: Record<string, string>;
  primary_cta: string;
  secondary_cta: string;
  avatar_alt: string;
  section_aria_label: string;
}

export interface HomeContactLocale {
  title: string;
  description: string;
  form: {
    full_name: string;
    email: string;
    message: string;
    send: string;
    sending: string;
    success: string;
    error: string;
    validation: string;
  };
  address: string;
  address_label: string;
  phone: string;
  phone_label: string;
  email: string;
  email_label: string;
  connect: string;
}

export interface HomeLocale {
  meta: HomeMetaLocale;
  hero: HomeHeroLocale;
  services: HomeServicesLocale;
  about: HomeAboutLocale;
  callToAction: HomeCallToActionLocale;
  video: { title: string };
  gestionObra: HomeGestionObraLocale;
  blog: HomeBlogLocale;
  cta: HomeCtaLocale;
  testimonials: HomeTestimonialsLocale;
  presupuestoIA: HomePresupuestoIALocale;
  ai_budget: HomeAiBudgetLocale;
  lauraSection: HomeLauraSectionLocale;
  contact: HomeContactLocale;
}

// --- Contact page ---
export interface ContactLocale {
  title: string;
  description: string;
  form: HomeContactLocale['form'];
  address: string;
  address_label: string;
  phone: string;
  phone_label: string;
  email: string;
  email_label: string;
  connect: string;
}

// --- Laura (habla-con-laura) ---
export interface LauraChatLocale {
  title: string;
  subtitle: string;
  greeting: string;
  placeholder: string;
  send: string;
  error: string;
  budget_opened: string;
  error_generic: string;
}

export interface LauraLocale {
  title: string;
  description: string;
  create_budget: string;
  ask_question: string;
  chat: LauraChatLocale;
}

// --- About page ---
export interface AboutMissionLocale {
  paragraph1: string;
  paragraph2: string;
  paragraph3: string;
  paragraph4: string;
  imageAlt: string;
  stats: Record<string, string>;
}

export interface AboutValueItemLocale {
  name: string;
  year: string;
  description: string;
}

export interface AboutValuesLocale {
  title: string;
  year: string;
  read_more: string;
  read_less: string;
  items: Record<string, AboutValueItemLocale>;
}

export interface AboutTeamLocale {
  title: string;
  description: string;
  connect: string;
  roles: Record<string, string>;
}

export interface AboutLocale {
  heading: { title: string };
  mission: AboutMissionLocale;
  values: AboutValuesLocale;
  team: AboutTeamLocale;
  video: { title: string; subtitle: string; subscribe: string };
}

// --- Blog page ---
export interface BlogLocale {
  title: string;
  search_placeholder: string;
  read_more: string;
  no_posts: string;
  no_results: string;
  no_results_hint: string;
  results_count: string;
  tags?: string;
  meta_description?: string;
  description?: string;
}

// --- Root locale (página completa) ---
export interface ILocale {
  nav: NavLocale;
  common: CommonLocale;
  pricingPage?: { meta: MetaLocale };
  pricing: PricingLocale;
  footer: FooterLocale;
  cta: CtaLocale;
  utilities: UtilitiesLocale;
  software: SoftwareLocale;
  notFound: NotFoundLocale;
  home: HomeLocale;
  contact: ContactLocale;
  laura: LauraLocale;
  aboutPage?: { meta: MetaLocale };
  about: AboutLocale;
  blog: BlogLocale;
}

/** Rutas por idioma (una entrada por clave de ruta) */
export interface IRoutesByLocale {
  home: string;
  nosotros: string;
  software: string;
  utilidades: string;
  precios: string;
  contacto: string;
  blog: string;
  apus: string;
  'analisis-de-precios-unitarios': string;
  'presupuestos-de-obras': string;
  'programacion-de-obras': string;
  'crear-presupuestos-de-obra-con-ia-de-forma-gratuita': string;
  'plataformas-de-construccion': string;
  planes: string;
  privacy: string;
}

/** Mapa centralizado de todas las rutas del sitio por idioma */
export interface IRouteMap {
  es: IRoutesByLocale;
  en: IRoutesByLocale;
  pt: IRoutesByLocale;
  fr: IRoutesByLocale;
}