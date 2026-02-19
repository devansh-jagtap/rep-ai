const balanceByUser = new Map<string, number>([["demo-user", 20]]);

export function consumeCredits(userId: string, amount: number): boolean {
  const current = balanceByUser.get(userId) ?? 0;
  if (amount <= 0 || current < amount) {
    return false;
  }

  balanceByUser.set(userId, current - amount);
  return true;
}
