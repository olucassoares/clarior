"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ClariorMark } from "../components/ClariorMark";
import { ClarityPlan } from "../components/ClarityPlan";
import { budgetPace, countEntries } from "../lib/dashboard-view";

type IconName =
  | "home"
  | "swap"
  | "chart"
  | "settings"
  | "plus"
  | "eye"
  | "bell"
  | "search"
  | "arrow-up"
  | "arrow-down";

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, React.ReactNode> = {
    home: <><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/></>,
    swap: <><path d="M7 7h11l-3-3"/><path d="m18 17H7l3 3"/><path d="m18 7-3 3"/><path d="m7 17 3-3"/></>,
    chart: <><path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-7"/><path d="M22 20H2"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/></>,
    plus: <><path d="M12 5v14"/><path d="M5 12h14"/></>,
    eye: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    "arrow-up": <><path d="m6 15 6-6 6 6"/></>,
    "arrow-down": <><path d="m6 9 6 6 6-6"/></>,
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

type UiTransaction = { id?: string; icon: string; color: string; title: string; category: string; date: string; value: number; type: "income" | "expense" };
type DashboardData = {
  summary: { balanceCents: number; incomeCents: number; expenseCents: number; savingsCents: number; savingsRate: number };
  budget: { amountCents: number; spentCents: number; availableCents: number; usedPercentage: number };
  transactions: Array<{ id: string; description: string; amount_cents: number; type: "income" | "expense"; occurred_at: string; category_name: string; category_color: string }>;
};

const initialTransactions: UiTransaction[] = [
  { icon: "S", color: "violet", title: "Salário", category: "Receita", date: "Hoje, 08:30", value: 5200, type: "income" },
  { icon: "N", color: "red", title: "Netflix", category: "Assinaturas", date: "Hoje, 06:12", value: -39.9, type: "expense" },
  { icon: "U", color: "black", title: "Uber", category: "Transporte", date: "Ontem, 19:42", value: -28.4, type: "expense" },
  { icon: "I", color: "blue", title: "iFood", category: "Alimentação", date: "Ontem, 12:21", value: -47.8, type: "expense" },
  { icon: "P", color: "green", title: "Projeto freelance", category: "Receita extra", date: "05 ago, 14:00", value: 850, type: "income" },
];

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function ModuleView({ activeNav, transactions, summary, budget, money, onDelete, onNew }: { activeNav: string; transactions: UiTransaction[]; summary: { incomeCents:number; expenseCents:number; savingsCents:number; savingsRate:number }; budget: { usedPercentage:number }; money:(value:number)=>string; onDelete:(id:string)=>void; onNew:()=>void }) {
  if (activeNav === "Transações") return <section className="module-view"><div className="module-heading"><div><p className="eyebrow">MOVIMENTAÇÕES</p><h1>Transações</h1><p>Consulte, filtre e gerencie todas as entradas e saídas.</p></div><button className="primary-button" onClick={onNew}><Icon name="plus"/>Nova transação</button></div><div className="module-kpis"><span><small>Registros</small><strong>{transactions.length}</strong></span><span><small>Receitas</small><strong className="positive">{money(summary.incomeCents/100)}</strong></span><span><small>Despesas</small><strong className="negative">{money(summary.expenseCents/100)}</strong></span></div><article className="panel full-transactions"><div className="table-head"><span>Transação</span><span>Categoria</span><span>Data</span><span>Valor</span><span/></div>{transactions.map((item) => <div className="table-row" key={item.id || item.title}><span className="table-title"><i className={`transaction-icon ${item.color}`}>{item.icon}</i><b>{item.title}</b></span><span>{item.category}</span><span>{item.date}</span><strong className={item.type}>{item.value>0?"+":""}{money(item.value)}</strong>{item.id ? <button className="delete-button" onClick={() => onDelete(item.id!)} aria-label={`Excluir ${item.title}`}>Excluir</button> : <span/>}</div>)}</article></section>;
  if (activeNav === "Relatórios") return <section className="module-view"><div className="module-heading"><div><p className="eyebrow">ANÁLISE FINANCEIRA</p><h1>Relatórios</h1><p>Compare renda, despesas e uso do orçamento com os registros do período.</p></div><a className="export-button" href="/api/export">Exportar CSV</a></div><div className="report-summary"><article className="panel report-hero"><p>Taxa de economia</p><strong>{summary.savingsRate}%</strong><span>Você preservou {money(summary.savingsCents/100)} da renda neste mês.</span><div className="report-track"><i style={{width:`${summary.savingsRate}%`}}/></div></article><article className="panel report-card"><span className="metric-icon income"><Icon name="arrow-up"/></span><small>Total de receitas</small><strong>{money(summary.incomeCents/100)}</strong><p>Consolidado no período selecionado</p></article><article className="panel report-card"><span className="metric-icon expense"><Icon name="arrow-down"/></span><small>Total de despesas</small><strong>{money(summary.expenseCents/100)}</strong><p>{budget.usedPercentage}% do orçamento mensal</p></article></div><article className="panel insights"><div><p className="eyebrow">LEITURA DO PERÍODO</p><h2>O que os registros mostram</h2></div><ul><li><span>01</span><p><strong>{summary.savingsRate >= 20 ? "Margem positiva" : "Margem apertada"}</strong>{summary.savingsRate}% da renda permanece disponível.</p></li><li><span>02</span><p><strong>{budget.usedPercentage < 70 ? "Orçamento confortável" : "Orçamento em atenção"}</strong>{budget.usedPercentage}% do limite mensal foi utilizado.</p></li><li><span>03</span><p><strong>Histórico portátil</strong>O CSV mantém valores e datas no padrão brasileiro.</p></li></ul></article></section>;
  return <section className="module-view"><div className="module-heading"><div><p className="eyebrow">PREFERÊNCIAS</p><h1>Configurações</h1><p>Controle privacidade, moeda e notificações.</p></div></div><article className="panel settings-panel"><div><strong>Privacidade dos valores</strong><p>O botão de olho no painel oculta todos os valores financeiros.</p><span className="status-pill">Ativo</span></div><div><strong>Moeda principal</strong><p>Real brasileiro, com datas e números no padrão pt-BR.</p><span className="status-pill neutral">BRL</span></div><div><strong>Proteção de dados</strong><p>Cada consulta é isolada pelo usuário autenticado no servidor.</p><span className="status-pill">Protegido</span></div></article></section>;
}

export default function Home() {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [period, setPeriod] = useState("Este mês");
  const [activeNav, setActiveNav] = useState("Visão geral");
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [transactions, setTransactions] = useState<UiTransaction[]>(initialTransactions);
  const [summary, setSummary] = useState({ balanceCents: 684235, incomeCents: 605000, expenseCents: 278365, savingsCents: 326635, savingsRate: 54 });
  const [budget, setBudget] = useState({ amountCents: 500000, spentCents: 278365, availableCents: 221635, usedPercentage: 56 });
  const [transactionType, setTransactionType] = useState<"income" | "expense">("expense");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Alimentação");
  const [occurredAt, setOccurredAt] = useState(() => new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [syncError, setSyncError] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  async function loadDashboard() {
    setSyncError("");
    const response = await fetch("/api/dashboard", { cache: "no-store" });
    if (!response.ok) throw new Error("Não foi possível sincronizar os dados.");
    const data = await response.json() as DashboardData;
    setSummary(data.summary);
    setBudget(data.budget);
    setTransactions(data.transactions.map((item) => ({
      id: item.id,
      icon: item.description.slice(0, 1).toUpperCase(),
      color: item.category_name === "Assinaturas" ? "red" : item.category_name === "Transporte" ? "black" : item.category_name === "Alimentação" ? "blue" : item.type === "income" ? (item.category_name === "Salário" ? "violet" : "green") : "violet",
      title: item.description,
      category: item.category_name,
      date: new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(new Date(`${item.occurred_at}T12:00:00`)),
      value: (item.type === "income" ? 1 : -1) * item.amount_cents / 100,
      type: item.type,
    })));
  }

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/dashboard", { cache: "no-store" })
      .then((response) => response.ok ? response.json() as Promise<DashboardData> : Promise.reject(new Error("Falha ao sincronizar")))
      .then((data) => {
        if (cancelled) return;
        setSummary(data.summary);
        setBudget(data.budget);
        setTransactions(data.transactions.map((item) => ({
          id: item.id, icon: item.description.slice(0, 1).toUpperCase(),
          color: item.category_name === "Assinaturas" ? "red" : item.category_name === "Transporte" ? "black" : item.category_name === "Alimentação" ? "blue" : item.type === "income" ? (item.category_name === "Salário" ? "violet" : "green") : "violet",
          title: item.description, category: item.category_name,
          date: new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(new Date(`${item.occurred_at}T12:00:00`)),
          value: (item.type === "income" ? 1 : -1) * item.amount_cents / 100, type: item.type,
        })));
      }).catch(() => setSyncError("Não foi possível atualizar agora. Os últimos dados continuam disponíveis."));
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const focusSearch = (event: KeyboardEvent) => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); searchRef.current?.focus(); } };
    window.addEventListener("keydown", focusSearch);
    return () => window.removeEventListener("keydown", focusSearch);
  }, []);

  async function saveTransaction(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "content-type": "application/json", "idempotency-key": `ft-${Date.now()}-${Math.random().toString(36).slice(2)}` },
        body: JSON.stringify({ description, amount, category, type: transactionType, occurredAt }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "Falha ao salvar.");
      await loadDashboard();
      setModalOpen(false);
      setDescription(""); setAmount(""); setFormError("");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Falha ao salvar.");
    } finally { setSaving(false); }
  }

  async function deleteTransaction(id: string) {
    if (!window.confirm("Excluir esta transação? O saldo e o orçamento serão recalculados.")) return;
    const response = await fetch(`/api/transactions/${encodeURIComponent(id)}`, { method: "DELETE" });
    if (response.ok) await loadDashboard();
  }

  const filtered = useMemo(() => transactions.filter((item) => `${item.title} ${item.category}`.toLowerCase().includes(search.toLowerCase())), [search, transactions]);
  const entryCounts = countEntries(transactions);
  const money = (value: number) => balanceVisible ? currency.format(value) : "R$ ••••••";

  return (
    <main className="app-shell">
      <a className="skip-link" href="#main-content">Pular para o conteúdo</a>
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark"><ClariorMark /></span><span>Clarior</span></div>
        <nav aria-label="Menu principal">
          <p className="nav-label">MENU</p>
          {[{label:"Visão geral",icon:"home"},{label:"Transações",icon:"swap"},{label:"Relatórios",icon:"chart"}].map((item) => (
            <button key={item.label} className={`nav-item ${activeNav === item.label ? "active" : ""}`} onClick={() => setActiveNav(item.label)}>
              <Icon name={item.icon as IconName}/><span>{item.label}</span>{item.label === "Transações" && <small>{transactions.length}</small>}
            </button>
          ))}
          <p className="nav-label nav-label-spaced">SISTEMA</p>
          <button className={`nav-item ${activeNav === "Configurações" ? "active" : ""}`} onClick={() => setActiveNav("Configurações")}><Icon name="settings"/><span>Configurações</span></button>
        </nav>
        <div className="profile"><span className="avatar">LS</span><span><strong>Lucas Soares</strong><small>Plano essencial</small></span><button aria-label="Opções do perfil">•••</button></div>
      </aside>

      <section className="workspace" id="main-content">
        <header className="topbar">
          <div className="search"><Icon name="search"/><input ref={searchRef} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar transações..." aria-label="Buscar transações"/><kbd>⌘ K</kbd></div>
          <div className="top-actions"><button className="icon-button" aria-label="Notificações"><Icon name="bell"/><span className="notification-dot"/></button><button className="primary-button" onClick={() => setModalOpen(true)}><Icon name="plus"/><span>Nova transação</span></button></div>
        </header>

        <div className="content">
          {activeNav === "Visão geral" ? <>
          <section className="welcome-row">
            <div><p className="eyebrow">AGOSTO · VISÃO MENSAL</p><h1>Seu mês, sem adivinhação.</h1><p>{summary.savingsRate}% da renda permanece disponível depois dos gastos registrados.</p></div>
            <div className="period-select"><span>Período</span><select value={period} onChange={(e) => setPeriod(e.target.value)} aria-label="Período do relatório"><option>Este mês</option><option>Últimos 30 dias</option><option>Últimos 90 dias</option></select></div>
          </section>

          <div className={`data-note ${syncError ? "has-error" : ""}`} role={syncError ? "alert" : "note"}><span>{syncError || "Ambiente demonstrativo · os valores abaixo são recalculados a cada lançamento."}</span><button onClick={() => loadDashboard().catch((error: Error) => setSyncError(error.message))}>Atualizar</button></div>

          <section className="metrics-grid" aria-label="Resumo financeiro">
            <article className="metric-card balance-card"><div className="metric-top"><span>Saldo do período</span><button onClick={() => setBalanceVisible(!balanceVisible)} aria-label={balanceVisible ? "Ocultar valores" : "Mostrar valores"}><Icon name="eye"/></button></div><strong>{money(summary.balanceCents / 100)}</strong><p>Receitas menos despesas registradas</p><div className="balance-glow"/></article>
            <article className="metric-card"><div className="metric-top"><span>Receitas</span><span className="metric-icon 