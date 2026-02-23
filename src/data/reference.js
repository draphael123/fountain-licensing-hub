// Population in millions (for tier: HIGH ≥10, MEDIUM 3-10, LOW <3)
export const STATE_POP = {
  AL: 5.1, AK: 0.7, AZ: 7.6, AR: 3.1, CA: 39.4, CO: 6.0, CT: 3.7, DE: 1.1, DC: 0.7, FL: 23.4, GA: 11.2, HI: 1.4, ID: 2.0, IL: 12.7, IN: 6.9, IA: 3.2, KS: 3.0, KY: 4.6, LA: 4.6, ME: 1.4, MD: 6.3, MA: 7.1, MI: 10.1, MN: 5.8, MS: 2.9, MO: 6.2, MT: 1.1, NE: 2.0, NV: 3.3, NH: 1.4, NJ: 9.5, NM: 2.1, NY: 19.9, NC: 11.0, ND: 0.8, OH: 11.9, OK: 4.1, OR: 4.3, PA: 13.1, RI: 1.1, SC: 5.5, SD: 0.9, TN: 7.2, TX: 31.3, UT: 3.5, VT: 0.6, VA: 8.8, WA: 8.0, WV: 1.8, WI: 6.0, WY: 0.6,
}

export const STATE_NAMES = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California", CO: "Colorado", CT: "Connecticut", DE: "Delaware", DC: "District of Columbia", FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa", KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland", MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia", WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
}

// Nurse Licensure Compact — 41 states (NPs)
export const NLC_STATES = ["AL","AZ","AR","CO","CT","DE","FL","GA","ID","IN","IA","KS","KY","LA","ME","MD","MS","MO","MT","NE","NH","NJ","NM","NC","ND","OH","OK","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","MN","MA"]

// Interstate Medical Licensure Compact — 40 states (MDs/DOs)
export const IMLC_STATES = ["AK","AL","AZ","CO","CT","DE","GA","ID","IL","IA","KS","KY","ME","MD","MN","MS","MO","MT","NE","NV","NH","NJ","NM","ND","OH","OK","RI","SC","SD","TN","UT","VT","VA","WA","WV","WI","WY","FL","IN","LA","TX"]

export const RENEWAL_CYCLE = {
  AL: "Biennial", AK: "Biennial", AZ: "Biennial", AR: "Biennial", CA: "Biennial", CO: "Biennial", CT: "Biennial", DE: "Biennial", DC: "Biennial", FL: "Biennial", GA: "Biennial", HI: "Biennial", ID: "Biennial", IL: "Triennial", IN: "Biennial", IA: "Triennial", KS: "Biennial", KY: "Biennial", LA: "Biennial", ME: "Biennial", MD: "Biennial", MA: "Biennial", MI: "Biennial", MN: "Biennial", MS: "Biennial", MO: "Biennial", MT: "Biennial", NE: "Biennial", NV: "Biennial", NH: "Biennial", NJ: "Biennial", NM: "Biennial", NY: "Triennial", NC: "Biennial", ND: "Biennial", OH: "Biennial", OK: "Biennial", OR: "Biennial", PA: "Biennial", RI: "Biennial", SC: "Biennial", SD: "Biennial", TN: "Biennial", TX: "Biennial", UT: "Biennial", VT: "Biennial", VA: "Biennial", WA: "Annual", WV: "Biennial", WI: "Biennial", WY: "Biennial",
}

export const BOARD_INFO = {
  AL: { name: "Alabama Board of Medical Examiners", phone: "(334) 242-4116", url: "https://www.albme.org" },
  AK: { name: "Alaska State Medical Board", phone: "(907) 269-8163", url: "https://www.commerce.alaska.gov" },
  AZ: { name: "Arizona Medical Board", phone: "(602) 364-1072", url: "https://www.azmd.gov" },
  AR: { name: "Arkansas State Medical Board", phone: "(501) 296-1802", url: "https://www.armedicalboard.org" },
  CA: { name: "Medical Board of California", phone: "(916) 263-2382", url: "https://www.mbc.ca.gov" },
  CO: { name: "Colorado Medical Board", phone: "(303) 894-7690", url: "https://dpo.colorado.gov" },
  CT: { name: "Connecticut Medical Examining Board", phone: "(860) 509-7603", url: "https://portal.ct.gov" },
  DE: { name: "Delaware Board of Medical Licensure", phone: "(302) 739-4522", url: "https://dpr.delaware.gov" },
  DC: { name: "DC Board of Medicine", phone: "(202) 442-5955", url: "https://dchealth.dc.gov" },
  FL: { name: "Florida Board of Medicine", phone: "(850) 245-4131", url: "https://flboardofmedicine.gov" },
  GA: { name: "Georgia Composite Medical Board", phone: "(404) 656-3913", url: "https://medicalboard.georgia.gov" },
  HI: { name: "Hawaii Board of Medical Examiners", phone: "(808) 586-3002", url: "https://cca.hawaii.gov" },
  ID: { name: "Idaho Board of Medicine", phone: "(208) 327-7000", url: "https://bom.idaho.gov" },
  IL: { name: "Illinois Department of Financial and Professional Regulation", phone: "(217) 782-8556", url: "https://idfpr.illinois.gov" },
  IN: { name: "Indiana Medical Licensing Board", phone: "(317) 234-2060", url: "https://www.in.gov/pla" },
  IA: { name: "Iowa Board of Medicine", phone: "(515) 242-5158", url: "https://medicalboard.iowa.gov" },
  KS: { name: "Kansas Board of Healing Arts", phone: "(785) 296-7413", url: "https://ksbha.org" },
  KY: { name: "Kentucky Board of Medical Licensure", phone: "(502) 429-8046", url: "https://kbml.ky.gov" },
  LA: { name: "Louisiana State Board of Medical Examiners", phone: "(504) 568-6820", url: "https://lsbme.la.gov" },
  ME: { name: "Maine Board of Licensure in Medicine", phone: "(207) 287-3601", url: "https://www.maine.gov/md" },
  MD: { name: "Maryland Board of Physicians", phone: "(410) 764-4777", url: "https://www.mbp.state.md.us" },
  MA: { name: "Massachusetts Board of Registration in Medicine", phone: "(781) 876-8200", url: "https://www.mass.gov/orgs/board-of-registration-in-medicine" },
  MI: { name: "Michigan Board of Medicine", phone: "(517) 335-0918", url: "https://www.michigan.gov/bpl" },
  MN: { name: "Minnesota Board of Medical Practice", phone: "(612) 617-2130", url: "https://mn.gov/boards/medical-practice" },
  MS: { name: "Mississippi State Board of Medical Licensure", phone: "(601) 987-3079", url: "https://msbml.ms.gov" },
  MO: { name: "Missouri Board of Registration for the Healing Arts", phone: "(573) 751-0098", url: "https://pr.mo.gov" },
  MT: { name: "Montana Board of Medical Examiners", phone: "(406) 444-4284", url: "https://boards.bsd.dli.mt.gov" },
  NE: { name: "Nebraska Department of Health and Human Services", phone: "(402) 471-2115", url: "https://dhhs.ne.gov" },
  NV: { name: "Nevada State Board of Medical Examiners", phone: "(775) 688-2559", url: "https://medboard.nv.gov" },
  NH: { name: "New Hampshire Board of Medicine", phone: "(603) 271-1203", url: "https://www.oplc.nh.gov" },
  NJ: { name: "New Jersey State Board of Medical Examiners", phone: "(609) 826-7100", url: "https://www.njconsumeraffairs.gov" },
  NM: { name: "New Mexico Medical Board", phone: "(505) 476-7220", url: "https://www.nmmb.state.nm.us" },
  NY: { name: "New York State Education Department", phone: "(518) 474-3817", url: "https://www.op.nysed.gov" },
  NC: { name: "North Carolina Medical Board", phone: "(919) 326-1100", url: "https://www.ncmedboard.org" },
  ND: { name: "North Dakota Board of Medicine", phone: "(701) 328-6500", url: "https://www.ndbom.org" },
  OH: { name: "State Medical Board of Ohio", phone: "(614) 466-3934", url: "https://med.ohio.gov" },
  OK: { name: "Oklahoma State Board of Medical Licensure", phone: "(405) 962-1400", url: "https://www.osbmle.ok.gov" },
  OR: { name: "Oregon Medical Board", phone: "(971) 673-2700", url: "https://www.oregon.gov/omb" },
  PA: { name: "Pennsylvania State Board of Medicine", phone: "(717) 783-1400", url: "https://www.dos.pa.gov" },
  RI: { name: "Rhode Island Board of Medical Licensure", phone: "(401) 222-3855", url: "https://health.ri.gov" },
  SC: { name: "South Carolina Board of Medical Examiners", phone: "(803) 896-4500", url: "https://www.llr.sc.gov" },
  SD: { name: "South Dakota Board of Medical and Osteopathic Examiners", phone: "(605) 334-8343", url: "https://dlr.sd.gov" },
  TN: { name: "Tennessee Board of Medical Examiners", phone: "(615) 532-3202", url: "https://www.tn.gov/health" },
  TX: { name: "Texas Medical Board", phone: "(512) 305-7010", url: "https://www.tmb.state.tx.us" },
  UT: { name: "Utah Division of Professional Licensing", phone: "(801) 530-6628", url: "https://dopl.utah.gov" },
  VT: { name: "Vermont Board of Medical Practice", phone: "(802) 828-2673", url: "https://sos.vermont.gov" },
  VA: { name: "Virginia Board of Medicine", phone: "(804) 367-4600", url: "https://www.dhp.virginia.gov" },
  WA: { name: "Washington Medical Commission", phone: "(360) 236-4700", url: "https://wmc.wa.gov" },
  WV: { name: "West Virginia Board of Medicine", phone: "(304) 558-2921", url: "https://wvbom.wv.gov" },
  WI: { name: "Wisconsin Medical Examining Board", phone: "(608) 266-2811", url: "https://dsps.wi.gov" },
  WY: { name: "Wyoming Board of Medicine", phone: "(307) 778-7053", url: "https://wyo.gov/boards" },
}

export const ALL_STATES = Object.keys(STATE_NAMES).sort()

// Fountain operating status (from official list: Available vs Coming Soon)
// Available (30): states where Fountain operates
export const OPERATING_STATES = ["AZ","CA","CO","FL","ID","IL","IN","IA","ME","MD","MI","MN","MT","NE","NV","NJ","NM","NY","NC","ND","OH","OR","PA","SD","TX","UT","VT","VA","WA","WI"]
// Coming soon (21): states where Fountain does not yet operate
export const COMING_SOON_STATES = ["AL","AK","AR","CT","DE","DC","GA","HI","KS","KY","LA","MA","MS","MO","NH","OK","RI","SC","TN","WV","WY"]
export const OPERATING_STATES_SET = new Set(OPERATING_STATES)
export function isOperatingState(state) {
  return OPERATING_STATES_SET.has(state)
}

export function getTier(pop) {
  if (pop >= 10) return "HIGH"
  if (pop >= 3) return "MEDIUM"
  return "LOW"
}

export function getTierColor(tier) {
  if (tier === "HIGH") return "#f59e0b"
  if (tier === "MEDIUM") return "#60a5fa"
  return "#475569"
}

export function getTierIcon(tier) {
  if (tier === "HIGH") return "★"
  if (tier === "MEDIUM") return "◆"
  return "·"
}
