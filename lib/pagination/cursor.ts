export function encodeCursor(offset: number): string {
  return Buffer.from(JSON.stringify({ offset })).toString("base64");
}

export function decodeCursor(token: string): number {
  if (!token) return 0;
  try {
    const { offset } = JSON.parse(Buffer.from(token, "base64").toString("utf8"));
    if (typeof offset !== "number" || offset < 0) throw new Error("invalid offset");
    return offset;
  } catch {
    throw new Error(`invalid page_token: ${token}`);
  }
}
