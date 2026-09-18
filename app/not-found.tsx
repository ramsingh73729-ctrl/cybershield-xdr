import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export default function NotFound() {
  return <main className="public-not-found"><div className="public-not-found-card"><span className="public-logo-mark"><Shield size={20} /></span><span className="public-kicker">CyberShield</span><h1>We could not find that page.</h1><p>The link may be out of date, or the page may have moved. Return to CyberShield and continue with an authorized security check.</p><Link className="primary-button" href="/"><ArrowLeft size={16} /> Back to CyberShield</Link></div></main>;
}
