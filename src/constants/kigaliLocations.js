// Official Kigali administrative structure (Umurenge/Sector level),
// cross-verified against Rwanda Energy Group's village registry and
// Wikipedia's district pages. Akagari (Cell) and Umudugudu (Village)
// are intentionally left out for now — the only official source found
// has extraction artifacts at that level that need careful cleanup
// before it's safe to treat as authoritative. Until then, cell/village
// are free-text fields in the app.

export const KIGALI_DISTRICTS = {
  Gasabo: [
    'Bumbogo', 'Gatsata', 'Gikomero', 'Gisozi', 'Jabana', 'Jali',
    'Kacyiru', 'Kimihurura', 'Kimironko', 'Kinyinya', 'Ndera',
    'Nduba', 'Remera', 'Rusororo', 'Rutunga',
  ],
  Kicukiro: [
    'Gahanga', 'Gatenga', 'Gikondo', 'Kagarama', 'Kanombe',
    'Kicukiro', 'Kigarama', 'Masaka', 'Niboye', 'Nyarugunga',
  ],
  Nyarugenge: [
    'Gitega', 'Kanyinya', 'Kigali', 'Kimisagara', 'Mageragere',
    'Muhima', 'Nyakabanda', 'Nyamirambo', 'Nyarugenge', 'Rwezamenyo',
  ],
};

// Flat list of all 35 sectors, for a simple single dropdown
// (since the app doesn't currently track District separately).
export const KIGALI_SECTORS = Object.values(KIGALI_DISTRICTS).flat();