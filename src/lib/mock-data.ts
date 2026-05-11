import { PillarType, AlertSeverity, AlertStatus, AlertType, SensorStatus, AssetStatus, QualityStatus, Role } from "@prisma/client";

const now = new Date();
const d = (offsetDays: number) => new Date(now.getTime() - offsetDays * 86_400_000);

export const MOCK_ORGS = [
  { id: "org_1", name: "WIT.ID", slug: "wit-id", status: "active", createdAt: d(90), updatedAt: d(0) },
];

export const MOCK_USERS = [
  { id: "usr_1", email: "admin@wit.id",     name: "Admin User",     passwordHash: "", role: Role.SUPER_ADMIN,           organizationId: "org_1", isActive: true, createdAt: d(80), updatedAt: d(0), lastLoginAt: d(1) },
  { id: "usr_2", email: "executive@wit.id", name: "Budi Santoso",   passwordHash: "", role: Role.EXECUTIVE,             organizationId: "org_1", isActive: true, createdAt: d(80), updatedAt: d(0), lastLoginAt: d(1) },
  { id: "usr_3", email: "energymgr@wit.id", name: "Dewi Rahayu",    passwordHash: "", role: Role.ENERGY_MANAGER,        organizationId: "org_1", isActive: true, createdAt: d(80), updatedAt: d(0), lastLoginAt: d(2) },
  { id: "usr_4", email: "opsup@wit.id",     name: "Hendra Wijaya",  passwordHash: "", role: Role.OPERATIONS_SUPERVISOR, organizationId: "org_1", isActive: true, createdAt: d(80), updatedAt: d(0), lastLoginAt: d(3) },
  { id: "usr_5", email: "tech@wit.id",      name: "Rizky Pratama",  passwordHash: "", role: Role.TECHNICIAN,            organizationId: "org_1", isActive: true, createdAt: d(80), updatedAt: d(0), lastLoginAt: d(1) },
  { id: "usr_6", email: "finance@wit.id",   name: "Sari Indah",     passwordHash: "", role: Role.FINANCE,               organizationId: "org_1", isActive: true, createdAt: d(80), updatedAt: d(0), lastLoginAt: d(4) },
  { id: "usr_7", email: "ehs@wit.id",       name: "Ahmad Fauzi",    passwordHash: "", role: Role.EHS_COMPLIANCE,        organizationId: "org_1", isActive: true, createdAt: d(80), updatedAt: d(0), lastLoginAt: d(2) },
  { id: "usr_8", email: "viewer@wit.id",    name: "Putri Lestari",  passwordHash: "", role: Role.VIEWER,                organizationId: "org_1", isActive: true, createdAt: d(80), updatedAt: d(0), lastLoginAt: d(5) },
];

export const MOCK_SITES = [
  { id: "ste_1", organizationId: "org_1", name: "PLTU Suralaya",              code: "SUR", address: "Jl. Suralaya No. 1",     city: "Cilegon",   country: "Indonesia", lat: -6.020, lng: 106.010, timezone: "Asia/Jakarta", isActive: true, createdAt: d(60), updatedAt: d(0) },
  { id: "ste_2", organizationId: "org_1", name: "Kilang Pertamina Balongan",  code: "BAL", address: "Jl. Balongan Km. 9",     city: "Indramayu", country: "Indonesia", lat: -6.394, lng: 108.297, timezone: "Asia/Jakarta", isActive: true, createdAt: d(60), updatedAt: d(0) },
  { id: "ste_3", organizationId: "org_1", name: "PDAM Tirta Patriot",         code: "PAT", address: "Jl. Ahmad Yani No. 45",  city: "Bekasi",    country: "Indonesia", lat: -6.235, lng: 107.001, timezone: "Asia/Jakarta", isActive: true, createdAt: d(60), updatedAt: d(0) },
  { id: "ste_4", organizationId: "org_1", name: "Kawasan Industri MM2100",    code: "MM2", address: "Jl. Raya MM2100",        city: "Bekasi",    country: "Indonesia", lat: -6.356, lng: 107.138, timezone: "Asia/Jakarta", isActive: true, createdAt: d(60), updatedAt: d(0) },
];

export const MOCK_BUILDINGS = [
  { id: "bld_1", siteId: "ste_1", name: "Gedung Kontrol Utama",    code: "GKU", floors: 4, description: "Pusat kendali operasi", createdAt: d(55), updatedAt: d(0) },
  { id: "bld_2", siteId: "ste_1", name: "Gedung Turbin",           code: "GTB", floors: 3, description: "Ruang mesin turbin",    createdAt: d(55), updatedAt: d(0) },
  { id: "bld_3", siteId: "ste_2", name: "Gedung Proses",           code: "GPR", floors: 5, description: "Area proses kilang",    createdAt: d(55), updatedAt: d(0) },
  { id: "bld_4", siteId: "ste_2", name: "Gedung Utilitas",         code: "GUT", floors: 2, description: "Sistem utilitas",       createdAt: d(55), updatedAt: d(0) },
  { id: "bld_5", siteId: "ste_3", name: "Gedung Pompa Utama",      code: "GPU", floors: 2, description: "Pompa distribusi air",  createdAt: d(55), updatedAt: d(0) },
  { id: "bld_6", siteId: "ste_3", name: "Gedung Pengolahan",       code: "GPG", floors: 3, description: "Unit pengolahan air",   createdAt: d(55), updatedAt: d(0) },
  { id: "bld_7", siteId: "ste_4", name: "Gedung Pabrik A",         code: "GPA", floors: 6, description: "Fasilitas produksi A",  createdAt: d(55), updatedAt: d(0) },
  { id: "bld_8", siteId: "ste_4", name: "Gedung Pabrik B",         code: "GPB", floors: 6, description: "Fasilitas produksi B",  createdAt: d(55), updatedAt: d(0) },
];

export const MOCK_DEPARTMENTS = [
  { id: "dep_1", buildingId: "bld_1", name: "Departemen Listrik",      code: "DEL", description: null, createdAt: d(50), updatedAt: d(0) },
  { id: "dep_2", buildingId: "bld_1", name: "Departemen Instrumentasi",code: "DIN", description: null, createdAt: d(50), updatedAt: d(0) },
  { id: "dep_3", buildingId: "bld_2", name: "Departemen Mesin",        code: "DME", description: null, createdAt: d(50), updatedAt: d(0) },
  { id: "dep_4", buildingId: "bld_5", name: "Departemen Distribusi",   code: "DDI", description: null, createdAt: d(50), updatedAt: d(0) },
];

export const MOCK_BAGIANS = [
  { id: "bag_1", departmentId: "dep_1", name: "Bagian Panel MV",   code: "BPM", description: null, createdAt: d(45), updatedAt: d(0) },
  { id: "bag_2", departmentId: "dep_1", name: "Bagian Trafo",      code: "BTR", description: null, createdAt: d(45), updatedAt: d(0) },
  { id: "bag_3", departmentId: "dep_2", name: "Bagian PLC/DCS",    code: "BPC", description: null, createdAt: d(45), updatedAt: d(0) },
  { id: "bag_4", departmentId: "dep_3", name: "Bagian Turbin Gas", code: "BTG", description: null, createdAt: d(45), updatedAt: d(0) },
  { id: "bag_5", departmentId: "dep_4", name: "Bagian Pompa",      code: "BPO", description: null, createdAt: d(45), updatedAt: d(0) },
];

export const MOCK_RUANGANS = [
  { id: "rng_1", bagianId: "bag_1", name: "Ruang Panel 1",     code: "RP1", floor: 1, description: null, createdAt: d(40), updatedAt: d(0) },
  { id: "rng_2", bagianId: "bag_1", name: "Ruang Panel 2",     code: "RP2", floor: 2, description: null, createdAt: d(40), updatedAt: d(0) },
  { id: "rng_3", bagianId: "bag_2", name: "Ruang Trafo Utama", code: "RTU", floor: 1, description: null, createdAt: d(40), updatedAt: d(0) },
  { id: "rng_4", bagianId: "bag_3", name: "Ruang Server PLC",  code: "RSP", floor: 3, description: null, createdAt: d(40), updatedAt: d(0) },
  { id: "rng_5", bagianId: "bag_4", name: "Hall Turbin",       code: "HT1", floor: 1, description: null, createdAt: d(40), updatedAt: d(0) },
  { id: "rng_6", bagianId: "bag_5", name: "Ruang Pompa Induk", code: "RPI", floor: 1, description: null, createdAt: d(40), updatedAt: d(0) },
];

export const MOCK_INSTALLATION_POINTS = [
  { id: "ip_1", ruanganId: "rng_1", name: "IP-Panel-MV-01",  code: "P01", pillar: PillarType.ELECTRICITY,    description: "Panel MV 20kV feeder 1", isActive: true,  createdAt: d(35), updatedAt: d(0) },
  { id: "ip_2", ruanganId: "rng_1", name: "IP-Panel-MV-02",  code: "P02", pillar: PillarType.ELECTRICITY,    description: "Panel MV 20kV feeder 2", isActive: true,  createdAt: d(35), updatedAt: d(0) },
  { id: "ip_3", ruanganId: "rng_2", name: "IP-Panel-LV-01",  code: "L01", pillar: PillarType.ELECTRICITY,    description: "Panel LV 380V",          isActive: true,  createdAt: d(35), updatedAt: d(0) },
  { id: "ip_4", ruanganId: "rng_3", name: "IP-Trafo-500kVA", code: "T01", pillar: PillarType.ELECTRICITY,    description: "Trafo step-down",        isActive: true,  createdAt: d(35), updatedAt: d(0) },
  { id: "ip_5", ruanganId: "rng_4", name: "IP-PLC-Main",     code: "C01", pillar: PillarType.ENVIRONMENT,    description: "PLC utama DCS",          isActive: true,  createdAt: d(35), updatedAt: d(0) },
  { id: "ip_6", ruanganId: "rng_5", name: "IP-Turbin-GT01",  code: "G01", pillar: PillarType.COMPRESSED_AIR, description: "Turbin gas unit 1",      isActive: true,  createdAt: d(35), updatedAt: d(0) },
  { id: "ip_7", ruanganId: "rng_6", name: "IP-Pompa-P-101",  code: "W01", pillar: PillarType.WATER,          description: "Pompa centrifugal P-101",isActive: true,  createdAt: d(35), updatedAt: d(0) },
  { id: "ip_8", ruanganId: "rng_6", name: "IP-Pompa-P-102",  code: "W02", pillar: PillarType.WATER,          description: "Pompa centrifugal P-102",isActive: false, createdAt: d(35), updatedAt: d(0) },
];

export const MOCK_GATEWAYS = [
  { id: "gw_1", siteId: "ste_1", name: "GW-SUR-01", serialNumber: "GW-001", connectionType: "LoRaWAN", ipAddress: "192.168.1.10", firmwareVersion: "v2.4.1", status: "online",  lastSeenAt: new Date(now.getTime() - 2 * 60000),  createdAt: d(50), updatedAt: d(0) },
  { id: "gw_2", siteId: "ste_1", name: "GW-SUR-02", serialNumber: "GW-002", connectionType: "Modbus",  ipAddress: "192.168.1.11", firmwareVersion: "v2.4.1", status: "online",  lastSeenAt: new Date(now.getTime() - 5 * 60000),  createdAt: d(50), updatedAt: d(0) },
  { id: "gw_3", siteId: "ste_2", name: "GW-BAL-01", serialNumber: "GW-003", connectionType: "LoRaWAN", ipAddress: "10.0.0.10",   firmwareVersion: "v2.3.0", status: "online",  lastSeenAt: new Date(now.getTime() - 1 * 60000),  createdAt: d(50), updatedAt: d(0) },
  { id: "gw_4", siteId: "ste_3", name: "GW-PAT-01", serialNumber: "GW-004", connectionType: "MQTT",   ipAddress: "10.1.0.10",   firmwareVersion: "v2.4.0", status: "offline", lastSeenAt: new Date(now.getTime() - 90 * 60000), createdAt: d(50), updatedAt: d(0) },
  { id: "gw_5", siteId: "ste_4", name: "GW-MM2-01", serialNumber: "GW-005", connectionType: "LoRaWAN", ipAddress: "172.16.0.10", firmwareVersion: "v2.4.1", status: "online",  lastSeenAt: new Date(now.getTime() - 3 * 60000),  createdAt: d(50), updatedAt: d(0) },
  { id: "gw_6", siteId: "ste_4", name: "GW-MM2-02", serialNumber: "GW-006", connectionType: "Modbus",  ipAddress: "172.16.0.11", firmwareVersion: "v2.2.5", status: "online",  lastSeenAt: new Date(now.getTime() - 8 * 60000),  createdAt: d(50), updatedAt: d(0) },
];

export const MOCK_ASSETS = [
  { id: "ast_01", siteId: "ste_1", zoneId: null, name: "Transformator 150kV",      code: "TR-001", assetType: "Transformer",   pillar: PillarType.ELECTRICITY,    manufacturer: "ABB",        model: "ONAN 150kV",  serialNumber: "TR001", installDate: d(500), status: AssetStatus.ACTIVE,      createdAt: d(50), updatedAt: d(0) },
  { id: "ast_02", siteId: "ste_1", zoneId: null, name: "Panel Distribusi MV",      code: "PD-001", assetType: "Switchgear",    pillar: PillarType.ELECTRICITY,    manufacturer: "Schneider",  model: "SM6",         serialNumber: "PD001", installDate: d(490), status: AssetStatus.ACTIVE,      createdAt: d(50), updatedAt: d(0) },
  { id: "ast_03", siteId: "ste_1", zoneId: null, name: "Pompa Air Pendingin",      code: "PA-001", assetType: "Pump",          pillar: PillarType.WATER,          manufacturer: "Grundfos",   model: "NB 65-160",   serialNumber: "PA001", installDate: d(480), status: AssetStatus.ACTIVE,      createdAt: d(50), updatedAt: d(0) },
  { id: "ast_04", siteId: "ste_1", zoneId: null, name: "Unit HVAC Gedung Kontrol", code: "HV-001", assetType: "HVAC",          pillar: PillarType.THERMAL_HVAC,   manufacturer: "Carrier",    model: "30XA",        serialNumber: "HV001", installDate: d(470), status: AssetStatus.ACTIVE,      createdAt: d(50), updatedAt: d(0) },
  { id: "ast_05", siteId: "ste_1", zoneId: null, name: "Monitor Kualitas Udara",   code: "MU-001", assetType: "Air Monitor",   pillar: PillarType.ENVIRONMENT,    manufacturer: "Vaisala",    model: "AQT530",      serialNumber: "MU001", installDate: d(460), status: AssetStatus.ACTIVE,      createdAt: d(50), updatedAt: d(0) },
  { id: "ast_06", siteId: "ste_1", zoneId: null, name: "Kompresor Udara",          code: "KU-001", assetType: "Compressor",    pillar: PillarType.COMPRESSED_AIR, manufacturer: "Atlas Copco", model: "GA45+",      serialNumber: "KU001", installDate: d(450), status: AssetStatus.MAINTENANCE, createdAt: d(50), updatedAt: d(0) },
  { id: "ast_07", siteId: "ste_2", zoneId: null, name: "Detektor Gas LEL",         code: "DG-001", assetType: "Gas Detector",  pillar: PillarType.GAS_AIR,        manufacturer: "Honeywell",  model: "MIDAS-E-LEL", serialNumber: "DG001", installDate: d(440), status: AssetStatus.ACTIVE,      createdAt: d(50), updatedAt: d(0) },
  { id: "ast_08", siteId: "ste_2", zoneId: null, name: "Analyzer Limbah Cair",     code: "AL-001", assetType: "Analyzer",      pillar: PillarType.WASTEWATER,     manufacturer: "Hach",       model: "DR6000",      serialNumber: "AL001", installDate: d(430), status: AssetStatus.ACTIVE,      createdAt: d(50), updatedAt: d(0) },
  { id: "ast_09", siteId: "ste_3", zoneId: null, name: "Flow Meter Induk",         code: "FM-001", assetType: "Flow Meter",    pillar: PillarType.WATER,          manufacturer: "Endress+H",  model: "Promag 10",   serialNumber: "FM001", installDate: d(420), status: AssetStatus.ACTIVE,      createdAt: d(50), updatedAt: d(0) },
  { id: "ast_10", siteId: "ste_3", zoneId: null, name: "Panel Listrik Pompa",      code: "PL-001", assetType: "Switchgear",    pillar: PillarType.ELECTRICITY,    manufacturer: "Siemens",    model: "SIVACON S4",  serialNumber: "PL001", installDate: d(410), status: AssetStatus.ACTIVE,      createdAt: d(50), updatedAt: d(0) },
  { id: "ast_11", siteId: "ste_4", zoneId: null, name: "Chiller 1",                code: "CH-001", assetType: "Chiller",       pillar: PillarType.THERMAL_HVAC,   manufacturer: "Trane",      model: "RTAF 300",    serialNumber: "CH001", installDate: d(400), status: AssetStatus.ACTIVE,      createdAt: d(50), updatedAt: d(0) },
  { id: "ast_12", siteId: "ste_4", zoneId: null, name: "Generator Diesel",         code: "GD-001", assetType: "Generator",     pillar: PillarType.ELECTRICITY,    manufacturer: "Cummins",    model: "C500D5",      serialNumber: "GD001", installDate: d(390), status: AssetStatus.ACTIVE,      createdAt: d(50), updatedAt: d(0) },
];

export const MOCK_SENSORS = [
  { id: "sns_01", assetId: "ast_01", gatewayId: "gw_1", name: "Tegangan Primer",    sensorType: "Voltage",     metricName: "voltage_kV",    unit: "kV",    protocol: "Modbus", minValue: 0,  maxValue: 200,  status: SensorStatus.ONLINE,          lastReadingAt: d(0), lastValue: 148.7,  createdAt: d(45), updatedAt: d(0) },
  { id: "sns_02", assetId: "ast_01", gatewayId: "gw_1", name: "Arus Primer",        sensorType: "Current",     metricName: "current_A",     unit: "A",     protocol: "Modbus", minValue: 0,  maxValue: 1000, status: SensorStatus.ONLINE,          lastReadingAt: d(0), lastValue: 423.5,  createdAt: d(45), updatedAt: d(0) },
  { id: "sns_03", assetId: "ast_02", gatewayId: "gw_1", name: "Daya Aktif",         sensorType: "Power",       metricName: "power_kW",      unit: "kW",    protocol: "Modbus", minValue: 0,  maxValue: 5000, status: SensorStatus.ONLINE,          lastReadingAt: d(0), lastValue: 3842.1, createdAt: d(45), updatedAt: d(0) },
  { id: "sns_04", assetId: "ast_02", gatewayId: "gw_1", name: "Power Factor",       sensorType: "PF",          metricName: "power_factor",  unit: "",      protocol: "Modbus", minValue: 0,  maxValue: 1,    status: SensorStatus.ONLINE,          lastReadingAt: d(0), lastValue: 0.92,   createdAt: d(45), updatedAt: d(0) },
  { id: "sns_05", assetId: "ast_03", gatewayId: "gw_2", name: "Laju Alir",          sensorType: "Flow",        metricName: "flow_m3h",      unit: "m³/h",  protocol: "Modbus", minValue: 0,  maxValue: 500,  status: SensorStatus.ONLINE,          lastReadingAt: d(0), lastValue: 187.3,  createdAt: d(45), updatedAt: d(0) },
  { id: "sns_06", assetId: "ast_03", gatewayId: "gw_2", name: "Tekanan",            sensorType: "Pressure",    metricName: "pressure_bar",  unit: "bar",   protocol: "Modbus", minValue: 0,  maxValue: 10,   status: SensorStatus.ONLINE,          lastReadingAt: d(0), lastValue: 4.2,    createdAt: d(45), updatedAt: d(0) },
  { id: "sns_07", assetId: "ast_04", gatewayId: "gw_2", name: "Suhu Supply",        sensorType: "Temperature", metricName: "temp_supply_C", unit: "°C",    protocol: "BACnet", minValue: 0,  maxValue: 50,   status: SensorStatus.ONLINE,          lastReadingAt: d(0), lastValue: 14.8,   createdAt: d(45), updatedAt: d(0) },
  { id: "sns_08", assetId: "ast_04", gatewayId: "gw_2", name: "Suhu Return",        sensorType: "Temperature", metricName: "temp_return_C", unit: "°C",    protocol: "BACnet", minValue: 0,  maxValue: 50,   status: SensorStatus.ONLINE,          lastReadingAt: d(0), lastValue: 22.1,   createdAt: d(45), updatedAt: d(0) },
  { id: "sns_09", assetId: "ast_05", gatewayId: "gw_1", name: "PM2.5",              sensorType: "Particulate", metricName: "pm25_ugm3",     unit: "µg/m³", protocol: "MQTT",   minValue: 0,  maxValue: 200,  status: SensorStatus.ONLINE,          lastReadingAt: d(0), lastValue: 18.4,   createdAt: d(45), updatedAt: d(0) },
  { id: "sns_10", assetId: "ast_05", gatewayId: "gw_1", name: "CO2",                sensorType: "Gas",         metricName: "co2_ppm",       unit: "ppm",   protocol: "MQTT",   minValue: 0,  maxValue: 5000, status: SensorStatus.ONLINE,          lastReadingAt: d(0), lastValue: 612.0,  createdAt: d(45), updatedAt: d(0) },
  { id: "sns_11", assetId: "ast_06", gatewayId: "gw_1", name: "Tekanan Udara",      sensorType: "Pressure",    metricName: "air_press_bar", unit: "bar",   protocol: "Modbus", minValue: 5,  maxValue: 12,   status: SensorStatus.FAULT,           lastReadingAt: d(1), lastValue: 6.8,    createdAt: d(45), updatedAt: d(0) },
  { id: "sns_12", assetId: "ast_07", gatewayId: "gw_3", name: "LEL %",              sensorType: "Gas",         metricName: "lel_pct",       unit: "%LEL",  protocol: "Modbus", minValue: 0,  maxValue: 100,  status: SensorStatus.ONLINE,          lastReadingAt: d(0), lastValue: 2.1,    createdAt: d(45), updatedAt: d(0) },
  { id: "sns_13", assetId: "ast_07", gatewayId: "gw_3", name: "H2S",                sensorType: "Gas",         metricName: "h2s_ppm",       unit: "ppm",   protocol: "Modbus", minValue: 0,  maxValue: 50,   status: SensorStatus.ONLINE,          lastReadingAt: d(0), lastValue: 0.4,    createdAt: d(45), updatedAt: d(0) },
  { id: "sns_14", assetId: "ast_08", gatewayId: "gw_3", name: "pH Air Limbah",      sensorType: "pH",          metricName: "ph",            unit: "pH",    protocol: "Modbus", minValue: 0,  maxValue: 14,   status: SensorStatus.ONLINE,          lastReadingAt: d(0), lastValue: 7.8,    createdAt: d(45), updatedAt: d(0) },
  { id: "sns_15", assetId: "ast_08", gatewayId: "gw_3", name: "COD",                sensorType: "Chemical",    metricName: "cod_mgl",       unit: "mg/L",  protocol: "Modbus", minValue: 0,  maxValue: 500,  status: SensorStatus.CALIBRATION_DUE, lastReadingAt: d(0), lastValue: 98.3,   createdAt: d(45), updatedAt: d(0) },
  { id: "sns_16", assetId: "ast_09", gatewayId: "gw_4", name: "Volume Harian",      sensorType: "Flow",        metricName: "vol_m3",        unit: "m³",    protocol: "Modbus", minValue: 0,  maxValue: 10000,status: SensorStatus.OFFLINE,         lastReadingAt: d(2), lastValue: 4521.0, createdAt: d(45), updatedAt: d(0) },
  { id: "sns_17", assetId: "ast_10", gatewayId: "gw_4", name: "Energi Harian",      sensorType: "Energy",      metricName: "energy_kWh",    unit: "kWh",   protocol: "Modbus", minValue: 0,  maxValue: 5000, status: SensorStatus.ONLINE,          lastReadingAt: d(0), lastValue: 1243.7, createdAt: d(45), updatedAt: d(0) },
  { id: "sns_18", assetId: "ast_11", gatewayId: "gw_5", name: "COP Chiller",        sensorType: "Efficiency",  metricName: "cop",           unit: "",      protocol: "BACnet", minValue: 2,  maxValue: 7,    status: SensorStatus.ONLINE,          lastReadingAt: d(0), lastValue: 4.3,    createdAt: d(45), updatedAt: d(0) },
  { id: "sns_19", assetId: "ast_12", gatewayId: "gw_6", name: "Fuel Consumption",   sensorType: "Flow",        metricName: "fuel_lh",       unit: "L/h",   protocol: "Modbus", minValue: 0,  maxValue: 200,  status: SensorStatus.ONLINE,          lastReadingAt: d(0), lastValue: 45.2,   createdAt: d(45), updatedAt: d(0) },
  { id: "sns_20", assetId: "ast_12", gatewayId: "gw_6", name: "Output Power",       sensorType: "Power",       metricName: "power_kW",      unit: "kW",    protocol: "Modbus", minValue: 0,  maxValue: 500,  status: SensorStatus.ONLINE,          lastReadingAt: d(0), lastValue: 387.0,  createdAt: d(45), updatedAt: d(0) },
];

function makeTelemetry(sensorId: string, metricName: string, unit: string, base: number, variance: number) {
  return Array.from({ length: 24 }, (_, i) => {
    const seed = Math.sin(i * 17 + base) * 0.5 + 0.5;
    return {
      id: `tel_${sensorId}_${i}`,
      sensorId,
      timestamp: new Date(now.getTime() - (23 - i) * 3600000),
      metricName,
      metricValue: +(base + seed * variance).toFixed(2),
      unit,
      qualityStatus: QualityStatus.GOOD,
      sourceProtocol: "Modbus",
      gatewayId: null,
    };
  });
}

export const MOCK_TELEMETRY = [
  ...makeTelemetry("sns_01", "voltage_kV",   "kV",    148, 4),
  ...makeTelemetry("sns_03", "power_kW",      "kW",    3800, 300),
  ...makeTelemetry("sns_05", "flow_m3h",      "m³/h",  185, 30),
  ...makeTelemetry("sns_09", "pm25_ugm3",     "µg/m³", 18, 10),
  ...makeTelemetry("sns_12", "lel_pct",       "%LEL",  2, 2),
  ...makeTelemetry("sns_14", "ph",            "pH",    7.5, 0.8),
  ...makeTelemetry("sns_18", "cop",           "",      4.2, 0.5),
];

export const MOCK_ALERT_RULES = [
  { id: "rul_1", sensorId: "sns_04", name: "PF Rendah",         alertType: AlertType.STATIC_THRESHOLD,      metricName: "power_factor", operator: "<",  threshold: 0.85, severity: AlertSeverity.HIGH,     isActive: true, description: "Power factor di bawah 0.85",        createdAt: d(40), updatedAt: d(0) },
  { id: "rul_2", sensorId: "sns_11", name: "Tekanan Udara Low", alertType: AlertType.STATIC_THRESHOLD,      metricName: "air_press_bar",operator: "<",  threshold: 7.0,  severity: AlertSeverity.CRITICAL,  isActive: true, description: "Tekanan udara terlalu rendah",       createdAt: d(40), updatedAt: d(0) },
  { id: "rul_3", sensorId: "sns_12", name: "Gas LEL Tinggi",    alertType: AlertType.STATIC_THRESHOLD,      metricName: "lel_pct",      operator: ">",  threshold: 10.0, severity: AlertSeverity.CRITICAL,  isActive: true, description: "Konsentrasi gas melebihi 10% LEL",   createdAt: d(40), updatedAt: d(0) },
  { id: "rul_4", sensorId: "sns_14", name: "pH Tinggi",         alertType: AlertType.COMPLIANCE_EXCEEDANCE, metricName: "ph",           operator: ">",  threshold: 9.0,  severity: AlertSeverity.MEDIUM,    isActive: true, description: "pH melebihi baku mutu",              createdAt: d(40), updatedAt: d(0) },
  { id: "rul_5", sensorId: "sns_16", name: "Sensor Offline",    alertType: AlertType.SENSOR_OFFLINE,        metricName: "vol_m3",       operator: "==", threshold: 0,    severity: AlertSeverity.HIGH,      isActive: true, description: "Sensor tidak mengirim data",         createdAt: d(40), updatedAt: d(0) },
];

export const MOCK_ALERTS = [
  { id: "alt_01", ruleId: "rul_2", assetId: "ast_06", assigneeId: "usr_5", severity: AlertSeverity.CRITICAL, alertType: AlertType.STATIC_THRESHOLD,      status: AlertStatus.INVESTIGATING, title: "Tekanan Udara Kompresor Sangat Rendah",   description: "Tekanan turun ke 6.8 bar",  metricName: "air_press_bar", metricValue: 6.8,  threshold: 7.0,  openedAt: d(1),  acknowledgedAt: d(1),  resolvedAt: null, closedAt: null, rootCause: "Kebocoran pipa distribusi", resolution: null, slaDeadline: d(-1), createdAt: d(1),  updatedAt: d(0) },
  { id: "alt_02", ruleId: "rul_1", assetId: "ast_02", assigneeId: "usr_3", severity: AlertSeverity.HIGH,     alertType: AlertType.STATIC_THRESHOLD,      status: AlertStatus.ACKNOWLEDGED,  title: "Power Factor Panel MV Di Bawah Standar", description: "PF: 0.82 < 0.85",          metricName: "power_factor",  metricValue: 0.82, threshold: 0.85, openedAt: d(2),  acknowledgedAt: d(2),  resolvedAt: null, closedAt: null, rootCause: null,                        resolution: null, slaDeadline: d(0),  createdAt: d(2),  updatedAt: d(1) },
  { id: "alt_03", ruleId: "rul_5", assetId: "ast_09", assigneeId: null,    severity: AlertSeverity.HIGH,     alertType: AlertType.SENSOR_OFFLINE,        status: AlertStatus.OPEN,          title: "Sensor Flow Meter PAT Offline",          description: "Tidak ada data > 2 jam",    metricName: "vol_m3",        metricValue: null, threshold: null, openedAt: d(0),  acknowledgedAt: null,  resolvedAt: null, closedAt: null, rootCause: null,                        resolution: null, slaDeadline: null,  createdAt: d(0),  updatedAt: d(0) },
  { id: "alt_04", ruleId: "rul_4", assetId: "ast_08", assigneeId: "usr_7", severity: AlertSeverity.MEDIUM,   alertType: AlertType.COMPLIANCE_EXCEEDANCE, status: AlertStatus.RESOLVED,      title: "pH Air Limbah Melewati Baku Mutu",       description: "pH 9.3 > 9.0",             metricName: "ph",            metricValue: 9.3,  threshold: 9.0,  openedAt: d(5),  acknowledgedAt: d(5),  resolvedAt: d(4), closedAt: d(4),  rootCause: "Alkaline spill",            resolution: "Neutralisasi H2SO4", slaDeadline: d(3),  createdAt: d(5),  updatedAt: d(4) },
  { id: "alt_05", ruleId: "rul_3", assetId: "ast_07", assigneeId: "usr_4", severity: AlertSeverity.CRITICAL, alertType: AlertType.STATIC_THRESHOLD,      status: AlertStatus.CLOSED,        title: "Konsentrasi Gas LEL Melebihi Batas",     description: "LEL 12% > 10%",            metricName: "lel_pct",       metricValue: 12.0, threshold: 10.0, openedAt: d(10), acknowledgedAt: d(10), resolvedAt: d(9), closedAt: d(9),  rootCause: "Kebocoran katup gas",       resolution: "Katup diganti",      slaDeadline: d(9),  createdAt: d(10), updatedAt: d(9) },
  { id: "alt_06", ruleId: null,    assetId: "ast_08", assigneeId: null,    severity: AlertSeverity.LOW,      alertType: AlertType.CALIBRATION_OVERDUE,   status: AlertStatus.OPEN,          title: "Kalibrasi COD Analyzer Overdue",         description: "Terlambat 15 hari",         metricName: null,            metricValue: null, threshold: null, openedAt: d(0),  acknowledgedAt: null,  resolvedAt: null, closedAt: null, rootCause: null,                        resolution: null, slaDeadline: null,  createdAt: d(0),  updatedAt: d(0) },
  { id: "alt_07", ruleId: null,    assetId: "ast_04", assigneeId: "usr_3", severity: AlertSeverity.MEDIUM,   alertType: AlertType.PEAK_DEMAND,           status: AlertStatus.OPEN,          title: "Peak Demand Listrik Melewati Kontrak",   description: "4.2 MVA > 4.0 MVA",        metricName: "demand_kVA",    metricValue: 4200, threshold: 4000, openedAt: d(0),  acknowledgedAt: null,  resolvedAt: null, closedAt: null, rootCause: null,                        resolution: null, slaDeadline: null,  createdAt: d(0),  updatedAt: d(0) },
  { id: "alt_08", ruleId: null,    assetId: "ast_11", assigneeId: "usr_5", severity: AlertSeverity.LOW,      alertType: AlertType.DYNAMIC_BASELINE,      status: AlertStatus.ACKNOWLEDGED,  title: "COP Chiller Di Bawah Baseline",          description: "COP 4.3 vs baseline 5.1",  metricName: "cop",           metricValue: 4.3,  threshold: 5.1,  openedAt: d(3),  acknowledgedAt: d(3),  resolvedAt: null, closedAt: null, rootCause: null,                        resolution: null, slaDeadline: null,  createdAt: d(3),  updatedAt: d(2) },
];

export const MOCK_REPORTS = [
  { id: "rpt_01", generatedBy: "usr_3", reportType: "monthly_energy",       title: "Laporan Energi Bulanan – April 2026",       period: "April 2026",  status: "ready",      fileUrl: null, parameters: { pillar: "ELECTRICITY" }, createdAt: d(5)  },
  { id: "rpt_02", generatedBy: "usr_7", reportType: "wastewater_compliance", title: "Compliance Air Limbah Q1 2026",             period: "Q1 2026",     status: "ready",      fileUrl: null, parameters: { pillar: "WASTEWATER" }, createdAt: d(8)  },
  { id: "rpt_03", generatedBy: "usr_2", reportType: "monthly_scorecard",     title: "Executive Scorecard April 2026",            period: "April 2026",  status: "ready",      fileUrl: null, parameters: {},                        createdAt: d(3)  },
  { id: "rpt_04", generatedBy: "usr_6", reportType: "cost_allocation",       title: "Alokasi Biaya Utilitas Q1 2026",            period: "Q1 2026",     status: "ready",      fileUrl: null, parameters: { currency: "IDR" },       createdAt: d(10) },
  { id: "rpt_05", generatedBy: "usr_3", reportType: "daily_operations",      title: "Laporan Operasional Harian 10 Mei 2026",    period: "10 Mei 2026", status: "ready",      fileUrl: null, parameters: { site: "ste_1" },         createdAt: d(1)  },
  { id: "rpt_06", generatedBy: "usr_7", reportType: "scope2_emissions",      title: "Emisi Scope 2 – April 2026",               period: "April 2026",  status: "processing", fileUrl: null, parameters: {},                        createdAt: d(0)  },
  { id: "rpt_07", generatedBy: "usr_4", reportType: "water_balance",         title: "Neraca Air PDAM Patriot – April 2026",     period: "April 2026",  status: "ready",      fileUrl: null, parameters: { site: "ste_3" },         createdAt: d(6)  },
  { id: "rpt_08", generatedBy: "usr_7", reportType: "calibration_status",    title: "Status Kalibrasi Sensor – Mei 2026",       period: "Mei 2026",    status: "ready",      fileUrl: null, parameters: {},                        createdAt: d(2)  },
  { id: "rpt_09", generatedBy: "usr_3", reportType: "peak_demand_analysis",  title: "Analisis Peak Demand Listrik – April 2026", period: "April 2026",  status: "ready",      fileUrl: null, parameters: { pillar: "ELECTRICITY" }, createdAt: d(7)  },
  { id: "rpt_10", generatedBy: "usr_7", reportType: "worker_safety",         title: "Keselamatan Kerja Gas Area – Q1 2026",     period: "Q1 2026",     status: "ready",      fileUrl: null, parameters: { pillar: "GAS_AIR" },     createdAt: d(12) },
];

const auditActions = ["LOGIN", "ALERT_ACKNOWLEDGED", "ALERT_RESOLVED", "REPORT_GENERATED", "USER_UPDATED", "SENSOR_UPDATED"];
export const MOCK_AUDIT_LOGS = Array.from({ length: 30 }, (_, i) => ({
  id: `log_${String(i).padStart(3, "0")}`,
  actorId: MOCK_USERS[i % MOCK_USERS.length].id,
  action: auditActions[i % auditActions.length],
  entityType: ["Alert", "Report", "User", "Sensor"][i % 4],
  entityId: `entity_${i}`,
  details: { note: `Mock audit entry ${i}` },
  ipAddress: `10.0.0.${(i % 254) + 1}`,
  userAgent: "Mozilla/5.0",
  timestamp: new Date(now.getTime() - i * 3_600_000),
}));

export const MOCK_INTEGRATIONS = [
  { id: "int_1", name: "Microsoft Teams",      type: "microsoft_teams", isEnabled: true,  config: { webhookUrl: "https://teams.example.com/webhook" }, createdAt: d(30), updatedAt: d(0) },
  { id: "int_2", name: "SAP Plant Maintenance",type: "sap_pm",          isEnabled: false, config: {},                                                   createdAt: d(30), updatedAt: d(0) },
  { id: "int_3", name: "Grafana",              type: "grafana",         isEnabled: true,  config: { apiUrl: "https://grafana.example.com" },            createdAt: d(30), updatedAt: d(0) },
  { id: "int_4", name: "PagerDuty",            type: "pagerduty",       isEnabled: false, config: {},                                                   createdAt: d(30), updatedAt: d(0) },
];

export const ALL_MOCK: Record<string, unknown[]> = {
  site: MOCK_SITES,
  organization: MOCK_ORGS,
  user: MOCK_USERS,
  building: MOCK_BUILDINGS,
  department: MOCK_DEPARTMENTS,
  bagian: MOCK_BAGIANS,
  ruangan: MOCK_RUANGANS,
  installationPoint: MOCK_INSTALLATION_POINTS,
  gateway: MOCK_GATEWAYS,
  asset: MOCK_ASSETS,
  sensor: MOCK_SENSORS,
  telemetryReading: MOCK_TELEMETRY,
  alertRule: MOCK_ALERT_RULES,
  alert: MOCK_ALERTS,
  report: MOCK_REPORTS,
  auditLog: MOCK_AUDIT_LOGS,
  integrationConfig: MOCK_INTEGRATIONS,
};

export const RELATIONS: Record<string, Record<string, [unknown[], string, string]>> = {
  site:              { buildings: [MOCK_BUILDINGS, "siteId", "id"], gateways: [MOCK_GATEWAYS, "siteId", "id"], assets: [MOCK_ASSETS, "siteId", "id"] },
  building:          { zones: [[], "buildingId", "id"], departments: [MOCK_DEPARTMENTS, "buildingId", "id"], site: [MOCK_SITES, "id", "siteId"] },
  department:        { bagians: [MOCK_BAGIANS, "departmentId", "id"], building: [MOCK_BUILDINGS, "id", "buildingId"] },
  bagian:            { ruangans: [MOCK_RUANGANS, "bagianId", "id"], department: [MOCK_DEPARTMENTS, "id", "departmentId"] },
  ruangan:           { installationPoints: [MOCK_INSTALLATION_POINTS, "ruanganId", "id"], bagian: [MOCK_BAGIANS, "id", "bagianId"] },
  installationPoint: { ruangan: [MOCK_RUANGANS, "id", "ruanganId"] },
  gateway:           { sensors: [MOCK_SENSORS, "gatewayId", "id"], site: [MOCK_SITES, "id", "siteId"] },
  asset:             { sensors: [MOCK_SENSORS, "assetId", "id"], alerts: [MOCK_ALERTS, "assetId", "id"], site: [MOCK_SITES, "id", "siteId"], zone: [[], "id", "zoneId"] },
  sensor:            { asset: [MOCK_ASSETS, "id", "assetId"], gateway: [MOCK_GATEWAYS, "id", "gatewayId"], telemetry: [MOCK_TELEMETRY, "sensorId", "id"], alertRules: [MOCK_ALERT_RULES, "sensorId", "id"] },
  alert:             { asset: [MOCK_ASSETS, "id", "assetId"], rule: [MOCK_ALERT_RULES, "id", "ruleId"], assignee: [MOCK_USERS, "id", "assigneeId"], workOrder: [[], "alertId", "id"] },
  report:            { generator: [MOCK_USERS, "id", "generatedBy"] },
  auditLog:          { actor: [MOCK_USERS, "id", "actorId"] },
  user:              { organization: [MOCK_ORGS, "id", "organizationId"] },
  alertRule:         { sensor: [MOCK_SENSORS, "id", "sensorId"], alerts: [MOCK_ALERTS, "ruleId", "id"] },
};

export const COUNT_RELATIONS: Record<string, Record<string, unknown[]>> = {
  site:       { buildings: MOCK_BUILDINGS, assets: MOCK_ASSETS, gateways: MOCK_GATEWAYS },
  building:   { zones: [], departments: MOCK_DEPARTMENTS },
  department: { bagians: MOCK_BAGIANS },
  bagian:     { ruangans: MOCK_RUANGANS },
  ruangan:    { installationPoints: MOCK_INSTALLATION_POINTS },
  asset:      { sensors: MOCK_SENSORS, alerts: MOCK_ALERTS },
  gateway:    { sensors: MOCK_SENSORS },
  sensor:     { telemetry: MOCK_TELEMETRY, alertRules: MOCK_ALERT_RULES, calibrationRecords: [] },
  alert:      { workOrder: [] },
  alertRule:  { alerts: MOCK_ALERTS },
};
