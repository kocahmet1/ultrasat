import React from 'react';
import { Link } from 'react-router-dom';
import './SiteFooter.css';

/**
 * SiteFooter — the global marketing/legal footer (Overhaul P0-B).
 * Rendered by LandingPageV3 (inside its design canvas) and by
 * LandingPageLayout for every other public page, so the legal pages are
 * finally reachable from somewhere. Dark ink surface, V3 tokens only.
 *
 * "Pricing" is an anchor on the landing page, so it stays a plain <a>:
 * on "/" the browser handles the hash natively, from any other page it
 * loads "/" and scrolls to #pricing.
 */

const COLUMNS = [
  {
    title: 'Product',
    links: [
      { label: 'Pricing', href: '/#pricing' },
      { label: 'SAT Guide', to: '/sat-guide' },
      { label: 'Score Calculator', to: '/score-calculator' },
      { label: 'Blog', to: '/blog' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', to: '/about' },
      { label: 'Contact', to: '/contact' },
      { label: 'Careers', to: '/careers' },
      { label: 'Press', to: '/press' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', to: '/privacy' },
      { label: 'Terms of Service', to: '/terms' },
      { label: 'Cookie Policy', to: '/cookies' },
      { label: 'Accessibility', to: '/accessibility' },
    ],
  },
];

const SiteFooter = () => (
  <footer className="site-footer">
    <div className="site-footer-shell">
      <div className="site-footer-grid">
        <div className="site-footer-brand">
          <Link to="/" className="site-footer-wordmark" aria-label="UltraSAT home">
            <span className="site-footer-mark" aria-hidden="true"></span>
            <span>UltraSAT</span>
          </Link>
          <p className="site-footer-tagline">
            Real past Digital SAT exams, scored into a 29-skill map.
          </p>
        </div>

        {COLUMNS.map((column) => (
          <nav className="site-footer-col" key={column.title} aria-label={column.title}>
            <h3 className="site-footer-heading">{column.title}</h3>
            <ul>
              {column.links.map((link) => (
                <li key={link.label}>
                  {link.to ? (
                    <Link to={link.to}>{link.label}</Link>
                  ) : (
                    <a href={link.href}>{link.label}</a>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="site-footer-bottom">
        <p className="site-footer-copyright">&copy; 2026 UltraSAT. All rights reserved.</p>
        <p className="site-footer-trademark">SAT is a trademark of the College Board</p>
      </div>
    </div>
  </footer>
);

export default SiteFooter;
