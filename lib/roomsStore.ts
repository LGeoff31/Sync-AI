export type Room = {
  code: string;
  name: string;
  createdAt: number;
};

type RoomsIndex = Record<string, Room>;

function getGlobalStore(): RoomsIndex {
  const g = globalThis as unknown as { __ROOMS__?: RoomsIndex };
  if (!g.__ROOMS__) g.__ROOMS__ = {};
  return g.__ROOMS__;
}

export function generateCode(length = 6): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I/O or 0/1
  let out = "";
  for (let i = 0; i < length; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

export function createRoom(name: string): Room {
  const store = getGlobalStore();
  let code = generateCode();
  // ensure uniqueness in the current process
  while (store[code]) code = generateCode();
  const room: Room = { code, name, createdAt: Date.now() };
  store[code] = room;
  return room;
}

export function getRoom(code: string): Room | undefined {
  const store = getGlobalStore();
  console.log(store);
  return store[code.toUpperCase()];
}
