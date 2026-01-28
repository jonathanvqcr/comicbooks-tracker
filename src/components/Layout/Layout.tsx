import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import "./Layout.css";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="layout">
      <header className="header">
        <Link to="/" className="header-title">
          Comic Books Tracker
        </Link>
      </header>
      <main className="main">{children}</main>
    </div>
  );
}
