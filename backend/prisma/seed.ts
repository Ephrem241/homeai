import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

// Addis Ababa is seed data only — no product logic depends on it. Any other
// country/city plugs into the same Location hierarchy the same way.
async function seedLocations() {
  // Country-level rows have parentId = null, and Postgres never treats two
  // NULLs as equal — so the (parentId, name) unique constraint can't
  // deduplicate roots. Find-then-create instead of upsert here.
  let ethiopia = await prisma.location.findFirst({
    where: { parentId: null, type: 'country', name: 'Ethiopia' },
  });
  if (!ethiopia) {
    ethiopia = await prisma.location.create({
      data: {
        name: 'Ethiopia',
        type: 'country',
        countryCode: 'ET',
        currency: 'ETB',
        phoneCode: '+251',
      },
    });
  }

  const addisAbaba = await prisma.location.upsert({
    where: { parentId_name: { parentId: ethiopia.id, name: 'Addis Ababa' } },
    update: {},
    create: {
      name: 'Addis Ababa',
      type: 'city',
      parentId: ethiopia.id,
      lat: 9.0192,
      lng: 38.7525,
    },
  });

  const neighborhoodDefs: { name: string; lat: number; lng: number }[] = [
    { name: 'Bole', lat: 8.9954, lng: 38.7891 },
    { name: 'Kazanchis', lat: 9.0175, lng: 38.7616 },
    { name: 'CMC', lat: 9.0389, lng: 38.8151 },
    { name: 'Gerji', lat: 9.0111, lng: 38.8181 },
    { name: 'Yeka', lat: 9.0402, lng: 38.7998 },
    { name: 'Sarbet', lat: 8.9986, lng: 38.7561 },
    { name: 'Summit', lat: 9.0067, lng: 38.8461 },
    { name: 'Old Airport', lat: 8.9847, lng: 38.7659 },
    { name: 'Ayat', lat: 9.0244, lng: 38.8642 },
    { name: 'Bole Arabsa', lat: 8.9694, lng: 38.8261 },
  ];

  const neighborhoods: Record<string, { id: string; lat: number | null; lng: number | null }> = {};
  for (const def of neighborhoodDefs) {
    neighborhoods[def.name] = await prisma.location.upsert({
      where: { parentId_name: { parentId: addisAbaba.id, name: def.name } },
      update: {},
      create: {
        name: def.name,
        type: 'neighborhood',
        parentId: addisAbaba.id,
        lat: def.lat,
        lng: def.lng,
      },
    });
  }

  return { ethiopia, addisAbaba, neighborhoods };
}

async function seedAgentsAndUsers() {
  const agentUserDefs = [
    { name: 'Yonas Girma', phone: '+251911100001', email: 'yonas@habeshahomes.et', businessName: 'Habesha Homes Real Estate', verified: true },
    { name: 'Bethlehem Alemu', phone: '+251911100002', email: 'beti@addisprime.et', businessName: 'Addis Prime Properties', verified: true },
    { name: 'Kebede Worku', phone: '+251911100003', email: 'kebede@sunshinerealty.et', businessName: 'Sunshine Realty', verified: false },
  ];

  const agents = [];
  for (const def of agentUserDefs) {
    const user = await prisma.user.upsert({
      where: { phone: def.phone },
      update: {},
      create: { name: def.name, phone: def.phone, email: def.email, role: 'AGENT' },
    });
    const agent = await prisma.agent.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id, businessName: def.businessName, verified: def.verified },
    });
    agents.push(agent);
  }

  const buyer = await prisma.user.upsert({
    where: { phone: '+251922200001' },
    update: {},
    create: { name: 'Selam Tesfaye', phone: '+251922200001', email: 'selam@example.com', role: 'BUYER' },
  });

  const renter = await prisma.user.upsert({
    where: { phone: '+251922200002' },
    update: {},
    create: { name: 'Dawit Bekele', phone: '+251922200002', email: 'dawit@example.com', role: 'RENTER' },
  });

  const owner = await prisma.user.upsert({
    where: { phone: '+251922200003' },
    update: {},
    create: { name: 'Marta Alemu', phone: '+251922200003', email: 'marta@example.com', role: 'BUYER' },
  });

  const admin = await prisma.user.upsert({
    where: { phone: '+251900000001' },
    update: {},
    create: { name: 'Admin', phone: '+251900000001', email: 'admin@homiai.app', role: 'ADMIN' },
  });

  return { agents, buyer, renter, owner, admin };
}

type PropertySeed = {
  agentIndex?: number;
  ownerUserId?: string;
  type: 'APARTMENT' | 'HOUSE' | 'LAND' | 'COMMERCIAL';
  purpose: 'BUY' | 'RENT';
  title: string;
  description: string;
  price: number;
  bedrooms?: number;
  bathrooms?: number;
  areaSqm?: number;
  furnished?: boolean;
  parking?: boolean;
  neighborhood: string;
  amenities: string[];
  status: 'DRAFT' | 'PENDING' | 'VERIFIED' | 'REPORTED' | 'UNAVAILABLE';
};

function buildPropertySeeds(ownerUserId: string): PropertySeed[] {
  return [
    { agentIndex: 0, type: 'APARTMENT', purpose: 'RENT', title: 'Modern 2BR Apartment in Bole', description: 'Bright, modern apartment near Bole Road with 24/7 security and elevator access.', price: 45000, bedrooms: 2, bathrooms: 2, areaSqm: 110, furnished: true, parking: true, neighborhood: 'Bole', amenities: ['elevator', 'security', 'generator', 'gym'], status: 'VERIFIED' },
    { agentIndex: 0, type: 'APARTMENT', purpose: 'RENT', title: 'Cozy 1BR Apartment near Kazanchis', description: 'Compact one-bedroom unit walking distance to Kazanchis business district.', price: 28000, bedrooms: 1, bathrooms: 1, areaSqm: 65, furnished: false, parking: false, neighborhood: 'Kazanchis', amenities: ['security', 'water tank'], status: 'VERIFIED' },
    { agentIndex: 1, type: 'APARTMENT', purpose: 'BUY', title: 'Luxury 3BR Apartment in CMC', description: 'Spacious apartment with city views, premium finishes, and dedicated parking.', price: 9500000, bedrooms: 3, bathrooms: 3, areaSqm: 180, furnished: false, parking: true, neighborhood: 'CMC', amenities: ['elevator', 'security', 'generator', 'balcony'], status: 'VERIFIED' },
    { agentIndex: 1, type: 'APARTMENT', purpose: 'BUY', title: 'Family 4BR Apartment in Gerji', description: 'Large family apartment close to schools and shopping centers.', price: 8200000, bedrooms: 4, bathrooms: 3, areaSqm: 210, furnished: false, parking: true, neighborhood: 'Gerji', amenities: ['security', 'generator', 'playground'], status: 'PENDING' },
    { agentIndex: 2, type: 'APARTMENT', purpose: 'RENT', title: 'Studio Apartment in Yeka', description: 'Efficient studio ideal for young professionals, close to public transport.', price: 15000, bedrooms: 0, bathrooms: 1, areaSqm: 40, furnished: true, parking: false, neighborhood: 'Yeka', amenities: ['security', 'water tank'], status: 'VERIFIED' },
    { agentIndex: 0, type: 'HOUSE', purpose: 'RENT', title: 'Charming 3BR House in Sarbet', description: 'Single-family home with a private garden in a quiet Sarbet neighborhood.', price: 65000, bedrooms: 3, bathrooms: 2, areaSqm: 220, furnished: false, parking: true, neighborhood: 'Sarbet', amenities: ['garden', 'security', 'generator'], status: 'VERIFIED' },
    { agentIndex: 1, type: 'HOUSE', purpose: 'BUY', title: 'Elegant 5BR Villa in CMC', description: 'Two-story villa with a large compound, ideal for large families or diplomats.', price: 32000000, bedrooms: 5, bathrooms: 5, areaSqm: 450, furnished: false, parking: true, neighborhood: 'CMC', amenities: ['garden', 'security', 'generator', 'staff quarters'], status: 'VERIFIED' },
    { agentIndex: 2, type: 'HOUSE', purpose: 'RENT', title: 'Compact 2BR House in Summit', description: 'Recently renovated house with a small yard, close to Summit shopping area.', price: 38000, bedrooms: 2, bathrooms: 1, areaSqm: 130, furnished: false, parking: true, neighborhood: 'Summit', amenities: ['yard', 'water tank'], status: 'PENDING' },
    { ownerUserId, type: 'HOUSE', purpose: 'BUY', title: 'Family Home in Old Airport', description: 'Well-maintained 4-bedroom home in the established Old Airport area, sold by owner.', price: 18500000, bedrooms: 4, bathrooms: 3, areaSqm: 300, furnished: false, parking: true, neighborhood: 'Old Airport', amenities: ['garden', 'generator'], status: 'DRAFT' },
    { agentIndex: 0, type: 'HOUSE', purpose: 'RENT', title: 'New Build 3BR House in Ayat', description: 'Newly constructed house in the fast-growing Ayat condominium area.', price: 42000, bedrooms: 3, bathrooms: 2, areaSqm: 165, furnished: true, parking: true, neighborhood: 'Ayat', amenities: ['security', 'generator', 'parking'], status: 'VERIFIED' },
    { agentIndex: 1, type: 'LAND', purpose: 'BUY', title: '500 sqm Residential Land in Bole Arabsa', description: 'Flat residential plot with clear title, ready for construction.', price: 6000000, areaSqm: 500, neighborhood: 'Bole Arabsa', amenities: ['road access', 'electricity access'], status: 'VERIFIED' },
    { agentIndex: 2, type: 'LAND', purpose: 'BUY', title: '1000 sqm Commercial Land in Summit', description: 'Prime corner plot suited for commercial development near the ring road.', price: 22000000, areaSqm: 1000, neighborhood: 'Summit', amenities: ['road access', 'corner plot'], status: 'PENDING' },
    { agentIndex: 0, type: 'LAND', purpose: 'BUY', title: '250 sqm Plot in Ayat', description: 'Affordable residential plot in a rapidly developing neighborhood.', price: 3200000, areaSqm: 250, neighborhood: 'Ayat', amenities: ['road access'], status: 'VERIFIED' },
    { agentIndex: 1, type: 'COMMERCIAL', purpose: 'RENT', title: 'Ground-Floor Retail Space in Bole', description: 'High-visibility retail space on a busy Bole street, ideal for a showroom or cafe.', price: 120000, areaSqm: 150, parking: true, neighborhood: 'Bole', amenities: ['storefront', 'generator', 'parking'], status: 'VERIFIED' },
    { agentIndex: 2, type: 'COMMERCIAL', purpose: 'RENT', title: 'Office Suite in Kazanchis', description: 'Furnished office suite in a business tower, walking distance to embassies.', price: 95000, areaSqm: 200, furnished: true, parking: true, neighborhood: 'Kazanchis', amenities: ['elevator', 'generator', 'conference room'], status: 'VERIFIED' },
    { agentIndex: 0, type: 'COMMERCIAL', purpose: 'BUY', title: 'Warehouse in Summit Industrial Zone', description: 'Standalone warehouse with truck access, suited for logistics or light manufacturing.', price: 28000000, areaSqm: 900, parking: true, neighborhood: 'Summit', amenities: ['truck access', 'high ceilings'], status: 'PENDING' },
    { agentIndex: 1, type: 'APARTMENT', purpose: 'RENT', title: 'Furnished 2BR Apartment in Old Airport', description: 'Fully furnished short-let friendly apartment near Bole International Airport.', price: 52000, bedrooms: 2, bathrooms: 2, areaSqm: 105, furnished: true, parking: true, neighborhood: 'Old Airport', amenities: ['security', 'generator', 'furnished'], status: 'VERIFIED' },
    { agentIndex: 2, type: 'APARTMENT', purpose: 'BUY', title: 'Entry-Level 1BR Apartment in Gerji', description: 'Affordable first-home option close to Gerji Mebrat Hail.', price: 3800000, bedrooms: 1, bathrooms: 1, areaSqm: 58, furnished: false, parking: false, neighborhood: 'Gerji', amenities: ['security'], status: 'VERIFIED' },
    { agentIndex: 0, type: 'HOUSE', purpose: 'RENT', title: 'Spacious 4BR House in Yeka', description: 'Multi-level family house with a rooftop terrace and mountain views.', price: 58000, bedrooms: 4, bathrooms: 3, areaSqm: 260, furnished: false, parking: true, neighborhood: 'Yeka', amenities: ['terrace', 'security', 'generator'], status: 'VERIFIED' },
    { ownerUserId, type: 'LAND', purpose: 'BUY', title: '350 sqm Plot in Bole Arabsa', description: 'Quiet residential plot sold directly by owner, negotiable price.', price: 4500000, areaSqm: 350, neighborhood: 'Bole Arabsa', amenities: ['road access'], status: 'UNAVAILABLE' },
  ];
}

async function seedProperties(
  neighborhoods: Record<string, { id: string; lat: number | null; lng: number | null }>,
  addisAbabaId: string,
  ethiopiaId: string,
  agents: { id: string }[],
  ownerUserId: string,
) {
  const seeds = buildPropertySeeds(ownerUserId);

  for (const seed of seeds) {
    const neighborhood = neighborhoods[seed.neighborhood];
    const existing = await prisma.property.findFirst({ where: { title: seed.title } });
    if (existing) continue;

    await prisma.property.create({
      data: {
        agentId: seed.agentIndex !== undefined ? agents[seed.agentIndex].id : null,
        ownerUserId: seed.agentIndex === undefined ? seed.ownerUserId : null,
        type: seed.type,
        purpose: seed.purpose,
        title: seed.title,
        description: seed.description,
        price: seed.price,
        currency: 'ETB',
        bedrooms: seed.bedrooms,
        bathrooms: seed.bathrooms,
        areaSqm: seed.areaSqm,
        furnished: seed.furnished ?? false,
        parking: seed.parking ?? false,
        countryId: ethiopiaId,
        cityId: addisAbabaId,
        neighborhoodId: neighborhood.id,
        lat: neighborhood.lat,
        lng: neighborhood.lng,
        amenities: seed.amenities,
        photos: [
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2',
          'https://images.unsplash.com/photo-1568605114967-8130f3a36994',
        ],
        status: seed.status,
      },
    });
  }
}

async function seedLeads(agents: { id: string }[], buyer: { id: string }, renter: { id: string }) {
  const agentZeroProperties = await prisma.property.findMany({
    where: { agentId: agents[0].id },
    take: 3,
    orderBy: { createdAt: 'asc' },
  });

  const leadSeeds = [
    { propertyId: agentZeroProperties[0]?.id, userId: buyer.id, status: 'NEW' as const },
    { propertyId: agentZeroProperties[1]?.id, userId: renter.id, status: 'CONTACTED' as const },
  ].filter((seed): seed is { propertyId: string; userId: string; status: 'NEW' | 'CONTACTED' } =>
    Boolean(seed.propertyId),
  );

  for (const seed of leadSeeds) {
    const existing = await prisma.lead.findFirst({
      where: { agentId: agents[0].id, propertyId: seed.propertyId, userId: seed.userId },
    });
    if (existing) continue;

    await prisma.lead.create({
      data: { agentId: agents[0].id, propertyId: seed.propertyId, userId: seed.userId, status: seed.status },
    });
  }
}

async function main() {
  const { ethiopia, addisAbaba, neighborhoods } = await seedLocations();
  const { agents, buyer, renter, owner } = await seedAgentsAndUsers();
  await seedProperties(neighborhoods, addisAbaba.id, ethiopia.id, agents, owner.id);
  await seedLeads(agents, buyer, renter);

  console.log('Seed complete.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
