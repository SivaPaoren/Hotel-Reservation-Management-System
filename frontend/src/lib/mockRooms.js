export const mockRooms = [
  { id: 1, number: "101", type: "single", price: 1200, amenities: ["Wi-Fi", "AC"], desc: "Cozy single for solo travelers." },
  { id: 2, number: "202", type: "double", price: 1800, amenities: ["Wi-Fi", "AC", "TV"], desc: "Comfy double room for two." },
  { id: 3, number: "303", type: "suite",  price: 3200, amenities: ["Wi-Fi", "AC", "TV", "Mini-bar"], desc: "Spacious suite with lounge." },
];

export function getRoom(id) {
  return mockRooms.find(r => r.id === Number(id)) || null;
}
