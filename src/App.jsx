import { useCallback, useEffect, useRef, useState } from "react";
import { objects, places, roles, satellites, updates } from "./data.js";
import { mountRelief } from "./relief.js";

function useReducedMotion() {
  const [reduce, setReduce] = useState(() =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduce(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduce;
}

function useFinePointer() {
  const [fine, setFine] = useState(
    () =>
      window.matchMedia("(pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const pointer = window.matchMedia("(pointer: fine)");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setFine(pointer.matches && !motion.matches);
    pointer.addEventListener("change", onChange);
    motion.addEventListener("change", onChange);
    return () => {
      pointer.removeEventListener("change", onChange);
      motion.removeEventListener("change", onChange);
    };
  }, []);
  return fine;
}

function usePinProgress(ref, onProgress) {
  const saved = useRef(onProgress);
  saved.current = onProgress;
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    let raf = 0;
    let live = true;
    let watching = false;

    const measure = () => {
      const total = el.offsetHeight - window.innerHeight;
      const raw = total <= 0 ? 0 : -el.getBoundingClientRect().top / total;
      const p = Math.min(1, Math.max(0, raw));
      el.style.setProperty("--p", p.toFixed(4));
      saved.current?.(p);
    };

    const loop = () => {
      if (!live) return;
      measure();
      raf = requestAnimationFrame(loop);
    };

    const start = () => {
      if (!watching) {
        watching = true;
        raf = requestAnimationFrame(loop);
      }
    };
    const stop = () => {
      watching = false;
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) start();
        else {
          measure();
          stop();
        }
      },
      { rootMargin: "120px" },
    );
    io.observe(el);
    measure();
    return () => {
      live = false;
      stop();
      io.disconnect();
    };
  }, [ref]);
}

function scrollToProgress(el, progress, reduce) {
  const total = el.offsetHeight - window.innerHeight;
  const top = window.scrollY + el.getBoundingClientRect().top + total * progress;
  window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
}

function ReliefPhoto({ src, alt, className }) {
  const fine = useFinePointer();
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!fine || !canvasRef.current) return undefined;
    return mountRelief(canvasRef.current, src);
  }, [fine, src]);

  return (
    <div className={`relief ${className || ""}`}>
      <img src={src} alt={alt} draggable="false" />
      {fine ? <canvas ref={canvasRef} aria-hidden="true" /> : null}
    </div>
  );
}

function Mark({ className = "" }) {
  return (
    <a className={`mark ${className}`} href="#top">
      <span className="mark-name">
        <span>Stillform</span>
        <span>Assembly</span>
      </span>
      <span className="mark-note">Quiet study</span>
    </a>
  );
}

function Header({ onMenu, scrolled }) {
  return (
    <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
      <div className="header-bar">
        <Mark />
        <nav className="header-links" aria-label="Sections">
          <a href="#places">Places</a>
          <span className="header-rule" aria-hidden="true" />
          <a href="#objects">Objects</a>
        </nav>
        <div className="header-actions">
          <a className="send" href="#admission">
            Send request
          </a>
          <button className="menu-button" type="button" onClick={onMenu}>
            <span className="menu-icon" aria-hidden="true" />
            Menu
          </button>
        </div>
      </div>
    </header>
  );
}

function MenuOverlay({ open, onClose }) {
  const closeRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.activeElement;
    const timer = window.setTimeout(() => closeRef.current?.focus(), 40);
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.classList.add("menu-open");
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("keydown", onKey);
      document.body.classList.remove("menu-open");
      if (previous instanceof HTMLElement) previous.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  const go = (event) => {
    const link = event.target.closest("a");
    if (!link) return;
    event.preventDefault();
    const id = link.getAttribute("href");
    onClose();
    window.setTimeout(() => {
      document.body.classList.remove("menu-open");
      document.querySelector(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 30);
  };

  return (
    <div className="menu" role="dialog" aria-modal="true" aria-label="Navigation">
      <button className="menu-scrim" type="button" aria-label="Close menu" onClick={onClose} />
      <div className="menu-veil" aria-hidden="true" />
      <div className="menu-panel" onClick={go}>
        <button ref={closeRef} className="menu-close-pill" type="button" onClick={onClose}>
          Close
        </button>
        <button className="menu-x" type="button" onClick={onClose} aria-label="Close menu">
          <span />
          <span />
        </button>
        <div className="menu-kicker">
          <span className="menu-rings" aria-hidden="true" />
          <span>Navigation</span>
        </div>
        <nav className="menu-links">
          <a className="m-places" href="#places">
            Places
          </a>
          <a className="m-objects" href="#objects">
            Objects
          </a>
          <a className="m-origin" href="#connection">
            Origin
          </a>
          <a className="m-contact" href="#admission">
            Contact
          </a>
          <a className="m-people" href="#people">
            People
          </a>
        </nav>
      </div>
    </div>
  );
}

function Hero() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  usePinProgress(ref);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduce) return undefined;
    const onMove = (event) => {
      const rect = el.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      el.style.setProperty("--mx", x.toFixed(3));
      el.style.setProperty("--my", y.toFixed(3));
    };
    const onLeave = () => {
      el.style.setProperty("--mx", "0");
      el.style.setProperty("--my", "0");
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [reduce]);

  return (
    <section className="hero" id="top" ref={ref}>
      <div className="hero-sticky">
        <div className="hero-bg" />
        <svg className="hero-stroke" viewBox="0 0 1440 900" preserveAspectRatio="none" aria-hidden="true">
          <path d="M-60 760C240 640 420 180 760 120C1080 64 1280 250 1520 430" />
        </svg>
        <div className="arch" aria-hidden="true" />
        <p className="hero-aside hero-aside-left">
          A quiet study
          <br />
          for making
        </p>
        <p className="hero-aside hero-aside-right">
          Sites
          <br />
          unlisted
        </p>
        <h1 className="hero-title">
          <span className="line-1">Unseen</span>
          <span className="line-2">Rooms</span>
          <span className="line-3">Hold</span>
        </h1>
        <div className="stone">
          <ReliefPhoto src="/images/atrium.jpg" alt="Dark atrium held inside an irregular stone silhouette" />
        </div>
        <figure className="hero-card hero-card-left">
          <img src="/images/stair.jpg" alt="Concrete stair, labeled as a room" />
          <figcaption>R.</figcaption>
        </figure>
        <figure className="hero-card hero-card-right">
          <img src="/images/marble.jpg" alt="Marble sculpture, labeled as a piece" />
          <figcaption>P.</figcaption>
        </figure>
        <div className="hero-cta">
          <p>
            <span>Attention</span>
            <span>precedes</span>
            <span>entry /</span>
          </p>
          <a className="pill-button" href="#admission">
            Request admission
          </a>
        </div>
        <p className="hero-within" aria-hidden="true">
          Within
        </p>
      </div>
      <svg className="svg-defs" width="0" height="0" aria-hidden="true">
        <defs>
          <clipPath id="arch" clipPathUnits="objectBoundingBox">
            <path d="M 0 1 L 0 0.72 Q 0.5 -0.02 1 0.72 L 1 1 Z" />
          </clipPath>
        </defs>
      </svg>
    </section>
  );
}

function Arrow({ direction, label, onClick }) {
  return (
    <button className={`arrow arrow-${direction}`} type="button" aria-label={label} onClick={onClick}>
      <svg viewBox="0 0 50 50" aria-hidden="true">
        {direction === "prev" ? (
          <path d="M29 14 L17 25 L29 36" />
        ) : (
          <path d="M21 14 L33 25 L21 36" />
        )}
      </svg>
    </button>
  );
}

function Places() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const last = useRef(0);

  usePinProgress(ref, (p) => {
    const next = Math.min(places.length - 1, Math.floor(p * places.length * 0.999));
    if (next !== last.current) {
      last.current = next;
      setIndex(next);
    }
  });

  const go = (next) => {
    const el = ref.current;
    if (!el) return;
    const wrapped = (next + places.length) % places.length;
    const progress = (wrapped + 0.45) / places.length;
    scrollToProgress(el, progress, reduce);
  };

  const place = places[index];

  return (
    <section className="places" id="places" ref={ref}>
      <div className="places-sticky">
        <h2 className="places-title">
          <span>Not</span>
          <span>everything</span>
          <span>is posted</span>
        </h2>
        <div className="mosaic">
          {satellites.map((item) => (
            <figure key={item.pos} className={`sat sat-${item.pos}`} style={{ "--dx": item.dx, "--dy": item.dy }}>
              <img src={item.src} alt="" />
            </figure>
          ))}
          <div className="stage">
            {places.map((item, i) => (
              <figure key={item.name} className={`stage-slide ${i === index ? "is-active" : ""}`}>
                {i === index ? (
                  <ReliefPhoto src={item.image} alt={item.alt} />
                ) : (
                  <img src={item.image} alt="" />
                )}
              </figure>
            ))}
            <div className="stage-ui">
              <p className="place-name" aria-live="polite">
                {place.name}
              </p>
              <div className="stage-nav">
                <Arrow direction="prev" label="Previous room" onClick={() => go(index - 1)} />
                <Arrow direction="next" label="Next room" onClick={() => go(index + 1)} />
                <p className="counter">
                  <span>{index + 1}</span>
                  <span className="slash">/</span>
                  <span>{places.length}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PlacesAfter() {
  return (
    <section className="places-after" aria-labelledby="places-after-title">
      <div className="after-arch" aria-hidden="true" />
      <div className="after-copy">
        <h2 id="places-after-title">
          They are not
          <br />
          on a public map
        </h2>
        <p className="after-lead">Seven rooms are arranged for this preview. None of them is a real address.</p>
        <p>
          The rooms are photographs, sequenced so the page can be read as a private circuit. Access on this
          site is a demonstration. Nothing here is offered, booked, or hidden behind a list.
        </p>
        <a className="text-link" href="#admission">
          Read the admission note /
        </a>
      </div>
    </section>
  );
}

function Objects() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const last = useRef(0);

  usePinProgress(ref, (p) => {
    const next = Math.min(objects.length - 1, Math.floor(p * objects.length * 0.999));
    if (next !== last.current) {
      last.current = next;
      setIndex(next);
    }
  });

  const go = (next) => {
    const el = ref.current;
    if (!el) return;
    const wrapped = (next + objects.length) % objects.length;
    scrollToProgress(el, (wrapped + 0.45) / objects.length, reduce);
  };

  const piece = objects[index];

  return (
    <section className="objects" id="objects" ref={ref}>
      <div className="objects-sticky">
        <h2 className="objects-title">
          <span>Origin</span>
          <span>pieces</span>
        </h2>
        <div className="objects-grid">
          <p className="obj-copy obj-a">These pieces are formed with the rooms, not shipped in from elsewhere.</p>
          <p className="obj-copy obj-b">Each one starts on site, then leaves. The room does not travel with it.</p>
          <p className="obj-copy obj-c">{piece.note}</p>
          <a className="text-link obj-link" href="#connection">
            See the connection /
          </a>
          <figure className="object-frame">
            <img src={piece.image} alt={piece.alt} />
            <figcaption>
              <span>
                ({piece.index}) {piece.name}
              </span>
              <span className="object-controls">
                <Arrow direction="prev" label="Previous piece" onClick={() => go(index - 1)} />
                <Arrow direction="next" label="Next piece" onClick={() => go(index + 1)} />
                <span className="counter compact">
                  <span>{index + 1}</span>
                  <span className="slash">/</span>
                  <span>{objects.length}</span>
                </span>
              </span>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}

function Connection() {
  return (
    <section className="connection" id="connection">
      <div className="connection-media">
        <img src="/images/marble.jpg" alt="Marble sculpture shown as a piece still tied to its source" />
        <p className="connection-kicker">The piece, shown where it began</p>
      </div>
      <div className="connection-copy">
        <h2>Connection</h2>
        <p className="connection-lead">A room and a piece are one sequence until the piece is carried out.</p>
        <p>
          After that, the piece keeps a trace of where it was made and stops standing in for the room. This
          page pairs them only so the order can be read. It is not a catalogue and not a sale.
        </p>
      </div>
    </section>
  );
}

function Updates() {
  return (
    <section className="updates" id="updates">
      <div className="updates-head">
        <h2>Updates</h2>
        <p>Notes for the preview. Not a record of work in progress.</p>
      </div>
      <ol className="update-list">
        {updates.map((item, i) => (
          <li key={item.title} className={`update update-${i + 1}`}>
            <figure>
              <img src={item.image} alt={item.alt} />
            </figure>
            <p className="kicker">{item.kicker}</p>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function People() {
  return (
    <section className="people" id="people">
      <h2>
        <span>Formed</span>
        <span>with care,</span>
        <span>not with a roster</span>
      </h2>
      <div className="people-stage">
        <figure className="window window-left">
          <img src="/images/tower.jpg" alt="Glass tower used as a side window in the people section" />
        </figure>
        <div className="people-arch">
          <img src="/images/stair.jpg" alt="Concrete stair framed by an arch" />
        </div>
        <figure className="window window-right">
          <img src="/images/balconies.jpg" alt="Balcony facade used as a side window" />
        </figure>
      </div>
      <p className="people-lead">
        The rooms and pieces are shaped as a small collaboration. No names, portraits, or quotes are invented
        here.
      </p>
      <ul className="roles">
        {roles.map((role) => (
          <li key={role.title}>
            <h3>{role.title}</h3>
            <p>{role.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Admission() {
  const [status, setStatus] = useState("");
  const [errors, setErrors] = useState({});

  const onSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const next = {};
    if (!String(data.get("name") || "").trim()) next.name = "Add a name to try the preview.";
    const email = String(data.get("email") || "").trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Add an email shape to try the preview.";
    if (!data.get("consent")) next.consent = "Confirm that you know this form is not sent.";
    setErrors(next);
    if (Object.keys(next).length) {
      setStatus("");
      return;
    }
    setStatus("This preview does not send or store the form. Nothing left this page.");
    event.currentTarget.reset();
  };

  return (
    <section className="admission" id="admission">
      <div className="admission-intro">
        <h2>Admission</h2>
        <p>
          A sample note only. Submitting shows a confirmation on this page and does not contact anyone.
        </p>
      </div>
      <form onSubmit={onSubmit} noValidate>
        <div className={`field ${errors.name ? "has-error" : ""}`}>
          <label htmlFor="name">Full name</label>
          <input id="name" name="name" type="text" autoComplete="name" placeholder="e.g. A. Marin" />
          {errors.name ? <p className="field-error">{errors.name}</p> : null}
        </div>
        <div className={`field ${errors.email ? "has-error" : ""}`}>
          <label htmlFor="email">Email address</label>
          <input id="email" name="email" type="email" autoComplete="email" placeholder="e.g. a.marin@example.com" />
          {errors.email ? <p className="field-error">{errors.email}</p> : null}
        </div>
        <div className="field">
          <label htmlFor="country">Country</label>
          <input id="country" name="country" type="text" autoComplete="country-name" placeholder="Optional" />
        </div>
        <div className="field">
          <label htmlFor="city">City</label>
          <input id="city" name="city" type="text" autoComplete="address-level2" placeholder="Optional" />
        </div>
        <div className="field field-area">
          <label htmlFor="context">Context for the note</label>
          <textarea id="context" name="context" rows={4} placeholder="A sentence is enough. This stays in the browser." />
        </div>
        <label className={`consent ${errors.consent ? "has-error" : ""}`}>
          <input type="checkbox" name="consent" />
          <span>I understand this admission note is a preview and is not reviewed.</span>
        </label>
        {errors.consent ? <p className="field-error consent-error">{errors.consent}</p> : null}
        <button className="pill-button dark" type="submit">
          Submit note
        </button>
        {status ? (
          <p className="form-status" role="status">
            {status}
          </p>
        ) : null}
      </form>
    </section>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div>
        <p className="footer-brand">Stillform Assembly</p>
        <p>An independent design preview. Not a practice, a membership, or a listing of real rooms.</p>
      </div>
      <nav aria-label="Footer">
        <a href="#places">Places</a>
        <a href="#objects">Objects</a>
        <a href="#connection">Connection</a>
        <a href="#updates">Updates</a>
        <a href="#people">People</a>
        <a href="#admission">Admission</a>
      </nav>
      <p className="footer-meta">
        Photography via Pexels, including the brutalist stair, concrete atrium, and marble sculpture named in
        the project notes. Type is Cormorant Garamond and Manrope, both SIL Open Font License.
        <span> © {new Date().getFullYear()} Preview only.</span>
      </p>
    </footer>
  );
}

export default function App() {
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const closeMenu = useCallback(() => setMenu(false), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 28);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <a className="skip" href="#places">
        Skip to places
      </a>
      <Header scrolled={scrolled} onMenu={() => setMenu(true)} />
      <MenuOverlay open={menu} onClose={closeMenu} />
      <main>
        <Hero />
        <Places />
        <PlacesAfter />
        <Objects />
        <Connection />
        <Updates />
        <People />
        <Admission />
      </main>
      <Footer />
    </>
  );
}
