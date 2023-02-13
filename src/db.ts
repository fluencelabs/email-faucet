import { Level } from "level";

//TODO: singleton pattern
const db = new Level<string, number>("./users.db");

async function setLastTimestampToUser(email: string, timestamp: number) {
  await db.put(email, timestamp);
}

async function getLastTimeByUser(email: string): Promise<number> {
  try {
    return Number(await db.get(email));
  } catch (err: any) {
    if (err && err.code === "LEVEL_NOT_FOUND") {
      return 0;
    }

    throw err;
  }
}

export { setLastTimestampToUser, getLastTimeByUser };
