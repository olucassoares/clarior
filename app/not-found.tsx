import Link from "next/link";

export default function NotFound() {
  return <main className="route-state"><div><h1>Página não encontrada</h1><p>Este endereço não pertence ao ambiente do Clarior.</p><Link href="/">Voltar ao painel</Link></div></main>;
}
