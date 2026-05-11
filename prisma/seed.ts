import "dotenv/config";
import { PrismaClient, Role, PillarType, AssetStatus, SensorStatus, AlertSeverity, AlertStatus, AlertType, WorkOrderStatus, QualityStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { subDays, subHours, addDays } from "date-fns";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env["DATABASE_URL"],
    },
  },
} as ConstructorParameters<typeof PrismaClient>[0]);

async function main() {
  console.log("🌱 Starting seed...");

  const passwordHash = bcrypt.hashSync("password123", 10);

  // ─── Organization ────────────────────────────────────────────────────────────
  const org = await prisma.organization.upsert({
    where: { slug: "wit-id" },
    update: {},
    create: {
      name: "WIT.ID Industrial",
      slug: "wit-id",
      status: "active",
    },
  });

  console.log("✓ Organization created");

  // ─── Users ───────────────────────────────────────────────────────────────────
  const usersData: Array<{
    email: string;
    name: string;
    role: Role;
  }> = [
    { email: "admin@wit.id", name: "Super Admin", role: Role.SUPER_ADMIN },
    { email: "executive@wit.id", name: "Budi Santoso", role: Role.EXECUTIVE },
    { email: "energymgr@wit.id", name: "Dewi Rahayu", role: Role.ENERGY_MANAGER },
    { email: "opsup@wit.id", name: "Andi Wijaya", role: Role.OPERATIONS_SUPERVISOR },
    { email: "tech@wit.id", name: "Reza Pratama", role: Role.TECHNICIAN },
    { email: "finance@wit.id", name: "Sari Kusuma", role: Role.FINANCE },
    { email: "ehs@wit.id", name: "Hendra Gunawan", role: Role.EHS_COMPLIANCE },
    { email: "viewer@wit.id", name: "Viewer Only", role: Role.VIEWER },
  ];

  const users: Record<string, string> = {};
  for (const u of usersData) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        name: u.name,
        passwordHash,
        role: u.role,
        organizationId: org.id,
        isActive: true,
      },
    });
    users[u.role] = user.id;
  }

  console.log("✓ Users created");

  // ─── Sites ────────────────────────────────────────────────────────────────────
  const sitesData = [
    {
      name: "Jakarta Industrial Park",
      code: "JKT-IND",
      address: "Jl. Industri Raya No. 1, Kawasan Berikat Nusantara",
      city: "Jakarta",
      lat: -6.2088,
      lng: 106.8456,
    },
    {
      name: "Surabaya Plant",
      code: "SBY-PLT",
      address: "Jl. Rungkut Industri No. 45, SIER Industrial Estate",
      city: "Surabaya",
      lat: -7.2575,
      lng: 112.7521,
    },
    {
      name: "Bandung Factory",
      code: "BDG-FAC",
      address: "Jl. Rancaekek KM 24, Kawasan Industri Rancaekek",
      city: "Bandung",
      lat: -6.9175,
      lng: 107.6191,
    },
    {
      name: "Semarang Facility",
      code: "SMG-FAC",
      address: "Jl. Kaligawe Raya No. 10, Kawasan Industri LIK",
      city: "Semarang",
      lat: -6.9932,
      lng: 110.4229,
    },
  ];

  const siteIds: string[] = [];
  for (const s of sitesData) {
    const site = await prisma.site.upsert({
      where: { id: `site-${s.code}` },
      update: {},
      create: {
        id: `site-${s.code}`,
        organizationId: org.id,
        name: s.name,
        code: s.code,
        address: s.address,
        city: s.city,
        country: "Indonesia",
        lat: s.lat,
        lng: s.lng,
        timezone: "Asia/Jakarta",
        isActive: true,
      },
    });
    siteIds.push(site.id);
  }

  console.log("✓ Sites created");

  // ─── User Site Access ─────────────────────────────────────────────────────────
  for (const userId of Object.values(users)) {
    for (const siteId of siteIds) {
      await prisma.userSiteAccess.upsert({
        where: { userId_siteId: { userId, siteId } },
        update: {},
        create: { userId, siteId },
      });
    }
  }

  // ─── Buildings ────────────────────────────────────────────────────────────────
  const buildingsData = [
    { siteId: siteIds[0], name: "Main Production Hall", code: "JKT-B1", floors: 3 },
    { siteId: siteIds[0], name: "Utilities Building", code: "JKT-B2", floors: 2 },
    { siteId: siteIds[1], name: "Assembly Plant A", code: "SBY-B1", floors: 2 },
    { siteId: siteIds[1], name: "Warehouse & Logistics", code: "SBY-B2", floors: 1 },
    { siteId: siteIds[2], name: "Fabrication Block", code: "BDG-B1", floors: 2 },
    { siteId: siteIds[2], name: "Quality Control Lab", code: "BDG-B2", floors: 1 },
    { siteId: siteIds[3], name: "Processing Unit", code: "SMG-B1", floors: 3 },
    { siteId: siteIds[3], name: "Administration Block", code: "SMG-B2", floors: 2 },
  ];

  const buildingIds: string[] = [];
  for (const b of buildingsData) {
    const building = await prisma.building.upsert({
      where: { id: `bldg-${b.code}` },
      update: {},
      create: {
        id: `bldg-${b.code}`,
        siteId: b.siteId,
        name: b.name,
        code: b.code,
        floors: b.floors,
      },
    });
    buildingIds.push(building.id);
  }

  console.log("✓ Buildings created");

  // ─── Zones ────────────────────────────────────────────────────────────────────
  const zonesData = [
    { buildingId: buildingIds[0], name: "Electrical Room", code: "Z-ELEC-01", pillar: PillarType.ELECTRICITY },
    { buildingId: buildingIds[0], name: "Water Treatment", code: "Z-WTR-01", pillar: PillarType.WATER },
    { buildingId: buildingIds[0], name: "Wastewater Pit", code: "Z-WWT-01", pillar: PillarType.WASTEWATER },
    { buildingId: buildingIds[1], name: "Gas Storage", code: "Z-GAS-01", pillar: PillarType.GAS_AIR },
    { buildingId: buildingIds[1], name: "HVAC Plant Room", code: "Z-HVAC-01", pillar: PillarType.THERMAL_HVAC },
    { buildingId: buildingIds[2], name: "Main Substation", code: "Z-ELEC-02", pillar: PillarType.ELECTRICITY },
    { buildingId: buildingIds[2], name: "Compressed Air Station", code: "Z-AIR-01", pillar: PillarType.COMPRESSED_AIR },
    { buildingId: buildingIds[3], name: "Environmental Monitor", code: "Z-ENV-01", pillar: PillarType.ENVIRONMENT },
    { buildingId: buildingIds[4], name: "Electrical Panel", code: "Z-ELEC-03", pillar: PillarType.ELECTRICITY },
    { buildingId: buildingIds[4], name: "Water Supply", code: "Z-WTR-02", pillar: PillarType.WATER },
    { buildingId: buildingIds[5], name: "Effluent Treatment", code: "Z-WWT-02", pillar: PillarType.WASTEWATER },
    { buildingId: buildingIds[6], name: "Gas Manifold", code: "Z-GAS-02", pillar: PillarType.GAS_AIR },
    { buildingId: buildingIds[6], name: "Chiller Plant", code: "Z-HVAC-02", pillar: PillarType.THERMAL_HVAC },
    { buildingId: buildingIds[7], name: "Air Compressor Room", code: "Z-AIR-02", pillar: PillarType.COMPRESSED_AIR },
    { buildingId: buildingIds[7], name: "Ambient Monitoring", code: "Z-ENV-02", pillar: PillarType.ENVIRONMENT },
    { buildingId: buildingIds[0], name: "Production Floor", code: "Z-ELEC-04", pillar: PillarType.ELECTRICITY },
    { buildingId: buildingIds[2], name: "Cooling Tower", code: "Z-WTR-03", pillar: PillarType.WATER },
    { buildingId: buildingIds[4], name: "Paint Booth Exhaust", code: "Z-ENV-03", pillar: PillarType.ENVIRONMENT },
    { buildingId: buildingIds[6], name: "Process Gases", code: "Z-AIR-03", pillar: PillarType.COMPRESSED_AIR },
    { buildingId: buildingIds[1], name: "Boiler Room", code: "Z-HVAC-03", pillar: PillarType.THERMAL_HVAC },
  ];

  const zoneIds: string[] = [];
  for (const z of zonesData) {
    const zone = await prisma.zone.upsert({
      where: { id: `zone-${z.code}` },
      update: {},
      create: {
        id: `zone-${z.code}`,
        buildingId: z.buildingId,
        name: z.name,
        code: z.code,
        pillar: z.pillar,
      },
    });
    zoneIds.push(zone.id);
  }

  console.log("✓ Zones created");

  // ─── Gateways ─────────────────────────────────────────────────────────────────
  const gatewaysData = [
    { siteId: siteIds[0], name: "JKT Gateway Alpha", serial: "GW-JKT-001", connectionType: "LoRaWAN", ipAddress: "192.168.1.10" },
    { siteId: siteIds[0], name: "JKT Gateway Beta", serial: "GW-JKT-002", connectionType: "Modbus TCP", ipAddress: "192.168.1.11" },
    { siteId: siteIds[1], name: "SBY Gateway Main", serial: "GW-SBY-001", connectionType: "LoRaWAN", ipAddress: "192.168.2.10" },
    { siteId: siteIds[2], name: "BDG Gateway Primary", serial: "GW-BDG-001", connectionType: "MQTT", ipAddress: "192.168.3.10" },
    { siteId: siteIds[3], name: "SMG Gateway Alpha", serial: "GW-SMG-001", connectionType: "LoRaWAN", ipAddress: "192.168.4.10" },
    { siteId: siteIds[3], name: "SMG Gateway Beta", serial: "GW-SMG-002", connectionType: "Modbus RTU", ipAddress: "192.168.4.11" },
  ];

  const gatewayIds: string[] = [];
  for (const g of gatewaysData) {
    const gw = await prisma.gateway.upsert({
      where: { serialNumber: g.serial },
      update: {},
      create: {
        siteId: g.siteId,
        name: g.name,
        serialNumber: g.serial,
        connectionType: g.connectionType,
        ipAddress: g.ipAddress,
        firmwareVersion: "2.4.1",
        status: "online",
        lastSeenAt: subHours(new Date(), 1),
      },
    });
    gatewayIds.push(gw.id);
  }

  console.log("✓ Gateways created");

  // ─── Assets ──────────────────────────────────────────────────────────────────
  interface AssetDef {
    siteId: string;
    zoneId: string;
    name: string;
    code: string;
    assetType: string;
    pillar: PillarType;
    manufacturer: string;
    model: string;
    status: AssetStatus;
  }

  const assetsData: AssetDef[] = [
    // ELECTRICITY – JKT
    { siteId: siteIds[0], zoneId: zoneIds[0], name: "Main Incomer Panel JKT", code: "JKT-ELEC-001", assetType: "Switchboard", pillar: PillarType.ELECTRICITY, manufacturer: "Schneider Electric", model: "MasterPact MTZ2", status: AssetStatus.ACTIVE },
    { siteId: siteIds[0], zoneId: zoneIds[0], name: "Transformer T1", code: "JKT-ELEC-002", assetType: "Transformer", pillar: PillarType.ELECTRICITY, manufacturer: "Trafoindo", model: "TRA-1600kVA", status: AssetStatus.ACTIVE },
    { siteId: siteIds[0], zoneId: zoneIds[15], name: "Distribution Panel DP-01", code: "JKT-ELEC-003", assetType: "Distribution Panel", pillar: PillarType.ELECTRICITY, manufacturer: "ABB", model: "MNS Series", status: AssetStatus.ACTIVE },
    { siteId: siteIds[0], zoneId: zoneIds[15], name: "Power Factor Correction PFC-01", code: "JKT-ELEC-004", assetType: "PFC Unit", pillar: PillarType.ELECTRICITY, manufacturer: "Frako", model: "KM 400-D", status: AssetStatus.ACTIVE },
    // WATER – JKT
    { siteId: siteIds[0], zoneId: zoneIds[1], name: "Water Pump WP-01", code: "JKT-WTR-001", assetType: "Pump", pillar: PillarType.WATER, manufacturer: "Grundfos", model: "CM10-2", status: AssetStatus.ACTIVE },
    { siteId: siteIds[0], zoneId: zoneIds[1], name: "Water Storage Tank WT-01", code: "JKT-WTR-002", assetType: "Tank", pillar: PillarType.WATER, manufacturer: "Local Fabrication", model: "SS-50m3", status: AssetStatus.ACTIVE },
    // WASTEWATER – JKT
    { siteId: siteIds[0], zoneId: zoneIds[2], name: "Effluent Pump EP-01", code: "JKT-WWT-001", assetType: "Pump", pillar: PillarType.WASTEWATER, manufacturer: "Flygt", model: "3127", status: AssetStatus.ACTIVE },
    { siteId: siteIds[0], zoneId: zoneIds[2], name: "Wastewater Treatment WWT-01", code: "JKT-WWT-002", assetType: "Treatment Unit", pillar: PillarType.WASTEWATER, manufacturer: "Degremont", model: "SBR-200", status: AssetStatus.MAINTENANCE },
    // GAS – JKT
    { siteId: siteIds[0], zoneId: zoneIds[3], name: "Natural Gas Meter GM-01", code: "JKT-GAS-001", assetType: "Meter", pillar: PillarType.GAS_AIR, manufacturer: "Elster", model: "G-250", status: AssetStatus.ACTIVE },
    // HVAC – JKT
    { siteId: siteIds[0], zoneId: zoneIds[4], name: "Chiller CH-01", code: "JKT-HVAC-001", assetType: "Chiller", pillar: PillarType.THERMAL_HVAC, manufacturer: "Trane", model: "CGAM-200", status: AssetStatus.ACTIVE },
    { siteId: siteIds[0], zoneId: zoneIds[4], name: "Air Handling Unit AHU-01", code: "JKT-HVAC-002", assetType: "AHU", pillar: PillarType.THERMAL_HVAC, manufacturer: "York", model: "ZF200", status: AssetStatus.ACTIVE },
    { siteId: siteIds[0], zoneId: zoneIds[19], name: "Boiler BLR-01", code: "JKT-HVAC-003", assetType: "Boiler", pillar: PillarType.THERMAL_HVAC, manufacturer: "Cochran", model: "Wee Chieftain 500", status: AssetStatus.ACTIVE },

    // ELECTRICITY – SBY
    { siteId: siteIds[1], zoneId: zoneIds[5], name: "Main Substation Panel SBY", code: "SBY-ELEC-001", assetType: "Switchboard", pillar: PillarType.ELECTRICITY, manufacturer: "Siemens", model: "SIVACON S8", status: AssetStatus.ACTIVE },
    { siteId: siteIds[1], zoneId: zoneIds[5], name: "Transformer T2", code: "SBY-ELEC-002", assetType: "Transformer", pillar: PillarType.ELECTRICITY, manufacturer: "Trafoindo", model: "TRA-2000kVA", status: AssetStatus.ACTIVE },
    { siteId: siteIds[1], zoneId: zoneIds[5], name: "UPS System UPS-01", code: "SBY-ELEC-003", assetType: "UPS", pillar: PillarType.ELECTRICITY, manufacturer: "Eaton", model: "9PX 20KVA", status: AssetStatus.ACTIVE },
    // COMPRESSED AIR – SBY
    { siteId: siteIds[1], zoneId: zoneIds[6], name: "Screw Compressor SC-01", code: "SBY-AIR-001", assetType: "Compressor", pillar: PillarType.COMPRESSED_AIR, manufacturer: "Atlas Copco", model: "GA30+", status: AssetStatus.ACTIVE },
    { siteId: siteIds[1], zoneId: zoneIds[6], name: "Air Dryer AD-01", code: "SBY-AIR-002", assetType: "Air Dryer", pillar: PillarType.COMPRESSED_AIR, manufacturer: "Atlas Copco", model: "FD60", status: AssetStatus.ACTIVE },
    // ENVIRONMENT – SBY
    { siteId: siteIds[1], zoneId: zoneIds[7], name: "Ambient Air Quality Monitor AQM-01", code: "SBY-ENV-001", assetType: "Monitor", pillar: PillarType.ENVIRONMENT, manufacturer: "Enviro Tech", model: "AQM-2000", status: AssetStatus.ACTIVE },

    // ELECTRICITY – BDG
    { siteId: siteIds[2], zoneId: zoneIds[8], name: "Main Panel BDG", code: "BDG-ELEC-001", assetType: "Switchboard", pillar: PillarType.ELECTRICITY, manufacturer: "Schneider Electric", model: "Blokset", status: AssetStatus.ACTIVE },
    { siteId: siteIds[2], zoneId: zoneIds[8], name: "Solar PV Inverter INV-01", code: "BDG-ELEC-002", assetType: "Inverter", pillar: PillarType.ELECTRICITY, manufacturer: "SMA", model: "Sunny Tripower 25", status: AssetStatus.ACTIVE },
    // WATER – BDG
    { siteId: siteIds[2], zoneId: zoneIds[9], name: "Water Pump WP-02", code: "BDG-WTR-001", assetType: "Pump", pillar: PillarType.WATER, manufacturer: "Grundfos", model: "NB65-160", status: AssetStatus.ACTIVE },
    { siteId: siteIds[2], zoneId: zoneIds[16], name: "Cooling Tower CT-01", code: "BDG-WTR-002", assetType: "Cooling Tower", pillar: PillarType.WATER, manufacturer: "Bac", model: "VFL-350", status: AssetStatus.ACTIVE },
    // WASTEWATER – BDG
    { siteId: siteIds[2], zoneId: zoneIds[10], name: "Effluent Treatment Plant ETP-01", code: "BDG-WWT-001", assetType: "Treatment Unit", pillar: PillarType.WASTEWATER, manufacturer: "Veolia", model: "ACTIFLO", status: AssetStatus.ACTIVE },
    // ENVIRONMENT – BDG
    { siteId: siteIds[2], zoneId: zoneIds[17], name: "VOC Monitor VOCM-01", code: "BDG-ENV-001", assetType: "Monitor", pillar: PillarType.ENVIRONMENT, manufacturer: "Ion Science", model: "Tiger Select", status: AssetStatus.ACTIVE },

    // GAS – SMG
    { siteId: siteIds[3], zoneId: zoneIds[11], name: "LPG Flow Meter FM-01", code: "SMG-GAS-001", assetType: "Flow Meter", pillar: PillarType.GAS_AIR, manufacturer: "Yokogawa", model: "AXF050G", status: AssetStatus.ACTIVE },
    { siteId: siteIds[3], zoneId: zoneIds[11], name: "Gas Leak Detector GLD-01", code: "SMG-GAS-002", assetType: "Detector", pillar: PillarType.GAS_AIR, manufacturer: "MSA Safety", model: "Ultima X", status: AssetStatus.ACTIVE },
    // HVAC – SMG
    { siteId: siteIds[3], zoneId: zoneIds[12], name: "Chiller CH-02", code: "SMG-HVAC-001", assetType: "Chiller", pillar: PillarType.THERMAL_HVAC, manufacturer: "Carrier", model: "30XA-400", status: AssetStatus.ACTIVE },
    // COMPRESSED AIR – SMG
    { siteId: siteIds[3], zoneId: zoneIds[13], name: "Piston Compressor PC-01", code: "SMG-AIR-001", assetType: "Compressor", pillar: PillarType.COMPRESSED_AIR, manufacturer: "Ingersoll Rand", model: "R-Series 30", status: AssetStatus.ACTIVE },
    { siteId: siteIds[3], zoneId: zoneIds[18], name: "N2 Generator NG-01", code: "SMG-AIR-002", assetType: "Gas Generator", pillar: PillarType.COMPRESSED_AIR, manufacturer: "Parker", model: "NITROSOURCE", status: AssetStatus.ACTIVE },
    // ENVIRONMENT – SMG
    { siteId: siteIds[3], zoneId: zoneIds[14], name: "Noise Level Monitor NLM-01", code: "SMG-ENV-001", assetType: "Monitor", pillar: PillarType.ENVIRONMENT, manufacturer: "Bruel & Kjaer", model: "2250", status: AssetStatus.ACTIVE },

    // Extra assets to reach ~80
    { siteId: siteIds[0], zoneId: zoneIds[0], name: "Energy Meter EM-01", code: "JKT-ELEC-005", assetType: "Energy Meter", pillar: PillarType.ELECTRICITY, manufacturer: "Schneider", model: "PM5560", status: AssetStatus.ACTIVE },
    { siteId: siteIds[0], zoneId: zoneIds[0], name: "Energy Meter EM-02", code: "JKT-ELEC-006", assetType: "Energy Meter", pillar: PillarType.ELECTRICITY, manufacturer: "Schneider", model: "PM5560", status: AssetStatus.ACTIVE },
    { siteId: siteIds[1], zoneId: zoneIds[5], name: "Energy Meter EM-03", code: "SBY-ELEC-004", assetType: "Energy Meter", pillar: PillarType.ELECTRICITY, manufacturer: "ABB", model: "B23 212-100", status: AssetStatus.ACTIVE },
    { siteId: siteIds[1], zoneId: zoneIds[5], name: "Energy Meter EM-04", code: "SBY-ELEC-005", assetType: "Energy Meter", pillar: PillarType.ELECTRICITY, manufacturer: "ABB", model: "B23 212-100", status: AssetStatus.ACTIVE },
    { siteId: siteIds[2], zoneId: zoneIds[8], name: "Energy Meter EM-05", code: "BDG-ELEC-003", assetType: "Energy Meter", pillar: PillarType.ELECTRICITY, manufacturer: "Schneider", model: "PM5560", status: AssetStatus.ACTIVE },
    { siteId: siteIds[3], zoneId: zoneIds[11], name: "Energy Meter EM-06", code: "SMG-ELEC-001", assetType: "Energy Meter", pillar: PillarType.ELECTRICITY, manufacturer: "Siemens", model: "SENTRON PAC3200", status: AssetStatus.ACTIVE },
    { siteId: siteIds[0], zoneId: zoneIds[1], name: "Flow Meter FLW-01", code: "JKT-WTR-003", assetType: "Flow Meter", pillar: PillarType.WATER, manufacturer: "Endress+Hauser", model: "Promag 50W", status: AssetStatus.ACTIVE },
    { siteId: siteIds[1], zoneId: zoneIds[6], name: "Flow Meter FLW-02", code: "SBY-AIR-003", assetType: "Flow Meter", pillar: PillarType.COMPRESSED_AIR, manufacturer: "Endress+Hauser", model: "Prowirl 200", status: AssetStatus.ACTIVE },
    { siteId: siteIds[0], zoneId: zoneIds[4], name: "Cooling Tower Fan CTF-01", code: "JKT-HVAC-004", assetType: "Fan", pillar: PillarType.THERMAL_HVAC, manufacturer: "EBARA", model: "FLF-250", status: AssetStatus.ACTIVE },
    { siteId: siteIds[3], zoneId: zoneIds[12], name: "AHU SMG AHU-02", code: "SMG-HVAC-002", assetType: "AHU", pillar: PillarType.THERMAL_HVAC, manufacturer: "Daikin", model: "JAHU-150", status: AssetStatus.ACTIVE },
    // More to reach ~80
    ...Array.from({ length: 40 }, (_, i) => ({
      siteId: siteIds[i % 4],
      zoneId: zoneIds[i % 20],
      name: `Sensor Node SN-${String(i + 1).padStart(3, "0")}`,
      code: `GEN-SN-${String(i + 1).padStart(3, "0")}`,
      assetType: "IoT Node",
      pillar: [PillarType.ELECTRICITY, PillarType.WATER, PillarType.WASTEWATER, PillarType.GAS_AIR, PillarType.ENVIRONMENT, PillarType.THERMAL_HVAC, PillarType.COMPRESSED_AIR][i % 7],
      manufacturer: "WIT.ID",
      model: "EMS-Node-v2",
      status: i % 10 === 0 ? AssetStatus.MAINTENANCE : AssetStatus.ACTIVE,
    })),
  ];

  const assetIds: string[] = [];
  for (const a of assetsData) {
    const asset = await prisma.asset.upsert({
      where: { id: `asset-${a.code}` },
      update: {},
      create: {
        id: `asset-${a.code}`,
        siteId: a.siteId,
        zoneId: a.zoneId,
        name: a.name,
        code: a.code,
        assetType: a.assetType,
        pillar: a.pillar,
        manufacturer: a.manufacturer,
        model: a.model,
        serialNumber: `SN-${a.code}`,
        installDate: subDays(new Date(), Math.floor(Math.random() * 730) + 30),
        status: a.status,
      },
    });
    assetIds.push(asset.id);
  }

  console.log(`✓ Assets created (${assetIds.length})`);

  // ─── Sensors ─────────────────────────────────────────────────────────────────
  interface SensorDef {
    assetId: string;
    gatewayId: string;
    name: string;
    sensorType: string;
    metricName: string;
    unit: string;
    protocol: string;
    minValue: number;
    maxValue: number;
    lastValue: number;
    status: SensorStatus;
  }

  const sensorsData: SensorDef[] = [
    // Electrical sensors for main assets
    { assetId: assetIds[0], gatewayId: gatewayIds[0], name: "Voltage L1-N", sensorType: "Voltage", metricName: "voltage_l1n", unit: "V", protocol: "Modbus TCP", minValue: 180, maxValue: 260, lastValue: 228.5, status: SensorStatus.ONLINE },
    { assetId: assetIds[0], gatewayId: gatewayIds[0], name: "Current L1", sensorType: "Current", metricName: "current_l1", unit: "A", protocol: "Modbus TCP", minValue: 0, maxValue: 400, lastValue: 185.2, status: SensorStatus.ONLINE },
    { assetId: assetIds[0], gatewayId: gatewayIds[0], name: "Active Power", sensorType: "Power", metricName: "active_power", unit: "kW", protocol: "Modbus TCP", minValue: 0, maxValue: 1600, lastValue: 423.6, status: SensorStatus.ONLINE },
    { assetId: assetIds[0], gatewayId: gatewayIds[0], name: "Power Factor", sensorType: "Power Factor", metricName: "power_factor", unit: "PF", protocol: "Modbus TCP", minValue: 0, maxValue: 1, lastValue: 0.88, status: SensorStatus.ONLINE },
    { assetId: assetIds[0], gatewayId: gatewayIds[0], name: "Energy kWh", sensorType: "Energy", metricName: "energy_kwh", unit: "kWh", protocol: "Modbus TCP", minValue: 0, maxValue: 9999999, lastValue: 45823.4, status: SensorStatus.ONLINE },
    { assetId: assetIds[1], gatewayId: gatewayIds[0], name: "Transformer Temperature", sensorType: "Temperature", metricName: "transformer_temp", unit: "°C", protocol: "Modbus RTU", minValue: 0, maxValue: 120, lastValue: 67.2, status: SensorStatus.ONLINE },
    { assetId: assetIds[4], gatewayId: gatewayIds[0], name: "Water Flow Rate", sensorType: "Flow", metricName: "flow_rate", unit: "m³/h", protocol: "Modbus TCP", minValue: 0, maxValue: 100, lastValue: 34.5, status: SensorStatus.ONLINE },
    { assetId: assetIds[4], gatewayId: gatewayIds[0], name: "Water Pressure", sensorType: "Pressure", metricName: "pressure", unit: "bar", protocol: "Modbus TCP", minValue: 0, maxValue: 10, lastValue: 3.2, status: SensorStatus.ONLINE },
    { assetId: assetIds[5], gatewayId: gatewayIds[0], name: "Tank Level", sensorType: "Level", metricName: "tank_level", unit: "%", protocol: "LoRaWAN", minValue: 0, maxValue: 100, lastValue: 72.8, status: SensorStatus.ONLINE },
    { assetId: assetIds[6], gatewayId: gatewayIds[0], name: "Effluent Flow", sensorType: "Flow", metricName: "effluent_flow", unit: "m³/h", protocol: "Modbus TCP", minValue: 0, maxValue: 50, lastValue: 12.3, status: SensorStatus.ONLINE },
    { assetId: assetIds[7], gatewayId: gatewayIds[0], name: "COD Level", sensorType: "Chemistry", metricName: "cod_level", unit: "mg/L", protocol: "Modbus TCP", minValue: 0, maxValue: 500, lastValue: 89.4, status: SensorStatus.ONLINE },
    { assetId: assetIds[7], gatewayId: gatewayIds[0], name: "pH Level", sensorType: "Chemistry", metricName: "ph_level", unit: "pH", protocol: "Modbus TCP", minValue: 0, maxValue: 14, lastValue: 7.2, status: SensorStatus.ONLINE },
    { assetId: assetIds[8], gatewayId: gatewayIds[1], name: "Gas Flow", sensorType: "Flow", metricName: "gas_flow", unit: "m³/h", protocol: "Modbus RTU", minValue: 0, maxValue: 500, lastValue: 145.6, status: SensorStatus.ONLINE },
    { assetId: assetIds[9], gatewayId: gatewayIds[1], name: "Chiller Supply Temp", sensorType: "Temperature", metricName: "supply_temp", unit: "°C", protocol: "Modbus TCP", minValue: 0, maxValue: 30, lastValue: 7.5, status: SensorStatus.ONLINE },
    { assetId: assetIds[9], gatewayId: gatewayIds[1], name: "Chiller Return Temp", sensorType: "Temperature", metricName: "return_temp", unit: "°C", protocol: "Modbus TCP", minValue: 0, maxValue: 40, lastValue: 12.3, status: SensorStatus.ONLINE },
    { assetId: assetIds[9], gatewayId: gatewayIds[1], name: "Chiller Power", sensorType: "Power", metricName: "chiller_power", unit: "kW", protocol: "Modbus TCP", minValue: 0, maxValue: 300, lastValue: 178.9, status: SensorStatus.ONLINE },
    { assetId: assetIds[10], gatewayId: gatewayIds[1], name: "AHU Supply Temp", sensorType: "Temperature", metricName: "ahu_supply_temp", unit: "°C", protocol: "Modbus TCP", minValue: 15, maxValue: 35, lastValue: 22.0, status: SensorStatus.ONLINE },
    { assetId: assetIds[12], gatewayId: gatewayIds[2], name: "SBY Incomer Voltage", sensorType: "Voltage", metricName: "voltage_l1n", unit: "V", protocol: "Modbus TCP", minValue: 180, maxValue: 260, lastValue: 231.0, status: SensorStatus.ONLINE },
    { assetId: assetIds[12], gatewayId: gatewayIds[2], name: "SBY Active Power", sensorType: "Power", metricName: "active_power", unit: "kW", protocol: "Modbus TCP", minValue: 0, maxValue: 2000, lastValue: 856.2, status: SensorStatus.ONLINE },
    { assetId: assetIds[15], gatewayId: gatewayIds[2], name: "Compressor Pressure", sensorType: "Pressure", metricName: "discharge_pressure", unit: "bar", protocol: "Modbus TCP", minValue: 0, maxValue: 13, lastValue: 7.8, status: SensorStatus.ONLINE },
    { assetId: assetIds[15], gatewayId: gatewayIds[2], name: "Compressor Power", sensorType: "Power", metricName: "compressor_power", unit: "kW", protocol: "Modbus TCP", minValue: 0, maxValue: 50, lastValue: 28.4, status: SensorStatus.ONLINE },
    { assetId: assetIds[17], gatewayId: gatewayIds[2], name: "PM2.5 Level", sensorType: "Particulate", metricName: "pm25", unit: "μg/m³", protocol: "MQTT", minValue: 0, maxValue: 500, lastValue: 34.2, status: SensorStatus.ONLINE },
    { assetId: assetIds[17], gatewayId: gatewayIds[2], name: "CO2 Level", sensorType: "Gas", metricName: "co2_ppm", unit: "ppm", protocol: "MQTT", minValue: 0, maxValue: 5000, lastValue: 412.0, status: SensorStatus.ONLINE },
    { assetId: assetIds[18], gatewayId: gatewayIds[3], name: "BDG Incomer Voltage", sensorType: "Voltage", metricName: "voltage_l1n", unit: "V", protocol: "Modbus TCP", minValue: 180, maxValue: 260, lastValue: 227.8, status: SensorStatus.ONLINE },
    { assetId: assetIds[20], gatewayId: gatewayIds[3], name: "BDG Water Flow", sensorType: "Flow", metricName: "flow_rate", unit: "m³/h", protocol: "Modbus TCP", minValue: 0, maxValue: 80, lastValue: 22.1, status: SensorStatus.ONLINE },
    { assetId: assetIds[22], gatewayId: gatewayIds[3], name: "ETP Outlet TSS", sensorType: "Chemistry", metricName: "tss_level", unit: "mg/L", protocol: "Modbus TCP", minValue: 0, maxValue: 200, lastValue: 45.6, status: SensorStatus.ONLINE },
    { assetId: assetIds[23], gatewayId: gatewayIds[3], name: "VOC Concentration", sensorType: "Gas", metricName: "voc_ppm", unit: "ppm", protocol: "MQTT", minValue: 0, maxValue: 1000, lastValue: 12.3, status: SensorStatus.CALIBRATION_DUE },
    { assetId: assetIds[24], gatewayId: gatewayIds[4], name: "LPG Flow", sensorType: "Flow", metricName: "gas_flow", unit: "m³/h", protocol: "Modbus TCP", minValue: 0, maxValue: 200, lastValue: 67.8, status: SensorStatus.ONLINE },
    { assetId: assetIds[25], gatewayId: gatewayIds[4], name: "CH4 LEL %", sensorType: "Gas", metricName: "ch4_lel", unit: "%LEL", protocol: "Modbus RTU", minValue: 0, maxValue: 100, lastValue: 2.1, status: SensorStatus.ONLINE },
    { assetId: assetIds[26], gatewayId: gatewayIds[4], name: "SMG Chiller Supply Temp", sensorType: "Temperature", metricName: "supply_temp", unit: "°C", protocol: "Modbus TCP", minValue: 0, maxValue: 30, lastValue: 8.2, status: SensorStatus.ONLINE },
    { assetId: assetIds[27], gatewayId: gatewayIds[5], name: "Piston Compressor Pressure", sensorType: "Pressure", metricName: "discharge_pressure", unit: "bar", protocol: "Modbus RTU", minValue: 0, maxValue: 12, lastValue: 8.5, status: SensorStatus.ONLINE },
    { assetId: assetIds[28], gatewayId: gatewayIds[5], name: "N2 Purity", sensorType: "Gas", metricName: "n2_purity", unit: "%", protocol: "Modbus RTU", minValue: 90, maxValue: 100, lastValue: 99.2, status: SensorStatus.ONLINE },
    { assetId: assetIds[29], gatewayId: gatewayIds[5], name: "Noise Level dBA", sensorType: "Acoustic", metricName: "noise_dba", unit: "dBA", protocol: "MQTT", minValue: 40, maxValue: 130, lastValue: 78.4, status: SensorStatus.ONLINE },
  ];

  // Pad to 160 with generic sensors for remaining assets
  for (let i = sensorsData.length; i < 160; i++) {
    const assetIndex = i % assetIds.length;
    const gIdx = i % gatewayIds.length;
    sensorsData.push({
      assetId: assetIds[assetIndex],
      gatewayId: gatewayIds[gIdx],
      name: `Generic Sensor S-${String(i + 1).padStart(3, "0")}`,
      sensorType: "Generic",
      metricName: `metric_${i % 5 === 0 ? "voltage" : i % 5 === 1 ? "current" : i % 5 === 2 ? "temperature" : i % 5 === 3 ? "pressure" : "flow"}`,
      unit: i % 5 === 0 ? "V" : i % 5 === 1 ? "A" : i % 5 === 2 ? "°C" : i % 5 === 3 ? "bar" : "m³/h",
      protocol: "Modbus TCP",
      minValue: 0,
      maxValue: 100,
      lastValue: Math.round(Math.random() * 80 + 10),
      status: i % 15 === 0 ? SensorStatus.OFFLINE : i % 20 === 0 ? SensorStatus.FAULT : SensorStatus.ONLINE,
    });
  }

  const sensorIds: string[] = [];
  for (let i = 0; i < sensorsData.length; i++) {
    const s = sensorsData[i];
    const sensor = await prisma.sensor.upsert({
      where: { id: `sensor-${String(i + 1).padStart(3, "0")}` },
      update: {},
      create: {
        id: `sensor-${String(i + 1).padStart(3, "0")}`,
        assetId: s.assetId,
        gatewayId: s.gatewayId,
        name: s.name,
        sensorType: s.sensorType,
        metricName: s.metricName,
        unit: s.unit,
        protocol: s.protocol,
        minValue: s.minValue,
        maxValue: s.maxValue,
        status: s.status,
        lastReadingAt: subHours(new Date(), Math.random() * 2),
        lastValue: s.lastValue,
      },
    });
    sensorIds.push(sensor.id);
  }

  console.log(`✓ Sensors created (${sensorIds.length})`);

  // ─── Telemetry ────────────────────────────────────────────────────────────────
  // 48 readings per sensor for last 2 days (hourly) = 160 sensors * 48 = 7680 rows
  const now = new Date();
  const BATCH_SIZE = 500;

  let totalTelemetryRows = 0;
  let batch: Array<{
    sensorId: string;
    timestamp: Date;
    metricName: string;
    metricValue: number;
    unit: string;
    qualityStatus: QualityStatus;
    sourceProtocol: string;
  }> = [];

  for (let si = 0; si < sensorsData.length; si++) {
    const s = sensorsData[si];
    const sensorId = sensorIds[si];
    for (let hourOffset = 0; hourOffset < 48; hourOffset++) {
      const ts = subHours(now, hourOffset);
      const range = s.maxValue - s.minValue;
      const noise = (Math.random() - 0.5) * range * 0.1;
      const value = Math.max(s.minValue, Math.min(s.maxValue, s.lastValue + noise));
      batch.push({
        sensorId,
        timestamp: ts,
        metricName: s.metricName,
        metricValue: Math.round(value * 100) / 100,
        unit: s.unit,
        qualityStatus: Math.random() > 0.98 ? QualityStatus.UNCERTAIN : QualityStatus.GOOD,
        sourceProtocol: s.protocol,
      });

      if (batch.length >= BATCH_SIZE) {
        await prisma.telemetryReading.createMany({ data: batch, skipDuplicates: true });
        totalTelemetryRows += batch.length;
        batch = [];
      }
    }
  }

  if (batch.length > 0) {
    await prisma.telemetryReading.createMany({ data: batch, skipDuplicates: true });
    totalTelemetryRows += batch.length;
  }

  console.log(`✓ Telemetry readings created (${totalTelemetryRows})`);

  // ─── Alert Rules ──────────────────────────────────────────────────────────────
  const alertRulesData = [
    { sensorId: sensorIds[0], name: "High Voltage L1", alertType: AlertType.STATIC_THRESHOLD, metricName: "voltage_l1n", operator: ">", threshold: 250, severity: AlertSeverity.HIGH },
    { sensorId: sensorIds[0], name: "Low Voltage L1", alertType: AlertType.STATIC_THRESHOLD, metricName: "voltage_l1n", operator: "<", threshold: 195, severity: AlertSeverity.HIGH },
    { sensorId: sensorIds[2], name: "Critical Overload", alertType: AlertType.PEAK_DEMAND, metricName: "active_power", operator: ">", threshold: 1400, severity: AlertSeverity.CRITICAL },
    { sensorId: sensorIds[2], name: "Peak Demand Warning", alertType: AlertType.PEAK_DEMAND, metricName: "active_power", operator: ">", threshold: 1200, severity: AlertSeverity.MEDIUM },
    { sensorId: sensorIds[3], name: "Low Power Factor", alertType: AlertType.STATIC_THRESHOLD, metricName: "power_factor", operator: "<", threshold: 0.85, severity: AlertSeverity.MEDIUM },
    { sensorId: sensorIds[5], name: "Transformer Overtemp", alertType: AlertType.STATIC_THRESHOLD, metricName: "transformer_temp", operator: ">", threshold: 100, severity: AlertSeverity.CRITICAL },
    { sensorId: sensorIds[6], name: "Low Water Flow", alertType: AlertType.CONTINUOUS_FLOW, metricName: "flow_rate", operator: "<", threshold: 10, severity: AlertSeverity.HIGH },
    { sensorId: sensorIds[8], name: "Low Tank Level", alertType: AlertType.STATIC_THRESHOLD, metricName: "tank_level", operator: "<", threshold: 20, severity: AlertSeverity.HIGH },
    { sensorId: sensorIds[10], name: "COD Exceedance", alertType: AlertType.COMPLIANCE_EXCEEDANCE, metricName: "cod_level", operator: ">", threshold: 150, severity: AlertSeverity.CRITICAL },
    { sensorId: sensorIds[11], name: "pH Out of Range High", alertType: AlertType.COMPLIANCE_EXCEEDANCE, metricName: "ph_level", operator: ">", threshold: 9.0, severity: AlertSeverity.HIGH },
    { sensorId: sensorIds[11], name: "pH Out of Range Low", alertType: AlertType.COMPLIANCE_EXCEEDANCE, metricName: "ph_level", operator: "<", threshold: 6.0, severity: AlertSeverity.HIGH },
    { sensorId: sensorIds[12], name: "Gas Overconsumption", alertType: AlertType.STATIC_THRESHOLD, metricName: "gas_flow", operator: ">", threshold: 400, severity: AlertSeverity.HIGH },
    { sensorId: sensorIds[13], name: "Chiller Warm Supply", alertType: AlertType.STATIC_THRESHOLD, metricName: "supply_temp", operator: ">", threshold: 12, severity: AlertSeverity.HIGH },
    { sensorId: sensorIds[15], name: "Chiller Energy Spike", alertType: AlertType.PEAK_DEMAND, metricName: "chiller_power", operator: ">", threshold: 260, severity: AlertSeverity.MEDIUM },
    { sensorId: sensorIds[19], name: "Low Compressor Pressure", alertType: AlertType.STATIC_THRESHOLD, metricName: "discharge_pressure", operator: "<", threshold: 6.5, severity: AlertSeverity.HIGH },
    { sensorId: sensorIds[21], name: "High PM2.5", alertType: AlertType.COMPLIANCE_EXCEEDANCE, metricName: "pm25", operator: ">", threshold: 75, severity: AlertSeverity.HIGH },
    { sensorId: sensorIds[22], name: "High CO2", alertType: AlertType.WORKER_EXPOSURE, metricName: "co2_ppm", operator: ">", threshold: 1000, severity: AlertSeverity.MEDIUM },
    { sensorId: sensorIds[26], name: "VOC Exposure Limit", alertType: AlertType.WORKER_EXPOSURE, metricName: "voc_ppm", operator: ">", threshold: 50, severity: AlertSeverity.CRITICAL },
    { sensorId: sensorIds[28], name: "Gas Leak Detected", alertType: AlertType.STATIC_THRESHOLD, metricName: "ch4_lel", operator: ">", threshold: 10, severity: AlertSeverity.CRITICAL },
    { sensorId: sensorIds[32], name: "Noise Exceedance", alertType: AlertType.WORKER_EXPOSURE, metricName: "noise_dba", operator: ">", threshold: 85, severity: AlertSeverity.HIGH },
    { sensorId: sensorIds[29], name: "N2 Purity Low", alertType: AlertType.STATIC_THRESHOLD, metricName: "n2_purity", operator: "<", threshold: 95, severity: AlertSeverity.HIGH },
    { sensorId: sensorIds[30], name: "SMG Piston Overpressure", alertType: AlertType.STATIC_THRESHOLD, metricName: "discharge_pressure", operator: ">", threshold: 11, severity: AlertSeverity.CRITICAL },
    { sensorId: sensorIds[25], name: "TSS Exceedance", alertType: AlertType.COMPLIANCE_EXCEEDANCE, metricName: "tss_level", operator: ">", threshold: 100, severity: AlertSeverity.HIGH },
    { sensorId: sensorIds[17], name: "SBY Overvoltage", alertType: AlertType.STATIC_THRESHOLD, metricName: "voltage_l1n", operator: ">", threshold: 252, severity: AlertSeverity.MEDIUM },
    { sensorId: sensorIds[18], name: "SBY Power Overload", alertType: AlertType.PEAK_DEMAND, metricName: "active_power", operator: ">", threshold: 1800, severity: AlertSeverity.CRITICAL },
  ];

  const alertRuleIds: string[] = [];
  for (let i = 0; i < alertRulesData.length; i++) {
    const r = alertRulesData[i];
    const rule = await prisma.alertRule.upsert({
      where: { id: `rule-${String(i + 1).padStart(3, "0")}` },
      update: {},
      create: {
        id: `rule-${String(i + 1).padStart(3, "0")}`,
        sensorId: r.sensorId,
        name: r.name,
        alertType: r.alertType,
        metricName: r.metricName,
        operator: r.operator,
        threshold: r.threshold,
        severity: r.severity,
        isActive: true,
        description: `Auto-generated rule: ${r.name}`,
      },
    });
    alertRuleIds.push(rule.id);
  }

  console.log(`✓ Alert rules created (${alertRuleIds.length})`);

  // ─── Alerts ───────────────────────────────────────────────────────────────────
  const alertsData = [
    { ruleId: alertRuleIds[0], assetId: assetIds[0], severity: AlertSeverity.HIGH, alertType: AlertType.STATIC_THRESHOLD, status: AlertStatus.OPEN, title: "Voltage L1 High — JKT Main Incomer", description: "Voltage on L1 phase exceeded threshold of 250V", metricName: "voltage_l1n", metricValue: 254.8, threshold: 250, daysAgo: 0.5 },
    { ruleId: alertRuleIds[2], assetId: assetIds[0], severity: AlertSeverity.CRITICAL, alertType: AlertType.PEAK_DEMAND, status: AlertStatus.ACKNOWLEDGED, title: "Critical Power Overload — JKT Production", description: "Active power peaked at 1456 kW exceeding 1400 kW limit", metricName: "active_power", metricValue: 1456.2, threshold: 1400, daysAgo: 1 },
    { ruleId: alertRuleIds[4], assetId: assetIds[0], severity: AlertSeverity.MEDIUM, alertType: AlertType.STATIC_THRESHOLD, status: AlertStatus.RESOLVED, title: "Low Power Factor — JKT Main Panel", description: "PF dropped below 0.85 target", metricName: "power_factor", metricValue: 0.81, threshold: 0.85, daysAgo: 3 },
    { ruleId: alertRuleIds[5], assetId: assetIds[1], severity: AlertSeverity.CRITICAL, alertType: AlertType.STATIC_THRESHOLD, status: AlertStatus.INVESTIGATING, title: "Transformer Overtemperature — T1 JKT", description: "Transformer T1 temperature reached 105°C", metricName: "transformer_temp", metricValue: 105.3, threshold: 100, daysAgo: 0.2 },
    { ruleId: alertRuleIds[7], assetId: assetIds[5], severity: AlertSeverity.HIGH, alertType: AlertType.STATIC_THRESHOLD, status: AlertStatus.OPEN, title: "Low Water Tank Level — WT-01 JKT", description: "Water storage tank level below 20%", metricName: "tank_level", metricValue: 14.2, threshold: 20, daysAgo: 0.3 },
    { ruleId: alertRuleIds[8], assetId: assetIds[7], severity: AlertSeverity.CRITICAL, alertType: AlertType.COMPLIANCE_EXCEEDANCE, status: AlertStatus.ACKNOWLEDGED, title: "COD Exceedance — WWT JKT", description: "Wastewater COD level exceeded environmental permit limit", metricName: "cod_level", metricValue: 187.4, threshold: 150, daysAgo: 2 },
    { ruleId: alertRuleIds[9], assetId: assetIds[7], severity: AlertSeverity.HIGH, alertType: AlertType.COMPLIANCE_EXCEEDANCE, status: AlertStatus.RESOLVED, title: "pH High — WWT JKT", description: "Effluent pH exceeded 9.0", metricName: "ph_level", metricValue: 9.4, threshold: 9.0, daysAgo: 5 },
    { ruleId: alertRuleIds[11], assetId: assetIds[8], severity: AlertSeverity.HIGH, alertType: AlertType.STATIC_THRESHOLD, status: AlertStatus.CLOSED, title: "Gas Overconsumption — JKT", description: "Natural gas consumption exceeded threshold", metricName: "gas_flow", metricValue: 423.0, threshold: 400, daysAgo: 7 },
    { ruleId: alertRuleIds[12], assetId: assetIds[9], severity: AlertSeverity.HIGH, alertType: AlertType.STATIC_THRESHOLD, status: AlertStatus.OPEN, title: "Chiller Warm Supply — CH-01 JKT", description: "Chilled water supply temperature too high", metricName: "supply_temp", metricValue: 13.8, threshold: 12, daysAgo: 0.1 },
    { ruleId: alertRuleIds[13], assetId: assetIds[9], severity: AlertSeverity.MEDIUM, alertType: AlertType.PEAK_DEMAND, status: AlertStatus.ACKNOWLEDGED, title: "Chiller Energy Spike — CH-01 JKT", description: "Chiller power consumption spiked", metricName: "chiller_power", metricValue: 278.5, threshold: 260, daysAgo: 1.5 },
    { ruleId: alertRuleIds[14], assetId: assetIds[15], severity: AlertSeverity.HIGH, alertType: AlertType.STATIC_THRESHOLD, status: AlertStatus.OPEN, title: "Low Compressor Pressure — SC-01 SBY", description: "Compressed air pressure below minimum", metricName: "discharge_pressure", metricValue: 6.1, threshold: 6.5, daysAgo: 0.4 },
    { ruleId: alertRuleIds[15], assetId: assetIds[17], severity: AlertSeverity.HIGH, alertType: AlertType.COMPLIANCE_EXCEEDANCE, status: AlertStatus.RESOLVED, title: "High PM2.5 — AQM-01 SBY", description: "Ambient PM2.5 exceeded health limit", metricName: "pm25", metricValue: 82.4, threshold: 75, daysAgo: 4 },
    { ruleId: alertRuleIds[17], assetId: assetIds[23], severity: AlertSeverity.CRITICAL, alertType: AlertType.WORKER_EXPOSURE, status: AlertStatus.OPEN, title: "VOC Exposure Limit Breached — BDG Factory", description: "VOC concentration exceeded worker exposure limit of 50 ppm", metricName: "voc_ppm", metricValue: 67.3, threshold: 50, daysAgo: 0.05 },
    { ruleId: alertRuleIds[18], assetId: assetIds[25], severity: AlertSeverity.CRITICAL, alertType: AlertType.STATIC_THRESHOLD, status: AlertStatus.ACKNOWLEDGED, title: "Gas Leak Detected — SMG Manifold", description: "CH4 concentration at 12% LEL — possible leak", metricName: "ch4_lel", metricValue: 12.0, threshold: 10, daysAgo: 0.6 },
    { ruleId: alertRuleIds[19], assetId: assetIds[29], severity: AlertSeverity.HIGH, alertType: AlertType.WORKER_EXPOSURE, status: AlertStatus.RESOLVED, title: "Noise Exceedance — SMG Processing", description: "Noise level exceeded 85 dBA occupational limit", metricName: "noise_dba", metricValue: 91.2, threshold: 85, daysAgo: 6 },
    { ruleId: alertRuleIds[20], assetId: assetIds[28], severity: AlertSeverity.HIGH, alertType: AlertType.STATIC_THRESHOLD, status: AlertStatus.OPEN, title: "N2 Purity Low — NG-01 SMG", description: "Nitrogen purity below 95%", metricName: "n2_purity", metricValue: 93.8, threshold: 95, daysAgo: 0.8 },
    { ruleId: alertRuleIds[21], assetId: assetIds[27], severity: AlertSeverity.CRITICAL, alertType: AlertType.STATIC_THRESHOLD, status: AlertStatus.INVESTIGATING, title: "Piston Compressor Overpressure — PC-01 SMG", description: "Discharge pressure exceeded safety limit", metricName: "discharge_pressure", metricValue: 11.4, threshold: 11, daysAgo: 0.3 },
    { ruleId: alertRuleIds[22], assetId: assetIds[22], severity: AlertSeverity.HIGH, alertType: AlertType.COMPLIANCE_EXCEEDANCE, status: AlertStatus.ACKNOWLEDGED, title: "TSS Exceedance — ETP-01 BDG", description: "Effluent TSS level exceeded permit limit of 100 mg/L", metricName: "tss_level", metricValue: 134.7, threshold: 100, daysAgo: 2.5 },
    { ruleId: alertRuleIds[23], assetId: assetIds[12], severity: AlertSeverity.MEDIUM, alertType: AlertType.STATIC_THRESHOLD, status: AlertStatus.CLOSED, title: "SBY Substation Overvoltage", description: "Voltage briefly exceeded 252V", metricName: "voltage_l1n", metricValue: 255.3, threshold: 252, daysAgo: 8 },
    { ruleId: alertRuleIds[24], assetId: assetIds[12], severity: AlertSeverity.CRITICAL, alertType: AlertType.PEAK_DEMAND, status: AlertStatus.RESOLVED, title: "SBY Power Overload", description: "Total demand exceeded 1800 kW during shift change", metricName: "active_power", metricValue: 1934.5, threshold: 1800, daysAgo: 10 },
    // Sensor offline / calibration alerts
    { ruleId: null, assetId: assetIds[26], severity: AlertSeverity.HIGH, alertType: AlertType.SENSOR_OFFLINE, status: AlertStatus.OPEN, title: "Sensor Offline — VOC Monitor BDG", description: "VOCM sensor has not reported in > 30 minutes", metricName: null, metricValue: null, threshold: null, daysAgo: 0.5 },
    { ruleId: null, assetId: assetIds[7], severity: AlertSeverity.INFO, alertType: AlertType.CALIBRATION_OVERDUE, status: AlertStatus.OPEN, title: "Calibration Overdue — WWT-01 pH Sensor", description: "pH sensor calibration was due 7 days ago", metricName: null, metricValue: null, threshold: null, daysAgo: 7 },
    { ruleId: null, assetId: assetIds[17], severity: AlertSeverity.INFO, alertType: AlertType.CALIBRATION_OVERDUE, status: AlertStatus.RESOLVED, title: "Calibration Overdue — AQM-01 SBY", description: "PM2.5 sensor due for calibration", metricName: null, metricValue: null, threshold: null, daysAgo: 14 },
    { ruleId: alertRuleIds[6], assetId: assetIds[4], severity: AlertSeverity.HIGH, alertType: AlertType.CONTINUOUS_FLOW, status: AlertStatus.FALSE_POSITIVE, title: "Low Water Flow — WP-01 JKT", description: "Momentary flow dip during pump startup sequence", metricName: "flow_rate", metricValue: 8.2, threshold: 10, daysAgo: 3 },
    { ruleId: alertRuleIds[16], assetId: assetIds[17], severity: AlertSeverity.MEDIUM, alertType: AlertType.WORKER_EXPOSURE, status: AlertStatus.CLOSED, title: "High CO2 — SBY AQM", description: "CO2 elevated during peak production shift", metricName: "co2_ppm", metricValue: 1124.0, threshold: 1000, daysAgo: 12 },
    // More open alerts
    { ruleId: alertRuleIds[1], assetId: assetIds[18], severity: AlertSeverity.HIGH, alertType: AlertType.STATIC_THRESHOLD, status: AlertStatus.OPEN, title: "BDG Low Voltage — Main Panel", description: "Voltage dipped during motor start", metricName: "voltage_l1n", metricValue: 192.3, threshold: 195, daysAgo: 0.2 },
    { ruleId: alertRuleIds[3], assetId: assetIds[0], severity: AlertSeverity.MEDIUM, alertType: AlertType.PEAK_DEMAND, status: AlertStatus.ACKNOWLEDGED, title: "Peak Demand Warning — JKT Production", description: "Approaching demand limit at 1250 kW", metricName: "active_power", metricValue: 1251.0, threshold: 1200, daysAgo: 0.7 },
    { ruleId: alertRuleIds[10], assetId: assetIds[7], severity: AlertSeverity.HIGH, alertType: AlertType.COMPLIANCE_EXCEEDANCE, status: AlertStatus.INVESTIGATING, title: "pH Low — WWT JKT", description: "Effluent pH dropped below 6.0", metricName: "ph_level", metricValue: 5.7, threshold: 6.0, daysAgo: 1.2 },
    { ruleId: null, assetId: assetIds[11], severity: AlertSeverity.HIGH, alertType: AlertType.SENSOR_OFFLINE, status: AlertStatus.OPEN, title: "Gateway Connectivity Loss — JKT Beta", description: "Modbus TCP gateway lost connectivity", metricName: null, metricValue: null, threshold: null, daysAgo: 0.1 },
    { ruleId: alertRuleIds[15], assetId: assetIds[17], severity: AlertSeverity.HIGH, alertType: AlertType.COMPLIANCE_EXCEEDANCE, status: AlertStatus.OPEN, title: "High PM2.5 — SBY AQM Recurring", description: "PM2.5 elevated again — wind from SW direction", metricName: "pm25", metricValue: 88.1, threshold: 75, daysAgo: 0.15 },
    { ruleId: alertRuleIds[13], assetId: assetIds[26], severity: AlertSeverity.MEDIUM, alertType: AlertType.PEAK_DEMAND, status: AlertStatus.RESOLVED, title: "SMG Chiller Energy Spike", description: "Chiller pulled excess power during hot day", metricName: "chiller_power", metricValue: 267.9, threshold: 260, daysAgo: 9 },
    { ruleId: alertRuleIds[12], assetId: assetIds[26], severity: AlertSeverity.HIGH, alertType: AlertType.STATIC_THRESHOLD, status: AlertStatus.OPEN, title: "SMG Chiller Warm Supply", description: "Supply temp above setpoint by 2°C", metricName: "supply_temp", metricValue: 10.4, threshold: 12, daysAgo: 0.6 },
    { ruleId: alertRuleIds[5], assetId: assetIds[13], severity: AlertSeverity.CRITICAL, alertType: AlertType.STATIC_THRESHOLD, status: AlertStatus.OPEN, title: "SBY Transformer Overtemp", description: "T2 temperature reached 107°C — emergency inspection required", metricName: "transformer_temp", metricValue: 107.2, threshold: 100, daysAgo: 0.05 },
    // Additional alerts to reach 40
    { ruleId: alertRuleIds[0], assetId: assetIds[2], severity: AlertSeverity.MEDIUM, alertType: AlertType.STATIC_THRESHOLD, status: AlertStatus.RESOLVED, title: "Voltage Spike — DP-01 JKT", description: "Transient voltage spike on distribution panel", metricName: "voltage_l1n", metricValue: 248.0, threshold: 250, daysAgo: 15 },
    { ruleId: alertRuleIds[4], assetId: assetIds[3], severity: AlertSeverity.LOW, alertType: AlertType.STATIC_THRESHOLD, status: AlertStatus.CLOSED, title: "PFC Unit Low PF — JKT", description: "Power factor below setpoint after capacitor bank switch", metricName: "power_factor", metricValue: 0.83, threshold: 0.85, daysAgo: 20 },
    { ruleId: alertRuleIds[6], assetId: assetIds[20], severity: AlertSeverity.MEDIUM, alertType: AlertType.CONTINUOUS_FLOW, status: AlertStatus.RESOLVED, title: "Low Water Flow — BDG Pump", description: "Flow dip detected during filter backwash cycle", metricName: "flow_rate", metricValue: 9.1, threshold: 10, daysAgo: 8 },
    { ruleId: alertRuleIds[7], assetId: assetIds[21], severity: AlertSeverity.HIGH, alertType: AlertType.STATIC_THRESHOLD, status: AlertStatus.OPEN, title: "Low Cooling Tower Level — CT-01 BDG", description: "Cooling tower basin level critically low", metricName: "tank_level", metricValue: 18.5, threshold: 20, daysAgo: 0.9 },
    { ruleId: alertRuleIds[24], assetId: assetIds[13], severity: AlertSeverity.CRITICAL, alertType: AlertType.PEAK_DEMAND, status: AlertStatus.ACKNOWLEDGED, title: "SBY T2 Power Overload Event", description: "Transformer T2 load exceeded 1800 kW safety margin", metricName: "active_power", metricValue: 1892.0, threshold: 1800, daysAgo: 0.4 },
    { ruleId: alertRuleIds[11], assetId: assetIds[24], severity: AlertSeverity.MEDIUM, alertType: AlertType.STATIC_THRESHOLD, status: AlertStatus.CLOSED, title: "LPG Overconsumption — SMG Manifold", description: "LPG usage above monthly average by 22%", metricName: "gas_flow", metricValue: 180.2, threshold: 200, daysAgo: 18 },
  ];

  const alertIds: string[] = [];
  const technicianId = users[Role.TECHNICIAN];
  const opsSupervisorId = users[Role.OPERATIONS_SUPERVISOR];

  for (let i = 0; i < alertsData.length; i++) {
    const a = alertsData[i];
    const openedAt = subDays(now, a.daysAgo);
    const alert = await prisma.alert.upsert({
      where: { id: `alert-${String(i + 1).padStart(3, "0")}` },
      update: {},
      create: {
        id: `alert-${String(i + 1).padStart(3, "0")}`,
        ruleId: a.ruleId,
        assetId: a.assetId,
        assigneeId: i % 3 === 0 ? technicianId : i % 3 === 1 ? opsSupervisorId : null,
        severity: a.severity,
        alertType: a.alertType,
        status: a.status,
        title: a.title,
        description: a.description,
        metricName: a.metricName,
        metricValue: a.metricValue,
        threshold: a.threshold,
        openedAt,
        acknowledgedAt: (a.status === AlertStatus.ACKNOWLEDGED || a.status === AlertStatus.INVESTIGATING || a.status === AlertStatus.RESOLVED || a.status === AlertStatus.CLOSED)
          ? new Date(openedAt.getTime() + 30 * 60 * 1000) : null,
        resolvedAt: (a.status === AlertStatus.RESOLVED || a.status === AlertStatus.CLOSED)
          ? new Date(openedAt.getTime() + 4 * 60 * 60 * 1000) : null,
        closedAt: a.status === AlertStatus.CLOSED ? new Date(openedAt.getTime() + 5 * 60 * 60 * 1000) : null,
        slaDeadline: addDays(openedAt, a.severity === AlertSeverity.CRITICAL ? 1 : a.severity === AlertSeverity.HIGH ? 4 : 7),
      },
    });
    alertIds.push(alert.id);
  }

  console.log(`✓ Alerts created (${alertIds.length})`);

  // ─── Work Orders ─────────────────────────────────────────────────────────────
  const workOrderAlerts = [
    { alertIndex: 1, title: "Inspect power overload on JKT production floor", status: WorkOrderStatus.IN_PROGRESS, priority: "critical" },
    { alertIndex: 3, title: "Emergency inspection — Transformer T1 overtemperature", status: WorkOrderStatus.OPEN, priority: "critical" },
    { alertIndex: 5, title: "Investigate COD exceedance — check dosing pump", status: WorkOrderStatus.IN_PROGRESS, priority: "high" },
    { alertIndex: 8, title: "Chiller warm supply — check refrigerant charge", status: WorkOrderStatus.OPEN, priority: "high" },
    { alertIndex: 12, title: "Isolate and inspect VOC source — BDG paint booth", status: WorkOrderStatus.OPEN, priority: "critical" },
    { alertIndex: 13, title: "Gas leak response — SMG manifold", status: WorkOrderStatus.IN_PROGRESS, priority: "critical" },
    { alertIndex: 16, title: "Safety shutdown — SMG piston compressor overpressure", status: WorkOrderStatus.IN_PROGRESS, priority: "critical" },
    { alertIndex: 17, title: "Adjust dosing — BDG ETP TSS exceedance", status: WorkOrderStatus.OPEN, priority: "high" },
  ];

  for (let i = 0; i < workOrderAlerts.length; i++) {
    const w = workOrderAlerts[i];
    await prisma.workOrder.upsert({
      where: { alertId: alertIds[w.alertIndex] },
      update: {},
      create: {
        alertId: alertIds[w.alertIndex],
        ownerId: i % 2 === 0 ? technicianId : opsSupervisorId,
        title: w.title,
        status: w.status,
        priority: w.priority,
        dueDate: addDays(now, w.priority === "critical" ? 1 : 3),
      },
    });
  }

  console.log("✓ Work orders created");

  // ─── Calibration Records ──────────────────────────────────────────────────────
  for (let i = 0; i < 10; i++) {
    const sIdx = i * 3;
    if (sIdx >= sensorIds.length) break;
    await prisma.calibrationRecord.create({
      data: {
        sensorId: sensorIds[sIdx],
        calibratedAt: subDays(now, 90),
        nextDueAt: addDays(now, 90),
        result: "pass",
        technician: "Reza Pratama",
        notes: "Annual calibration completed",
      },
    });
  }

  console.log("✓ Calibration records created");

  // ─── Reports ─────────────────────────────────────────────────────────────────
  const reportsData = [
    { reportType: "daily_operations", title: "Daily Operations Report — May 10 2026", period: "2026-05-10" },
    { reportType: "daily_operations", title: "Daily Operations Report — May 9 2026", period: "2026-05-09" },
    { reportType: "weekly_variance", title: "Weekly Variance Report — Week 18 2026", period: "2026-W18" },
    { reportType: "monthly_scorecard", title: "Monthly Executive Scorecard — April 2026", period: "2026-04" },
    { reportType: "wastewater_compliance", title: "Wastewater Compliance Report — April 2026", period: "2026-04" },
    { reportType: "scope2_emissions", title: "Scope 2 Emissions Report — Q1 2026", period: "2026-Q1" },
    { reportType: "iso50001_evidence", title: "ISO 50001 Evidence Pack — April 2026", period: "2026-04" },
    { reportType: "gas_ldar_incident", title: "Gas / LDAR Incident Report — SMG Manifold", period: "2026-05" },
    { reportType: "quarterly_board", title: "Quarterly Board Pack — Q1 2026", period: "2026-Q1" },
    { reportType: "monthly_scorecard", title: "Monthly Executive Scorecard — March 2026", period: "2026-03" },
  ];

  const execId = users[Role.EXECUTIVE];
  const energyMgrId = users[Role.ENERGY_MANAGER];

  for (let i = 0; i < reportsData.length; i++) {
    const r = reportsData[i];
    await prisma.report.create({
      data: {
        generatedBy: i % 2 === 0 ? execId : energyMgrId,
        reportType: r.reportType,
        title: r.title,
        period: r.period,
        status: "ready",
        fileUrl: `/reports/${r.reportType}-${r.period}.pdf`,
      },
    });
  }

  console.log("✓ Reports created");

  // ─── Integration Configs ──────────────────────────────────────────────────────
  const integrations = [
    { name: "Microsoft Teams", type: "microsoft_teams", isEnabled: true, config: { webhookUrl: "https://outlook.office.com/webhook/xxx", channel: "element-alerts" } },
    { name: "Slack", type: "slack", isEnabled: false, config: { webhookUrl: "", channel: "#monitoring-alerts" } },
    { name: "SAP Plant Maintenance", type: "sap_pm", isEnabled: false, config: { sapHost: "sap.wit.id", client: "100", systemId: "PRD" } },
    { name: "ServiceNow", type: "servicenow", isEnabled: true, config: { instanceUrl: "wit.service-now.com", assignmentGroup: "Facilities-CMMS" } },
  ];

  for (const integ of integrations) {
    await prisma.integrationConfig.upsert({
      where: { id: `integ-${integ.type}` },
      update: {},
      create: {
        id: `integ-${integ.type}`,
        name: integ.name,
        type: integ.type,
        isEnabled: integ.isEnabled,
        config: integ.config,
      },
    });
  }

  console.log("✓ Integration configs created");

  // ─── Audit Logs ───────────────────────────────────────────────────────────────
  const adminId = users[Role.SUPER_ADMIN];
  const auditEntries = [
    { actorId: adminId, action: "THRESHOLD_CHANGED", entityType: "AlertRule", entityId: alertRuleIds[0], details: { name: "High Voltage L1", oldThreshold: 245, newThreshold: 250 } },
    { actorId: adminId, action: "USER_LOGIN", entityType: "User", entityId: adminId, details: { email: "admin@wit.id" } },
    { actorId: opsSupervisorId, action: "ALERT_ACKNOWLEDGED", entityType: "Alert", entityId: alertIds[1], details: { alertTitle: "Critical Power Overload" } },
    { actorId: technicianId, action: "CALIBRATION_UPDATED", entityType: "Sensor", entityId: sensorIds[0], details: { result: "pass", technician: "Reza Pratama" } },
    { actorId: energyMgrId, action: "REPORT_GENERATED", entityType: "Report", entityId: null, details: { reportType: "monthly_scorecard", period: "2026-04" } },
    { actorId: adminId, action: "THRESHOLD_CHANGED", entityType: "AlertRule", entityId: alertRuleIds[8], details: { name: "COD Exceedance", oldThreshold: 200, newThreshold: 150 } },
    { actorId: opsSupervisorId, action: "ALERT_RESOLVED", entityType: "Alert", entityId: alertIds[2], details: { resolution: "Power factor correction capacitor reconnected" } },
    { actorId: technicianId, action: "SENSOR_MODIFIED", entityType: "Sensor", entityId: sensorIds[26], details: { field: "status", oldValue: "CALIBRATION_DUE", newValue: "ONLINE" } },
    { actorId: execId, action: "REPORT_GENERATED", entityType: "Report", entityId: null, details: { reportType: "quarterly_board", period: "2026-Q1" } },
    { actorId: adminId, action: "USER_LOGIN", entityType: "User", entityId: opsSupervisorId, details: { email: "opsup@wit.id" } },
    { actorId: energyMgrId, action: "ALERT_ACKNOWLEDGED", entityType: "Alert", entityId: alertIds[5], details: { alertTitle: "COD Exceedance — WWT JKT" } },
    { actorId: adminId, action: "CALIBRATION_UPDATED", entityType: "Sensor", entityId: sensorIds[10], details: { result: "pass", nextDueAt: "2026-08-11" } },
  ];

  for (const log of auditEntries) {
    await prisma.auditLog.create({
      data: {
        actorId: log.actorId,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        details: log.details,
        ipAddress: "192.168.1.100",
        userAgent: "Mozilla/5.0 (Element Monitoring System)",
        timestamp: subHours(now, Math.floor(Math.random() * 72)),
      },
    });
  }

  console.log("✓ Audit logs created");

  console.log("\n✅ Seed completed successfully!");
  console.log(`   Org: ${org.name}`);
  console.log(`   Users: ${usersData.length}`);
  console.log(`   Sites: ${siteIds.length}`);
  console.log(`   Assets: ${assetIds.length}`);
  console.log(`   Sensors: ${sensorIds.length}`);
  console.log(`   Telemetry rows: ${totalTelemetryRows}`);
  console.log(`   Alert Rules: ${alertRuleIds.length}`);
  console.log(`   Alerts: ${alertIds.length}`);
  console.log("\n   Demo users (password: password123):");
  for (const u of usersData) {
    console.log(`     ${u.email.padEnd(28)} [${u.role}]`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
