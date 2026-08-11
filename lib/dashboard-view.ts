type Entry = { type: "income" | "expense" };

export function countEntries(entries: Entry[]) {
  return entries.reduce((counts, entry) => {
    counts[entry.type] += 1;
    return counts;
  }, { income: 0, expense: 0 });
}

export function budgetPace(usedPercentage: number) {
  if (usedPercentage < 70) return "Ritmo confortável";
  if (usedPercentage < 90) return "Acompanhe de perto";
  return "Limite próximo";
}
