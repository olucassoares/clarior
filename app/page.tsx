"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { ClariorMark } from "../components/ClariorMark";

type Transaction = { id: string; description: string; amount_cents: number; type: "income" | "expense"; occurred_at: string; category_name: string };
type Dashboard = {
  summary: { balanceCents: number; incomeCents: number; expenseCents: number; savingsCents: number; savingsRate: number };
  budget: { amountCents: number; spentCents: number; availableCents: number; usedPercentage: number };
  transactions: Transaction[];
  categories: Array<{ name: string; amount_cents: number }>;
};

const fallback: Dashboard = {
  summary: { balanceCents: 326635, incomeCents: 605000, expenseCents: 278365, savingsCents: 326635, savingsRate: 54 },
  budget: { amountCents: 500000, spentCents: 278365, availableCents: 221635, usedPercentage: 56 },
  transactions: [], categories: [],
};
const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function Icon({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    home: <><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/></>,
    swap: <><path d="M7 7h12l-3-3"/><path d="M17 17H5l3 3"/></>,
    chart: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M19 5l-2 2M7 17l-2 2"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    plus: <path d="M12 5v14M5 12h14"/>, eye: <><path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/></>,
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

export default function Home() {
  const [data, setData] = useState(fallback);
  const [active, setActive] = useState("Visão geral");
  const [search, setSearch] = useState("");
  const [visible, setVisible] = useState(true);
  const [modal, setModal] = useState(false);
  const [notice, setNotice] = useState("Carregando seus lançamentos...");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  async function load() {
    const response = await fetch("/api/dashboard", { cache: "no-store" });
    if (!response.ok) throw new Error("Não foi possível sincronizar os dados.");
    setData(await response.json() as Dashboard);
    setNotice("Ambiente demonstrativo · valores recalculados a cada lançamento.");
  }
  useEffect(() => {
    fetch("/api/dashboard", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Não foi possível sincronizar os dados.");
        return response.json() as Promise<Dashboard>;
      })
      .then((dashboard) => {
        setData(dashboard);
        setNotice("Ambiente demonstrativo · valores recalculados a cada lançamento.");
      })
      .catch(() => setNotice("Os últimos dados continuam disponíveis."));
  }, []);
  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); searchRef.current?.focus(); } };
    window.addEventListener("keydown", shortcut); return () => window.removeEventListener("keydown", shortcut);
  }, []);

  const money = (cents: number) => visible ? currency.format(cents / 100) : "R$ ••••••";
  const transactions = useMemo(() => data.transactions.filter((item) => `${item.description} ${item.category_name}`.toLowerCase().includes(search.toLowerCase())), [data.transactions, search]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setFormError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/transactions", { method: "POST", headers: { "content-type": "application/json", "idempotency-key": crypto.randomUUID() }, body: JSON.stringify(Object.fromEntries(form)) });
    const result = await response.json() as { error?: string };
    if (!response.ok) { setFormError(result.error || "Não foi possível salvar."); setSaving(false); return; }
    await load(); setModal(false); setSaving(false);
  }
  async function remove(id: string) {
    if (!window.confirm("Excluir esta transação?")) return;
    const response = await fetch(`/api/transactions/${encodeURIComponent(id)}`, { method: "DELETE" });
    if (response.ok) await load();
  }

  const nav = [{ label: "Visão geral", icon: "home" }, { label: "Transações", icon: "swap" }, { label: "Relatórios", icon: "chart" }, { label: "Configurações", icon: "settings" }];
  return <main className="app-shell">
    <aside className="sidebar">
      <div className="brand"><span><ClariorMark/></span>Clarior</div>
      <nav>{nav.map((item) => <button key={item.label} className={active === item.label ? "active" : ""} onClick={() => setActive(item.label)}><Icon name={item.icon}/>{item.label}{item.label === "Transações" && <small>{data.transactions.length}</small>}</button>)}</nav>
      <div className="profile"><b>LS</b><span><strong>Lucas Soares</strong><small>Ambiente demonstrativo</small></span></div>
    </aside>
    <section className="workspace">
      <header className="topbar"><label><Icon name="search"/><input ref={searchRef} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar transações..."/><kbd>⌘ K</kbd></label><button className="primary" onClick={() => setModal(true)}><Icon name="plus"/>Nova transação</button></header>
      <div className="content">
        {active === "Visão geral" && <>
          <section className="welcome"><div><p>AGOSTO · VISÃO MENSAL</p><h1>Seu mês, sem adivinhação.</h1><span>{data.summary.savingsRate}% da renda permanece disponível depois dos gastos.</span></div><select aria-label="Período"><option>Este mês</option><option>Últimos 30 dias</option><option>Últimos 90 dias</option></select></section>
          <div className="notice"><span>{notice}</span><button onClick={() => load()}>Atualizar</button></div>
          <section className="metrics">
            <article className="balance"><header>Saldo do período <button onClick={() => setVisible(!visible)}><Icon name="eye"/></button></header><strong>{money(data.summary.balanceCents)}</strong><p>Receitas menos despesas registradas</p></article>
            <article><header>Receitas <i className="green">↑</i></header><strong>{money(data.summary.incomeCents)}</strong><p>{data.transactions.filter((x) => x.type === "income").length} entradas registradas</p></article>
            <article><header>Despesas <i className="red">↓</i></header><strong>{money(data.summary.expenseCents)}</strong><p>{data.transactions.filter((x) => x.type === "expense").length} saídas registradas</p></article>
            <article><header>Economia do mês <i className="purple">◎</i></header><strong>{money(data.summary.savingsCents)}</strong><p>{data.summary.savingsRate}% da sua receita</p></article>
          </section>
          <section className="plan"><div><small>DISPONÍVEL NO ORÇAMENTO</small><strong>{money(data.budget.availableCents)}</strong><span>até o limite mensal definido</span></div><div><small>LEITURA DO MÊS</small><strong>{data.budget.usedPercentage < 70 ? "Ritmo confortável" : "Acompanhe de perto"}</strong><span>{data.budget.usedPercentage}% do orçamento utilizado</span></div><button onClick={() => setActive("Transações")}>Revisar lançamentos →</button></section>
          <section className="dashboard-grid"><article className="panel chart-panel"><header><div><h2>Fluxo de caixa</h2><p>Receitas e despesas nos últimos 6 meses</p></div></header><div className="chart"><svg viewBox="0 0 600 200" preserveAspectRatio="none"><defs><linearGradient id="fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#166B56" stopOpacity=".25"/><stop offset="1" stopColor="#166B56" stopOpacity="0"/></linearGradient></defs><path className="area" d="M0 145 C80 130 100 105 180 115 S270 78 340 88 S430 35 490 55 S560 38 600 25 L600 200 L0 200Z"/><path className="line" d="M0 145 C80 130 100 105 180 115 S270 78 340 88 S430 35 490 55 S560 38 600 25"/></svg></div></article><article className="panel budget"><header><h2>Orçamento mensal</h2><p>Agosto de 2026</p></header><div className="ring" style={{ "--value": `${data.budget.usedPercentage * 3.6}deg` } as React.CSSProperties}><div><strong>{data.budget.usedPercentage}%</strong><span>utilizado</span></div></div><p>Seu ritmo está dentro do planejado para este mês.</p></article></section>
          <Transactions items={transactions.slice(0, 5)} money={money} remove={remove}/>
        </>}
        {active === "Transações" && <section><div className="section-title"><p>MOVIMENTAÇÕES</p><h1>Transações</h1><span>Consulte e gerencie entradas e saídas.</span></div><Transactions items={transactions} money={money} remove={remove}/></section>}
        {active === "Relatórios" && <section><div className="section-title"><p>ANÁLISE FINANCEIRA</p><h1>Relatórios</h1><span>Leitura consolidada do período.</span></div><div className="report-grid"><article><small>Taxa de economia</small><strong>{data.summary.savingsRate}%</strong><p>{money(data.summary.savingsCents)} preservados neste mês.</p></article><article><small>Receitas</small><strong>{money(data.summary.incomeCents)}</strong><p>Consolidado dos lançamentos.</p></article><article><small>Uso do orçamento</small><strong>{data.budget.usedPercentage}%</strong><p>{money(data.budget.availableCents)} disponíveis.</p></article></div><a className="export" href="/api/export">Exportar CSV</a></section>}
        {active === "Configurações" && <section><div className="section-title"><p>SISTEMA</p><h1>Configurações</h1><span>Preferências do ambiente demonstrativo.</span></div><article className="settings"><div><strong>Moeda principal</strong><span>Real brasileiro (BRL)</span></div><div><strong>Persistência</strong><span>PostgreSQL conectado</span></div><div><strong>Privacidade</strong><span>Valores podem ser ocultados</span></div></article></section>}
      </div>
    </section>
    {modal && <div className="modal" role="dialog" aria-modal="true"><form onSubmit={save}><header><div><p>NOVO LANÇAMENTO</p><h2>Adicionar transação</h2></div><button type="button" onClick={() => setModal(false)}>×</button></header><label>Descrição<input name="description" required minLength={2}/></label><div className="form-grid"><label>Valor<input name="amount" required inputMode="decimal" placeholder="0,00"/></label><label>Tipo<select name="type"><option value="expense">Despesa</option><option value="income">Receita</option></select></label></div><div className="form-grid"><label>Categoria<select name="category"><option>Alimentação</option><option>Transporte</option><option>Assinaturas</option><option>Salário</option><option>Receita extra</option></select></label><label>Data<input name="occurredAt" type="date" defaultValue={new Date().toISOString().slice(0,10)}/></label></div>{formError && <p className="form-error">{formError}</p>}<footer><button type="button" onClick={() => setModal(false)}>Cancelar</button><button className="primary" disabled={saving}>{saving ? "Salvando..." : "Salvar transação"}</button></footer></form></div>}
  </main>;
}

function Transactions({ items, money, remove }: { items: Transaction[]; money: (cents: number) => string; remove: (id: string) => void }) {
  return <article className="panel transactions"><header><div><h2>Transações recentes</h2><p>Movimentações salvas no banco</p></div></header>{items.length ? items.map((item) => <div className="transaction" key={item.id}><i>{item.description.slice(0,1).toUpperCase()}</i><span><strong>{item.description}</strong><small>{item.category_name}</small></span><time>{new Date(`${item.occurred_at}T12:00:00`).toLocaleDateString("pt-BR", { day:"2-digit", month:"short" })}</time><b className={item.type}>{item.type === "income" ? "+" : "-"}{money(item.amount_cents)}</b><button onClick={() => remove(item.id)}>Excluir</button></div>) : <p className="empty">Nenhuma transação encontrada.</p>}</article>;
}
