import { useState } from 'react'

// W produkcji ustaw VITE_API_URL w zmiennych środowiskowych Vercel
const API_URL =
    (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_API_URL) ??
    'http://localhost:5000'

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Outfit:wght@300;400;500;600&display=swap');`

const CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg:#07090f; --surface:#0d1117; --border:rgba(255,255,255,0.07);
    --amber:#f5a500; --amber-dim:rgba(245,165,0,0.1); --amber-border:rgba(245,165,0,0.28);
    --text:#e4e8f0; --muted:#64748b;
  }
  body { background:var(--bg); color:var(--text); font-family:'Outfit',sans-serif; }

  /* NAV */
  .nav {
    position:fixed; top:0; left:0; right:0; z-index:100;
    display:flex; align-items:center; padding:18px 40px;
    background:rgba(7,9,15,0.88); backdrop-filter:blur(20px);
    border-bottom:1px solid var(--border);
  }
  .logo {
    font-family:'Syne',sans-serif; font-size:19px; font-weight:800;
    letter-spacing:-0.5px; display:flex; align-items:center; gap:9px;
  }
  .logo-dot { color:var(--amber); }

  /* HERO */
  .hero {
    min-height:100vh; display:flex; align-items:center; justify-content:center;
    padding:60px 24px 80px; position:relative; overflow:hidden;
  }
  .hero-glow {
    position:absolute; inset:0; pointer-events:none;
    background:radial-gradient(ellipse 55% 35% at 50% 105%, rgba(245,165,0,0.09) 0%, transparent 65%),
               radial-gradient(ellipse 30% 50% at 85% 10%, rgba(245,165,0,0.04) 0%, transparent 55%);
  }
  .hero-road {
    position:absolute; bottom:0; left:50%; transform:translateX(-50%);
    width:3px; height:180px;
    background:linear-gradient(to bottom, var(--amber), transparent); opacity:0.25;
  }
  .hero-road::before, .hero-road::after {
    content:''; position:absolute; width:3px; height:180px;
    background:linear-gradient(to bottom, var(--amber), transparent); opacity:0.4;
  }
  .hero-road::before { left:-40px; }
  .hero-road::after  { left:40px;  }
  .hero-inner { position:relative; max-width:700px; text-align:center; }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.4} }
  .h1 {
    font-family:'Syne',sans-serif;
    font-size:clamp(44px,6.5vw,76px); font-weight:800;
    line-height:1.04; letter-spacing:-2.5px; margin-bottom:22px;
  }
  .h1 em { font-style:normal; color:var(--amber); }
  .hero-sub {
    font-size:17px; color:var(--muted); line-height:1.65; font-weight:300;
    margin-bottom:44px; max-width:540px; margin-left:auto; margin-right:auto;
  }

  /* FORM */
  .form-shell { max-width:500px; margin:0 auto; }
  .input-row {
    display:flex; background:var(--surface); border:1px solid var(--border);
    border-radius:12px; overflow:hidden; transition:border-color 0.2s, box-shadow 0.2s;
  }
  .input-row:focus-within {
    border-color:var(--amber-border); box-shadow:0 0 0 3px rgba(245,165,0,0.07);
  }
  .email-inp {
    flex:1; background:none; border:none; outline:none;
    padding:15px 18px; font-family:'Outfit',sans-serif; font-size:15px; color:var(--text);
  }
  .email-inp::placeholder { color:var(--muted); }
  .send-btn {
    background:var(--amber); color:#07090f; border:none;
    padding:15px 26px; font-family:'Outfit',sans-serif;
    font-size:14px; font-weight:600; cursor:pointer; transition:background 0.18s;
    white-space:nowrap; display:flex; align-items:center; gap:7px;
    min-width:136px; justify-content:center;
  }
  .send-btn:hover:not(:disabled) { background:#ffba30; }
  .send-btn:disabled { opacity:0.65; cursor:not-allowed; }
  .form-note { font-size:12px; color:var(--muted); margin-top:11px; text-align:center; }
  .err-msg { color:#f87171; font-size:13px; margin-top:10px; text-align:center; }

  /* SUCCESS */
  .success-box {
    background:rgba(34,197,94,0.06); border:1px solid rgba(34,197,94,0.22);
    border-radius:14px; padding:28px; text-align:center;
  }
  .success-ring {
    width:52px; height:52px; background:rgba(34,197,94,0.1);
    border-radius:50%; display:flex; align-items:center; justify-content:center;
    font-size:24px; margin:0 auto 14px;
  }
  .success-title { font-family:'Syne',sans-serif; font-size:20px; font-weight:700; margin-bottom:7px; }
  .success-sub { font-size:14px; color:var(--muted); line-height:1.6; }

  /* FEATURES */
  .features { padding:100px 24px; max-width:1080px; margin:0 auto; }
  .section-eyebrow {
    font-size:11px; font-weight:600; letter-spacing:2.5px;
    text-transform:uppercase; color:var(--amber); margin-bottom:14px;
  }
  .section-h2 {
    font-family:'Syne',sans-serif; font-size:clamp(26px,3vw,40px);
    font-weight:800; letter-spacing:-1px; margin-bottom:52px; max-width:460px;
    display: inline-block;
  }
  .cards { display:grid; grid-template-columns:repeat(auto-fit,minmax(290px,1fr)); gap:20px; }
  .card {
    background:var(--surface); border:1px solid var(--border);
    border-radius:16px; padding:28px; transition:border-color 0.2s, transform 0.2s;
  }
  .card:hover { border-color:var(--amber-border); transform:translateY(-3px); }
  .card-icon {
    width:46px; height:46px; background:var(--amber-dim);
    border-radius:11px; display:flex; align-items:center; justify-content:center;
    font-size:22px; margin-bottom:16px;
  }
  .card-title { font-family:'Syne',sans-serif; font-size:17px; font-weight:700; margin-bottom:8px; }
  .card-text { font-size:14px; color:var(--muted); line-height:1.65; font-weight:300; }

  /* FOOTER */
  .footer {
    border-top:1px solid var(--border); padding:28px 40px;
    text-align:center; font-size:13px; color:var(--muted);
  }

  /* SPINNER */
  @keyframes spin { to { transform:rotate(360deg); } }
  .spinner {
    width:17px; height:17px; border:2px solid rgba(7,9,15,0.3);
    border-top-color:#07090f; border-radius:50%; animation:spin 0.55s linear infinite;
  }

  @media(max-width:600px){
    .nav{ padding:14px 18px; }
    .hero{ padding:90px 18px 70px; }
    .input-row{ flex-direction:column; }
    .send-btn{ width:100%; }
    .features{ padding:70px 18px; }
  }
`

const ICON_CAR = (
    <svg
        width='20'
        height='20'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='2.2'
        strokeLinecap='round'
        strokeLinejoin='round'
    >
        <path d='M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.75-3.67A1 1 0 0 0 12.45 7H5.14a1 1 0 0 0-.95.68L2 12v4h2' />
        <circle cx='6.5' cy='16.5' r='2.5' />
        <circle cx='16.5' cy='16.5' r='2.5' />
    </svg>
)

const ICON_PLAY = (
    <svg width='16' height='16' viewBox='0 0 24 24' fill='currentColor'>
        <polygon points='5 3 19 12 5 21 5 3' />
    </svg>
)

const FEATURES = [
    {
        icon: '🎬',
        title: 'Film instruktażowy HD',
        desc: 'Nagranie wysokiej jakości omawiające kluczowe manewry, przepisy i sytuacje drogowe - dostępne w każdej chwili.',
    },
    {
        icon: '📬',
        title: 'Bezpośrednio na e-mail',
        desc: 'Wystarczy jeden adres e-mail - link do filmu trafi do Twojej skrzynki natychmiast, bez żadnych opłat.',
    },
    {
        icon: '📱',
        title: 'Na każdym urządzeniu',
        desc: 'Film otworzysz na telefonie, tablecie czy komputerze - gdziekolwiek się uczysz, w dowolnej chwili.',
    },
    {
        icon: '♾️',
        title: 'Dostęp bez limitu',
        desc: 'Do materiału wideo możesz wracać wielokrotnie. Oglądasz tyle razy, ile potrzebujesz, dopóki w pełni nie opanujesz materiału.',
    },
]

export default function App() {
    const [email, setEmail] = useState('')
    const [status, setStatus] = useState('idle') // idle | loading | success | error

    const validEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

    const handleSubscribe = async () => {
        if (!validEmail(email)) return
        setStatus('loading')
        try {
            const res = await fetch(`${API_URL}/api/subscribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            })
            if (!res.ok) throw new Error('API error')
            setStatus('success')
        } catch {
            setStatus('error')
        }
    }

    return (
        <>
            <style>{FONTS + CSS}</style>

            {/* NAV */}
            <nav className='nav'>
                <div className='logo'>
                    {ICON_CAR}
                    <span>
                        Drive<span className='logo-dot'>Learn</span>
                    </span>
                </div>
            </nav>

            {/* HERO */}
            <section className='hero'>
                <div className='hero-glow' />
                <div className='hero-road' />
                <div className='hero-inner'>
                    <h1 className='h1'>
                        Naucz się jeździć
                        <br />
                        <em>pewnie i bezpiecznie</em>
                    </h1>
                    <p className='hero-sub'>
                        Podaj adres e-mail, a wyślemy Ci film instruktażowy z
                        najważniejszymi zasadami nauki jazdy - prosto do Twojej
                        skrzynki pocztowej.
                    </p>

                    <div className='form-shell'>
                        {status === 'success' ? (
                            <div className='success-box'>
                                <div className='success-ring'>✓</div>
                                <div className='success-title'>
                                    Wysłano pomyślnie!
                                </div>
                                <p className='success-sub'>
                                    Film instruktażowy jest już w drodze do
                                    Twojej skrzynki.
                                    <br />
                                    Nie widzisz wiadomości? Sprawdź folder spam.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className='input-row'>
                                    <input
                                        className='email-inp'
                                        type='email'
                                        placeholder='jan.kowalski@example.com'
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        onKeyDown={e =>
                                            e.key === 'Enter' &&
                                            handleSubscribe()
                                        }
                                        disabled={status === 'loading'}
                                    />
                                    <button
                                        className='send-btn'
                                        onClick={handleSubscribe}
                                        disabled={
                                            status === 'loading' || !email
                                        }
                                    >
                                        {status === 'loading' ? (
                                            <span className='spinner' />
                                        ) : (
                                            <>{ICON_PLAY} Wyślij film</>
                                        )}
                                    </button>
                                </div>
                                {status === 'error' && (
                                    <p className='err-msg'>
                                        Coś poszło nie tak. Spróbuj ponownie.
                                    </p>
                                )}
                                <p className='form-note'>
                                    Nie spamujemy. Twój adres nie zostanie
                                    udostępniony osobom trzecim.
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* FEATURES */}
            <section className='features'>
                <div className='section-eyebrow'>Co otrzymasz</div>
                <h2 className='section-h2'>
                    Wszystko, czego potrzebujesz do nauki
                </h2>
                <div className='cards'>
                    {FEATURES.map((f, i) => (
                        <div key={i} className='card'>
                            <div className='card-icon'>{f.icon}</div>
                            <div className='card-title'>{f.title}</div>
                            <p className='card-text'>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <footer className='footer'>
                © 2025 DriveLearn - Materiały instruktażowe z nauki jazdy
            </footer>
        </>
    )
}
