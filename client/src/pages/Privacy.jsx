import { Link } from 'react-router-dom';
import Logo from '../components/ui/Logo';

export default function Privacy() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      <nav className="flex items-center justify-between px-6 py-4 max-w-4xl mx-auto w-full">
        <Link to="/" className="no-underline">
          <Logo height={28} />
        </Link>
      </nav>
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-6" style={{ color: 'var(--text)' }}>
          Privacy Policy
        </h1>
        <div className="space-y-6" style={{ color: 'var(--muted)' }}>
          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--text)' }}>
              Information We Collect
            </h2>
            <p>FORGE collects information you provide when taking our career profiler quiz.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--text)' }}>
              Contact
            </h2>
            <p>If you have questions about this Privacy Policy, please contact us.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
