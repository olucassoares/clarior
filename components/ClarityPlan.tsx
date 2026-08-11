type ClarityPlanProps = {
  available: string;
  usedPercentage: number;
  pace: string;
  onReview: () => void;
};

export function ClarityPlan({ available, usedPercentage, pace, onReview }: ClarityPlanProps) {
  return (
    <section className="clarity-plan" aria-label="Próximos passos financeiros">
      <div><span>DISPONÍVEL NO ORÇAMENTO</span><strong>{available}</strong><small>até o limite mensal definido</small></div>
      <div><span>LEITURA DO MÊS</span><strong>{pace}</strong><small>{usedPercentage}% do orçamento já utilizado</small></div>
      <button onClick={onReview}>Revisar lançamentos →</button>
    </section>
  );
}
