/**
 * Field reference for the diseases in the backend registry: who gets it, how it spreads, what
 * to look for, and the standard containment and vaccination response. Summarised from WOAH and
 * DAHD guidance for quick reference; officers follow the latest departmental SOP.
 */
export interface DiseaseProtocolReference {
  species: string;
  transmission: string;
  signs: string[];
  containment: string[];
  vaccination: string[];
}

export const DISEASE_PROTOCOLS: Record<string, DiseaseProtocolReference> = {
  'Lumpy Skin Disease': {
    species: 'Cattle, water buffalo',
    transmission: 'Biting insects (mosquitoes, stable flies, ticks); less often direct contact or shared feed and water',
    signs: [
      'Fever, then firm skin nodules (2–5 cm) over the body',
      'Swollen lymph nodes in front of the shoulder and flank',
      'Sharp drop in milk yield; watery eyes and nasal discharge',
      'Swelling of the legs and brisket in severe cases',
    ],
    containment: [
      'Isolate sick animals and treat wounds to prevent fly strike',
      'Vector control: insecticide on animals and sheds, remove standing water',
      'Stop cattle movement and markets inside the outbreak zone',
      'Disinfect sheds, vehicles and equipment',
    ],
    vaccination: [
      'Ring-vaccinate healthy cattle and buffalo around the outbreak (goat pox or LSD vaccine)',
      'Do not vaccinate animals already showing signs',
    ],
  },
  'Foot and Mouth Disease': {
    species: 'Cattle, buffalo, sheep, goats, pigs (all cloven-hoofed animals)',
    transmission: 'Direct contact, airborne spread, contaminated feed, milk, vehicles, people and equipment',
    signs: [
      'High fever and heavy drooling',
      'Blisters and raw sores in the mouth, on the tongue, feet and teats',
      'Lameness and reluctance to eat',
      'Sudden deaths in young calves',
    ],
    containment: [
      'Isolate sick animals; stop animal movement and cattle markets in the zone',
      'Disinfect with 4% washing soda (sodium carbonate) solution',
      'Soft feed and wound care; foot baths at farm entrances',
      'Vets and workers change clothes and disinfect boots between farms',
    ],
    vaccination: [
      'NADCP: vaccinate cattle and buffalo every 6 months',
      'Ring-vaccinate susceptible animals around the outbreak',
    ],
  },
  Brucellosis: {
    species: 'Cattle, buffalo, goats, sheep, pigs; infects people',
    transmission: 'Aborted foetus, placenta and uterine discharge; raw milk; mating',
    signs: [
      'Abortion in late pregnancy',
      'Retained placenta and repeat breeding',
      'Swollen testicles in bulls; swollen knee joints (hygroma)',
    ],
    containment: [
      'Isolate animals that abort; wear gloves when handling birth material',
      'Bury the foetus and placenta deep with lime; disinfect the area',
      'Boil milk before use; test the herd and separate positive animals',
    ],
    vaccination: ['NADCP: one-time S19 vaccination of female calves aged 4–8 months'],
  },
  Rabies: {
    species: 'All mammals (dogs are the main source); fatal in people',
    transmission: 'Bite or saliva of a rabid animal',
    signs: [
      'Behaviour change: aggression or unusual dullness',
      'Excess drooling and difficulty swallowing; bellowing',
      'Paralysis, then death within about 10 days of signs',
    ],
    containment: [
      'Confine the suspect animal; never examine its mouth bare-handed',
      'People bitten or exposed: wash the wound with soap and water for 15 minutes and get post-exposure vaccination the same day',
      'Do not use milk or meat from the suspect animal',
    ],
    vaccination: [
      'Vaccinate dogs every year',
      'Post-bite vaccination course for livestock bitten by a suspect animal',
    ],
  },
  Anthrax: {
    species: 'Cattle, buffalo, sheep, goats; infects people',
    transmission: 'Spores in soil swallowed while grazing, often after floods or drought; people via carcasses and meat',
    signs: [
      'Sudden death, often without earlier signs',
      'Dark, non-clotting blood from the nose, mouth and anus',
      'Rapid bloating; carcass does not stiffen',
    ],
    containment: [
      'Do NOT open the carcass (no post-mortem)',
      'Burn or bury the carcass deep with lime where it lies',
      'Disinfect with 10% formalin; keep animals off the contaminated pasture',
      'Report immediately to the district office',
    ],
    vaccination: ['Annual anthrax spore vaccine in affected areas before the risk season; ring-vaccinate around the outbreak'],
  },
  'Avian Influenza': {
    species: 'Poultry and wild birds; infects people',
    transmission: 'Infected birds and droppings, contaminated feed, equipment and vehicles; migratory birds',
    signs: [
      'Sudden high death rate in the flock',
      'Sharp fall in egg production',
      'Swollen, bluish head, comb and wattles; breathing difficulty',
    ],
    containment: [
      'Follow the national action plan: culling in the infected zone (1 km), surveillance up to 10 km',
      'Stop movement of birds, eggs and manure',
      'Disinfect premises; workers wear full protective equipment',
    ],
    vaccination: ['India does not vaccinate poultry against highly pathogenic bird flu; control is by culling and biosecurity'],
  },
  'African Swine Fever': {
    species: 'Domestic pigs and wild boar',
    transmission: 'Direct contact, pork products and swill, contaminated vehicles and clothing, ticks',
    signs: [
      'High fever and loss of appetite',
      'Red to purple skin on the ears, belly and legs',
      'Bleeding and very high death rate',
    ],
    containment: [
      'Stop pig movement; culling in the infected zone under the national action plan',
      'No swill feeding; strict farm biosecurity',
      'Disinfect premises and vehicles',
    ],
    vaccination: ['No approved vaccine in India; prevention is by biosecurity'],
  },
  'Bovine Mastitis': {
    species: 'Dairy cattle, buffalo, goats',
    transmission: 'Bacteria entering the teat: poor milking hygiene, dirty bedding, milkers’ hands',
    signs: [
      'Hot, swollen, painful udder quarter',
      'Clots, flakes, watery or bloody milk',
      'Drop in milk yield; hidden (subclinical) cases show on the CMT test',
    ],
    containment: [
      'Milk affected animals last and discard their milk',
      'Dip teats after milking; keep bedding clean and dry',
      'Treat under a vet’s advice; dry-cow therapy at drying off',
    ],
    vaccination: ['No routine vaccine; prevention is milking hygiene'],
  },
};

/** Reference for a registry disease name (exact, then by containment of the key). */
export function protocolReference(diseaseName: string): DiseaseProtocolReference | undefined {
  if (DISEASE_PROTOCOLS[diseaseName]) return DISEASE_PROTOCOLS[diseaseName];
  const key = Object.keys(DISEASE_PROTOCOLS).find((k) => diseaseName.toLowerCase().includes(k.toLowerCase()));
  return key ? DISEASE_PROTOCOLS[key] : undefined;
}
