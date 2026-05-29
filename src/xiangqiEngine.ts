import {
  chooseAiMove,
  findPiece,
  getLegalMoves,
  getPieceAt,
  hasPoint,
  isCheckmate,
  isInCheck,
  movePiece,
  opposite,
} from './game.js';
import type { Move, Piece, PieceKind, Position, Side } from './game.js';

export type EngineBestMoveProvider = (
  fen: string,
  options: { movetimeMs: number; timeoutMs: number },
) => Promise<string | null>;

export type ChooseComputerMoveOptions = {
  turnIndex?: number;
  movetimeMs?: number;
  timeoutMs?: number;
  engine?: EngineBestMoveProvider;
  difficulty?: XiangqiAiDifficulty;
};

export type XiangqiAiDifficulty = 'beginner' | 'advanced' | 'expert';

type XiangqiAiDifficultyConfig = {
  useEngine: boolean;
  movetimeMs: number;
  timeoutMs: number;
  searchDepth: number;
  searchTimeoutMs: number;
};

const DEFAULT_MOVETIME_MS = 600;
const DEFAULT_TIMEOUT_MS = 1800;
const ENGINE_STARTUP_TIMEOUT_MS = 15000;
const DEFAULT_SEARCH_DEPTH = 3;
const DEFAULT_SEARCH_TIMEOUT_MS = 650;
const ENGINE_WORKER_URL = '/pikafish-engine-worker.js';
const CHECKMATE_SCORE = 1_000_000;
const difficultyConfigs: Record<XiangqiAiDifficulty, XiangqiAiDifficultyConfig> = {
  beginner: {
    useEngine: false,
    movetimeMs: 0,
    timeoutMs: 0,
    searchDepth: 1,
    searchTimeoutMs: 80,
  },
  advanced: {
    useEngine: true,
    movetimeMs: 450,
    timeoutMs: 1500,
    searchDepth: 2,
    searchTimeoutMs: 360,
  },
  expert: {
    useEngine: true,
    movetimeMs: 1000,
    timeoutMs: 3000,
    searchDepth: 3,
    searchTimeoutMs: 900,
  },
};

const pieceValues: Record<PieceKind, number> = {
  king: 10000,
  rook: 900,
  cannon: 450,
  horse: 400,
  elephant: 200,
  advisor: 200,
  pawn: 120,
};

const fenPieces: Record<Side, Record<PieceKind, string>> = {
  red: {
    rook: 'R',
    horse: 'N',
    elephant: 'B',
    advisor: 'A',
    king: 'K',
    cannon: 'C',
    pawn: 'P',
  },
  black: {
    rook: 'r',
    horse: 'n',
    elephant: 'b',
    advisor: 'a',
    king: 'k',
    cannon: 'c',
    pawn: 'p',
  },
};

let sharedClient: PikafishEngineClient | null = null;

export function piecesToFen(pieces: Piece[], sideToMove: Side): string {
  const rows: string[] = [];
  for (let y = 0; y < 10; y += 1) {
    let row = '';
    let empty = 0;
    for (let x = 0; x < 9; x += 1) {
      const piece = pieces.find((item) => item.x === x && item.y === y);
      if (!piece) {
        empty += 1;
        continue;
      }
      if (empty > 0) {
        row += empty.toString();
        empty = 0;
      }
      row += fenPieces[piece.side][piece.kind];
    }
    if (empty > 0) row += empty.toString();
    rows.push(row);
  }
  return `${rows.join('/')} ${sideToMove === 'red' ? 'w' : 'b'} - - 0 1`;
}

export function uciBestMoveToMove(
  pieces: Piece[],
  side: Side,
  bestmove: string,
): Pick<Move, 'pieceId' | 'to'> | null {
  const moveText = bestmove.trim().startsWith('bestmove ')
    ? bestmove.trim().split(/\s+/)[1]
    : bestmove.trim().split(/\s+/)[0];
  if (!moveText || moveText === '(none)' || moveText === 'none') return null;

  const match = /^([a-i])([0-9])([a-i])([0-9])/.exec(moveText);
  if (!match) return null;

  const from = uciSquareToPoint(`${match[1]}${match[2]}`);
  const to = uciSquareToPoint(`${match[3]}${match[4]}`);
  const piece = pieces.find((item) => item.side === side && item.x === from.x && item.y === from.y);
  if (!piece) return null;
  if (!hasPoint(getLegalMoves(pieces, piece), to)) return null;

  return { pieceId: piece.id, to };
}

export async function chooseComputerMove(
  pieces: Piece[],
  side: Side,
  options: ChooseComputerMoveOptions = {},
): Promise<Pick<Move, 'pieceId' | 'to'> | null> {
  const turnIndex = options.turnIndex ?? 0;
  const difficulty = options.difficulty ?? 'expert';
  const config = difficultyConfigs[difficulty];
  const fallback = chooseSearchFallbackMove(pieces, side, turnIndex, config.searchDepth, config.searchTimeoutMs)
    ?? (side === 'black' ? chooseAiMove(pieces, turnIndex) : chooseSideFallbackMove(pieces, side));
  if (!config.useEngine) return fallback;

  const engine = options.engine ?? getSharedEngineProvider();

  if (!engine) return fallback;

  try {
    const fen = piecesToFen(pieces, side);
    const timeoutMs = options.timeoutMs ?? config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    const bestmove = await withTimeout(engine(fen, {
      movetimeMs: options.movetimeMs ?? config.movetimeMs ?? DEFAULT_MOVETIME_MS,
      timeoutMs,
    }), timeoutMs);
    if (!bestmove) return fallback;
    return uciBestMoveToMove(pieces, side, bestmove) ?? fallback;
  } catch {
    return fallback;
  }
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T | null> {
  return new Promise((resolve) => {
    const timeout = globalThis.setTimeout(() => resolve(null), timeoutMs);
    promise
      .then((value) => resolve(value))
      .catch(() => resolve(null))
      .finally(() => globalThis.clearTimeout(timeout));
  });
}

export function evaluateComputerPosition(pieces: Piece[], perspective: Side): number {
  const rival = opposite(perspective);
  if (isCheckmate(pieces, perspective)) return -CHECKMATE_SCORE;
  if (isCheckmate(pieces, rival)) return CHECKMATE_SCORE;

  let score = 0;
  pieces.forEach((piece) => {
    const sign = piece.side === perspective ? 1 : -1;
    score += sign * pieceValues[piece.kind];
    score += sign * positionalValue(piece);
  });

  if (isInCheck(pieces, perspective)) score -= 900;
  if (isInCheck(pieces, rival)) score += 900;
  score += (countLegalMoves(pieces, perspective) - countLegalMoves(pieces, rival)) * 6;
  score += (bestCaptureValue(pieces, perspective) - bestCaptureValue(pieces, rival)) * 4;
  return score;
}

function chooseSideFallbackMove(pieces: Piece[], side: Side): Pick<Move, 'pieceId' | 'to'> | null {
  const candidate = pieces
    .filter((piece) => piece.side === side)
    .flatMap((piece) => getLegalMoves(pieces, piece).map((to) => ({ pieceId: piece.id, to })))
    .find((move) => {
      const piece = findPiece(pieces, move.pieceId);
      return Boolean(piece && hasPoint(getLegalMoves(pieces, piece), move.to));
    });
  return candidate ?? null;
}

function chooseSearchFallbackMove(
  pieces: Piece[],
  side: Side,
  turnIndex: number,
  depth = DEFAULT_SEARCH_DEPTH,
  timeoutMs = DEFAULT_SEARCH_TIMEOUT_MS,
): Pick<Move, 'pieceId' | 'to'> | null {
  const deadline = Date.now() + timeoutMs;
  const candidates = generateOrderedMoves(pieces, side, turnIndex);
  if (candidates.length === 0) return null;

  let best = candidates[0];
  let bestScore = -Infinity;
  let alpha = -Infinity;
  for (const candidate of candidates) {
    const score = alphaBeta(
      candidate.nextPieces,
      opposite(side),
      depth - 1,
      alpha,
      Infinity,
      side,
      deadline,
      turnIndex + 1,
    );
    if (score > bestScore) {
      best = candidate;
      bestScore = score;
    }
    alpha = Math.max(alpha, bestScore);
    if (Date.now() >= deadline) break;
  }

  return { pieceId: best.pieceId, to: best.to };
}

function alphaBeta(
  pieces: Piece[],
  sideToMove: Side,
  depth: number,
  alpha: number,
  beta: number,
  perspective: Side,
  deadline: number,
  turnIndex: number,
): number {
  if (Date.now() >= deadline || depth <= 0) return evaluateComputerPosition(pieces, perspective);

  const moves = generateOrderedMoves(pieces, sideToMove, turnIndex, depth >= 2 ? 24 : 18);
  if (moves.length === 0) {
    return sideToMove === perspective ? -CHECKMATE_SCORE + depth : CHECKMATE_SCORE - depth;
  }

  if (sideToMove === perspective) {
    let value = -Infinity;
    for (const move of moves) {
      value = Math.max(value, alphaBeta(move.nextPieces, opposite(sideToMove), depth - 1, alpha, beta, perspective, deadline, turnIndex + 1));
      alpha = Math.max(alpha, value);
      if (alpha >= beta || Date.now() >= deadline) break;
    }
    return value;
  }

  let value = Infinity;
  for (const move of moves) {
    value = Math.min(value, alphaBeta(move.nextPieces, opposite(sideToMove), depth - 1, alpha, beta, perspective, deadline, turnIndex + 1));
    beta = Math.min(beta, value);
    if (alpha >= beta || Date.now() >= deadline) break;
  }
  return value;
}

function generateOrderedMoves(pieces: Piece[], side: Side, turnIndex: number, limit = 32): Array<{
  pieceId: string;
  to: Position;
  piece: Piece;
  captured?: Piece;
  nextPieces: Piece[];
  orderScore: number;
}> {
  return pieces
    .filter((piece) => piece.side === side)
    .flatMap((piece) =>
      getLegalMoves(pieces, piece).map((to) => {
        const captured = getPieceAt(pieces, to);
        const nextPieces = movePiece(pieces, piece.id, to);
        return {
          pieceId: piece.id,
          to,
          piece,
          captured,
          nextPieces,
          orderScore: scoreMoveOrder(pieces, piece, to, captured, nextPieces, turnIndex),
        };
      }),
    )
    .sort((a, b) => b.orderScore - a.orderScore)
    .slice(0, limit);
}

function scoreMoveOrder(
  pieces: Piece[],
  piece: Piece,
  to: Position,
  captured: Piece | undefined,
  nextPieces: Piece[],
  turnIndex: number,
): number {
  const rival = opposite(piece.side);
  const captureScore = captured ? pieceValues[captured.kind] * 12 - pieceValues[piece.kind] : 0;
  const mateScore = isCheckmate(nextPieces, rival) ? CHECKMATE_SCORE : 0;
  const checkScore = isInCheck(nextPieces, rival) ? 8000 : 0;
  const safetyPenalty = isSquareAttacked(nextPieces, to, rival) ? pieceValues[piece.kind] * 3 : 0;
  const replyPenalty = bestCaptureValue(nextPieces, rival) * 2;
  const advance = piece.side === 'black' ? to.y - piece.y : piece.y - to.y;
  const pawnAdvance = piece.kind === 'pawn' ? advance * 80 : 0;
  const center = 4 - Math.abs(4 - to.x);
  return mateScore + checkScore + captureScore + pawnAdvance + center + ((to.x + turnIndex) % 2) - safetyPenalty - replyPenalty;
}

function positionalValue(piece: Piece): number {
  const center = 4 - Math.abs(4 - piece.x);
  if (piece.kind === 'pawn') {
    const crossedRiver = piece.side === 'red' ? piece.y <= 4 : piece.y >= 5;
    const advance = piece.side === 'red' ? 9 - piece.y : piece.y;
    return advance * 18 + (crossedRiver ? 80 + center * 12 : 0);
  }
  if (piece.kind === 'rook') return center * 12;
  if (piece.kind === 'horse') return center * 16 + (piece.y > 0 && piece.y < 9 ? 20 : 0);
  if (piece.kind === 'cannon') return center * 10;
  return 0;
}

function countLegalMoves(pieces: Piece[], side: Side): number {
  return pieces
    .filter((piece) => piece.side === side)
    .reduce((total, piece) => total + getLegalMoves(pieces, piece).length, 0);
}

function bestCaptureValue(pieces: Piece[], side: Side): number {
  let best = 0;
  pieces
    .filter((piece) => piece.side === side)
    .forEach((piece) => {
      getLegalMoves(pieces, piece).forEach((to) => {
        const captured = getPieceAt(pieces, to);
        if (captured && captured.side !== side) best = Math.max(best, pieceValues[captured.kind]);
      });
    });
  return best;
}

function isSquareAttacked(pieces: Piece[], position: Position, attacker: Side): boolean {
  return pieces
    .filter((piece) => piece.side === attacker)
    .some((piece) => getLegalMoves(pieces, piece).some((to) => to.x === position.x && to.y === position.y));
}

function getSharedEngineProvider(): EngineBestMoveProvider | null {
  if (typeof Worker === 'undefined') return null;
  sharedClient ??= new PikafishEngineClient(ENGINE_WORKER_URL);
  return (fen, options) => sharedClient?.getBestMove(fen, options) ?? Promise.resolve(null);
}

function uciSquareToPoint(square: string): Position {
  return {
    x: square.charCodeAt(0) - 'a'.charCodeAt(0),
    y: 9 - Number(square[1]),
  };
}

class PikafishEngineClient {
  private worker: Worker | null = null;
  private ready: Promise<boolean> | null = null;
  private listeners: Array<(line: string) => void> = [];
  private unavailable = false;

  constructor(private readonly workerUrl: string) {}

  async getBestMove(
    fen: string,
    options: { movetimeMs: number; timeoutMs: number },
  ): Promise<string | null> {
    const ready = await withTimeout(this.ensureReady(), options.timeoutMs);
    if (!ready || !this.worker) return null;

    this.post(`fen ${fen}`);
    this.post(`go movetime ${options.movetimeMs}`);
    const line = await this.waitFor((item) => /^bestmove\s+/.test(item), options.timeoutMs);
    return line;
  }

  private ensureReady(): Promise<boolean> {
    if (this.unavailable) return Promise.resolve(false);
    if (this.ready) return this.ready;

    this.ready = new Promise((resolve) => {
      const startWorker = () => {
        try {
          this.worker = new Worker(this.workerUrl);
        } catch {
          this.unavailable = true;
          resolve(false);
          return;
        }

        const timeout = window.setTimeout(() => {
          resolve(false);
        }, ENGINE_STARTUP_TIMEOUT_MS);

        this.worker.addEventListener('message', (event) => {
          const line = normalizeEngineLine(event.data);
          if (!line) return;
          this.listeners.forEach((listener) => listener(line));
        });

        this.worker.addEventListener('error', () => {
          this.unavailable = true;
          window.clearTimeout(timeout);
          resolve(false);
        });

        this.waitFor((line) => line === 'readyok', ENGINE_STARTUP_TIMEOUT_MS).then((line) => {
          window.clearTimeout(timeout);
          resolve(Boolean(line));
        });

        this.post('uci');
        void this.waitFor((line) => line === 'uciok', ENGINE_STARTUP_TIMEOUT_MS).then((line) => {
          if (!line || this.unavailable) return;
          this.post('setoption name Threads value 1');
          this.post('setoption name Hash value 16');
          this.post('isready');
        });
      };

      if (typeof fetch === 'function') {
        fetch(this.workerUrl, { method: 'HEAD', cache: 'no-store' })
          .then((response) => {
            if (!response.ok) {
              this.unavailable = true;
              resolve(false);
              return;
            }
            startWorker();
          })
          .catch(() => {
            this.unavailable = true;
            resolve(false);
          });
        return;
      }

      startWorker();
    });

    return this.ready;
  }

  private post(command: string) {
    this.worker?.postMessage(command);
  }

  private waitFor(predicate: (line: string) => boolean, timeoutMs: number): Promise<string | null> {
    return new Promise((resolve) => {
      const listener = (line: string) => {
        if (!predicate(line)) return;
        cleanup();
        resolve(line);
      };
      const timeout = window.setTimeout(() => {
        cleanup();
        resolve(null);
      }, timeoutMs);
      const cleanup = () => {
        window.clearTimeout(timeout);
        this.listeners = this.listeners.filter((item) => item !== listener);
      };
      this.listeners.push(listener);
    });
  }
}

function normalizeEngineLine(data: unknown): string {
  if (typeof data === 'string') return data.trim();
  if (data && typeof data === 'object') {
    const candidate = data as { line?: unknown; message?: unknown; data?: unknown };
    if (typeof candidate.line === 'string') return candidate.line.trim();
    if (typeof candidate.message === 'string') return candidate.message.trim();
    if (typeof candidate.data === 'string') return candidate.data.trim();
  }
  return '';
}
