'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useAction } from 'convex/react'
import { anyApi } from 'convex/server'
import { gsap } from 'gsap'
import { useSession } from 'next-auth/react'
import Navbar from '@/components/Navbar'
import FlaticonIcon from '@/components/FlaticonIcon'
import {
  Search, Upload, X, ChevronDown, ChevronUp,
  Pill, AlertTriangle, Activity, DollarSign, FlaskConical,
  Stethoscope, ShieldCheck, Clock, ExternalLink, Loader2, FileText,
  CheckCircle2, Sparkles, ChevronRight, ScanLine, ImageOff
} from 'lucide-react'

// ---- OCR result type ----
interface ExtractedMedicine {
  name: string
  dosage: string
  instructions: string
}

interface MedicineSource {
  title: string
  url: string
  domain: string
  snippet: string
}

// ---- Mock medicine database ----
const MOCK_DB: Record<string, MedicineData> = {
  paracetamol: {
    name: 'Paracetamol (Acetaminophen)',
    brand: 'Calpol, Panadol, Tylenol',
    chemical: 'Câ‚ˆHâ‚‰NOâ‚‚ â€” para-acetylaminophenol',
    category: 'Analgesic / Antipyretic',
    uses: ['Fever reduction', 'Mild to moderate pain relief', 'Headache', 'Toothache', 'Muscle aches', 'Cold & flu symptoms'],
    dosage: { adult: '325â€“1000 mg every 4â€“6 hours', child: '10â€“15 mg/kg every 4â€“6 hours', max: '4000 mg/day for adults' },
    sideEffects: ['Generally well-tolerated at recommended doses', 'Nausea (rare)', 'Skin rash (rare)', 'Liver damage (overdose)'],
    prevention: ['Do not exceed recommended dose', 'Avoid alcohol consumption', 'Check other medications for paracetamol content', 'Consult doctor if liver disease present'],
    prices: [
      { store: 'Apollo Pharmacy', price: 'â‚¹28', generic: true, available: true },
      { store: '1mg', price: 'â‚¹32', generic: false, available: true },
      { store: 'Netmeds', price: 'â‚¹26', generic: true, available: true },
      { store: 'PharmEasy', price: 'â‚¹30', generic: false, available: true },
    ],
    interactions: ['Warfarin (blood thinner)', 'Alcohol'],
    pregnancy: 'Generally considered safe in recommended doses',
    controlled: false,
  },
  ibuprofen: {
    name: 'Ibuprofen',
    brand: 'Brufen, Advil, Nurofen',
    chemical: 'Câ‚â‚ƒHâ‚â‚ˆOâ‚‚ â€” (RS)-2-(4-(2-methylpropyl)phenyl)propanoic acid',
    category: 'NSAID â€” Non-Steroidal Anti-Inflammatory Drug',
    uses: ['Pain relief', 'Inflammation reduction', 'Fever', 'Arthritis', 'Menstrual cramps', 'Dental pain'],
    dosage: { adult: '200â€“400 mg every 4â€“6 hours', child: '5â€“10 mg/kg every 6â€“8 hours', max: '1200 mg/day OTC; 3200 mg/day prescribed' },
    sideEffects: ['Stomach upset or pain', 'Heartburn', 'Nausea', 'Dizziness', 'Increased blood pressure', 'Kidney issues (prolonged use)'],
    prevention: ['Take with food or milk', 'Avoid if kidney or heart disease', 'Not for use during third trimester pregnancy', 'Limit alcohol intake'],
    prices: [
      { store: 'Apollo Pharmacy', price: 'â‚¹42', generic: true, available: true },
      { store: '1mg', price: 'â‚¹38', generic: true, available: true },
      { store: 'Netmeds', price: 'â‚¹45', generic: false, available: false },
      { store: 'PharmEasy', price: 'â‚¹39', generic: true, available: true },
    ],
    interactions: ['Aspirin', 'Blood thinners', 'ACE inhibitors', 'Lithium'],
    pregnancy: 'Avoid in third trimester; use with caution in first and second',
    controlled: false,
  },
  amoxicillin: {
    name: 'Amoxicillin',
    brand: 'Amoxil, Trimox, Moxatag',
    chemical: 'Câ‚â‚†Hâ‚â‚‰Nâ‚ƒOâ‚…S â€” (2S,5R,6R)-6-[(2R)-2-amino-2-(4-hydroxyphenyl)acetamido]-3,3-dimethyl-7-oxo-4-thia-1-azabicyclo[3.2.0]heptane-2-carboxylic acid',
    category: 'Antibiotic â€” Penicillin class',
    uses: ['Bacterial infections', 'Ear infections', 'Throat infections (strep)', 'Urinary tract infections', 'Skin infections', 'H. pylori (with other meds)'],
    dosage: { adult: '250â€“500 mg every 8 hours or 500â€“875 mg every 12 hours', child: '25â€“45 mg/kg/day in divided doses', max: '3 g/day standard; higher in specific cases' },
    sideEffects: ['Diarrhea', 'Nausea', 'Skin rash', 'Vomiting', 'Allergic reactions (in penicillin-allergic patients â€” serious)'],
    prevention: ['Complete full course even if feeling better', 'Inform doctor of penicillin allergy', 'May reduce effectiveness of oral contraceptives', 'Take at even intervals'],
    prices: [
      { store: 'Apollo Pharmacy', price: 'â‚¹95', generic: true, available: true },
      { store: '1mg', price: 'â‚¹110', generic: false, available: true },
      { store: 'Netmeds', price: 'â‚¹88', generic: true, available: true },
      { store: 'PharmEasy', price: 'â‚¹102', generic: false, available: true },
    ],
    interactions: ['Methotrexate', 'Warfarin', 'Other antibiotics', 'Probenecid'],
    pregnancy: 'Generally safe during pregnancy when benefits outweigh risks',
    controlled: false,
  },
}

interface MedicineData {
  name: string; brand: string; chemical: string; category: string;
  uses: string[]; dosage: { adult: string; child: string; max: string };
  sideEffects: string[]; prevention: string[];
  prices: { store: string; price: string; generic: boolean; available: boolean; url?: string }[];
  interactions: string[]; pregnancy: string; controlled: boolean;
  sources?: MedicineSource[];
  timing?: string[];
  source?: 'mock' | 'cache' | 'gemini' | 'fallback';
  cached?: boolean;
}

const sectionColors: Record<string, string> = {
  uses: '#527d56', dosage: '#4a9e8e', sideEffects: '#e07b5a', prevention: '#8b7fb8', prices: '#cab87e', timing: '#4a9e8e'
}

function createLiveMedicineData(liveResult: {
  name: string
  purpose: string
  dosage: string
  precautions: string[]
  sideEffects: string[]
  timing: string[]
  source: 'cache' | 'gemini' | 'fallback'
  cached: boolean
}): MedicineData {
  const timingSummary =
    liveResult.timing[0] ?? 'Follow the prescription label or ask a pharmacist for timing guidance.'

  return {
    name: liveResult.name,
    brand: liveResult.cached ? 'Saved analysis' : 'AI-generated overview',
    chemical: 'Detailed chemical formula is not available in the live response yet.',
    category: liveResult.source === 'fallback' ? 'General guidance' : 'Medicine analysis',
    uses: [liveResult.purpose],
    dosage: {
      adult: liveResult.dosage,
      child: 'Please confirm children dosing with a doctor or pharmacist.',
      max: timingSummary,
    },
    sideEffects: liveResult.sideEffects,
    prevention: liveResult.precautions,
    prices: [],
    interactions: [],
    pregnancy: 'Please confirm pregnancy safety with a doctor or pharmacist.',
    controlled: false,
    sources: [],
    timing: liveResult.timing,
    source: liveResult.source,
    cached: liveResult.cached,
  }
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const analyzeMedicine = useAction(anyApi.actions.analyzeMedicine.analyzeMedicine)
  const pageRef = useRef<HTMLDivElement>(null)
  const searchBarRef = useRef<HTMLDivElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<MedicineData | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    uses: true, dosage: true, sideEffects: false, prevention: false, prices: true
  })
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null)
  const [prescriptionLoading, setPrescriptionLoading] = useState(false)
  const [extractedMedicines, setExtractedMedicines] = useState<ExtractedMedicine[]>([])
  const [ocrNotes, setOcrNotes] = useState<string>('')
  const [ocrConfidence, setOcrConfidence] = useState<'high' | 'medium' | 'low' | null>(null)
  const [ocrError, setOcrError] = useState<string | null>(null)
  const [pricesLoading, setPricesLoading] = useState(false)
  const [sourcesLoading, setSourcesLoading] = useState(false)

  const fetchPriceComparison = useCallback(async (
    medicineName: string,
    fallbackPrices: MedicineData['prices'] = [],
  ) => {
    setPricesLoading(true)

    try {
      const response = await fetch('/api/prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medicineName }),
      })

      if (!response.ok) {
        throw new Error(`Price request failed with status ${response.status}`)
      }

      const data = await response.json() as { prices?: MedicineData['prices'] }
      const nextPrices = data.prices && data.prices.length > 0 ? data.prices : fallbackPrices

      setResult((current) => current ? { ...current, prices: nextPrices } : current)
    } catch (error) {
      console.error('Price comparison failed', error)
      setResult((current) => current ? { ...current, prices: fallbackPrices } : current)
    } finally {
      setPricesLoading(false)
    }
  }, [])

  const fetchSearchSources = useCallback(async (medicineName: string) => {
    setSourcesLoading(true)

    try {
      const response = await fetch('/api/medicine-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medicineName }),
      })

      if (!response.ok) {
        throw new Error(`Source request failed with status ${response.status}`)
      }

      const data = await response.json() as { sources?: MedicineSource[] }
      setResult((current) => current ? { ...current, sources: data.sources ?? [] } : current)
    } catch (error) {
      console.error('Trusted source search failed', error)
      setResult((current) => current ? { ...current, sources: [] } : current)
    } finally {
      setSourcesLoading(false)
    }
  }, [])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(searchBarRef.current,
        { y: 40, opacity: 0, scale: 0.97 },
        { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: 'power3.out', delay: 0.3 }
      )
    })
    return () => ctx.revert()
  }, [])

  const handleSearch = useCallback(async (searchQuery = query) => {
    if (!searchQuery.trim()) return
    setLoading(true)
    setResult(null)
    setNotFound(false)
    setPricesLoading(false)
    setSourcesLoading(false)

    // Simulate API delay
    await new Promise(r => setTimeout(r, 1200))

    const key = searchQuery.toLowerCase().trim()
    const found = Object.keys(MOCK_DB).find(k => key.includes(k) || k.includes(key))

    try {
      if (found) {
        const nextResult: MedicineData = {
          ...MOCK_DB[found],
          source: 'mock',
          cached: true,
        }

        setResult(nextResult)
        void fetchPriceComparison(nextResult.name, nextResult.prices)
        void fetchSearchSources(nextResult.name)
      } else {
        const liveResult = await analyzeMedicine({
          medicineName: searchQuery,
          userId: session?.user?.email ?? undefined,
        })

        const nextResult = createLiveMedicineData(liveResult)
        setResult(nextResult)
        void fetchPriceComparison(nextResult.name)
        void fetchSearchSources(nextResult.name)
      }
    } catch (error) {
      console.error('Medicine search failed', error)
      setNotFound(true)
    }
    setLoading(false)

    // Animate results in
    setTimeout(() => {
      if (resultsRef.current) {
        gsap.fromTo(resultsRef.current,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' }
        )
      }
    }, 50)
  }, [analyzeMedicine, fetchPriceComparison, fetchSearchSources, query, session?.user?.email])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
    if (!validTypes.includes(file.type)) {
      setOcrError('Please upload a JPG, PNG, WebP, or PDF file.')
      return
    }

    setPrescriptionFile(file)
    setPrescriptionLoading(true)
    setExtractedMedicines([])
    setOcrError(null)
    setOcrNotes('')
    setOcrConfidence(null)

    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          const result = reader.result as string
          // Strip the data URL prefix (e.g. "data:image/jpeg;base64,")
          resolve(result.split(',')[1])
        }
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      // Call Gemini Vision API route
      const response = await fetch('/api/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageData: base64,
          mimeType: file.type === 'application/pdf' ? 'application/pdf' : file.type,
        }),
      })

      if (!response.ok) {
        const err = await response.json() as { error?: string }
        throw new Error(err.error ?? `Server error ${response.status}`)
      }

      const data = await response.json() as {
        medicines: ExtractedMedicine[]
        rawText?: string
        confidence?: 'high' | 'medium' | 'low'
        notes?: string
        error?: string
      }

      if (data.error) throw new Error(data.error)

      setExtractedMedicines(data.medicines ?? [])
      setOcrNotes(data.notes ?? '')
      setOcrConfidence(data.confidence ?? 'medium')

      // Animate scanner result in
      setTimeout(() => {
        if (resultsRef.current) {
          gsap.fromTo(resultsRef.current,
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }
          )
        }
      }, 50)

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setOcrError(`Failed to read prescription: ${message}`)
    } finally {
      setPrescriptionLoading(false)
      // Reset input so the same file can be re-uploaded
      e.target.value = ''
    }
  }

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const quickSearches = ['Paracetamol', 'Ibuprofen', 'Amoxicillin', 'Metformin', 'Atorvastatin']

  return (
    <div ref={pageRef} className="min-h-screen bg-cream-50 noise-overlay">
      <Navbar />

      <main className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ===== PAGE HEADER ===== */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="pill bg-sage-100 text-sage-600 mx-auto mb-3">Medicine Database</div>
          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-sage-900 mb-2">
            Search any medicine
          </h1>
          <p className="text-sage-400 text-sm sm:text-base max-w-md mx-auto">
            Get instant drug info, real-time pricing from top pharmacies, and AI-powered insights.
          </p>
        </div>

        {/* ===== SEARCH BAR ===== */}
        <div ref={searchBarRef} className="glass rounded-2xl p-3 sm:p-4 shadow-lg mb-6 max-w-3xl mx-auto">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-xl bg-sage-100 flex items-center justify-center shrink-0">
              <Search size={18} className="text-sage-500" />
            </div>
            <input
              className="flex-1 min-w-0 bg-transparent text-sage-900 placeholder-sage-300 outline-none text-sm sm:text-base"
              placeholder="Search by medicine name (e.g. Paracetamol, Ibuprofenâ€¦)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            {query && (
              <button onClick={() => { setQuery(''); setResult(null); setNotFound(false) }} className="text-sage-300 hover:text-sage-500 transition-colors">
                <X size={16} />
              </button>
            )}
            </div>
            <button
              onClick={() => handleSearch()}
              className="btn-primary w-full sm:w-auto py-2.5 px-5 text-sm"
              disabled={loading}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : 'Search'}
            </button>
          </div>
        </div>

        {/* Quick Search Pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {quickSearches.map((q) => (
            <button
              key={q}
              onClick={() => { setQuery(q); handleSearch(q) }}
              className="pill bg-sage-100 text-sage-600 hover:bg-sage-200 transition-colors cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>

        {/* ===== MAIN CONTENT GRID ===== */}
        <div className="grid lg:grid-cols-3 gap-5 lg:gap-6">

          {/* LEFT COL â€” Results */}
          <div className="lg:col-span-2 space-y-4" ref={resultsRef}>

            {/* Loading State */}
            {loading && (
              <div className="glass rounded-2xl p-12 text-center">
                <div className="flex justify-center gap-2 mb-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="loading-dot w-3 h-3 rounded-full bg-sage-400" />
                  ))}
                </div>
                <p className="text-sage-400 text-sm">Searching medicine databaseâ€¦</p>
              </div>
            )}

            {/* Not Found */}
            {notFound && !loading && (
              <div className="glass rounded-2xl p-10 text-center">
                <Pill size={36} className="text-sage-300 mx-auto mb-3" />
                <h3 className="font-display text-lg font-semibold text-sage-700 mb-2">Medicine not found</h3>
                <p className="text-sage-400 text-sm">Try searching for Paracetamol, Ibuprofen, or Amoxicillin to see a demo.</p>
              </div>
            )}

            {/* Medicine Card */}
            {result && !loading && (
              <div className="space-y-4">

                {/* Header Card */}
                <div className="glass rounded-2xl p-4 sm:p-6 border border-cream-200/60">
                  <div className="flex flex-col-reverse sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="tag bg-sage-100 text-sage-700">{result.category}</span>
                        {result.controlled && <span className="tag bg-orange-100 text-orange-700">Controlled</span>}
                        {result.source && result.source !== 'mock' && (
                          <span className={`tag ${
                            result.source === 'fallback'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {result.source === 'cache'
                              ? 'Cached'
                              : result.source === 'gemini'
                                ? 'AI'
                                : 'Limited data'}
                          </span>
                        )}
                      </div>
                      <h2 className="font-display text-xl sm:text-2xl font-bold text-sage-900 mt-2 break-words">{result.name}</h2>
                      <p className="text-sage-400 text-sm mt-1">Brands: <span className="text-sage-600 font-medium">{result.brand}</span></p>
                    </div>
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-sage-100 flex items-center justify-center shrink-0 self-start">
                      <Pill size={26} className="text-sage-500" />
                    </div>
                  </div>

                  {/* Chemical Formula */}
                  <div className="mt-4 p-3 bg-cream-100 rounded-xl">
                    <div className="flex items-center gap-2">
                      <FlaskConical size={14} className="text-sage-500" />
                      <span className="text-xs text-sage-500 font-semibold uppercase tracking-wide">Chemical Formula</span>
                    </div>
                    <p className="font-mono text-xs sm:text-sm text-sage-700 mt-1 break-all">{result.chemical}</p>
                  </div>

                  {/* Quick stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                    <div className="p-3 rounded-xl bg-cream-50 border border-cream-200">
                      <p className="text-xs text-sage-400 mb-0.5">Adult Dose</p>
                      <p className="text-xs font-semibold text-sage-700">{result.dosage.adult}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-cream-50 border border-cream-200">
                      <p className="text-xs text-sage-400 mb-0.5">Max Daily</p>
                      <p className="text-xs font-semibold text-sage-700">{result.dosage.max}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-cream-50 border border-cream-200">
                      <p className="text-xs text-sage-400 mb-0.5">Pregnancy</p>
                      <p className="text-xs font-semibold text-sage-700 line-clamp-2">{result.pregnancy}</p>
                    </div>
                  </div>
                </div>

                {/* ACCORDION SECTIONS */}
                {[
                  { key: 'uses', icon: Stethoscope, label: 'Uses & Indications', content: result.uses },
                  { key: 'sideEffects', icon: AlertTriangle, label: 'Side Effects', content: result.sideEffects },
                  { key: 'prevention', icon: ShieldCheck, label: 'Precautions & Prevention', content: result.prevention },
                ].map(({ key, icon: Icon, label, content }) => (
                  <div key={key} className="glass rounded-2xl overflow-hidden border border-cream-200/60">
                    <button
                      className="w-full flex items-center justify-between gap-3 p-4 sm:p-5 hover:bg-cream-50/50 transition-colors"
                      onClick={() => toggleSection(key)}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${sectionColors[key]}18` }}>
                          <Icon size={15} style={{ color: sectionColors[key] }} />
                        </div>
                        <span className="font-semibold text-sage-800 text-sm text-left">{label}</span>
                      </div>
                      {openSections[key] ? <ChevronUp size={16} className="text-sage-400" /> : <ChevronDown size={16} className="text-sage-400" />}
                    </button>
                    {openSections[key] && (
                      <div className="px-4 pb-4 sm:px-5 sm:pb-5">
                        <div className="grid sm:grid-cols-2 gap-2">
                          {content.map((item, i) => (
                            <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-cream-50 border border-cream-100">
                              <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: sectionColors[key] }} />
                              <span className="text-sm text-sage-600 leading-relaxed">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {result.timing && result.timing.length > 0 && (
                  <div className="glass rounded-2xl overflow-hidden border border-cream-200/60">
                    <button
                      className="w-full flex items-center justify-between gap-3 p-4 sm:p-5 hover:bg-cream-50/50 transition-colors"
                      onClick={() => toggleSection('timing')}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                          <Clock size={15} className="text-blue-500" />
                        </div>
                        <span className="font-semibold text-sage-800 text-sm text-left">Timing Guidance</span>
                      </div>
                      {openSections.timing ? <ChevronUp size={16} className="text-sage-400" /> : <ChevronDown size={16} className="text-sage-400" />}
                    </button>
                    {openSections.timing && (
                      <div className="px-4 pb-4 sm:px-5 sm:pb-5">
                        <div className="grid sm:grid-cols-2 gap-2">
                          {result.timing.map((item, i) => (
                            <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-cream-50 border border-cream-100">
                              <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 bg-blue-500" />
                              <span className="text-sm text-sage-600 leading-relaxed">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* PRICE COMPARISON */}
                {(pricesLoading || result.prices.length > 0) && (
                  <div className="glass rounded-2xl overflow-hidden border border-cream-200/60">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 sm:p-5">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                          <DollarSign size={15} className="text-amber-600" />
                        </div>
                        <span className="font-semibold text-sage-800 text-sm">Price Comparison</span>
                      </div>
                      <span className="text-xs text-sage-400 flex items-center gap-1 sm:justify-end">
                        <Activity size={11} />
                        Live prices
                      </span>
                    </div>
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5">
                      {pricesLoading ? (
                        <div className="flex items-center gap-2 text-sage-400 py-4">
                          <Loader2 size={14} className="animate-spin" />
                          <span className="text-sm">Fetching current prices from pharmaciesâ€¦</span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {result.prices.map((p, i) => (
                            <div key={i} className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-3 rounded-xl border ${p.available ? 'bg-white border-cream-200' : 'bg-cream-50 border-cream-100 opacity-60'}`}>
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-8 h-8 rounded-lg bg-sage-100 flex items-center justify-center text-xs font-bold text-sage-600">
                                  {p.store[0]}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-sage-700 break-words">{p.store}</p>
                                  <p className="text-xs text-sage-400">{p.generic ? 'Generic' : 'Branded'} Â· {p.available ? 'In Stock' : 'Out of Stock'}</p>
                                </div>
                              </div>
                              <div className="flex items-center justify-between sm:justify-end gap-3">
                                <span className="font-display text-lg font-bold text-sage-800">{p.price}</span>
                                {p.available && p.url && (
                                  <a
                                    href={p.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-sage-400 hover:text-sage-600 transition-colors"
                                  >
                                    <ExternalLink size={13} />
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                          <p className="text-xs text-sage-300 mt-2 text-center">Prices updated dynamically via pharmacy APIs</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {(sourcesLoading || (result.sources?.length ?? 0) > 0) && (
                  <div className="glass rounded-2xl overflow-hidden border border-cream-200/60">
                    <div className="flex items-start gap-3 p-4 sm:p-5">
                        <div className="w-8 h-8 rounded-lg bg-sage-100 flex items-center justify-center">
                          <Search size={15} className="text-sage-500" />
                        </div>
                        <div className="min-w-0">
                          <span className="font-semibold text-sage-800 text-sm">Trusted Search Sources</span>
                          <p className="text-[11px] text-sage-400 mt-0.5">Curated results powered by Exa</p>
                        </div>
                    </div>
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5">
                      {sourcesLoading ? (
                        <div className="flex items-center gap-2 text-sage-400 py-4">
                          <Loader2 size={14} className="animate-spin" />
                          <span className="text-sm">Finding reliable medicine referencesâ€¦</span>
                        </div>
                      ) : (
                        <div className="grid gap-3">
                          {(result.sources ?? []).map((source, i) => (
                            <a
                              key={`${source.url}-${i}`}
                              href={source.url}
                              target="_blank"
                              rel="noreferrer"
                              className="block rounded-xl border border-cream-200 bg-white/80 p-3 sm:p-4 transition-all hover:border-sage-300 hover:bg-white"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-sage-800 line-clamp-2">{source.title}</p>
                                  <p className="text-xs text-sage-400 mt-1">{source.domain}</p>
                                </div>
                                <ExternalLink size={13} className="text-sage-400 shrink-0 mt-0.5" />
                              </div>
                              {source.snippet && (
                                <p className="text-sm text-sage-500 leading-relaxed mt-3">{source.snippet}</p>
                              )}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Drug Interactions */}
                {result.interactions.length > 0 && (
                  <div className="glass rounded-2xl p-5 border border-orange-200/40 bg-orange-50/30">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle size={15} className="text-orange-500" />
                      <span className="font-semibold text-sage-800 text-sm">Drug Interactions</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {result.interactions.map((drug, i) => (
                        <span key={i} className="tag bg-orange-100 text-orange-700">{drug}</span>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* Empty State */}
            {!result && !loading && !notFound && (
              <div className="glass rounded-2xl p-8 sm:p-14 text-center">
                <div className="blob bg-sage-100 w-20 h-20 sm:w-24 sm:h-24 mx-auto flex items-center justify-center mb-5">
                  <Search size={30} className="text-sage-400" />
                </div>
                <h3 className="font-display text-xl font-semibold text-sage-700 mb-2">Search for a medicine</h3>
                <p className="text-sage-400 text-sm">Type a medicine name to get started.</p>
              </div>
            )}
          </div>

          {/* RIGHT COL â€” Prescription + Dosage Guide */}
          <div className="space-y-5 lg:sticky lg:top-24 self-start">

            {/* Prescription Scanner — Gemini Vision */}
            <div className="glass rounded-2xl p-4 sm:p-5 border border-cream-200/60">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-sage-100 flex items-center justify-center">
                    <ScanLine size={15} className="text-sage-500" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sage-800 text-sm">Prescription Scanner</h3>
                    <p className="text-[10px] text-sage-400">Powered by Gemini Vision AI</p>
                  </div>
                </div>
                {(extractedMedicines.length > 0 || ocrError) && (
                  <button
                    onClick={() => { setPrescriptionFile(null); setExtractedMedicines([]); setOcrError(null); setOcrNotes(""); setOcrConfidence(null) }}
                    className="text-xs text-sage-400 hover:text-sage-600 flex items-center gap-1 transition-colors"
                  >
                    <X size={12} /> Clear
                  </button>
                )}
              </div>

              <label className={`block border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${prescriptionLoading ? "border-sage-300 bg-sage-50/50 cursor-wait" : "border-cream-300 hover:border-sage-300 hover:bg-sage-50/30"}`}>
                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,.pdf" className="hidden" onChange={handleFileUpload} disabled={prescriptionLoading} />
                {prescriptionLoading ? (
                  <div className="py-2">
                    <div className="flex justify-center items-end gap-1 mb-3 h-8">
                      {[14,20,10,26,16,22,12,18].map((h, i) => (
                        <div key={i} className="w-1 rounded-full bg-sage-400 animate-pulse" style={{ height: `${h}px`, animationDelay: `${i * 0.1}s` }} />
                      ))}
                    </div>
                    <p className="text-sm text-sage-600 font-medium">Gemini is reading your prescription...</p>
                    <p className="text-xs text-sage-400 mt-1">Identifying medicines, dosages and instructions</p>
                  </div>
                ) : prescriptionFile && extractedMedicines.length === 0 && !ocrError ? (
                  <div>
                    <FileText size={22} className="text-sage-400 mx-auto mb-2" />
                    <p className="text-sm text-sage-600 font-medium truncate max-w-[180px] mx-auto">{prescriptionFile.name}</p>
                    <p className="text-xs text-sage-400 mt-1">Click to scan a different file</p>
                  </div>
                ) : (
                  <div>
                    <Upload size={22} className="text-sage-300 mx-auto mb-2" />
                    <p className="text-sm text-sage-500 font-medium">Upload Prescription</p>
                    <p className="text-xs text-sage-300 mt-1">JPG, PNG, WebP or PDF</p>
                  </div>
                )}
              </label>

              {ocrError && (
                <div className="mt-3 p-3 bg-red-50 rounded-xl border border-red-200 flex items-start gap-2">
                  <ImageOff size={14} className="text-red-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-600 leading-relaxed">{ocrError}</p>
                </div>
              )}

              {extractedMedicines.length > 0 && (
                <div className="mt-4 space-y-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs font-semibold text-sage-600 uppercase tracking-wide flex items-center gap-1.5">
                      <Sparkles size={11} /> Extracted Medicines
                    </p>
                    {ocrConfidence && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${ocrConfidence === "high" ? "bg-green-100 text-green-700" : ocrConfidence === "medium" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-600"}`}>
                        {ocrConfidence === "high" ? "High confidence" : ocrConfidence === "medium" ? "Medium confidence" : "Low confidence"}
                      </span>
                    )}
                  </div>

                  {extractedMedicines.map((med, i) => (
                    <div key={i} className="p-3 bg-cream-50 rounded-xl border border-cream-200 group">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="w-4 h-4 rounded-full bg-sage-100 flex items-center justify-center shrink-0 text-[10px] font-bold text-sage-600">{i + 1}</span>
                            <p className="text-sm font-semibold text-sage-800 leading-tight">{med.name}</p>
                          </div>
                          {med.dosage && <p className="text-xs text-sage-500 flex items-center gap-1 pl-5"><Pill size={9} className="text-sage-400 shrink-0" /> {med.dosage}</p>}
                          {med.instructions && <p className="text-xs text-sage-400 mt-0.5 pl-5 leading-relaxed">{med.instructions}</p>}
                        </div>
                        <button
                          onClick={() => { const n = med.name.split(" ")[0]; setQuery(n); handleSearch(n) }}
                          className="shrink-0 w-7 h-7 rounded-lg bg-white border border-cream-200 flex items-center justify-center text-sage-400 hover:text-sage-600 hover:border-sage-300 transition-all"
                          title={`Search ${med.name}`}
                        >
                          <ChevronRight size={13} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {ocrNotes && (
                    <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                      <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wide mb-1">Doctor Notes</p>
                      <p className="text-xs text-blue-700 leading-relaxed">{ocrNotes}</p>
                    </div>
                  )}
                  <p className="text-[10px] text-sage-300 text-center pt-1">Click the arrow on any medicine to search its full information</p>
                </div>
              )}

              {!prescriptionLoading && prescriptionFile && extractedMedicines.length === 0 && !ocrError && (
                <div className="mt-3 text-center py-2">
                  <CheckCircle2 size={16} className="text-sage-300 mx-auto mb-1" />
                  <p className="text-xs text-sage-400">No medicines detected. Try a clearer image.</p>
                </div>
              )}
            </div>

            {/* Dosage Guide */}
            <div className="glass rounded-2xl p-4 sm:p-5 border border-cream-200/60">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Clock size={15} className="text-blue-500" />
                </div>
                <h3 className="font-semibold text-sage-800 text-sm">Dosage Guide</h3>
              </div>

              {result ? (
                <div className="space-y-3">
                  {[
                    { label: 'Adult', value: result.dosage.adult },
                    { label: 'Children', value: result.dosage.child },
                    { label: 'Maximum', value: result.dosage.max },
                  ].map(({ label, value }) => (
                    <div key={label} className="p-3 bg-cream-50 rounded-xl">
                      <p className="text-xs text-sage-400 mb-0.5 uppercase tracking-wide font-semibold">{label}</p>
                      <p className="text-sm text-sage-700 font-medium">{value}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-sage-300 text-center py-4">Search a medicine to see dosage details</p>
              )}
            </div>

            {/* Quick Info */}
            <div className="glass rounded-2xl p-4 sm:p-5 border border-cream-200/60">
              <h3 className="font-semibold text-sage-800 text-sm mb-4">How to use</h3>
              {[
                { icon: 'fi-sr-search', text: 'Type or paste a medicine name in the search bar' },
                { icon: 'fi-sr-globe', text: 'Review trusted Exa-powered sources alongside the AI summary' },
                { icon: 'fi-sr-camera', text: 'Upload a prescription image for automatic extraction' },
                { icon: 'fi-sr-pills', text: 'View full drug information, prices, and interactions' },
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-3 mb-3 last:mb-0">
                  <FlaticonIcon icon={tip.icon} className="text-sm shrink-0 text-sage-500 mt-0.5" />
                  <p className="text-xs text-sage-500 leading-relaxed">{tip.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
