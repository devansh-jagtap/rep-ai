const balanceByUser = new Map<string, number>([["demo-user", 20]]);
const userLocks = new Map<string, Promise<unknown>>();

export async function consumeCredits(
  userId: string,
  amount: number
): Promise<boolean> {
  const run = async (): Promise<boolean> => {
    const current = balanceByUser.get(userId) ?? 0;
    if (amount <= 0 || current < amount) {
      return false;
    }
    balanceByUser.set(userId, current - amount);
    return true;
  };

  const prev = userLocks.get(userId) ?? Promise.resolve();
  const result = prev.then(() => run());
  userLocks.set(userId, result);
  return result;
}
