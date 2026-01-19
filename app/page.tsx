import Link from 'next/link'
import './landing.css'

export default function LandingPage() {
  return (
    <div className="landing">
      <nav className="nav">
        <div className="nav-brand">Invoice Chaser</div>
        <div className="nav-links">
          <Link href="/login">Login</Link>
          <Link href="/signup" className="btn-primary">Sign Up</Link>
        </div>
      </nav>

      <section className="hero">
        <h1>Stop Chasing Invoices. Start Getting Paid.</h1>
        <p className="subheadline">
          Automatically send polite invoice reminders until payment is received.
          No awkward conversations. No time wasted.
        </p>
        <Link href="/signup" className="btn-primary btn-large">
          Get Started Free
        </Link>
      </section>

      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Create Your Invoice</h3>
            <p>Add client details, amount, and due date in seconds.</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>We Send Reminders</h3>
            <p>Automated emails go out before, on, and after the due date.</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Get Paid Faster</h3>
            <p>No more awkward follow-ups. Just mark as paid when done.</p>
          </div>
        </div>
      </section>

      <section className="pricing">
        <h2>Simple Pricing</h2>
        <div className="plan-card">
          <div className="plan-name">Invoice Chaser Pro</div>
          <div className="plan-price">£9<span>/month</span></div>
          <ul className="plan-features">
            <li>Unlimited invoices</li>
            <li>Automated reminders</li>
            <li>Custom email templates</li>
            <li>Reminder history tracking</li>
          </ul>
          <Link href="/signup" className="btn-primary btn-large">
            Start Free Trial
          </Link>
        </div>
      </section>

      <footer className="footer">
        <p>&copy; 2024 Invoice Chaser. All rights reserved.</p>
      </footer>
    </div>
  )
}
