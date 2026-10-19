'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const clean = v => typeof v === 'string' ? v.trim() : '';
const MAX_GAMES = 1000;

function splitArgs(line) {
  const out = [];
  let buf = '', quote = false, begun = false, bs = 0;
  for (const ch of `${line || ''}`) {
    if (ch === '\\') {bs++; continue;}
    if (ch === '"') {
      buf += '\\'.repeat(Math.floor(bs / 2));
      if (bs % 2) buf += '"'; else quote = !quote;
      bs = 0; begun = true; continue;
    }
    if (bs) {buf += '\\'.repeat(bs); bs = 0;}
    if (/\s/.test(ch) && !quote) {if (begun) {out.push(buf); buf=''; begun=false;} }
    else {buf += ch; begun=true;}
  }
  if (bs) buf += '\\'.repeat(bs);
  if (quote) throw new Error('Aspas não fechadas nos parâmetros de execução.');
  if (begun) out.push(buf);
  return out;
}

function normalizeGame(g) {
  return {
    id: clean(g.id) || crypto.randomUUID(),
    name: clean(g.name || g.title) || 'Jogo sem título',
    exe: clean(g.exe),
    args: clean(g.args),
    cwd: clean(g.cwd || g.work),
    config: clean(g.config),
    directExe: clean(g.directExe),
    cover: clean(g.cover),
    fps: clean(g.fps),
    playedSeconds: Math.max(0, Number(g.playedSeconds ?? g.played) || 0),
    lastPlayed: clean(g.lastPlayed),
    favorite: Boolean(g.favorite)
  };
}

function suggestDirectExe(exe) {
  if (typeof exe !== 'string' || path.extname(exe).toLowerCase() !== '.exe') return '';
  const base=path.basename(exe);
  if (/^Play /i.test(base)) return '';
  const candidate=path.join(path.dirname(exe),'Play '+base);
  return fs.existsSync(candidate) && fs.statSync(candidate).isFile() ? candidate : '';
}

function importLegacyTSV(text) {
  return text.replace(/^\uFEFF/, '').split(/\r?\n/).filter(Boolean).slice(0, MAX_GAMES).map(line => {
    const [name, exe, args, cwd, config, cover, fps, played] = line.split('\t');
    return normalizeGame({name, exe, args, cwd, config, cover, fps, played});
  }).filter(g => g.exe);
}

class Library {
  constructor(root) {
    this.root = root;
    this.file = path.join(root, 'library.json');
    this.legacy = path.join(root, 'native_library.tsv');
    fs.mkdirSync(root, {recursive: true});
    if (fs.existsSync(this.file)) {
      const parsed = JSON.parse(fs.readFileSync(this.file, 'utf8'));
      this.games = Array.isArray(parsed.games) ? parsed.games.map(normalizeGame).slice(0, MAX_GAMES) : [];
    } else if (fs.existsSync(this.legacy)) {
      this.games = importLegacyTSV(fs.readFileSync(this.legacy, 'utf16le'));
      this.save(); // keep native_library.tsv untouched for rollback
    } else {
      this.games = [];
    }
  }
  list() {return this.games.map(g => ({...g}));}
  save() {
    const temp = `${this.file}.${process.pid}.tmp`;
    fs.writeFileSync(temp, JSON.stringify({schema: 1, games: this.games}, null, 2), 'utf8');
    fs.renameSync(temp, this.file);
  }
  add(exe) {
    if (this.games.length >= MAX_GAMES) throw new Error('Biblioteca cheia.');
    if (!fs.existsSync(exe) || !fs.statSync(exe).isFile() || path.extname(exe).toLowerCase() !== '.exe') throw new Error('Selecione um arquivo .exe válido.');
    const name = path.parse(exe).name.replace(/[_-]/g, ' ');
    const game = normalizeGame({name,exe,cwd:path.dirname(exe),directExe:suggestDirectExe(exe)});
    this.games.push(game); this.save(); return game;
  }
  update(game) {
    const index = this.games.findIndex(g => g.id === game.id);
    if (index < 0) throw new Error('Jogo não encontrado.');
    if (!game.exe || path.extname(game.exe).toLowerCase() !== '.exe' || !fs.existsSync(game.exe)) throw new Error('Caminho do executável inválido.');
    if (game.directExe && (path.extname(game.directExe).toLowerCase() !== '.exe' || !fs.existsSync(game.directExe))) throw new Error('O executável direto precisa ser um .exe existente.');
    this.games[index] = normalizeGame({...this.games[index], ...game});
    this.save(); return this.games[index];
  }
  remove(id) {this.games = this.games.filter(g => g.id !== id); this.save();}
  find(id) {return this.games.find(g => g.id === id);}
}
module.exports = {Library, splitArgs, importLegacyTSV, normalizeGame, suggestDirectExe};
