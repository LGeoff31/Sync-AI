export type Room = {
  code: string;
  name: string;
  createdAt: number;
};

export function generateCode(length = 6): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I/O or 0/1
  let out = "";
  for (let i = 0; i < length; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

export function createRoom(name: string): Room {
  // Generate a code; uniqueness is enforced at the database layer.
  const code = generateCode();
  return { code, name, createdAt: Date.now() };
}
