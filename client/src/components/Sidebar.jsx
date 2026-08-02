import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Icon from "./Icon.jsx";

const Sidebar = ({ links }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const closeButtonRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      closeButtonRef.current?.focus();
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleNavigate = () => setIsOpen(false);

  return (
    <>
      <div className="xl:hidden">
        <div className="flex items-center justify-between border-b border-orange-100 bg-white/95 px-4 py-3 shadow-sm backdrop-blur">
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label="Open navigation menu"
            aria-expanded={isOpen}
            aria-controls="mobile-sidebar"
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-orange-100 bg-orange-50 text-orange-600 transition hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          >
            <span className="text-2xl leading-none">☰</span>
          </button>
          <div className="flex items-center gap-2 font-semibold text-gray-900">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
              <Icon name="shield" className="h-4 w-4" />
            </span>
            <span>College DMS</span>
          </div>
        </div>
      </div>

      {isOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm xl:hidden"
        />
      )}

      <aside
        id="mobile-sidebar"
        role="dialog"
        aria-modal={isOpen ? "true" : undefined}
        aria-label="Sidebar navigation"
        className={`fixed inset-y-0 left-0 z-50 flex w-[85vw] max-w-[280px] -translate-x-full flex-col border-r border-orange-100 bg-white shadow-2xl transition-transform duration-300 ease-in-out xl:sticky xl:top-0 xl:w-72 xl:max-w-[280px] xl:translate-x-0 xl:shadow-sm ${
          isOpen ? "translate-x-0" : ""
        }`}
      >
        <div className="flex h-full flex-col px-5 py-6">
          <div className="mb-8 flex items-start justify-between gap-3">
            <div className="inline-flex items-center gap-3 rounded-2xl bg-orange-50 px-3 py-2 font-semibold text-orange-600 shadow-sm">
              <Icon name="shield" className="h-5 w-5" />
              <span>College DMS</span>
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              aria-label="Close sidebar"
              onClick={() => setIsOpen(false)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-orange-100 bg-white text-xl text-gray-600 transition hover:bg-orange-50 xl:hidden"
            >
              ×
            </button>
          </div>

          <div className="mb-6 rounded-3xl border border-orange-100 bg-orange-50 p-4">
            <p className="text-xs uppercase tracking-[0.2em] font-semibold text-orange-700">
              Signed in as
            </p>
            <p className="mt-3 font-semibold text-gray-900">
              {user?.name || "User"}
            </p>
            <p className="text-sm text-gray-500">{user?.role || "Role"}</p>
          </div>

          <nav className="flex-1 space-y-2">
            {links.map((link) => {
              const active = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={handleNavigate}
                  className={`group flex items-center gap-3 rounded-3xl px-4 py-3 transition-all duration-200 ${
                    active
                      ? "bg-orange-600 text-white shadow-lg"
                      : "text-gray-700 hover:bg-orange-50"
                  }`}
                >
                  <span className="font-medium">{link.label}</span>
                </Link>
              );
            })}
          </nav>

          <button
            onClick={() => {
              handleNavigate();
              logout();
            }}
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-3xl border border-orange-100 bg-white px-4 py-3 text-sm font-semibold text-orange-600 transition hover:bg-orange-50"
          >
            <Icon name="logout" className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
