import { useEffect, useRef, useState } from "react";

const WORK_ITEMS = [
  { title: "Aperture", desc: "A visual identity system for a photography collective.", seed: "raz-work-1" },
  { title: "Meridian", desc: "Product design & front-end build for a fintech dashboard.", seed: "raz-work-2" },
  { title: "Northline", desc: "Editorial site and motion system for an independent label.", seed: "raz-work-3" },
  { title: "Faultline", desc: "Interactive data-story built for a climate research lab.", seed: "raz-work-4" },
];

function photoStyle(seed: string, w: number, h: number, overlay = "180deg,rgba(11,11,11,0) 40%,rgba(11,11,11,.7) 100%"): React.CSSProperties {
  return {
    backgroundImage: `linear-gradient(${overlay}), url('https://picsum.photos/seed/${seed}/${w}/${h}')`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    filter: "grayscale(1) contrast(1.05) brightness(.8)",
  };
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 14 10" fill="none" className="h-2.5 w-3.5">
      <path d="M8.6.35 13.1 4.87 8.6 9.39" stroke="currentColor" />
      <line y1="5.02" x2="13.1" y2="5.02" stroke="currentColor" />
    </svg>
  );
}

function RazWordmark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 1200 260" className={className} aria-label="RAZ">
      <text x="0" y="220" fontFamily="'Space Grotesk', sans-serif" fontWeight={700} fontSize={240} fill="currentColor">
        RAZ
      </text>
    </svg>
  );
}

function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setInView(true),
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      } ${className}`}
    >
      {children}
    </div>
  );
}

function useParallax(speed: number) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const offset = (r.top + r.height / 2 - vh / 2) * speed;
      el.style.transform = `translateY(${-offset * 0.3}px)`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [speed]);
  return ref;
}

function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mx = 0, my = 0, cx = 0, cy = 0, raf = 0;
    const move = (e: MouseEvent) => { mx = e.clientX; my = e.clientY; };
    window.addEventListener("mousemove", move);
    const loop = () => {
      cx += (mx - cx) * 0.18;
      cy += (my - cy) * 0.18;
      if (dotRef.current) dotRef.current.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%)`;
      if (labelRef.current) labelRef.current.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const bigEls = document.querySelectorAll<HTMLElement>("a, .menu-btn, .work-thumb");
    const onEnter = (el: HTMLElement) => () => {
      dotRef.current?.classList.add("!w-16", "!h-16");
      if (el.classList.contains("work-thumb") && labelRef.current) {
        labelRef.current.textContent = "view";
        labelRef.current.style.opacity = "1";
      }
    };
    const onLeave = () => {
      dotRef.current?.classList.remove("!w-16", "!h-16");
      if (labelRef.current) labelRef.current.style.opacity = "0";
    };
    const cleanups: Array<() => void> = [];
    bigEls.forEach((el) => {
      const enter = onEnter(el);
      el.addEventListener("mouseenter", enter);
      el.addEventListener("mouseleave", onLeave);
      cleanups.push(() => {
        el.removeEventListener("mouseenter", enter);
        el.removeEventListener("mouseleave", onLeave);
      });
    });

    return () => {
      window.removeEventListener("mousemove", move);
      cancelAnimationFrame(raf);
      cleanups.forEach((c) => c());
    };
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-3.5 h-3.5 rounded-full bg-foreground pointer-events-none z-[9999] mix-blend-difference transition-[width,height] duration-200 hidden md:block"
      />
      <div
        ref={labelRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999] font-mono text-[11px] uppercase tracking-wider text-background opacity-0 transition-opacity duration-200 hidden md:block"
      />
    </>
  );
}

function Loader({ onDone }: { onDone: () => void }) {
  const [done, setDone] = useState(false);
  const [hide, setHide] = useState(false);
  const [count, setCount] = useState(0);
  const [litLetters, setLitLetters] = useState(0);
  const letters = ["R", "A", "Z"];

  useEffect(() => {
    let already = false;
    try {
      already = sessionStorage.getItem("raz:loader-played") === "1";
    } catch {
      /* noop */
    }
    if (already) {
      setHide(true);
      onDone();
      return;
    }

    const letterIv = setInterval(() => {
      setLitLetters((n) => (n < letters.length ? n + 1 : n));
    }, 160);

    const countIv = setInterval(() => {
      setCount((n) => {
        const next = Math.min(100, n + Math.ceil(Math.random() * 18));
        if (next >= 100) {
          clearInterval(countIv);
          clearInterval(letterIv);
          setLitLetters(letters.length);
          setTimeout(() => {
            setDone(true);
            try {
              sessionStorage.setItem("raz:loader-played", "1");
            } catch {
              /* noop */
            }
            onDone();
          }, 350);
        }
        return next;
      });
    }, 90);

    return () => {
      clearInterval(letterIv);
      clearInterval(countIv);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (hide) return null;

  const loaderImgs = [
    { seed: "raz-load-1", size: 120, className: "top-[14%] left-[12%]", delay: "0.1s" },
    { seed: "raz-load-2", size: 90, className: "top-[20%] right-[14%]", delay: "0.4s" },
    { seed: "raz-load-3", size: 150, className: "bottom-[12%] left-[20%]", delay: "0.2s" },
    { seed: "raz-load-4", size: 100, className: "bottom-[16%] right-[18%]", delay: "0.5s" },
  ];

  return (
    <div
      className={`fixed inset-0 bg-background z-[10000] flex flex-col items-center justify-center overflow-hidden transition-transform duration-[900ms] ease-[cubic-bezier(0.76,0,0.24,1)] ${
        done ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      {loaderImgs.map((img) => (
        <img
          key={img.seed}
          src={`https://picsum.photos/seed/${img.seed}/${img.size * 2}/${img.size * 2}`}
          alt=""
          className={`absolute rounded-full object-cover grayscale contrast-[1.05] brightness-75 animate-[razLoaderFloat_2.6s_ease-in-out_infinite] ${img.className}`}
          style={{ width: img.size, height: img.size, animationDelay: img.delay }}
        />
      ))}
      <div className="relative z-10 flex gap-[0.05em] text-[clamp(48px,9vw,110px)] font-bold tracking-tight font-mono">
        {letters.map((l, i) => (
          <span
            key={l}
            className={`inline-block transition-all duration-500 ${
              i < litLetters ? "opacity-100 translate-y-0" : "opacity-15 translate-y-3"
            }`}
          >
            {l}
          </span>
        ))}
      </div>
      <div className="mt-[18px] text-[13px] tracking-[0.15em] text-muted-foreground font-mono">
        {String(count).padStart(3, "0")}
      </div>
    </div>
  );
}

export default function RazPortfolio() {
  const [ready, setReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const parallaxA = useParallax(0.12);
  const parallaxB = useParallax(0.22);

  return (
    <div className="bg-background text-foreground font-sans overflow-x-hidden [cursor:none] md:[cursor:none] selection:bg-foreground selection:text-background">
      <CustomCursor />
      <Loader onDone={() => setReady(true)} />

      <nav
        className={`fixed top-0 left-0 right-0 z-[500] flex items-center justify-between px-5 md:px-12 py-5 mix-blend-difference transition-all duration-700 delay-300 ${
          ready ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
        }`}
      >
        <a href="#top" className="font-bold text-xl tracking-tight">RAZ</a>
        <button
          className="menu-btn flex items-center gap-2.5 [cursor:none]"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span className="font-mono text-xs uppercase">Menu</span>
          <div className="grid grid-cols-2 gap-1 w-3.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <i key={i} className="w-1 h-1 bg-foreground block" />
            ))}
          </div>
        </button>
      </nav>

      <div
        className={`fixed inset-0 bg-foreground text-background z-[600] flex flex-col justify-between px-5 md:px-16 pt-24 pb-12 transition-transform duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] ${
          menuOpen ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="flex flex-col gap-2">
          {[
            { href: "#work", label: "Work" },
            { href: "#practice", label: "Practice" },
            { href: "#footer", label: "Contact" },
          ].map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="text-[clamp(40px,9vw,88px)] font-bold tracking-tight leading-[1.05]"
            >
              {l.label}
            </a>
          ))}
        </div>
        <div className="flex justify-between items-end flex-wrap gap-6 font-mono text-sm">
          <span>Based in — remote / worldwide</span>
          <div className="flex gap-5">
            <a href="#">LinkedIn</a>
            <a href="#">Instagram</a>
            <a href="#">Github</a>
          </div>
        </div>
      </div>

      <main id="top">
        {/* HERO */}
        <section className="relative min-h-[100dvh] flex flex-col justify-end pb-14 overflow-hidden">
          <div
            className="absolute inset-0 -z-10"
            style={photoStyle("raz-hero", 1800, 1200, "160deg,rgba(11,11,11,.55) 0%,rgba(11,11,11,.75) 55%,rgba(11,11,11,.95) 100%")}
          />
          <div className="absolute top-28 left-0 right-0 px-5 md:px-16 hidden md:flex justify-between items-start">
            <Reveal className="max-w-[420px] text-[15px] leading-relaxed text-muted-foreground">
              Independent creative &amp; developer. I design and build digital work for people who&apos;d rather stand out than fit in.
            </Reveal>
          </div>
          <div className="max-w-[1400px] mx-auto w-full px-5 md:px-16">
            <div className="w-full overflow-hidden">
              <RazWordmark
                className={`w-full h-auto block transition-transform duration-[1100ms] ease-[cubic-bezier(0.76,0,0.24,1)] ${
                  ready ? "translate-y-0" : "translate-y-full"
                }`}
              />
            </div>
            <Reveal className="flex items-center justify-between flex-wrap gap-6 mt-7">
              <a
                href="#footer"
                className="inline-flex items-center gap-3.5 border border-white/10 px-5 py-3 rounded-full font-mono text-[13px] uppercase tracking-wide transition-colors hover:bg-foreground hover:text-background"
              >
                <span>Start a project</span>
                <ArrowIcon />
              </a>
              <div className="flex justify-between items-center gap-4 text-xs uppercase text-muted-foreground font-mono">
                <span>Portfolio — 2026</span>
                <div className="flex gap-4 ml-4">
                  <a href="#">LinkedIn</a>
                  <a href="#">Instagram</a>
                  <a href="#">Github</a>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* SHOWREEL */}
        <section className="py-32">
          <div className="max-w-[1400px] mx-auto px-5 md:px-16">
            <Reveal>
              <h2 className="text-[clamp(30px,4.4vw,56px)] font-medium leading-[1.08] tracking-tight">
                Most portfolios show finished work.
                <br />
                I&apos;d rather show how I think.
              </h2>
            </Reveal>
            <div className="grid md:grid-cols-[1.5fr_1fr] gap-10 mt-14">
              <Reveal>
                <div
                  className="aspect-[16/10] rounded overflow-hidden relative"
                  style={photoStyle("raz-reel", 1200, 750, "0deg,rgba(11,11,11,.55),rgba(11,11,11,.35)")}
                >
                  <div className="absolute inset-0 flex items-center justify-center font-mono text-xs uppercase tracking-[0.1em] text-muted-foreground">
                    ▸ watch the reel
                  </div>
                </div>
              </Reveal>
              <Reveal>
                <div className="font-mono text-xs uppercase text-muted-foreground mb-5 tracking-wide">( The approach )</div>
                <p className="text-muted-foreground text-base leading-relaxed">
                  Every project starts as a question, not a template. I sketch, prototype, and throw most of it away — what&apos;s left is the part worth shipping.
                </p>
              </Reveal>
            </div>
          </div>
        </section>

        {/* WORK */}
        <section id="work" className="py-32">
          <div className="max-w-[1400px] mx-auto px-5 md:px-16">
            <Reveal className="font-mono text-xs uppercase text-muted-foreground mb-5 tracking-wide">( Selected work )</Reveal>
            <Reveal>
              <h2 className="text-[clamp(30px,4.4vw,56px)] font-medium leading-[1.08] tracking-tight">
                Built to be used,
                <br />
                not just admired.
              </h2>
            </Reveal>
            <div className="grid md:grid-cols-2 gap-px bg-white/10 border-t border-white/10 mt-16">
              {WORK_ITEMS.map((item) => (
                <Reveal key={item.title} className="bg-background p-8 md:p-10 relative overflow-hidden">
                  <div className="flex justify-between items-start mb-7">
                    <div className="text-[clamp(22px,2.6vw,30px)] font-medium">{item.title}</div>
                    <div className="text-muted-foreground text-sm max-w-[260px] text-right">{item.desc}</div>
                  </div>
                  <a
                    href="#"
                    className="work-thumb block aspect-[4/3] rounded-sm relative overflow-hidden transition-transform duration-500 hover:scale-[1.02]"
                    style={photoStyle(item.seed, 800, 600)}
                  >
                    <span className="absolute bottom-3.5 left-3.5 font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
                      view →
                    </span>
                  </a>
                </Reveal>
              ))}
            </div>
            <div className="flex justify-between items-center flex-wrap gap-5 mt-12">
              <a
                href="#"
                className="inline-flex items-center gap-3.5 border border-white/10 px-5 py-3 rounded-full font-mono text-[13px] uppercase tracking-wide transition-colors hover:bg-foreground hover:text-background"
              >
                <span>View all work</span>
                <ArrowIcon />
              </a>
              <div className="font-mono text-[13px] text-muted-foreground">( 04 )</div>
            </div>
          </div>
        </section>

        {/* PRACTICE */}
        <section id="practice" className="py-32">
          <div className="max-w-[1400px] mx-auto px-5 md:px-16">
            <Reveal className="font-mono text-xs uppercase text-muted-foreground mb-5 tracking-wide">( The practice )</Reveal>
            <Reveal className="text-[clamp(20px,2.6vw,30px)] leading-snug max-w-[820px] mt-1">
              I started calling this practice RAZ because it&apos;s meant to stay open — not one discipline, but whatever the problem actually needs: a brand, a build, an experiment.
            </Reveal>

            <div className="grid md:grid-cols-[1.1fr_0.9fr] gap-8 mt-20 items-end">
              <Reveal>
                <div
                  ref={parallaxA}
                  className="aspect-[3/4] rounded-sm overflow-hidden relative will-change-transform"
                  style={photoStyle("raz-studio-a", 700, 900, "180deg,rgba(11,11,11,0) 45%,rgba(11,11,11,.75) 100%")}
                >
                  <span className="absolute bottom-4 left-4 font-mono text-[13px] text-muted-foreground">or something unexpected</span>
                </div>
              </Reveal>
              <Reveal>
                <div
                  ref={parallaxB}
                  className="aspect-[3/4] rounded-sm overflow-hidden relative mb-14 will-change-transform"
                  style={photoStyle("raz-studio-b", 700, 900, "180deg,rgba(11,11,11,0) 45%,rgba(11,11,11,.75) 100%")}
                >
                  <span className="absolute bottom-4 left-4 font-mono text-[13px] text-muted-foreground">detail over decoration</span>
                </div>
              </Reveal>
            </div>

            <div className="grid md:grid-cols-[0.4fr_1fr] gap-8 mt-28">
              <div className="flex flex-col">
                {["Brand systems", "Web & product design", "Front-end development", "Motion & interaction", "Creative direction"].map((s) => (
                  <Reveal key={s} className="flex items-center gap-3.5 py-4 border-b border-white/10 text-[15px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-foreground flex-none" />
                    {s}
                  </Reveal>
                ))}
              </div>
              <Reveal>
                <h2 className="text-[clamp(30px,4.4vw,56px)] font-medium leading-[1.08] tracking-tight mb-4">
                  Form follows the problem, not the portfolio.
                </h2>
                <p className="text-muted-foreground text-base leading-relaxed max-w-[420px]">
                  I work end to end — strategy, design, and the actual code that ships it. That&apos;s usually the difference between a deck and a live product.
                </p>
              </Reveal>
            </div>
          </div>
        </section>

        {/* GLITCH */}
        <section className="relative h-[220vh]">
          <div className="sticky top-0 h-[100dvh] flex items-center justify-center overflow-hidden bg-background">
            <div className="absolute inset-0 flex flex-col justify-around opacity-[0.16]" aria-hidden="true">
              {[
                "we build things · we build things · we build things · we build things",
                "RAZ — RAZ — RAZ — RAZ — RAZ — RAZ — RAZ — RAZ",
                "detail is direction · detail is direction · detail is direction",
                "RAZ — RAZ — RAZ — RAZ — RAZ — RAZ — RAZ — RAZ",
                "we build things · we build things · we build things · we build things",
              ].map((row, i) => (
                <div
                  key={i}
                  className="font-mono text-[15px] whitespace-nowrap tracking-wide"
                  style={{
                    animation: `razGlitchShift ${i % 2 === 0 ? 6 : 7}s infinite ease-in-out ${i % 2 !== 0 ? "reverse" : ""}`,
                  }}
                >
                  {row}
                </div>
              ))}
            </div>
            <div className="relative text-[clamp(30px,5vw,64px)] font-medium text-center leading-[1.15] max-w-[900px] px-6">
              I build the kind of work that changes how people look at the problem.
            </div>
          </div>
        </section>
      </main>

      <footer id="footer" className="pt-32 pb-10">
        <div className="max-w-[1400px] mx-auto px-5 md:px-16">
          <div className="flex justify-between items-end flex-wrap gap-8">
            <Reveal>
              <h2 className="text-[clamp(30px,4.4vw,56px)] font-medium leading-[1.08] tracking-tight">
                Let&apos;s start
                <br />
                with nothing.
              </h2>
            </Reveal>
            <Reveal className="flex gap-3.5 flex-wrap">
              <a
                href="#"
                className="inline-flex items-center gap-3.5 border border-white/10 px-5 py-3 rounded-full font-mono text-[13px] uppercase tracking-wide transition-colors hover:bg-foreground hover:text-background"
              >
                <span>Book a call</span>
                <ArrowIcon />
              </a>
              <a
                href="mailto:hello@raz.dev"
                className="inline-flex items-center gap-3.5 border border-white/10 px-5 py-3 rounded-full font-mono text-[13px] uppercase tracking-wide transition-colors hover:bg-foreground hover:text-background"
              >
                hello@raz.dev
              </a>
            </Reveal>
          </div>

          <Reveal className="mt-24 w-full">
            <RazWordmark className="w-full h-auto opacity-90" />
          </Reveal>

          <div className="flex justify-between flex-wrap gap-3 mt-6 pt-5 border-t border-white/10 font-mono text-xs text-muted-foreground">
            <span>© 2026 RAZ — All rights reserved.</span>
            <div className="flex gap-5">
              <a href="#">LinkedIn</a>
              <a href="#">Instagram</a>
              <a href="#">Github</a>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes razGlitchShift {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-4%); }
        }
        @keyframes razLoaderFloat {
          0% { opacity: 0; transform: translateY(14px) scale(.92); }
          30%, 70% { opacity: .55; }
          100% { opacity: 0; transform: translateY(-14px) scale(1.02); }
        }
      `}</style>
    </div>
  );
}
