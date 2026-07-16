export default function GuinnessGauge({ progressPercent }) {
  const clamped = Math.min(100, Math.max(0, progressPercent));
  const fillHeight = (clamped / 100) * 118;
  const fillY = 120 - fillHeight;
  const overflowing = clamped >= 100;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-center gap-1 pointer-events-none">
      <span className="text-[10px] uppercase tracking-widest text-lgo-gold-light/70 font-semibold">
        {Math.round(clamped)} %
      </span>

      <div className="relative w-12 h-28 sm:w-14 sm:h-32 drop-shadow-2xl">
        <svg
          viewBox="0 0 100 150"
          className="w-full h-full"
          aria-label="Jauge de progression"
        >
          <defs>
            <linearGradient id="foamGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFF8E7" />
              <stop offset="100%" stopColor="#F4D992" />
            </linearGradient>
            <linearGradient id="stoutGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3d2b1f" />
              <stop offset="30%" stopColor="#1a0f08" />
              <stop offset="100%" stopColor="#0f0905" />
            </linearGradient>
            <linearGradient id="glassShine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(255,255,255,0)" />
              <stop offset="30%" stopColor="rgba(255,255,255,0.25)" />
              <stop offset="60%" stopColor="rgba(255,255,255,0.05)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
            <clipPath id="pintClip">
              <path d="M22,5 L24,118 C24,128 35,134 50,134 C65,134 76,128 76,118 L78,5 Z" />
            </clipPath>
          </defs>

          <path
            d="M20,3 L22,120 C22,132 34,138 50,138 C66,138 78,132 78,120 L80,3 Z"
            fill="rgba(15,61,51,0.35)"
            stroke="rgba(244,217,146,0.5)"
            strokeWidth="2"
          />

          <g clipPath="url(#pintClip)">
            <rect
              x="0"
              y={fillY}
              width="100"
              height={fillHeight}
              fill="url(#stoutGrad)"
              className="transition-all duration-300 ease-out"
            />

            <path
              d={`M0,${fillY + 2} Q12,${fillY - 3} 25,${fillY + 2} T50,${fillY + 2} T75,${fillY + 2} T100,${fillY + 2} V150 H0 Z`}
              fill="url(#foamGrad)"
              opacity="0.95"
              className="transition-all duration-300 ease-out"
            />

            {clamped > 0 && (
              <rect x="0" y={fillY - 2} width="100" height="6" fill="#F4D992" opacity="0.9" className="transition-all duration-300 ease-out" />
            )}

            {overflowing && (
              <>
                <ellipse cx="50" cy="-2" rx="20" ry="6" fill="url(#foamGrad)" opacity="0.9" />
                <circle cx="28" cy="2" r="4" fill="#F4D992" opacity="0.85" />
                <circle cx="72" cy="3" r="5" fill="#F4D992" opacity="0.85" />
                <circle cx="50" cy="-6" r="5" fill="#F4D992" opacity="0.8" />
                <circle cx="38" cy="-3" r="3" fill="#F4D992" opacity="0.75" />
              </>
            )}

            <g fill="rgba(244,217,146,0.25)">
              <circle cx="35" cy="115" r="1.5" />
              <circle cx="55" cy="100" r="2" />
              <circle cx="45" cy="85" r="1.2" />
              <circle cx="60" cy="75" r="1.5" />
              <circle cx="38" cy="60" r="1" />
            </g>
          </g>

          <path
            d="M28,10 L30,115 C30,122 34,128 40,130"
            fill="none"
            stroke="url(#glassShine)"
            strokeWidth="5"
            strokeLinecap="round"
            opacity="0.7"
          />

          <ellipse
            cx="50"
            cy="3"
            rx="29"
            ry="4"
            fill="none"
            stroke="rgba(244,217,146,0.5)"
            strokeWidth="2"
          />
        </svg>
      </div>
    </div>
  );
}
