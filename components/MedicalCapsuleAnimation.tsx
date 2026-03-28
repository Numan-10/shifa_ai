'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

/* ─── Tiny inline SVG icons ──────────────────────────────────────── */
const HeartIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
)
const PillIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="w-5 h-5">
    <path d="M10.5 4.5a6 6 0 0 0-8.485 8.485L10.5 21.47l8.485-8.485A6 6 0 0 0 10.5 4.5Z" />
    <line x1="3.515" y1="12" x2="17.485" y2="12" />
  </svg>
)
const ScanIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="w-5 h-5">
    <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
    <rect x="7" y="7" width="10" height="10" rx="1" />
  </svg>
)
const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="w-5 h-5">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <path d="m9 16 2 2 4-4" />
  </svg>
)
const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="w-5 h-5">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
)

/* ─── ECG polyline points ────────────────────────────────────────── */
const ECG_POINTS = '0,20 12,20 18,4 24,36 30,2 36,20 48,20 54,12 60,20 72,20'

export default function MedicalCapsuleAnimation() {
  const rootRef = useRef<HTMLDivElement>(null)
  const coreRef = useRef<HTMLDivElement>(null)
  const ring1Ref = useRef<HTMLDivElement>(null)
  const ring2Ref = useRef<HTMLDivElement>(null)
  const ecgRef = useRef<SVGPolylineElement>(null)
  const scanLineRef = useRef<HTMLDivElement>(null)
  const counterRef = useRef<HTMLSpanElement>(null)
  const card1Ref = useRef<HTMLDivElement>(null)
  const card2Ref = useRef<HTMLDivElement>(null)
  const card3Ref = useRef<HTMLDivElement>(null)
  const card4Ref = useRef<HTMLDivElement>(null)
  const svgLinesRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {

      /* ── 1. Entrance master timeline ── */
      const tl = gsap.timeline({ delay: 0.2 })

      // Core pulses in
      tl.fromTo(coreRef.current,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.9, ease: 'back.out(2)' }
      )
        // Rings expand
        .fromTo([ring1Ref.current, ring2Ref.current],
          { scale: 0.2, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.7, stagger: 0.15, ease: 'power3.out' },
          '-=0.5'
        )
        // Connection lines draw in
        .fromTo(svgLinesRef.current?.querySelectorAll('line') || [],
          { strokeDashoffset: 300 },
          { strokeDashoffset: 0, duration: 0.6, stagger: 0.1, ease: 'power2.inOut' },
          '-=0.3'
        )
        // Cards cascade in
        .fromTo([card1Ref.current, card2Ref.current, card3Ref.current, card4Ref.current],
          { y: 24, opacity: 0, scale: 0.9 },
          { y: 0, opacity: 1, scale: 1, duration: 0.5, stagger: 0.1, ease: 'back.out(1.5)' },
          '-=0.3'
        )

      /* ── 2. Ambient loops ── */

      // Core heartbeat pulse
      gsap.to(coreRef.current, {
        scale: 1.05,
        duration: 0.9,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      })

      // Rings slowly expand & fade
      gsap.to(ring1Ref.current, {
        scale: 1.18,
        opacity: 0,
        duration: 2.2,
        ease: 'power1.out',
        repeat: -1,
        repeatDelay: 0.2,
      })
      gsap.to(ring2Ref.current, {
        scale: 1.32,
        opacity: 0,
        duration: 2.8,
        ease: 'power1.out',
        delay: 0.8,
        repeat: -1,
        repeatDelay: 0.2,
      })

        // Cards gentle float (different phases)
        ;[card1Ref, card2Ref, card3Ref, card4Ref].forEach((ref, i) => {
          gsap.to(ref.current, {
            y: i % 2 === 0 ? -10 : 10,
            duration: 2.4 + i * 0.3,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
            delay: i * 0.4,
          })
        })

      /* ── 3. ECG sweep ── */
      if (ecgRef.current) {
        const len = 240
        gsap.set(ecgRef.current, { strokeDasharray: len, strokeDashoffset: len })
        gsap.to(ecgRef.current, {
          strokeDashoffset: 0,
          duration: 1.6,
          ease: 'power2.inOut',
          repeat: -1,
          repeatDelay: 0.4,
        })
      }

      /* ── 4. Scan laser beam ── */
      if (scanLineRef.current) {
        gsap.to(scanLineRef.current, {
          y: 68,
          duration: 1.4,
          ease: 'power1.inOut',
          yoyo: true,
          repeat: -1,
          repeatDelay: 0.2,
        })
      }

      /* ── 5. Counter: 0 → 99.9 ── */
      if (counterRef.current) {
        const obj = { val: 0 }
        gsap.to(obj, {
          val: 99.9,
          duration: 2.5,
          ease: 'power2.out',
          delay: 0.8,
          onUpdate: () => {
            if (counterRef.current)
              counterRef.current.textContent = obj.val.toFixed(1)
          },
          repeat: -1,
          repeatDelay: 3,
        })
      }

    }, rootRef)

    return () => ctx.revert()
  }, [])

  /* shared glass card style */
  const card = 'absolute backdrop-blur-xl border rounded-2xl shadow-xl overflow-hidden'
  const cardBg = 'bg-[color-mix(in_srgb,var(--surface-elevated)_78%,transparent)]'
  const cardBorder = 'border-[color-mix(in_srgb,var(--border-soft)_50%,white_15%)]'

  return (
    <div
      ref={rootRef}
      className="relative w-full h-full min-h-[520px] flex items-center justify-center select-none"
      aria-hidden="true"
    >
      {/* ── SVG connection lines ───────────────────────────────────── */}
      <svg
        ref={svgLinesRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 0 }}
      >
        {/* lines from center (50%,50%) to each card corner */}
        {[
          { x1: '50%', y1: '50%', x2: '18%', y2: '25%' },
          { x1: '50%', y1: '50%', x2: '82%', y2: '25%' },
          { x1: '50%', y1: '50%', x2: '18%', y2: '76%' },
          { x1: '50%', y1: '50%', x2: '82%', y2: '76%' },
        ].map((l, i) => (
          <line
            key={i}
            x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
            stroke="var(--sage-400)"
            strokeWidth="0.8"
            strokeDasharray="300"
            strokeDashoffset="300"
            opacity="0.35"
          />
        ))}
      </svg>

      {/* ── Central glowing core ───────────────────────────────────── */}
      <div className="absolute" style={{ left: '50%', top: '50%', transform: 'translate(-50%,-50%)', zIndex: 2 }}>
        {/* Ripple rings */}
        <div
          ref={ring1Ref}
          className="absolute rounded-full border"
          style={{
            width: 120, height: 120,
            inset: -20,
            borderColor: 'var(--sage-400)',
            opacity: 0.5,
          }}
        />
        <div
          ref={ring2Ref}
          className="absolute rounded-full border"
          style={{
            width: 160, height: 160,
            inset: -40,
            borderColor: 'var(--sage-500)',
            opacity: 0.3,
          }}
        />
        {/* Core disc */}
        <div
          ref={coreRef}
          className="relative flex items-center justify-center rounded-full shadow-2xl"
          style={{
            width: 80, height: 80,
            background: 'linear-gradient(135deg, var(--sage-600), var(--accent-teal))',
            boxShadow: '0 0 40px 12px rgba(74,158,142,0.35)',
          }}
        >
          <div className="text-white" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))' }}>
            <HeartIcon />
          </div>
          {/* Inner label */}

        </div>
      </div>

      {/* ── Card 1 · Vitals (top-left) ────────────────────────────── */}
      <div
        ref={card1Ref}
        className={`${card} ${cardBg} ${cardBorder} w-44`}
        style={{ left: '2%', top: '8%', zIndex: 3 }}
      >
        <div className="px-3 pt-3 pb-1 flex items-center gap-2">
          <span style={{ color: '#e07b5a' }}><HeartIcon /></span>
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            Overview
          </span>
        </div>
        <div className="px-3 pb-1">
          <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            72 <span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>bpm</span>
          </p>
        </div>
        {/* ECG strip */}
        <div className="mx-3 mb-3 rounded-lg overflow-hidden" style={{ background: 'rgba(74,158,142,0.08)' }}>
          <svg viewBox="0 0 72 40" className="w-full h-10" preserveAspectRatio="none">
            <polyline
              ref={ecgRef}
              points={ECG_POINTS}
              fill="none"
              stroke="#4a9e8e"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* ── Card 2 · Medicine (top-right) ────────────────────────── */}
      <div
        ref={card2Ref}
        className={`${card} ${cardBg} ${cardBorder} w-44`}
        style={{ right: '2%', top: '8%', zIndex: 3 }}
      >
        <div className="px-3 pt-3 pb-2 flex items-center gap-2">
          <span style={{ color: 'var(--sage-500)' }}><PillIcon /></span>
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            Medicines
          </span>
        </div>
        <div className="px-3 pb-3 space-y-1.5">
          {['Paracetamol 500mg', 'Omeprazole 20mg', 'Metformin 1g'].map((med, i) => (
            <div
              key={med}
              className="flex items-center gap-2 rounded-lg px-2 py-1"
              style={{ background: i === 0 ? 'color-mix(in srgb,var(--sage-600) 15%,transparent)' : 'transparent' }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: ['var(--sage-500)', 'var(--accent-teal)', '#cab87e'][i] }}
              />
              <span className="text-[10px]" style={{ color: i === 0 ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                {med}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Card 3 · AI Scan (bottom-left) ───────────────────────── */}
      <div
        ref={card3Ref}
        className={`${card} ${cardBg} ${cardBorder} w-44`}
        style={{ left: '2%', bottom: '8%', zIndex: 3 }}
      >
        <div className="px-3 pt-3 pb-2 flex items-center gap-2">
          <span style={{ color: 'var(--accent-teal)' }}><ScanIcon /></span>
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            AI Scan
          </span>
        </div>
        {/* Scan document mock */}
        <div
          className="relative mx-3 mb-2 rounded-lg overflow-hidden"
          style={{ height: 70, background: 'color-mix(in srgb,var(--surface-muted) 80%,transparent)' }}
        >
          {/* Doc lines */}
          {[20, 35, 50, 65].map(t => (
            <div
              key={t}
              className="absolute h-px mx-3 rounded-full"
              style={{ top: t, left: 8, right: 8, background: 'var(--border-strong)', opacity: 0.6 }}
            />
          ))}
          {/* Scanning beam */}
          <div
            ref={scanLineRef}
            className="absolute left-0 right-0 h-0.5 rounded-full"
            style={{
              top: 0,
              background: 'linear-gradient(90deg, transparent, var(--accent-teal), transparent)',
              boxShadow: '0 0 8px 2px rgba(74,158,142,0.6)',
            }}
          />
        </div>
        <div className="px-3 pb-3">
          <div className="flex justify-between text-[9px] mb-1" style={{ color: 'var(--text-muted)' }}>
            <span>Accuracy</span>
            <span style={{ color: 'var(--sage-500)' }}><span ref={counterRef}>0</span>%</span>
          </div>
          <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'var(--cream-200)' }}>
            <div
              className="h-full rounded-full"
              style={{
                width: '99.9%',
                background: 'linear-gradient(90deg, var(--accent-teal), var(--sage-500))',
                transition: 'width 2.5s ease',
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Card 4 · Appointments (bottom-right) ─────────────────── */}
      <div
        ref={card4Ref}
        className={`${card} ${cardBg} ${cardBorder} w-44`}
        style={{ right: '2%', bottom: '8%', zIndex: 3 }}
      >
        <div className="px-3 pt-3 pb-2 flex items-center gap-2">
          <span style={{ color: '#8b7fb8' }}><CalendarIcon /></span>
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            Appointments
          </span>
        </div>
        <div className="px-3 pb-3 space-y-2">
          {[
            { time: '09:00', doc: 'Dr. Amir', tag: 'General', done: true },
            { time: '14:30', doc: 'Dr. Sarah', tag: 'Cardio', done: false },
          ].map(apt => (
            <div
              key={apt.time}
              className="flex items-center gap-2 rounded-xl px-2 py-1.5 border"
              style={{
                background: apt.done
                  ? 'color-mix(in srgb,var(--sage-600) 10%,transparent)'
                  : 'color-mix(in srgb,var(--surface-muted) 70%,transparent)',
                borderColor: apt.done ? 'color-mix(in srgb,var(--sage-500) 30%,transparent)' : 'var(--border-soft)',
              }}
            >
              {apt.done
                ? <span style={{ color: 'var(--sage-500)' }}><ShieldIcon /></span>
                : <span className="w-5 h-5 flex items-center justify-center rounded-full border" style={{ borderColor: '#8b7fb8', color: '#8b7fb8', fontSize: 10 }}>→</span>
              }
              <div>
                <p className="text-[10px] font-semibold" style={{ color: 'var(--text-primary)' }}>{apt.doc}</p>
                <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{apt.time} · {apt.tag}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Floating glow blobs (background ambiance) ─────────────── */}
      <div
        className="absolute pointer-events-none rounded-full blur-3xl"
        style={{
          width: 200, height: 200,
          background: 'radial-gradient(circle, rgba(74,158,142,0.18) 0%, transparent 70%)',
          top: '15%', left: '20%',
          animation: 'blobDrift1 7s ease-in-out infinite alternate',
        }}
      />
      <div
        className="absolute pointer-events-none rounded-full blur-3xl"
        style={{
          width: 160, height: 160,
          background: 'radial-gradient(circle, rgba(82,125,86,0.15) 0%, transparent 70%)',
          bottom: '15%', right: '18%',
          animation: 'blobDrift2 8s ease-in-out infinite alternate',
        }}
      />

      <style>{`
        @keyframes blobDrift1 {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(18px, -22px) scale(1.12); }
        }
        @keyframes blobDrift2 {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(-14px, 20px) scale(1.1); }
        }
      `}</style>
    </div>
  )
}
