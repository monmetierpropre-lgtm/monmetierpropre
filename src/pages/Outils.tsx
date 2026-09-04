import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calculator, Gamepad2, Calendar, Lock, Save, Trash2, Plus, Ruler, Copy, Share2, Square, Box, Minus } from 'lucide-react';
import { showToast } from '@/lib/toast';
import type { AgendaEvent } from '@/types';

type Tool = 'calculatrice' | 'chantier' | 'jeux' | 'agenda' | 'coffre';

export default function Outils() {
  const navigate = useNavigate();
  const [activeTool, setActiveTool] = useState<Tool>('calculatrice');

  const tools: { id: Tool; label: string; icon: typeof Calculator }[] = [
    { id: 'calculatrice', label: 'Calculatrice Devis', icon: Calculator },
    { id: 'chantier', label: 'Pro Chantier', icon: Ruler },
    { id: 'jeux', label: 'Jeux', icon: Gamepad2 },
    { id: 'agenda', label: 'Agenda', icon: Calendar },
    { id: 'coffre', label: 'Coffre Secret', icon: Lock },
  ];

  return (
    <div className="min-h-screen bg-[#0B2E8C] text-white pb-24">
      <header className="sticky top-0 z-40 bg-[#0B2E8C] border-b border-white/10">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate('/')} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-xl font-black">Outils</h1>
        </div>
      </header>

      <div className="px-4 py-4 max-w-md mx-auto">
        {/* Tool selector */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                className={`rounded-2xl p-3 flex flex-col items-center gap-1.5 transition-all ${
                  activeTool === tool.id
                    ? 'bg-[#F97316] shadow-lg scale-105'
                    : 'bg-white/10 hover:bg-white/15'
                }`}
              >
                <Icon size={24} />
                <span className="text-xs font-bold text-center">{tool.label}</span>
              </button>
            );
          })}
        </div>

        {activeTool === 'calculatrice' && <CalculatriceDevis />}
        {activeTool === 'chantier' && <CalculatriceChantier />}
        {activeTool === 'jeux' && <Jeux />}
        {activeTool === 'agenda' && <Agenda />}
        {activeTool === 'coffre' && <CoffreSecret />}
      </div>
    </div>
  );
}

/* ============ CALCULATRICE DEVIS ============ */
function CalculatriceDevis() {
  const [surface, setSurface] = useState('');
  const [prix, setPrix] = useState('');
  const total = (parseFloat(surface) || 0) * (parseFloat(prix) || 0);

  return (
    <div className="bg-white/10 rounded-2xl p-5 space-y-4">
      <h2 className="font-bold text-lg flex items-center gap-2">
        <Calculator size={20} className="text-[#F97316]" />
        Calculatrice de Devis
      </h2>
      <div>
        <label className="block text-sm font-semibold mb-1.5">Surface (m²)</label>
        <input
          type="number"
          value={surface}
          onChange={(e) => setSurface(e.target.value)}
          placeholder="Ex: 50"
          className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-[#F97316]"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1.5">Prix par m² ($)</label>
        <input
          type="number"
          value={prix}
          onChange={(e) => setPrix(e.target.value)}
          placeholder="Ex: 10"
          className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-[#F97316]"
        />
      </div>
      <div className="bg-[#F97316] rounded-2xl p-4 text-center">
        <p className="text-sm text-white/80">Total estimé</p>
        <p className="text-3xl font-black">{total.toFixed(2)} $</p>
      </div>
    </div>
  );
}

/* ============ CALCULATRICE PRO CHANTIER ============ */
type MeasureMode = 'surface' | 'volume' | 'lineaire';
interface MeasureLine {
  id: string;
  longueur: string;
  largeur: string;
  hauteur: string;
}

function CalculatriceChantier() {
  const [mode, setMode] = useState<MeasureMode>('surface');
  const [lines, setLines] = useState<MeasureLine[]>([
    { id: '1', longueur: '', largeur: '', hauteur: '' },
  { id: '2', longueur: '', largeur: '', hauteur: '' },
  { id: '3', longueur: '', largeur: '', hauteur: '' },
  { id: '4', longueur: '', largeur: '', hauteur: '' },
  ]);
  const [result, setResult] = useState<{
    totalSurface: number;
    totalVolume: number;
    perimetre: number;
    carreaux: number | null;
  } | null>(null);
  const [carreauSize, setCarreauSize] = useState('');
  const [useCarrelage, setUseCarrelage] = useState(false);

  const addLine = () => {
    setLines([...lines, { id: Date.now().toString(), longueur: '', largeur: '', hauteur: '' }]);
  };

  const removeLine = (id: string) => {
    setLines(lines.filter((l) => l.id !== id));
  };

  const updateLine = (id: string, field: keyof MeasureLine, value: string) => {
    setLines(lines.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
  };

  const calculate = () => {
    let totalSurface = 0;
    let totalVolume = 0;
    let perimetre = 0;

    for (const line of lines) {
      const L = parseFloat(line.longueur) || 0;
      const l = parseFloat(line.largeur) || 0;
      const h = parseFloat(line.hauteur) || 0;

      totalSurface += L * l;
      totalVolume += L * l * h;
      perimetre += 2 * (L + l);
    }

    let carreaux: number | null = null;
    if (useCarrelage && carreauSize) {
      const [cw, ch] = carreauSize.split('x').map((v) => parseFloat(v.trim()) || 0);
      if (cw > 0 && ch > 0) {
        const surfaceCarreau = cw * ch;
        const surfaceTotale = mode === 'surface' ? totalSurface : totalVolume;
        const nbCarreaux = Math.ceil((surfaceTotale / surfaceCarreau) * 1.1);
        carreaux = nbCarreaux;
      }
    }

    setResult({ totalSurface, totalVolume, perimetre, carreaux });
    showToast('Calcul terminé!', 'success');
  };

  const resultText = result
    ? [
        `--- Calculatrice Pro Chantier ---`,
        `Total Surface: ${result.totalSurface.toFixed(2)} m²`,
        `Total Volume: ${result.totalVolume.toFixed(2)} m³`,
        `Périmètre total: ${result.perimetre.toFixed(2)} ml`,
        result.carreaux !== null ? `Carreaux nécessaires (+10%): ${result.carreaux}` : '',
      ].filter(Boolean).join('\n')
    : '';

  const copyResult = () => {
    if (!result) return;
    navigator.clipboard.writeText(resultText);
    showToast('Résultat copié!', 'success');
  };

  const shareWhatsApp = () => {
    if (!result) return;
    window.open(`https://wa.me/?text=${encodeURIComponent(resultText)}`, '_blank', 'noopener');
  };

  const tabs: { id: MeasureMode; label: string; icon: typeof Square }[] = [
    { id: 'surface', label: 'Surface m²', icon: Square },
    { id: 'volume', label: 'Volume m³', icon: Box },
    { id: 'lineaire', label: 'Linéaire ml', icon: Minus },
  ];

  return (
    <div className="bg-gray-900 rounded-2xl p-5 space-y-4 border border-white/10">
      <h2 className="font-bold text-lg flex items-center gap-2 text-green-400">
        <Ruler size={20} />
        Calculatrice Pro Chantier
      </h2>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setMode(tab.id)}
              className={`rounded-xl py-2.5 px-1 flex flex-col items-center gap-1 transition-all ${
                mode === tab.id ? 'bg-green-600 shadow-lg scale-105' : 'bg-white/10 hover:bg-white/15'
              }`}
            >
              <Icon size={18} />
              <span className="text-xs font-bold text-center">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Lines */}
      <div className="space-y-3">
        {lines.map((line, idx) => (
          <div key={line.id} className="bg-white/5 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white/50">Mesure {idx + 1}</span>
              {lines.length > 1 && (
                <button onClick={() => removeLine(line.id)} className="text-red-400 hover:text-red-300">
                  <Trash2 size={16} />
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-white/60 mb-1">Longueur (m)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={line.longueur}
                  onChange={(e) => updateLine(line.id, 'longueur', e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-gray-800 border border-white/20 rounded-lg px-3 py-2 text-white text-lg font-bold placeholder-white/30 focus:outline-none focus:border-green-500"
                />
              </div>
              {mode !== 'lineaire' && (
                <div>
                  <label className="block text-xs text-white/60 mb-1">Largeur (m)</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={line.largeur}
                    onChange={(e) => updateLine(line.id, 'largeur', e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-gray-800 border border-white/20 rounded-lg px-3 py-2 text-white text-lg font-bold placeholder-white/30 focus:outline-none focus:border-green-500"
                  />
                </div>
              )}
            </div>
            {mode === 'volume' && (
              <div>
                <label className="block text-xs text-white/60 mb-1">Hauteur (m)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={line.hauteur}
                  onChange={(e) => updateLine(line.id, 'hauteur', e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-gray-800 border border-white/20 rounded-lg px-3 py-2 text-white text-lg font-bold placeholder-white/30 focus:outline-none focus:border-green-500"
                />
              </div>
            )}
            {mode === 'lineaire' && (
              <p className="text-xs text-green-400 font-semibold">
                = {(parseFloat(line.longueur) || 0).toFixed(2)} ml
              </p>
            )}
            {mode === 'surface' && (
              <p className="text-xs text-green-400 font-semibold">
                = {((parseFloat(line.longueur) || 0) * (parseFloat(line.largeur) || 0)).toFixed(2)} m²
              </p>
            )}
            {mode === 'volume' && (
              <p className="text-xs text-green-400 font-semibold">
                = {((parseFloat(line.longueur) || 0) * (parseFloat(line.largeur) || 0) * (parseFloat(line.hauteur) || 0)).toFixed(2)} m³
              </p>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={addLine}
        className="w-full bg-white/10 hover:bg-white/15 rounded-xl py-2.5 font-bold text-sm flex items-center justify-center gap-2 transition-colors"
      >
        <Plus size={18} />
        Ajouter une mesure
      </button>

      {/* Carrelage option */}
      <div className="bg-white/5 rounded-xl p-3 space-y-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={useCarrelage}
            onChange={(e) => setUseCarrelage(e.target.checked)}
            className="w-4 h-4 accent-green-600"
          />
          <span className="text-sm font-semibold">Mode Carreleur (calcul de carreaux)</span>
        </label>
        {useCarrelage && (
          <input
            type="text"
            value={carreauSize}
            onChange={(e) => setCarreauSize(e.target.value)}
            placeholder="Ex: 0.6x0.6"
            className="w-full bg-gray-800 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:border-green-500"
          />
        )}
      </div>

      {/* Calculate button */}
      <button
        onClick={calculate}
        className="w-full bg-green-600 hover:bg-green-700 rounded-2xl py-4 font-black text-lg shadow-lg active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
      >
        <Calculator size={22} />
        Calculer le total
      </button>

      {/* Results */}
      {result && (
        <div className="bg-green-900/40 border border-green-500/30 rounded-2xl p-5 space-y-3 animate-[scaleIn_0.3s_ease-out]">
          <h3 className="font-bold text-green-400 text-center text-sm uppercase tracking-wider">Résultats</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-800 rounded-xl p-3 text-center">
              <p className="text-xs text-white/60">Total m²</p>
              <p className="text-2xl font-black text-green-400">{result.totalSurface.toFixed(2)}</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-3 text-center">
              <p className="text-xs text-white/60">Total m³</p>
              <p className="text-2xl font-black text-green-400">{result.totalVolume.toFixed(2)}</p>
            </div>
          </div>
          <div className="bg-gray-800 rounded-xl p-3 text-center">
            <p className="text-xs text-white/60">Périmètre total (plinthes)</p>
            <p className="text-2xl font-black text-green-400">{result.perimetre.toFixed(2)} ml</p>
          </div>
          {result.carreaux !== null && (
            <div className="bg-green-600 rounded-xl p-3 text-center">
              <p className="text-xs text-white/80">Carreaux nécessaires (+10% perte)</p>
              <p className="text-3xl font-black text-white">{result.carreaux}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={copyResult}
              className="bg-white/10 hover:bg-white/15 rounded-xl py-2.5 font-bold text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <Copy size={16} />
              Copier
            </button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(resultText)}`}
              target="_blank"
              rel="noopener"
              onClick={(e) => { e.preventDefault(); shareWhatsApp(); }}
              className="bg-green-600 hover:bg-green-700 rounded-xl py-2.5 font-bold text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <Share2 size={16} />
              WhatsApp
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============ JEUX ============ */
function Jeux() {
  const [activeGame, setActiveGame] = useState<string | null>(null);

  const games = [
    { id: 'briques', label: 'Blocs Briques' },
    { id: 'carrelage', label: 'Carrelage Puzzle' },
    { id: 'plomberie', label: 'Plomberie Connect' },
    { id: 'tetris', label: 'Tetris' },
    { id: 'electrique', label: 'Électrique' },
    { id: 'comptage', label: 'Comptage' },
  ];

  if (activeGame === 'briques') return <BriquesGame onBack={() => setActiveGame(null)} />;
  if (activeGame === 'carrelage') return <CarrelageGame onBack={() => setActiveGame(null)} />;
  if (activeGame === 'plomberie') return <PlomberieGame onBack={() => setActiveGame(null)} />;
  if (activeGame === 'tetris') return <TetrisGame onBack={() => setActiveGame(null)} />;
  if (activeGame === 'electrique') return <ElectriqueGame onBack={() => setActiveGame(null)} />;
  if (activeGame === 'comptage') return <ComptageGame onBack={() => setActiveGame(null)} />;

  return (
    <div className="bg-white/10 rounded-2xl p-5">
      <h2 className="font-bold text-lg flex items-center gap-2 mb-4">
        <Gamepad2 size={20} className="text-[#F97316]" />
        Jeux
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {games.map((game) => (
          <button
            key={game.id}
            onClick={() => setActiveGame(game.id)}
            className="bg-white/10 hover:bg-[#F97316] rounded-2xl p-4 text-center font-bold text-sm transition-all active:scale-95"
          >
            {game.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* --- Briques game --- */
function BriquesGame({ onBack }: { onBack: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [running, setRunning] = useState(true);
  const stateRef = useRef({
    paddleX: 150,
    ballX: 200,
    ballY: 300,
    ballDX: 3,
    ballDY: -3,
    bricks: [] as { x: number; y: number; alive: boolean }[],
    score: 0,
    lives: 3,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const PADDLE_W = 80;
    const PADDLE_H = 12;
    const BRICK_W = 38;
    const BRICK_H = 14;
    const BRICK_COLS = 8;
    const BRICK_ROWS = 4;

    const s = stateRef.current;
    s.bricks = [];
    for (let r = 0; r < BRICK_ROWS; r++) {
      for (let c = 0; c < BRICK_COLS; c++) {
        s.bricks.push({ x: 10 + c * (BRICK_W + 4), y: 30 + r * (BRICK_H + 4), alive: true });
      }
    }

    let raf = 0;

    const handleTouch = (clientX: number) => {
      const rect = canvas.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * W;
      s.paddleX = Math.max(0, Math.min(W - PADDLE_W, x - PADDLE_W / 2));
    };

    const onTouch = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches[0]) handleTouch(e.touches[0].clientX);
    };
    const onMouse = (e: MouseEvent) => handleTouch(e.clientX);

    canvas.addEventListener('touchmove', onTouch, { passive: false });
    canvas.addEventListener('mousemove', onMouse);

    const loop = () => {
      if (!stateRef.current.lives || stateRef.current.lives <= 0) {
        setRunning(false);
        return;
      }

      ctx.fillStyle = '#1E345D';
      ctx.fillRect(0, 0, W, H);

      // bricks
      let aliveCount = 0;
      s.bricks.forEach((b) => {
        if (b.alive) {
          aliveCount++;
          ctx.fillStyle = '#F97316';
          ctx.fillRect(b.x, b.y, BRICK_W, BRICK_H);
        }
      });
      if (aliveCount === 0) {
        setRunning(false);
        showToast('Vous avez gagné!', 'success');
        return;
      }

      // paddle
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(s.paddleX, H - 20, PADDLE_W, PADDLE_H);

      // ball
      ctx.beginPath();
      ctx.arc(s.ballX, s.ballY, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#60A5FA';
      ctx.fill();

      s.ballX += s.ballDX;
      s.ballY += s.ballDY;

      if (s.ballX < 6 || s.ballX > W - 6) s.ballDX = -s.ballDX;
      if (s.ballY < 6) s.ballDY = -s.ballDY;

      // paddle collision
      if (s.ballY > H - 26 && s.ballY < H - 8 && s.ballX > s.paddleX && s.ballX < s.paddleX + PADDLE_W) {
        s.ballDY = -Math.abs(s.ballDY);
      }

      // bottom
      if (s.ballY > H) {
        stateRef.current.lives--;
        setLives(stateRef.current.lives);
        s.ballX = W / 2;
        s.ballY = H / 2;
        s.ballDX = 3;
        s.ballDY = -3;
      }

      // brick collision
      s.bricks.forEach((b) => {
        if (b.alive && s.ballX > b.x && s.ballX < b.x + BRICK_W && s.ballY > b.y && s.ballY < b.y + BRICK_H) {
          b.alive = false;
          s.ballDY = -s.ballDY;
          stateRef.current.score++;
          setScore(stateRef.current.score);
        }
      });

      raf = requestAnimationFrame(loop);
    };

    if (running) raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener('touchmove', onTouch);
      canvas.removeEventListener('mousemove', onMouse);
    };
  }, [running]);

  return (
    <div className="bg-white/10 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <button onClick={onBack} className="text-sm bg-white/10 rounded-xl px-3 py-1.5 font-bold">← Retour</button>
        <div className="flex gap-3 text-sm font-bold">
          <span>Score: {score}</span>
          <span>Vies: {lives}</span>
        </div>
      </div>
      <canvas ref={canvasRef} width={360} height={400} className="w-full rounded-2xl touch-none" />
      {!running && (
        <button
          onClick={() => {
            stateRef.current = { paddleX: 150, ballX: 200, ballY: 300, ballDX: 3, ballDY: -3, bricks: [], score: 0, lives: 3 };
            setScore(0);
            setLives(3);
            setRunning(true);
          }}
          className="w-full bg-[#F97316] rounded-2xl py-3 font-bold mt-3"
        >
          Recommencer
        </button>
      )}
    </div>
  );
}

/* --- Carrelage puzzle (memory match) --- */
function CarrelageGame({ onBack }: { onBack: () => void }) {
  const colors = ['#F97316', '#3B82F6', '#22C55E', '#EAB308', '#EF4444', '#A855F7'];
  const [cards, setCards] = useState<{ color: string; flipped: boolean; matched: boolean }[]>([]);
  const [flippedIdx, setFlippedIdx] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);

  useEffect(() => {
    const pairs = [...colors, ...colors].sort(() => Math.random() - 0.5);
    setCards(pairs.map((color) => ({ color, flipped: false, matched: false })));
  }, []);

  const handleCard = (idx: number) => {
    if (flippedIdx.length === 2 || cards[idx].flipped || cards[idx].matched) return;
    const newCards = [...cards];
    newCards[idx].flipped = true;
    setCards(newCards);
    const newFlipped = [...flippedIdx, idx];
    setFlippedIdx(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(moves + 1);
      setTimeout(() => {
        const [a, b] = newFlipped;
        const updated = [...newCards];
        if (updated[a].color === updated[b].color) {
          updated[a].matched = true;
          updated[b].matched = true;
          showToast('Paire trouvée!', 'success');
        } else {
          updated[a].flipped = false;
          updated[b].flipped = false;
        }
        setCards(updated);
        setFlippedIdx([]);
      }, 700);
    }
  };

  const won = cards.length > 0 && cards.every((c) => c.matched);

  return (
    <div className="bg-white/10 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <button onClick={onBack} className="text-sm bg-white/10 rounded-xl px-3 py-1.5 font-bold">← Retour</button>
        <span className="text-sm font-bold">Coups: {moves}</span>
      </div>
      {won && <p className="text-center text-[#F97316] font-bold mb-2">🎉 Gagné en {moves} coups!</p>}
      <div className="grid grid-cols-3 gap-2">
        {cards.map((card, i) => (
          <button
            key={i}
            onClick={() => handleCard(i)}
            className="aspect-square rounded-2xl flex items-center justify-center text-2xl font-black transition-all active:scale-95"
            style={{
              background: card.flipped || card.matched ? card.color : '#1E345D',
              opacity: card.matched ? 0.5 : 1,
            }}
          >
            {card.flipped || card.matched ? '✓' : '?'}
          </button>
        ))}
      </div>
    </div>
  );
}

/* --- Plomberie connect (pipe puzzle) --- */
function PlomberieGame({ onBack }: { onBack: () => void }) {
  const [grid, setGrid] = useState<number[]>(Array(9).fill(0));
  const [solved, setSolved] = useState(false);

  const toggle = (idx: number) => {
    const newGrid = [...grid];
    newGrid[idx] = (newGrid[idx] + 1) % 4;
    if (idx % 3 > 0) newGrid[idx - 1] = (newGrid[idx - 1] + 1) % 4;
    if (idx % 3 < 2) newGrid[idx + 1] = (newGrid[idx + 1] + 1) % 4;
    if (idx >= 3) newGrid[idx - 3] = (newGrid[idx - 3] + 1) % 4;
    if (idx < 6) newGrid[idx + 3] = (newGrid[idx + 3] + 1) % 4;
    setGrid(newGrid);
    setSolved(newGrid.every((v) => v === newGrid[0]));
  };

  const symbols = ['⬆', '➡', '⬇', '⬅'];

  return (
    <div className="bg-white/10 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <button onClick={onBack} className="text-sm bg-white/10 rounded-xl px-3 py-1.5 font-bold">← Retour</button>
        <span className="text-sm font-bold">Alignez toutes les flèches</span>
      </div>
      {solved && <p className="text-center text-[#F97316] font-bold mb-2">🎉 Tuyaux connectés!</p>}
      <div className="grid grid-cols-3 gap-2">
        {grid.map((val, i) => (
          <button
            key={i}
            onClick={() => toggle(i)}
            className="aspect-square rounded-2xl bg-[#1E345D] flex items-center justify-center text-3xl font-black active:scale-95 transition-transform hover:bg-[#2A4A7A]"
          >
            {symbols[val]}
          </button>
        ))}
      </div>
    </div>
  );
}

/* --- Tetris (simplified) --- */
function TetrisGame({ onBack }: { onBack: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [running, setRunning] = useState(true);
  const stateRef = useRef({
    grid: Array(20).fill(null).map(() => Array(10).fill(0)),
    piece: { x: 4, y: 0, shape: [[1, 1, 1, 1]] as number[][] },
    dropTime: 0,
    score: 0,
  });

  const shapes = [
    [[1, 1, 1, 1]],
    [[1, 1], [1, 1]],
    [[1, 0], [1, 0], [1, 1]],
    [[0, 1], [0, 1], [1, 1]],
    [[1, 1], [1, 0], [1, 0]],
    [[1, 1], [0, 1], [0, 1]],
    [[1, 1, 1], [0, 1, 0]],
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const COLS = 10;
    const ROWS = 20;
    const CELL = 30;

    const newPiece = () => {
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      stateRef.current.piece = { x: 4, y: 0, shape };
    };

    const checkCollision = (dx: number, dy: number, shape: number[][]) => {
      const { grid, piece } = stateRef.current;
      for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
          if (shape[r][c]) {
            const nx = piece.x + c + dx;
            const ny = piece.y + r + dy;
            if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
            if (ny >= 0 && grid[ny][nx]) return true;
          }
        }
      }
      return false;
    };

    const merge = () => {
      const { grid, piece } = stateRef.current;
      piece.shape.forEach((row, r) => {
        row.forEach((val, c) => {
          if (val && piece.y + r >= 0) {
            grid[piece.y + r][piece.x + c] = 1;
          }
        });
      });
      // clear lines
      for (let r = ROWS - 1; r >= 0; r--) {
        if (grid[r].every((v) => v)) {
          grid.splice(r, 1);
          grid.unshift(Array(COLS).fill(0));
          stateRef.current.score += 10;
          setScore(stateRef.current.score);
          r++;
        }
      }
      if (checkCollision(0, 0, stateRef.current.piece.shape) && stateRef.current.piece.y === 0) {
        setRunning(false);
        showToast('Game Over! Score: ' + stateRef.current.score, 'info');
        return;
      }
      newPiece();
    };

    let lastTime = 0;
    let raf = 0;

    const loop = (time: number) => {
      if (!running) return;
      const delta = time - lastTime;
      lastTime = time;

      const s = stateRef.current;
      ctx.fillStyle = '#1E345D';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // grid
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (s.grid[r][c]) {
            ctx.fillStyle = '#F97316';
            ctx.fillRect(c * CELL, r * CELL, CELL - 1, CELL - 1);
          }
        }
      }

      // piece
      ctx.fillStyle = '#60A5FA';
      s.piece.shape.forEach((row, r) => {
        row.forEach((val, c) => {
          if (val) {
            ctx.fillRect((s.piece.x + c) * CELL, (s.piece.y + r) * CELL, CELL - 1, CELL - 1);
          }
        });
      });

      s.dropTime += delta;
      if (s.dropTime > 500) {
        s.dropTime = 0;
        if (!checkCollision(0, 1, s.piece.shape)) {
          s.piece.y++;
        } else {
          merge();
        }
      }

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);

    const handleKey = (e: KeyboardEvent) => {
      const s = stateRef.current;
      if (e.key === 'ArrowLeft' && !checkCollision(-1, 0, s.piece.shape)) s.piece.x--;
      if (e.key === 'ArrowRight' && !checkCollision(1, 0, s.piece.shape)) s.piece.x++;
      if (e.key === 'ArrowDown' && !checkCollision(0, 1, s.piece.shape)) s.piece.y++;
      if (e.key === 'ArrowUp') {
        const rotated = s.piece.shape[0].map((_, i) => s.piece.shape.map((row) => row[i]).reverse());
        if (!checkCollision(0, 0, rotated)) s.piece.shape = rotated;
      }
    };

    const handleTouch = (dir: string) => {
      const s = stateRef.current;
      if (dir === 'left' && !checkCollision(-1, 0, s.piece.shape)) s.piece.x--;
      if (dir === 'right' && !checkCollision(1, 0, s.piece.shape)) s.piece.x++;
      if (dir === 'down' && !checkCollision(0, 1, s.piece.shape)) s.piece.y++;
      if (dir === 'rotate') {
        const rotated = s.piece.shape[0].map((_, i) => s.piece.shape.map((row) => row[i]).reverse());
        if (!checkCollision(0, 0, rotated)) s.piece.shape = rotated;
      }
    };

    window.addEventListener('keydown', handleKey);
    (window as unknown as { __tetrisTouch?: (dir: string) => void }).__tetrisTouch = handleTouch;

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', handleKey);
    };
  }, [running]);

  return (
    <div className="bg-white/10 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <button onClick={onBack} className="text-sm bg-white/10 rounded-xl px-3 py-1.5 font-bold">← Retour</button>
        <span className="text-sm font-bold">Score: {score}</span>
      </div>
      <canvas ref={canvasRef} width={300} height={600} className="w-full max-w-[300px] mx-auto rounded-2xl touch-none" />
      <div className="grid grid-cols-4 gap-2 mt-3">
        {(['left', 'rotate', 'right', 'down'] as const).map((dir) => (
          <button
            key={dir}
            onClick={() => (window as unknown as { __tetrisTouch?: (dir: string) => void }).__tetrisTouch?.(dir)}
            className="bg-white/15 hover:bg-[#F97316] rounded-xl py-2.5 font-bold text-sm transition-colors"
          >
            {dir === 'left' ? '←' : dir === 'right' ? '→' : dir === 'down' ? '↓' : '↻'}
          </button>
        ))}
      </div>
      {!running && (
        <button
          onClick={() => {
            stateRef.current = { grid: Array(20).fill(null).map(() => Array(10).fill(0)), piece: { x: 4, y: 0, shape: [[1, 1, 1, 1]] }, dropTime: 0, score: 0 };
            setScore(0);
            setRunning(true);
          }}
          className="w-full bg-[#F97316] rounded-2xl py-3 font-bold mt-3"
        >
          Recommencer
        </button>
      )}
    </div>
  );
}

/* --- Électrique (reaction game) --- */
function ElectriqueGame({ onBack }: { onBack: () => void }) {
  const [target, setTarget] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(30);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = () => {
    setScore(0);
    setTime(30);
    setPlaying(true);
    setTarget(Math.floor(Math.random() * 9));
    timerRef.current = setInterval(() => {
      setTime((t) => {
        if (t <= 1) {
          setPlaying(false);
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const hit = (idx: number) => {
    if (!playing || idx !== target) return;
    setScore(score + 1);
    setTarget(Math.floor(Math.random() * 9));
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="bg-white/10 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <button onClick={onBack} className="text-sm bg-white/10 rounded-xl px-3 py-1.5 font-bold">← Retour</button>
        <span className="text-sm font-bold">Score: {score} | Temps: {time}s</span>
      </div>
      {!playing ? (
        <button onClick={start} className="w-full bg-[#F97316] rounded-2xl py-3 font-bold">
          {time === 0 ? `Score final: ${score} - Rejouer` : 'Démarrer'}
        </button>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 9 }).map((_, i) => (
            <button
              key={i}
              onClick={() => hit(i)}
              className={`aspect-square rounded-2xl flex items-center justify-center text-2xl font-black transition-all active:scale-90 ${
                i === target ? 'bg-yellow-400 text-black' : 'bg-[#1E345D]'
              }`}
            >
              {i === target ? '⚡' : ''}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* --- Comptage game --- */
function ComptageGame({ onBack }: { onBack: () => void }) {
  const [count, setCount] = useState(0);
  const [target] = useState(() => Math.floor(Math.random() * 20) + 5);
  const [done, setDone] = useState(false);

  const check = () => {
    if (count === target) {
      showToast('Correct! Bien joué!', 'success');
      setDone(true);
    } else {
      showToast(`Non, il y en avait ${target}`, 'error');
      setDone(true);
    }
  };

  const reset = () => {
    setCount(0);
    setDone(false);
  };

  return (
    <div className="bg-white/10 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <button onClick={onBack} className="text-sm bg-white/10 rounded-xl px-3 py-1.5 font-bold">← Retour</button>
      </div>
      <p className="text-center text-sm mb-3">Comptez les objets. Cible: {target}</p>
      <div className="flex flex-wrap gap-2 justify-center mb-4 min-h-[80px]">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="w-8 h-8 bg-[#F97316] rounded-lg" />
        ))}
      </div>
      <div className="flex gap-2 mb-3">
        <button onClick={() => setCount(Math.max(0, count - 1))} className="flex-1 bg-white/15 rounded-xl py-2.5 font-bold">-</button>
        <button onClick={() => setCount(count + 1)} className="flex-1 bg-white/15 rounded-xl py-2.5 font-bold">+</button>
      </div>
      <p className="text-center font-bold mb-3">Total: {count}</p>
      {!done ? (
        <button onClick={check} className="w-full bg-green-600 rounded-2xl py-3 font-bold">Vérifier</button>
      ) : (
        <button onClick={reset} className="w-full bg-[#F97316] rounded-2xl py-3 font-bold">Recommencer</button>
      )}
    </div>
  );
}

/* ============ AGENDA ============ */
function Agenda() {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [date, setDate] = useState('');
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('mon_agenda');
    if (stored) {
      try {
        setEvents(JSON.parse(stored));
      } catch { /* empty */ }
    }
  }, []);

  const save = (updated: AgendaEvent[]) => {
    setEvents(updated);
    localStorage.setItem('mon_agenda', JSON.stringify(updated));
  };

  const addEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !titre) return;
    const newEvent: AgendaEvent = {
      id: Date.now().toString(),
      date,
      titre,
      description,
      createdAt: Date.now(),
    };
    save([newEvent, ...events]);
    setDate('');
    setTitre('');
    setDescription('');
    showToast('Événement ajouté!', 'success');
  };

  const deleteEvent = (id: string) => {
    save(events.filter((e) => e.id !== id));
    showToast('Événement supprimé', 'info');
  };

  const sorted = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="bg-white/10 rounded-2xl p-5 space-y-4">
      <h2 className="font-bold text-lg flex items-center gap-2">
        <Calendar size={20} className="text-[#F97316]" />
        Mon Agenda
      </h2>
      <form onSubmit={addEvent} className="space-y-3">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-[#F97316]"
        />
        <input
          type="text"
          placeholder="Titre"
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-[#F97316]"
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-[#F97316]"
        />
        <button type="submit" className="w-full bg-green-600 rounded-2xl py-3 font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
          <Plus size={18} />
          Ajouter
        </button>
      </form>

      <div className="space-y-2">
        {sorted.length === 0 ? (
          <p className="text-center text-white/50 text-sm py-4">Aucun événement</p>
        ) : (
          sorted.map((event) => (
            <div key={event.id} className="bg-white/5 rounded-2xl p-3 flex items-start gap-3">
              <div className="flex-1">
                <p className="font-bold text-sm">{event.titre}</p>
                <p className="text-xs text-white/60">{new Date(event.date).toLocaleDateString('fr-FR')}</p>
                {event.description && <p className="text-xs text-white/50 mt-1">{event.description}</p>}
              </div>
              <button onClick={() => deleteEvent(event.id)} className="text-red-400 hover:text-red-300">
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ============ COFFRE SECRET ============ */
function CoffreSecret() {
  const [unlocked, setUnlocked] = useState(false);
  const [code, setCode] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('coffre_code')) {
      localStorage.setItem('coffre_code', '0000');
    }
    const savedNotes = localStorage.getItem('coffre_notes');
    if (savedNotes) setNotes(savedNotes);
  }, []);

  const tryUnlock = () => {
    const savedCode = localStorage.getItem('coffre_code') || '0000';
    if (code === savedCode) {
      setUnlocked(true);
      setError(false);
      showToast('Coffre déverrouillé!', 'success');
    } else {
      setError(true);
      showToast('Code incorrect', 'error');
    }
  };

  const saveNotes = () => {
    localStorage.setItem('coffre_notes', notes);
    showToast('Notes sauvegardées!', 'success');
  };

  const changeCode = (newCode: string) => {
    if (/^\d{0,4}$/.test(newCode)) {
      setCode(newCode);
      setError(false);
    }
  };

  if (!unlocked) {
    return (
      <div className="bg-white/10 rounded-2xl p-5 space-y-4">
        <h2 className="font-bold text-lg flex items-center gap-2">
          <Lock size={20} className="text-[#F97316]" />
          Coffre Secret
        </h2>
        <p className="text-sm text-white/60">Entrez votre code à 4 chiffres</p>
        <input
          type="password"
          inputMode="numeric"
          maxLength={4}
          value={code}
          onChange={(e) => changeCode(e.target.value)}
          placeholder="****"
          className={`w-full bg-white/10 border rounded-2xl px-4 py-3 text-white text-center text-2xl tracking-widest focus:outline-none transition-colors ${
            error ? 'border-red-500' : 'border-white/20 focus:border-[#F97316]'
          }`}
        />
        <button onClick={tryUnlock} className="w-full bg-[#F97316] rounded-2xl py-3 font-bold active:scale-[0.98] transition-transform">
          Déverrouiller
        </button>
        <p className="text-xs text-white/40 text-center">Code par défaut: 0000</p>
      </div>
    );
  }

  return (
    <div className="bg-white/10 rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-lg flex items-center gap-2">
          <Lock size={20} className="text-green-400" />
          Coffre Secret
        </h2>
        <button onClick={() => setUnlocked(false)} className="text-sm bg-white/10 rounded-xl px-3 py-1.5 font-bold">
          Verrouiller
        </button>
      </div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={10}
        placeholder="Vos notes secrètes..."
        className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-[#F97316] resize-none"
      />
      <button onClick={saveNotes} className="w-full bg-green-600 rounded-2xl py-3 font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
        <Save size={18} />
        Sauvegarder
      </button>
    </div>
  );
}
