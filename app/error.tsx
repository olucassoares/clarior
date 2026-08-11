"use client";
import { ClariorMark } from "../components/ClariorMark";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="error-screen"><section><span className="brand-mark"><ClariorMark /></span><p className="eyebrow">CLARIOR</p><h1>Não foi possível carregar esta área.</h1><p>Os últimos registros continuam preservados. Tente novamente para atualizar a tela.</p><button className="primary-button" onClick={reset}>Tentar novamente</button></section></main>;
}
