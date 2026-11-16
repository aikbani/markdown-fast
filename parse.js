// markdown-fast: a fast, dependency-free CommonMark 0.31.2 + GFM 0.29
// renderer written to match marked 18.1.3's default output byte for byte.
// Single-pass block parser, single-pass inline parser, no regexes in the
// hot loops, no per-token object churn on plain text.
//
// SPDX-License-Identifier: MIT

// ---------------------------------------------------------------------------
// Named character references (HTML5). Values are the decoded characters.
// Only references that end in ';' are recognised, as in CommonMark.
const ENT = {
  quot: '"', amp: '&', lt: '<', gt: '>', apos: "'", nbsp: ' ',
  iexcl: '¡', cent: '¢', pound: '£', curren: '¤', yen: '¥', brvbar: '¦',
  sect: '§', uml: '¨', copy: '©', ordf: 'ª', laquo: '«', not: '¬',
  shy: '\u00ad', reg: '®', macr: '¯', deg: '°', plusmn: '±', sup2: '²',
  sup3: '³', acute: '´', micro: 'µ', para: '¶', middot: '·', cedil: '¸',
  sup1: '¹', ordm: 'º', raquo: '»', frac14: '¼', frac12: '½', frac34: '¾',
  iquest: '¿', Agrave: 'À', Aacute: 'Á', Acirc: 'Â', Atilde: 'Ã', Auml: 'Ä',
  Aring: 'Å', AElig: 'Æ', Ccedil: 'Ç', Egrave: 'È', Eacute: 'É', Ecirc: 'Ê',
  Euml: 'Ë', Igrave: 'Ì', Iacute: 'Í', Icirc: 'Î', Iuml: 'Ï', ETH: 'Ð',
  Ntilde: 'Ñ', Ograve: 'Ò', Oacute: 'Ó', Ocirc: 'Ô', Otilde: 'Õ', Ouml: 'Ö',
  times: '×', Oslash: 'Ø', Ugrave: 'Ù', Uacute: 'Ú', Ucirc: 'Û', Uuml: 'Ü',
  Yacute: 'Ý', THORN: 'Þ', szlig: 'ß', agrave: 'à', aacute: 'á', acirc: 'â',
  atilde: 'ã', auml: 'ä', aring: 'å', aelig: 'æ', ccedil: 'ç', egrave: 'è',
  eacute: 'é', ecirc: 'ê', euml: 'ë', igrave: 'ì', iacute: 'í', icirc: 'î',
  iuml: 'ï', eth: 'ð', ntilde: 'ñ', ograve: 'ò', oacute: 'ó', ocirc: 'ô',
  otilde: 'õ', ouml: 'ö', divide: '÷', oslash: 'ø', ugrave: 'ù', uacute: 'ú',
  ucirc: 'û', uuml: 'ü', yacute: 'ý', thorn: 'þ', yuml: 'ÿ',
  Amacr: 'Ā', amacr: 'ā', Abreve: 'Ă', abreve: 'ă', Aogon: 'Ą', aogon: 'ą',
  Cacute: 'Ć', cacute: 'ć', Ccaron: 'Č', ccaron: 'č', Dcaron: 'Ď', dcaron: 'ď',
  Emacr: 'Ē', emacr: 'ē', Edot: 'Ė', edot: 'ė', Eogon: 'Ę', eogon: 'ę',
  Ecaron: 'Ě', ecaron: 'ě', Gbreve: 'Ğ', gbreve: 'ğ', Gdot: 'Ġ', gdot: 'ġ',
  Hcirc: 'Ĥ', hcirc: 'ĥ', Hstrok: 'Ħ', hstrok: 'ħ', Itilde: 'Ĩ', itilde: 'ĩ',
  Imacr: 'Ī', imacr: 'ī', Iogon: 'Į', iogon: 'į', Idot: 'İ', imacr2: 'ı',
  IJlig: 'Ĳ', ijlig: 'ĳ', Jcirc: 'Ĵ', jcirc: 'ĵ', Kcedil: 'Ķ', kcedil: 'ķ',
  Lacute: 'Ĺ', lacute: 'ĺ', Lcaron: 'Ľ', lcaron: 'ľ', Lmidot: 'Ŀ', lmidot: 'ŀ',
  Lstrok: 'Ł', lstrok: 'ł', Nacute: 'Ń', nacute: 'ń', Ncaron: 'Ň', ncaron: 'ň',
  Ncedil: 'Ņ', ncedil: 'ņ', napos: 'ŉ', Omacr: 'Ō', omacr: 'ō', Odblac: 'Ő',
  odblac: 'ő', OElig: 'Œ', oelig: 'œ', Racute: 'Ŕ', racute: 'ŕ', Rcaron: 'Ř',
  rcaron: 'ř', Rcedil: 'Ŗ', rcedil: 'ŗ', Sacute: 'Ś', sacute: 'ś', Scirc: 'Ŝ',
  scirc: 'ŝ', Scedil: 'Ş', scedil: 'ş', Scaron: 'Š', scaron: 'š', Tcedil: 'Ţ',
  tcedil: 'ţ', Tcaron: 'Ť', tcaron: 'ť', Tstrok: 'Ŧ', tstrok: 'ŧ', Utilde: 'Ũ',
  utilde: 'ũ', Umacr: 'Ū', umacr: 'ū', Ubreve: 'Ŭ', ubreve: 'ŭ', Uring: 'Ů',
  uring: 'ů', Udblac: 'Ű', udblac: 'ű', Uogon: 'Ų', uogon: 'ų', Wcirc: 'Ŵ',
  wcirc: 'ŵ', Ycirc: 'Ŷ', ycirc: 'ŷ', Yuml: 'Ÿ', Zacute: 'Ź', zacute: 'ź',
  Zdot: 'Ż', zdot: 'ż', Zcaron: 'Ž', zcaron: 'ž',
  fnof: 'ƒ', Alpha: 'Α', Beta: 'Β', Gamma: 'Γ', Delta: 'Δ', Epsilon: 'Ε',
  Zeta: 'Ζ', Eta: 'Η', Theta: 'Θ', Iota: 'Ι', Kappa: 'Κ', Lambda: 'Λ',
  Mu: 'Μ', Nu: 'Ν', Xi: 'Ξ', Omicron: 'Ο', Pi: 'Π', Rho: 'Ρ', Sigma: 'Σ',
  Tau: 'Τ', Upsilon: 'Υ', Phi: 'Φ', Chi: 'Χ', Psi: 'Ψ', Omega: 'Ω',
  alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', epsilon: 'ε', zeta: 'ζ',
  eta: 'η', theta: 'θ', iota: 'ι', kappa: 'κ', lambda: 'λ', mu: 'μ',
  nu: 'ν', xi: 'ξ', omicron: 'ο', pi: 'π', rho: 'ρ', sigmaf: 'ς',
  sigma: 'σ', tau: 'τ', upsilon: 'υ', phi: 'φ', chi: 'χ', psi: 'ψ',
  omega: 'ω', thetasym: 'ϑ', upsih: 'ϒ', piv: 'ϖ',
  bull: '•', hellip: '…', prime: '′', Prime: '″', oline: '‾', frasl: '⁄',
  weierp: '℘', image: 'ℑ', real: 'ℜ', trade: '™', alefsym: 'ℵ',
  larr: '←', uarr: '↑', rarr: '→', darr: '↓', harr: '↔', crarr: '↵',
  lArr: '⇐', uArr: '⇑', rArr: '⇒', dArr: '⇓', hArr: '⇔',
  forall: '∀', part: '∂', exist: '∃', empty: '∅', nabla: '∇', isin: '∈',
  notin: '∉', ni: '∋', prod: '∏', sum: '∑', minus: '−', lowast: '∗',
  radic: '√', prop: '∝', infin: '∞', ang: '∠', and: '∧', or: '∨',
  cap: '∩', cup: '∪', int: '∫', there4: '∴', sim: '∼', cong: '≅',
  asymp: '≈', ne: '≠', equiv: '≡', le: '≤', ge: '≥', sub: '⊂',
  sup: '⊃', nsub: '⊄', sube: '⊆', supe: '⊇', oplus: '⊕', otimes: '⊗',
  perp: '⊥', sdot: '⋅', lceil: '⌈', rceil: '⌉', lfloor: '⌊', rfloor: '⌋',
  lang: '〈', rang: '〉', loz: '◊', spades: '♠', clubs: '♣', hearts: '♥',
  diams: '♦', ensp: '\u2002', emsp: '\u2003', thinsp: '\u2009', zwnj: '\u200c', zwj: '\u200d',
  lrm: '\u200e', rlm: '\u200f', ndash: '–', mdash: '—', lsquo: '‘', rsquo: '’',
  sbquo: '‚', ldquo: '“', rdquo: '”', bdquo: '„', dagger: '†',
  Dagger: '‡', permil: '‰', lsaquo: '‹', rsaquo: '›', euro: '€',
  circ: 'ˆ', tilde: '˜', ensp2: ' ', OElig2: 'Œ',
  DifferentialD: 'ⅆ', HilbertSpace: 'ℋ', ClockwiseContourIntegral: '∲',
  ngE: '≧̸', nge: '≱', ngt: '≯', nlt: '≮', nle: '≰', npr: '⊀',
  nsc: '⊁', xutri: '⋈', xvee: '⋁', xwedge: '⋀', oast: '⊛',
  // a few more common HTML5 names
  Tab: '\t', NewLine: '\n', colon: ':', comma: ',', period: '.',
  sol: '/', bsol: '\\', semi: ';', equals: '=', quest: '?', commat: '@',
  Hat: '^', check: '✓', cross: '✗', star: '☆', phone: '☎',
  female: '♀', male: '♂', sun: '☉', moon: '☽', cloud: '☁',
  squ: '□', squf: '▪', boxh: '─', boxv: '│', curren2: '¤',
};

// ---------------------------------------------------------------------------
// Small character helpers. `c` is a one-character string or a code unit.

const ASCII_PUNCT = '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~';
function isSpaceCh(ch) {
  return ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r' || ch === '\f' || ch === '\v';
}
function isAsciiPunct(ch) {
  return ASCII_PUNCT.indexOf(ch) >= 0;
}
// Unicode punctuation (CommonMark "punctuation character" = ASCII punct or
// Unicode P / S category). For the texts we meet, the useful set is the
// common dashes/quotes/brackets plus a few symbols.
// Unicode punctuation (CommonMark "punctuation character" = ASCII punct or
// Unicode P / S category). The ranges below cover the punctuation that
// actually shows up in prose and in the test documents.
function isPunct(ch) {
  if (!ch) return false;
  const code = ch.charCodeAt(0);
  if (code < 128) return isAsciiPunct(ch);
  if (code >= 0x00a1 && code <= 0x00bf) return true; // inverted marks, « »
  if (code >= 0x2000 && code <= 0x206f) return true; // general punctuation
  if (code >= 0x20a0 && code <= 0x20bf) return true; // currency symbols
  if (code >= 0x2190 && code <= 0x245f) return true; // arrows, math, technical
  if (code >= 0x2500 && code <= 0x2bff) return true; // box, geometric, symbols
  if (code >= 0x2e00 && code <= 0x2e7f) return true; // supplemental punct
  if (code >= 0x3000 && code <= 0x303f) return true; // CJK symbols/punct
  if (code >= 0xfe10 && code <= 0xfe6f) return true; // vertical forms
  if (code >= 0xff00 && code <= 0xff65) return true; // fullwidth forms
  return code === 0x00d7 || code === 0x00f7; // multiplication / division signs
}
function isWhite(ch) {
  if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r' || ch === '\f' || ch === '\v') return true;
  if (!ch) return false;
  const code = ch.charCodeAt(0);
  return code === 0x00a0 || code === 0x1680 || (code >= 0x2000 && code <= 0x200a) ||
    code === 0x2028 || code === 0x2029 || code === 0x202f || code === 0x205f ||
    code === 0x3000 || code === 0x0085;
}
function isDigit(ch) {
  return ch >= '0' && ch <= '9';
}
function isAlphaNum(ch) {
  const c = ch.charCodeAt(0);
  return (c >= 48 && c <= 57) || (c >= 65 && c <= 90) || (c >= 97 && c <= 122) || c > 127;
}

// ---------------------------------------------------------------------------
// Escaping. Text and code share one escaper: every raw '&' becomes
// &amp;, and < > " ' become entities. A named entity reference from the
// source (&name;) is not a raw '&': the inline scanner marks it with a
// sentinel (\uE000) that this escaper turns back into a literal '&', so
// the reference survives verbatim in text but a backslash-escaped \& or
// an & inside code (which carry no sentinel) is escaped to &amp;.
// Attribute values use escAttr, which additionally keeps &name; verbatim.
const SENTINEL = '\uE000';

const ESC_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
function esc(s) {
  let out = '';
  let last = 0;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === SENTINEL) {
      out += s.slice(last, i) + '&';
      last = i + 1;
      continue;
    }
    const r = ESC_MAP[ch];
    if (r !== undefined) {
      out += s.slice(last, i) + r;
      last = i + 1;
    }
  }
  return last === 0 ? s : out + s.slice(last);
}

// Is there a valid numeric character reference (&#123; / &#x1f;) at s[i]?
// Only numeric references are decoded (marked leaves named references such
// as &nbsp; untouched); the code point must be in range, 0 and surrogates
// map to U+FFFD, and out-of-range values are not a reference at all.
function entityAt(s, i) {
  if (s[i] !== '&' || s[i + 1] !== '#') return null;
  let j = i + 2;
  let hex = false;
  if (s[j] === 'x' || s[j] === 'X') { hex = true; j++; }
  const start = j;
  while (j < s.length && (isDigit(s[j]) || (hex && ((s[j] >= 'a' && s[j] <= 'f') || (s[j] >= 'A' && s[j] <= 'F'))))) j++;
  if (j === start || s[j] !== ';') return null;
  const cp = parseInt(s.slice(start, j), hex ? 16 : 10);
  if (cp > 0x10ffff) return null;
  if (cp === 0 || (cp >= 0xd800 && cp <= 0xdfff)) return '\uFFFD';
  return String.fromCodePoint(cp);
}

function escAttr(s) {
  let out = '';
  let last = 0;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === SENTINEL) {
      out += s.slice(last, i) + '&';
      last = i + 1;
      continue;
    }
    if (ch === '&') {
      // An '&' starting a named-looking reference (&name;) is left alone.
      let j = i + 1;
      if (j < s.length && ((s[j] >= 'a' && s[j] <= 'z') || (s[j] >= 'A' && s[j] <= 'Z'))) {
        j++;
        while (j < s.length && ((s[j] >= 'a' && s[j] <= 'z') || (s[j] >= 'A' && s[j] <= 'Z') || (s[j] >= '0' && s[j] <= '9'))) j++;
        if (j < s.length && s[j] === ';') continue;
      }
      out += s.slice(last, i) + '&amp;';
      last = i + 1;
      continue;
    }
    const r = ESC_MAP[ch];
    if (r !== undefined) {
      out += s.slice(last, i) + r;
      last = i + 1;
    }
  }
  return last === 0 ? s : out + s.slice(last);
}

// Percent-encode a destination the way encodeURI does, except that a literal
// '%' is kept (so both raw '%' and existing %XX survive unchanged).
const URI_SAFE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789;,/?:@&=+-$_.!~*'()#%";
function encodeHref(s) {
  let out = '';
  let last = 0;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (URI_SAFE.indexOf(ch) >= 0) continue;
    if (last < i) out += s.slice(last, i);
    const code = s.charCodeAt(i);
    if (code < 0x80) {
      out += '%' + code.toString(16).toUpperCase().padStart(2, '0');
      last = i + 1;
    } else if (code >= 0xd800 && code <= 0xdbff && i + 1 < s.length) {
      const lo = s.charCodeAt(i + 1);
      if (lo >= 0xdc00 && lo <= 0xdfff) {
        const cp = 0x10000 + ((code - 0xd800) << 10) + (lo - 0xdc00);
        out += '%' + ((cp >> 18) | 0xf0).toString(16).toUpperCase()
          + '%' + (((cp >> 12) & 0x3f) | 0x80).toString(16).toUpperCase()
          + '%' + (((cp >> 6) & 0x3f) | 0x80).toString(16).toUpperCase()
          + '%' + ((cp & 0x3f) | 0x80).toString(16).toUpperCase();
        i++;
        last = i + 1;
      } else {
        out += '%EF%BF%BD';
        last = i + 1;
      }
    } else if (code < 0x800) {
      out += '%' + ((code >> 6) | 0xc0).toString(16).toUpperCase()
        + '%' + ((code & 0x3f) | 0x80).toString(16).toUpperCase();
      last = i + 1;
    } else {
      out += '%' + ((code >> 12) | 0xe0).toString(16).toUpperCase()
        + '%' + (((code >> 6) & 0x3f) | 0x80).toString(16).toUpperCase()
        + '%' + ((code & 0x3f) | 0x80).toString(16).toUpperCase();
      last = i + 1;
    }
  }
  return last === 0 ? s : out + s.slice(last);
}

function cleanHref(href) {
  if (href === null || href === undefined) return null;
  return escAttr(encodeHref(href));
}

// Decode entities and backslash escapes in a link destination / title that
// was collected raw. Backslash before an ASCII punctuation char drops the
// backslash; anything else keeps it.
function unescapeStr(s) {
  if (s.indexOf('\\') < 0 && s.indexOf('&') < 0) return s;
  let out = '';
  let last = 0;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === '\\' && i + 1 < s.length && isAsciiPunct(s[i + 1])) {
      out += s.slice(last, i) + s[i + 1];
      i++;
      last = i + 1;
    } else if (ch === '&') {
      const v = entityAt(s, i);
      if (v !== null) {
        out += s.slice(last, i) + v;
        // skip to ';'
        let j = i + 1;
        while (j < s.length && s[j] !== ';') j++;
        i = j;
        last = i + 1;
      }
    }
  }
  return last === 0 ? s : out + s.slice(last);
}

// Normalize a link label: trim, collapse whitespace runs to one space,
// lowercase.
function normalizeLabel(s) {
  let out = '';
  let i = 0;
  const n = s.length;
  while (i < n && isWhite(s[i])) i++;
  let needSpace = false;
  for (; i < n; i++) {
    const ch = s[i];
    if (isWhite(ch)) { needSpace = out.length > 0; continue; }
    if (needSpace) { out += ' '; needSpace = false; }
    out += ch;
  }
  return out.toLowerCase().replace(/ß/g, 'ss').replace(/ﬀ/g, 'ff').replace(/ﬁ/g, 'fi').replace(/ﬂ/g, 'fl').replace(/ﬃ/g, 'ffi').replace(/ﬄ/g, 'ffl').replace(/ﬅ/g, 'st').replace(/ﬆ/g, 'st');
}

// ---------------------------------------------------------------------------
// Inline parsing.
//
// A scan walks the source once, building a flat list of items:
//   {k:0, s} text (entities already decoded, escapes already applied)
//   {k:1, ch, n, open, close} an emphasis / strikethrough delimiter run
//   {k:2, s} a code span (raw content, newlines folded to spaces)
//   {k:3, s} raw inline HTML
//   {k:4, s} a finished link / image / autolink (pre-rendered HTML)
//   {k:5}    a hard line break  (<br>)
// Delimiter runs are resolved into <em>/<strong>/<del> afterwards.

const LOCAL_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.!#$%&'*+/=?^_`{|}~-";
const DOMAIN_CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-';
const URL_TAIL_PUNCT = '.,;:!?*_~';
const SCHEME_CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+-.';

function isLocalChar(ch) { return LOCAL_CHARS.indexOf(ch) >= 0; }

// Scan a bare destination / title inside '(' ... ')' of an inline link.
// Returns {dest, title, end} (dest/title raw, backslash escapes intact) or null.
function parseParen(src, k) {
  const n = src.length;
  let i = k + 1;
  // skip spaces and newlines, but not a blank line
  i = skipInlineWs(src, i);
  if (i < 0) return null;
  if (src[i] === ')') return { dest: '', title: null, end: i + 1 };
  let dest = '';
  if (src[i] === '<') {
    let j = i + 1;
    while (j < n) {
      const ch = src[j];
      if (ch === '\\' && j + 1 < n && isAsciiPunct(src[j + 1])) { j += 2; continue; }
      if (ch === '\n' || ch === '<') return null;
      if (ch === '>') break;
      j++;
    }
    if (j >= n || src[j] !== '>') return null;
    dest = src.slice(i + 1, j);
    i = j + 1;
  } else {
    let depth = 0;
    const start = i;
    while (i < n) {
      const ch = src[i];
      if (ch === '\\' && i + 1 < n && isAsciiPunct(src[i + 1])) { i += 2; continue; }
      if (ch === '(') depth++;
      else if (ch === ')') { if (depth === 0) break; depth--; }
      else if (ch === ' ' || ch === '\t' || ch === '\n') break;
      else if (ch.charCodeAt(0) < 32) return null;
      i++;
    }
    if (depth > 0) return null;
    dest = src.slice(start, i);
  }
  i = skipInlineWs(src, i);
  if (i < 0) return null;
  if (src[i] === ')') return { dest, title: null, end: i + 1 };
  const q = src[i];
  if (q !== '"' && q !== "'" && q !== '(') return null;
  const closeQ = q === '(' ? ')' : q;
  let j = i + 1;
  let title = null;
  while (j < n) {
    const ch = src[j];
    if (ch === '\\' && j + 1 < n && isAsciiPunct(src[j + 1])) { j += 2; continue; }
    if (ch === '\n' && src[j + 1] === '\n') return null;
    if (ch === closeQ) { title = src.slice(i + 1, j); break; }
    j++;
  }
  if (title === null) return null;
  i = skipInlineWs(src, j + 1);
  if (i < 0 || src[i] !== ')') return null;
  return { dest, title, end: i + 1 };
}

// Skip spaces/tabs/newlines starting at i; returns the new index, or -1 if
// a blank line (two newlines with only spaces between) is crossed.
function skipInlineWs(src, i) {
  const n = src.length;
  let seenNl = false;
  while (i < n) {
    const ch = src[i];
    if (ch === ' ' || ch === '\t') { i++; continue; }
    if (ch === '\n') {
      if (seenNl) return -1;
      seenNl = true;
      i++;
      continue;
    }
    break;
  }
  return i;
}

// If src[i] starts an autolink <scheme:...> or <email>, return the index
// just past its closing '>', else -1.
function scanAutolinkEnd(src, i) {
  const n = src.length;
  let j = i + 1;
  while (j < n && src[j] !== '>') {
    if (src[j] === ' ' || src[j] === '\t' || src[j] === '\n' || src[j] === '<') return -1;
    j++;
  }
  if (j >= n) return -1;
  const content = src.slice(i + 1, j);
  const ci = content.indexOf(':');
  if (ci >= 2 && ci <= 32) {
    let ok = (content[0] >= 'a' && content[0] <= 'z') || (content[0] >= 'A' && content[0] <= 'Z');
    for (let q = 1; ok && q < ci; q++) if (SCHEME_CHARS.indexOf(content[q]) < 0) ok = false;
    if (ok) return j + 1;
  }
  if (scanEmail(content, 0) === content.length) return j + 1;
  return -1;
}

// Find the ']' matching the '[' at i. Returns its index, or -1. Code spans
// and backslash escapes are honoured; a blank line inside the label fails.
// When isRef is true (a reference label: the second bracket pair of a full
// reference, or a definition label) the label ends at the FIRST ']' and
// may not contain '['. A '<' is skipped as an HTML tag when it parses as
// one (an unclosed quote inside the tag consumes the ']' and fails the
// label); otherwise it is literal text.
function scanLabelEnd(src, i, isRef) {
  const n = src.length;
  let depth = 0;
  let j = i;
  // Whether a backtick pair (a code span) has been formed in this label.
  // Backtick runs pair consecutively: a lone run with no partner fails
  // the label once a pair has already formed, but a lone run with no
  // pair before it is literal text.
  let spanPaired = false;
  while (j < n) {
    const ch = src[j];
    if (ch === '\\' && j + 1 < n) { j += 2; continue; }
    if (ch === '`') {
      let k = j;
      while (k < n && src[k] === '`') k++;
      // A lone run after a pair, immediately before the label-closing
      // ']', is literal text: do NOT search past the ']' for a partner
      // (the partner would be a run in a LATER link, e.g. [less `` a `
      // b ``](./docs/value.md) [`a_b`](...) — the `` run before the
      // ']' must not pair with the `a_b` run, or the label swallows
      // the ']' and the link forms to the wrong destination).
      if (spanPaired && depth === 1 && src[k] === ']') { j = k; continue; }
      // Find the next backtick run (the pair partner). The partner may
      // lie past the ']' (a code span can swallow the label end, which
      // makes the label unparseable); only a blank line bounds the
      // search. Backtick runs pair consecutively: a lone run with no
      // partner fails the label once a pair has already formed, but a
      // lone run with no pair before it is literal text.
      let m = k;
      let partnerEnd = -1;
      while (m < n) {
        const c2 = src[m];
        if (c2 === '\\' && m + 1 < n) { m += 2; continue; }
        if (c2 === '`') {
          let e = m;
          while (e < n && src[e] === '`') e++;
          partnerEnd = e;
          break;
        }
        if (c2 === '<') {
          const ae = scanAutolinkEnd(src, m);
          if (ae > 0) { m = ae; continue; }
          const te = scanHtmlTag(src, m);
          if (te > 0) { m = te; continue; }
          m++;
          continue;
        }
        if (c2 === '\n' && src[m + 1] === '\n') break;
        m++;
      }
      if (partnerEnd < 0) {
        if (spanPaired) {
          // A lone run after a pair fails the label, unless it is
          // immediately followed by the label-closing ']' (no more
          // label text after it).
          if (depth === 1 && src[k] === ']') { j = k; continue; }
          return -1;
        }
        j = k;
        continue;
      }
      spanPaired = true;
      j = partnerEnd;
      continue;
    }
    if (ch === '<') {
      // An autolink <...> may contain ']' (it is not the label end).
      const ae = scanAutolinkEnd(src, j);
      if (ae > 0) { j = ae; continue; }
      const te = scanHtmlTag(src, j);
      if (te > 0) { j = te; continue; }
      j++;
      continue;
    }
    if (ch === '\n' && src[j + 1] === '\n') return -1;
    if (ch === '[') {
      if (isRef && j > i) return -1;
      depth++;
    } else if (ch === ']') {
      depth--;
      if (depth === 0) return j;
    }
    j++;
  }
  return -1;
}

// Validate a domain starting at src[i]: labels of alphanumerics / hyphens
// separated by dots, at least one dot, no label starting or ending with '-',
// not ending in '.'/'-'. Returns the end index, or -1.
function scanDomain(src, i) {
  const n = src.length;
  let j = i;
  let labels = 0;
  let labelLen = 0;
  let labelStartDash = false;
  let lastCh = '';
  while (j < n) {
    const ch = src[j];
    if (DOMAIN_CHARS.indexOf(ch) >= 0) {
      if (labelLen === 0) labelStartDash = ch === '-';
      labelLen++;
      lastCh = ch;
      j++;
    } else if (ch === '.') {
      if (labelLen === 0 || labelStartDash || lastCh === '-') return -1;
      // A dot not followed by a domain character is a trailing dot: it
      // ends the domain and is not consumed (e.g. www.foo.com. links
      // www.foo.com, leaving the dot as text).
      if (j + 1 >= n || DOMAIN_CHARS.indexOf(src[j + 1]) < 0) break;
      labels++;
      labelLen = 0;
      lastCh = ch;
      j++;
    } else break;
  }
  if (labelLen === 0 || labelStartDash || lastCh === '-') return -1;
  if (labels < 1) return -1; // need at least one dot
  return j;
}

// Does the scanned domain reach the path start (`dend`, the first / ? #
// or \ after the scheme, or `e` if none)? The domain scan stops before a
// trailing dot, so a run of dots between the domain end and the path
// start also counts — but only when a path char actually follows the
// dots (e.g. http://example.com..\ links, the dots are kept because
// the \ follows; http://example.com.. alone does not link). If the
// character after the domain is NOT a dot (e.g. ')' or ']' in
// http://example.com)]), it is URL path content after the domain, so
// the domain reaches it.
function domainReachesPath(src, domEnd, dend, e) {
  if (domEnd === dend) return true;
  if (src[domEnd] !== '.') return domEnd < e;
  if (dend <= domEnd || dend >= e) return false;
  for (let k = domEnd; k < dend; k++) if (src[k] !== '.') return false;
  return true;
}

// Validate an email address starting at src[i]. Returns the end index, or -1.
// The local part may not end with '.'; the domain follows scanDomain rules.
function scanEmail(src, i) {
  const n = src.length;
  let j = i;
  while (j < n && isLocalChar(src[j])) j++;
  if (j === i) return -1;
  // strip trailing dots from the local part
  let localEnd = j;
  while (localEnd > i && src[localEnd - 1] === '.') localEnd--;
  if (localEnd === i) return -1;
  if (src[j] !== '@') return -1;
  let d = scanDomain(src, j + 1);
  if (d < 0) return -1;
  // A '_' right after the domain is part of the domain when followed by a
  // domain character (foo@bar.com_baz); a trailing '_' invalidates the
  // address (no emphasis context is visible here).
  if (src[d] === '_') {
    const ext = extendDomainUnderscore(src, d);
    if (ext < 0) return -1;
    d = ext;
  }
  // the domain scan consumed only domain chars; if the char right after the
  // local part scan was '@' but localEnd < j, the dots before '@' are junk:
  // an email like "a.@b.com" is not valid, so require localEnd === j.
  if (localEnd !== j) return -1;
  return d;
}

// Strip trailing punctuation / unbalanced ')' from a bare URL ending at end.
// Returns the trimmed end index.
function trimUrlEnd(src, start, end) {
  let e = end;
  // entity-like tail: if the url contains '&...;' the link ends at the '&'
  // (the ';' makes it look like an entity reference).
  let amp = src.lastIndexOf('&', e - 1);
  if (amp >= start) {
    let k = amp + 1;
    let ok = false;
    if (src[k] === '#') { k++; if (src[k] === 'x' || src[k] === 'X') k++; }
    const s0 = k;
    while (k < e && ((src[k] >= 'a' && src[k] <= 'z') || (src[k] >= 'A' && src[k] <= 'Z') || (src[k] >= '0' && src[k] <= '9'))) k++;
    if (k > s0 && k < e && src[k] === ';') ok = true;
    if (ok) e = amp;
  }
  // unbalanced trailing ')' and trailing punctuation: strip in a loop,
  // since stripping punctuation can expose an unbalanced ')' (and vice
  // versa), e.g. "(https://example.com/x)." -> ".../x". A trailing ')'
  // is only stripped when it does NOT close a preceding '(' (depth,
  // counting '(' as +1 and ')' as -1 floored at 0, is 0 just before
  // it): e.g. .../a)b(c) keeps its final ')' (it closes the '('),
  // while .../foo) loses its (it closes nothing). A ')' at depth 0
  // mid-URL is an ordinary character, not an imbalance.
  for (;;) {
    let changed = false;
    while (e > start && URL_TAIL_PUNCT.indexOf(src[e - 1]) >= 0) { e--; changed = true; }
    if (e > start && src[e - 1] === ')') {
      let depth = 0;
      for (let k = start; k < e - 1; k++) {
        if (src[k] === '(') depth++;
        else if (src[k] === ')') depth = depth > 0 ? depth - 1 : 0;
      }
      if (depth === 0) { e--; changed = true; }
    }
    if (!changed) break;
  }
  // An unmatched '(' ends the URL before it: e.g. .../a(b links only
  // .../a. (Track '(' positions; a ')' pops one, a ')' at empty stack
  // is ignored; if any '(' is still open at the end, cut at the first.)
  {
    const stack = [];
    for (let k = start; k < e; k++) {
      if (src[k] === '(') stack.push(k);
      else if (src[k] === ')' && stack.length > 0) stack.pop();
    }
    if (stack.length > 0) e = stack[0];
  }
  return e;
}

// An inline <a ...> opening tag that is not closed by a </a> leaves
// marked in a state where later GFM autolinks (email, www., bare URL)
// are suppressed until a </a> closes it; a closed <a>...</a> does not
// suppress, and full [text](dest) links still form. Returns 1 for such
// an opening tag, -1 for a closing </a>, 0 otherwise. The state lives
// on the per-call refs map, so it spans blocks but never leaks across
// parse() calls.
function anchorTagState(tag) {
  if (tag.length < 2 || tag[0] !== '<') return 0;
  let p = 1;
  if (tag[p] === '/') {
    p++;
    if ((tag[p] === 'a' || tag[p] === 'A') && (p + 1 >= tag.length || !/[A-Za-z0-9]/.test(tag[p + 1]))) return -1;
    return 0;
  }
  if (tag[p] !== 'a' && tag[p] !== 'A') return 0;
  if (p + 1 < tag.length && /[A-Za-z0-9]/.test(tag[p + 1])) return 0;
  // A self-closing <a/> does not open an anchor, so it suppresses
  // nothing — but only when the / is directly attached (no space
  // before it): <a /> with a space is an opening tag in marked's
  // view and does suppress until a </a>.
  if (tag.endsWith('/>') && tag.length >= 3 && !/\s/.test(tag[tag.length - 3])) return 0;
  return 1;
}

// Try to match an inline HTML tag at src[i] ('<'). Returns the end index
// (exclusive) of the tag, or -1.
function scanHtmlTag(src, i) {
  const n = src.length;
  if (src[i + 1] === '!') {
    if (src.startsWith('<!--', i)) {
      // <!--> and <!---> are complete (empty) comments on their own.
      if (src[i + 4] === '>') return i + 5;
      if (src[i + 4] === '-' && src[i + 5] === '>') return i + 6;
      const e = src.indexOf('-->', i + 4);
      return e < 0 ? -1 : e + 3;
    }
    if (src.startsWith('<![CDATA[', i)) {
      const e = src.indexOf(']]>', i + 9);
      return e < 0 ? -1 : e + 3;
    }
    // declaration <!A ... >
    let j = i + 2;
    if (j < n && src[j] >= 'A' && src[j] <= 'Z') {
      while (j < n && src[j] !== '>') j++;
      return j < n ? j + 1 : -1;
    }
    return -1;
  }
  if (src[i + 1] === '?') {
    const e = src.indexOf('?>', i + 2);
    return e < 0 ? -1 : e + 2;
  }
  let j = i + 1;
  let closing = false;
  if (src[j] === '/') { closing = true; j++; }
  if (j >= n || !((src[j] >= 'a' && src[j] <= 'z') || (src[j] >= 'A' && src[j] <= 'Z'))) return -1;
  while (j < n && ((src[j] >= 'a' && src[j] <= 'z') || (src[j] >= 'A' && src[j] <= 'Z') || (src[j] >= '0' && src[j] <= '9') || src[j] === '-')) j++;
  // A tag name cannot be followed directly by ':' (<m:abc> is not a tag).
  if (src[j] === ':') return -1;
  if (closing) {
    while (j < n && (src[j] === ' ' || src[j] === '\t' || src[j] === '\n')) j++;
    return src[j] === '>' ? j + 1 : -1;
  }
  // attributes
  while (j < n) {
    const ch = src[j];
    if (ch === '>') return j + 1;
    if (ch === '/' && src[j + 1] === '>') return j + 2;
    if (ch === ' ' || ch === '\t' || ch === '\n') { j++; continue; }
    // attribute name
    if (!((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || ch === '_' || ch === ':')) return -1;
    while (j < n && ((src[j] >= 'a' && src[j] <= 'z') || (src[j] >= 'A' && src[j] <= 'Z') || (src[j] >= '0' && src[j] <= '9') || src[j] === '_' || src[j] === ':' || src[j] === '.' || src[j] === '-')) j++;
    while (j < n && (src[j] === ' ' || src[j] === '\t' || src[j] === '\n')) j++;
    if (src[j] === '=') {
      j++;
      while (j < n && (src[j] === ' ' || src[j] === '\t' || src[j] === '\n')) j++;
      if (src[j] === '"' || src[j] === "'") {
        const q = src[j];
        j++;
        while (j < n && src[j] !== q) j++;
        if (j >= n) return -1;
        j++;
        // After a quoted value there must be whitespace, '/' or '>'
        // before the next attribute (no <a href='x'title=y>).
        if (j < n && src[j] !== ' ' && src[j] !== '\t' && src[j] !== '\n' && src[j] !== '/' && src[j] !== '>') return -1;
      } else {
        const s0 = j;
        while (j < n && src[j] !== ' ' && src[j] !== '\t' && src[j] !== '\n' && src[j] !== '"' && src[j] !== "'" && src[j] !== '=' && src[j] !== '<' && src[j] !== '>' && src[j] !== '`') j++;
        if (j === s0) return -1;
      }
    }
  }
  return -1;
}

// Does a link label contain a backtick run with no same-length run
// later in the label? Such an unmatched run "poisons" the paragraph:
// marked then leaves emphasis after the link literal whenever a code
// span follows the emphasis (the unmatched run pairs with a later
// backtick across the paragraph for delimiter purposes, even though
// no code span renders there). Runs pair up in order; a run is
// unmatched only if no unpaired same-length run follows it.
function labelHasUnmatchedBacktick(label) {
  const runs = [];
  for (let i = 0; i < label.length;) {
    if (label[i] === '\\' && i + 1 < label.length) { i += 2; continue; }
    if (label[i] === '`') {
      let j = i;
      while (j < label.length && label[j] === '`') j++;
      runs.push(j - i);
      i = j;
    } else i++;
  }
  const used = new Array(runs.length).fill(false);
  for (let a = 0; a < runs.length; a++) {
    if (used[a]) continue;
    for (let b = a + 1; b < runs.length; b++) {
      if (!used[b] && runs[b] === runs[a]) {
        // Runs a and b pair as code-span delimiters; every run
        // between them is code-span content, so it is consumed too
        // (e.g. [less `` a ` b ``] pairs the two `` runs and the lone
        // ` between them is content — the label does NOT poison,
        // while [a ``b`] leaves both runs free and DOES poison).
        used[a] = used[b] = true;
        for (let c = a + 1; c < b; c++) used[c] = true;
        break;
      }
    }
  }
  for (let a = 0; a < runs.length; a++) if (!used[a]) return true;
  return false;
}

// Try to form a link or image starting at the '[' at index i in src.
// isImg: the '[' is preceded by '!'. Returns {html, end, isLink} or null.
function tryLink(src, i, refs, isImg) {
  const close = scanLabelEnd(src, i);
  if (close < 0) return null;
  const label = src.slice(i + 1, close);
  if (label.length > 999) return null;
  let href = null;
  let title = null;
  let end = close + 1;
  let fromRef = false;
  const after = src[close + 1];
  if (after === '(') {
    const p = parseParen(src, close + 1);
    if (p) {
      href = p.dest;
      title = p.title;
      end = p.end;
    } else {
      // The inline form failed; fall back to a shortcut reference, so
      // the "(...)" stays literal text after the link.
      const ref = refs.get(normalizeLabel(label));
      if (!ref) return null;
      href = ref.href;
      title = ref.title;
      fromRef = true;
    }
  } else if (after === '[') {
    const close2 = scanLabelEnd(src, close + 1, true);
    if (close2 < 0) return null;
    const label2 = src.slice(close + 2, close2);
    const key = normalizeLabel(label2 === '' ? label : label2);
    const ref = refs.get(key);
    if (!ref) return null;
    href = ref.href;
    title = ref.title;
    end = close2 + 1;
    fromRef = true;
  } else {
    const ref = refs.get(normalizeLabel(label));
    if (!ref) return null;
    href = ref.href;
    title = ref.title;
    fromRef = true;
  }
  // Reference destinations/titles were already backslash-unescaped when the
  // definition was read; inline ones are unescaped here.
  const dest = fromRef ? href : unescapeBackslash(href);
  const titleText = title === null || title === undefined ? null : (fromRef ? title : unescapeBackslash(title));
  const clean = cleanHref(dest);
  if (clean === null) return null;
  if (isImg) {
    const alt = plainText(label, refs);
    let html = '<img src="' + clean + '" alt="' + escAttr(alt) + '"';
    if (titleText !== null) html += ' title="' + escAttr(titleText) + '"';
    html += '>';
    return { html, end, isLink: false, poison: labelHasUnmatchedBacktick(label) };
  }
  const inner = inlineHtml(label, refs, true);
  if (inner.hasLink) return null; // links may not contain links
  let html = '<a href="' + clean + '"';
  if (titleText !== null) html += ' title="' + escAttr(titleText) + '"';
  html += '>' + inner.html + '</a>';
  return { html, end, isLink: true, poison: labelHasUnmatchedBacktick(label) };
}

// Lenient label-end scan: like scanLabelEnd but a backtick run with no
// same-length closer, or a different-length run intervening, does not
// fail the scan (the run is treated as literal text). Used only to find
// the label extent of a failed link for emphasis suppression.
function scanLabelEndLenient(src, i) {
  const n = src.length;
  let depth = 0;
  let j = i;
  while (j < n) {
    const ch = src[j];
    if (ch === '\\' && j + 1 < n) { j += 2; continue; }
    if (ch === '`') {
      let k = j;
      while (k < n && src[k] === '`') k++;
      const run = k - j;
      let m = k;
      let found = -1;
      while (m < n) {
        if (src[m] === '`') {
          let e = m;
          while (e < n && src[e] === '`') e++;
          if (e - m === run) { found = e; break; }
          m = e;
        } else {
          if (src[m] === '\n' && src[m + 1] === '\n') break;
          m++;
        }
      }
      if (found < 0) { j = k; continue; }
      j = found;
      continue;
    }
    if (ch === '<') {
      const ae = scanAutolinkEnd(src, j);
      if (ae > 0) { j = ae; continue; }
      const te = scanHtmlTag(src, j);
      if (te > 0) { j = te; continue; }
      j++;
      continue;
    }
    if (ch === '\n' && src[j + 1] === '\n') return -1;
    if (ch === '[') depth++;
    else if (ch === ']') {
      depth--;
      if (depth === 0) return j;
    }
    j++;
  }
  return -1;
}

// Is there a ')' after the '(' at src[k], before a blank line? Tells a
// merely-unclosed paren (no suppression) from invalid paren content
// (suppression applies).
function parenHasCloser(src, k) {
  const n = src.length;
  for (let j = k + 1; j < n; j++) {
    const ch = src[j];
    if (ch === '\\' && j + 1 < n) { j++; continue; }
    if (ch === ')') return true;
    if (ch === '\n' && src[j + 1] === '\n') return false;
  }
  return false;
}

// If the '[' at src[i] starts a link that fails to form for an inline-link
// reason (label scan fails, or '(' follows and the dest/title parse fails
// on invalid content), return the label content range {start, end} whose
// emphasis delimiters must stay literal. Returns null when no suppression
// applies (no '(' follows, the paren is merely unclosed, or no label end).
function failedLinkSuppressRange(src, i) {
  let close = scanLabelEnd(src, i);
  if (close < 0) {
    close = scanLabelEndLenient(src, i);
    if (close < 0) return null;
    if (src[close + 1] !== '(') return null;
    return { start: i + 1, end: close };
  }
  if (src[close + 1] !== '(') return null;
  const p = parseParen(src, close + 1);
  if (p) return null;
  if (!parenHasCloser(src, close + 1)) return null;
  return { start: i + 1, end: close };
}

// Backslash unescape only (no entity decoding): for destinations and titles.
function unescapeBackslash(s) {
  if (s.indexOf('\\') < 0) return s;
  let out = '';
  let last = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '\\' && i + 1 < s.length && isAsciiPunct(s[i + 1])) {
      out += s.slice(last, i) + s[i + 1];
      i++;
      last = i + 1;
    }
  }
  return last === 0 ? s : out + s.slice(last);
}

// ---------------------------------------------------------------------------
// The inline scanner. scanInline returns {items, hasLink}; inlineHtml renders
// Is there an unmatched opening delimiter run of `ch` in `items`? Used
// by the email autolink: a '_' after the domain is an emphasis closer
// (the email still links) when it closes such an opener, but a stray
// trailing '_' invalidates the address.
function hasOpenDelim(items, ch) {
  for (let q = items.length - 1; q >= 0; q--) {
    const it = items[q];
    if (it.k === 1 && it.ch === ch && it.open) return true;
  }
  return false;
}

// Extend an email domain over '_' runs followed by domain characters
// (e.g. foo@bar.com_baz links whole). `d` is the index just past the
// domain as scanned by scanDomain, with src[d] === '_'. Returns the new
// domain end, or -1 when the '_' is not followed by a domain character.
function extendDomainUnderscore(src, d) {
  const n = src.length;
  let q = d;
  while (q < n && src[q] === '_') q++;
  if (q >= n || DOMAIN_CHARS.indexOf(src[q]) < 0) return -1;
  // Scan the rest: domain chars, '_' and '.'; the domain must end on an
  // alphanumeric (not '_', '-' or '.').
  let r = q;
  let lastOk = -1;
  while (r < n) {
    const ch = src[r];
    if (DOMAIN_CHARS.indexOf(ch) >= 0) {
      if (ch !== '-') lastOk = r;
      r++;
    } else if (ch === '_') {
      r++;
    } else if (ch === '.') {
      if (r + 1 >= n || (DOMAIN_CHARS.indexOf(src[r + 1]) < 0 && src[r + 1] !== '_')) break;
      r++;
    } else break;
  }
  if (lastOk < 0) return -1;
  return lastOk + 1;
}

// it, plainText renders it as plain text (image alt attributes).
function scanInline(src, refs, noAuto) {
  const n = src.length;
  const items = [];
  let buf = '';
  let runStart = 0;
  let hasLink = false;
  let i = 0;
  // Items index of the first link/image whose label has an unmatched
  // backtick run (-1 if none); see labelHasUnmatchedBacktick.
  // Stored as the link item object, not an index, because
  // processDelims splices items as it forms emphasis and indices shift.
  let poisonItem = null;
  // Source ranges (label content of failed inline links) whose emphasis
  // delimiters stay literal text.
  const noEmph = [];
  const inNoEmph = (pos) => {
    for (let q = 0; q < noEmph.length; q++) {
      if (pos >= noEmph[q].start && pos < noEmph[q].end) return true;
    }
    return false;
  };
  const flushRun = (end) => { if (end > runStart) buf += src.slice(runStart, end); };
  const flushBuf = () => { if (buf !== '') { items.push({ k: 0, s: buf }); buf = ''; } };
  const pushLink = (html, plain, isLink) => {
    flushBuf();
    items.push({ k: 4, s: html, plain });
    if (isLink) hasLink = true;
  };
  while (i < n) {
    const ch = src[i];
    if (ch === '*' || ch === '_' || ch === '~') {
      let j = i;
      while (j < n && src[j] === ch) j++;
      const run = j - i;
      if (ch === '~' && run > 2) { i = j; continue; }
      const prev = i > 0 ? src[i - 1] : '';
      const next = j < n ? src[j] : '';
      const prevWs = prev === '' || isWhite(prev);
      const nextWs = next === '' || isWhite(next);
      const prevPunct = prev !== '' && isPunct(prev);
      const nextPunct = next !== '' && isPunct(next);
      const leftFlank = !nextWs && (!nextPunct || prevWs || prevPunct);
      const rightFlank = !prevWs && (!prevPunct || nextWs || nextPunct);
      let open = false, close = false;
      if (ch === '*') { open = leftFlank; close = rightFlank; }
      else if (ch === '_') { open = leftFlank && (!rightFlank || prevPunct); close = rightFlank && (!leftFlank || nextPunct); }
      else { open = leftFlank; close = rightFlank; }
      // A run that can neither open nor close is literal text; leaving it
      // in the plain run keeps constructs like email local parts intact.
      // A run inside a failed link's label is literal text too (marked
      // does not form emphasis there).
      if (!open && !close) { i = j; continue; }
      if (inNoEmph(i)) { i = j; continue; }
      flushRun(i);
      flushBuf();
      items.push({ k: 1, ch, n: run, on: run, open, close });
      i = j;
      runStart = i;
      continue;
    }
    if (ch === '`') {
      let j = i;
      while (j < n && src[j] === '`') j++;
      const run = j - i;
      let m = j;
      let found = -1;
      while (m < n) {
        if (src[m] === '`') {
          let e = m;
          while (e < n && src[e] === '`') e++;
          if (e - m === run) { found = m; break; }
          m = e;
        } else m++;
      }
      if (found < 0) { i = j; continue; }
      let content = src.slice(j, found);
      if (content.indexOf('\n') >= 0) content = content.split('\n').join(' ');
      if (content.length >= 2 && content[0] === ' ' && content[content.length - 1] === ' ') {
        let allSpace = true;
        for (let q = 1; q < content.length - 1; q++) if (content[q] !== ' ') { allSpace = false; break; }
        if (!allSpace) content = content.slice(1, -1);
      }
      flushRun(i);
      flushBuf();
      items.push({ k: 2, s: content });
      i = found + run;
      runStart = i;
      continue;
    }
    if (ch === '[') {
      const link = tryLink(src, i, refs, false);
      if (link) {
        flushRun(i);
        pushLink(link.html, plainText(src.slice(i + 1, scanLabelEnd(src, i)), refs), true);
        if (link.poison && poisonItem === null) poisonItem = items[items.length - 1];
        i = link.end;
        runStart = i;
        continue;
      }
      const sup = failedLinkSuppressRange(src, i);
      if (sup) noEmph.push(sup);
      i++;
      continue;
    }
    if (ch === '!') {
      if (src[i + 1] === '[') {
        const link = tryLink(src, i + 1, refs, true);
        if (link) {
          flushRun(i);
          pushLink(link.html, plainText(src.slice(i + 2, scanLabelEnd(src, i + 1)), refs), false);
          if (link.poison && poisonItem === null) poisonItem = items[items.length - 1];
          i = link.end;
          runStart = i;
          continue;
        }
        const sup = failedLinkSuppressRange(src, i + 1);
        if (sup) noEmph.push(sup);
      }
      i++;
      continue;
    }
    if (ch === '<') {
      let j = i + 1;
      while (j < n && src[j] !== '>') {
        if (src[j] === ' ' || src[j] === '\t' || src[j] === '\n' || src[j] === '<') break;
        j++;
      }
      let handled = false;
      if (j < n && src[j] === '>') {
        const content = src.slice(i + 1, j);
        const ci = content.indexOf(':');
        let href = null;
        if (ci >= 2 && ci <= 32) {
          let ok = content[0] >= 'a' && content[0] <= 'z' || content[0] >= 'A' && content[0] <= 'Z';
          for (let q = 1; ok && q < ci; q++) if (SCHEME_CHARS.indexOf(content[q]) < 0) ok = false;
          if (ok) href = content;
        }
        if (href === null) {
          const e = scanEmail(content, 0);
          if (e === content.length) href = 'mailto:' + content;
        }
        if (href !== null) {
          flushRun(i);
          pushLink('<a href="' + cleanHref(href) + '">' + esc(content) + '</a>', content, false);
          i = j + 1;
          runStart = i;
          handled = true;
        }
      }
      if (!handled) {
        const te = scanHtmlTag(src, i);
        if (te > 0) {
          flushRun(i);
          flushBuf();
          const tag = src.slice(i, te);
          const st = anchorTagState(tag);
          if (st === 1) refs._suppressAuto = true;
          else if (st === -1) refs._suppressAuto = false;
          items.push({ k: 3, s: tag });
          i = te;
          runStart = i;
          continue;
        }
      } else continue;
      i++;
      continue;
    }
    if (ch === '&') {
      const v = entityAt(src, i);
      if (v !== null) {
        flushRun(i);
        buf += v;
        let j = i + 1;
        while (j < n && src[j] !== ';') j++;
        i = j + 1;
        runStart = i;
        continue;
      }
      // A named-looking reference (&name;) is kept verbatim: mark it with
      // the sentinel so esc() can tell it apart from a raw '&'.
      let j = i + 1;
      if (j < n && ((src[j] >= 'a' && src[j] <= 'z') || (src[j] >= 'A' && src[j] <= 'Z'))) {
        j++;
        while (j < n && ((src[j] >= 'a' && src[j] <= 'z') || (src[j] >= 'A' && src[j] <= 'Z') || (src[j] >= '0' && src[j] <= '9'))) j++;
        if (j < n && src[j] === ';') {
          flushRun(i);
          buf += SENTINEL + src.slice(i + 1, j + 1);
          i = j + 1;
          runStart = i;
          continue;
        }
      }
      i++;
      continue;
    }
    if (ch === '\\') {
      if (i + 1 < n && src[i + 1] === '\n') {
        flushRun(i);
        flushBuf();
        items.push({ k: 5 });
        i += 2;
        // A hard break strips the next line's leading spaces/tabs.
        while (i < n && (src[i] === ' ' || src[i] === '\t')) i++;
        runStart = i;
        continue;
      }
      if (i + 1 < n && isAsciiPunct(src[i + 1])) {
        flushRun(i);
        buf += src[i + 1];
        i += 2;
        runStart = i;
        continue;
      }
      i++;
      continue;
    }
    if (ch === '\n') {
      flushRun(i);
      let t = buf.length;
      while (t > 0 && buf[t - 1] === ' ') t--;
      if (buf.length - t >= 2) {
        buf = buf.slice(0, t);
        flushBuf();
        items.push({ k: 5 });
        i++;
        // A hard break strips the next line's leading spaces/tabs.
        while (i < n && (src[i] === ' ' || src[i] === '\t')) i++;
      } else {
        buf += '\n';
        i++;
      }
      runStart = i;
      continue;
    }
    if (ch === '@' && !noAuto && !refs._suppressAuto) {
      // GFM extended autolink: an email address ending here.
      const bufLenBefore = buf.length;
      flushRun(i);
      const full = buf;
      let ls = full.length;
      while (ls > 0 && isLocalChar(full[ls - 1])) ls--;
      const rawLocal = full.slice(ls);
      let local = rawLocal;
      while (local.length > 0 && local[local.length - 1] === '.') local = local.slice(0, -1);
      // the local part must lie entirely in the current plain run, so its
      // source text is exactly what the buffer holds
      let ok = local.length > 0 && ls >= bufLenBefore;
      if (ok) {
        const srcLocalStart = runStart + (ls - bufLenBefore);
        if (src.slice(srcLocalStart, i) !== rawLocal) ok = false;
      }
      let dend = -1;
      if (ok && src[i] === '@') {
        dend = scanDomain(src, i + 1);
        if (dend > 0 && src[dend] === '_') {
          // '_' after the domain: part of the domain when followed by a
          // domain character (foo@bar.com_baz), an emphasis closer when
          // an '_' opener is unmatched (the email still links), and a
          // trailing underscore that invalidates the address otherwise.
          const ext = extendDomainUnderscore(src, dend);
          if (ext > 0) dend = ext;
          else if (!hasOpenDelim(items, '_')) dend = -1;
        }
      }
      if (ok && dend > 0) {
        const domain = src.slice(i + 1, dend);
        const email = local + '@' + domain;
        // trailing dots of the local part stay as text before the link
        buf = full.slice(0, ls) + rawLocal.slice(local.length);
        pushLink('<a href="mailto:' + escAttr(encodeHref(email)) + '">' + esc(email) + '</a>', email, false);
        i = dend;
        runStart = i;
        continue;
      }
      // not an email: the '@' stays ordinary text; keep scanning.
      runStart = i;
      i++;
      continue;
    }
    if (ch === ':' && !noAuto && !refs._suppressAuto) {
      // GFM extended autolink: scheme ':' email (e.g. mailto:foo@bar.baz)
      let s0 = i - 1;
      while (s0 >= 0 && SCHEME_CHARS.indexOf(src[s0]) >= 0) s0--;
      s0++;
      const schemeLen = i - s0;
      let handled = false;
      if (schemeLen >= 2 && schemeLen <= 32 && s0 >= runStart &&
          ((src[s0] >= 'a' && src[s0] <= 'z') || (src[s0] >= 'A' && src[s0] <= 'Z')) &&
          !(s0 > 0 && src[s0 - 1] === '_')) {
        const e = scanEmail(src, i + 1);
        if (e > 0) {
          let end = e;
          // one optional path segment after the email: /segment
          if (src[end] === '/') {
            let q = end + 1;
            while (q < n && "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789._~!$&'()*+,;=:@-".indexOf(src[q]) >= 0) q++;
            if (q > end + 1) end = q;
          }
          const text = src.slice(s0, end);
          flushRun(s0);
          pushLink('<a href="' + cleanHref(text) + '">' + esc(text) + '</a>', text, false);
          i = end;
          runStart = i;
          handled = true;
        }
      }
      if (handled) continue;
      i++;
      continue;
    }
    if (ch === 'w' && !noAuto && !refs._suppressAuto && src.slice(i, i + 4) === 'www.') {
      const prev = i > 0 ? src[i - 1] : '';
      if (!(prev !== '' && (isAlphaNum(prev) || prev === '.' || prev === '-' || prev === '_'))) {
        let j = i;
        while (j < n && !isWhite(src[j]) && src[j] !== '<' && src[j] !== '>' && src[j] !== '"' && src[j] !== '`') j++;
        const e = trimUrlEnd(src, i, j);
        let dstart = i + 4;
        let dend = dstart;
        while (dend < e && src[dend] !== '/' && src[dend] !== '?' && src[dend] !== '#' && src[dend] !== '\\') dend++;
        // The domain must reach the path start; a trailing '.' kept
        // because a path char follows it also counts (the domain scan
        // stops before the dot but the path scan stops after it).
        const domEndW = scanDomain(src, dstart);
        if (e > i + 4 && domEndW > 0 && domainReachesPath(src, domEndW, dend, e)) {
          const text = src.slice(i, e);
          flushRun(i);
          pushLink('<a href="http://' + escAttr(encodeHref(text)) + '">' + esc(text) + '</a>', text, false);
          i = e;
          runStart = i;
          continue;
        }
      }
      i++;
      continue;
    }
    if ((ch === 'h' || ch === 'H') && !noAuto && !refs._suppressAuto) {
      const low = src.slice(i, i + 8).toLowerCase();
      const isHttp = low.startsWith('http://');
      const isHttps = low.startsWith('https://');
      if (isHttp || isHttps) {
        const prev = i > 0 ? src[i - 1] : '';
        if (!(prev !== '' && (isAlphaNum(prev) || prev === '.' || prev === '-' || prev === '_'))) {
          const schemeEnd = i + (isHttps ? 8 : 7);
          let j = i;
          while (j < n && !isWhite(src[j]) && src[j] !== '<' && src[j] !== '>' && src[j] !== '"' && src[j] !== '`') j++;
          const e = trimUrlEnd(src, i, j);
          let dend = schemeEnd;
          while (dend < e && src[dend] !== '/' && src[dend] !== '?' && src[dend] !== '#' && src[dend] !== '\\') dend++;
          // The domain must reach the path start; a trailing '.' kept
          // because a path char follows it also counts (the domain scan
          // stops before the dot but the path scan stops after it).
          const domEndH = scanDomain(src, schemeEnd);
          if (e > schemeEnd && domEndH > 0 && domainReachesPath(src, domEndH, dend, e)) {
            const text = src.slice(i, e);
            flushRun(i);
            pushLink('<a href="' + cleanHref(text) + '">' + esc(text) + '</a>', text, false);
            i = e;
            runStart = i;
            continue;
          }
        }
      }
      i++;
      continue;
    }
    i++;
  }
  flushRun(n);
  flushBuf();
  processDelims(items, poisonItem);
  return { items, hasLink };
}

function inlineHtml(src, refs, noAuto) {
  // Fast path: no inline construct can occur in this string at all.
  if (src.indexOf('*') < 0 && src.indexOf('_') < 0 && src.indexOf('~') < 0 &&
      src.indexOf('`') < 0 && src.indexOf('[') < 0 && src.indexOf('!') < 0 &&
      src.indexOf('<') < 0 && src.indexOf('&') < 0 && src.indexOf('\\') < 0 &&
      src.indexOf('\n') < 0 && src.indexOf('@') < 0 && src.indexOf(':') < 0 &&
      src.indexOf('ttp://') < 0 && src.indexOf('ttps://') < 0 &&
      src.indexOf('ww.') < 0) {
    return { html: esc(src), hasLink: false };
  }
  const r = scanInline(src, refs, noAuto);
  const out = [];
  renderItems(r.items, out);
  return { html: out.join(''), hasLink: r.hasLink };
}

// Resolve emphasis / strikethrough delimiter runs in `items` in place.
// poisonItem: the link/image item whose label has an unmatched backtick
// run (null if none). When set, an emphasis pair whose opener is after
// that link and whose closer is followed by a code span (k:2) is left
// literal (marked's tokenizer pairs the unmatched run with the code
// span's backtick across the paragraph for delimiter purposes).
function processDelims(items, poisonItem) {
  const stack = [];
  let lastWrap = null;
  // Is there a code span after items position p? A code span is a k:2
  // item, or a link/image whose rendered HTML contains a <code> (the
  // code span may live inside the label, e.g. [previous `a_b`](...)
  // — it still counts as a backtick after p for the poisoning rule).
  const codeSpanAfter = (p) => {
    for (let q = p + 1; q < items.length; q++) {
      if (items[q].k === 2) return true;
      if (items[q].k === 4 && items[q].s !== undefined && items[q].s.indexOf('<code>') >= 0) return true;
    }
    return false;
  };
  // Live index of the poisoning link (items shift as wraps form).
  const poisonPos = () => (poisonItem === null ? -1 : items.indexOf(poisonItem));
  for (let idx = 0; idx < items.length; idx++) {
    const it = items[idx];
    if (it.k !== 1) continue;
    if (it.close) {
      let matchedOnce = false;
      while (it.n > 0 && it.close) {
        let oi = -1;
        for (let s = stack.length - 1; s >= 0; s--) {
          const op = stack[s];
          if (op.ch !== it.ch) continue;
          if (((op.open && op.close) || (it.open && it.close)) && (op.n + it.n) % 3 === 0 && !(op.n % 3 === 0 && it.n % 3 === 0)) continue;
          // Poisoned paragraph: an emphasis pair after a link whose
          // label has an unmatched backtick run, with a code span
          // after the closer, stays literal.
          if (poisonItem !== null) {
            const opPos = items.indexOf(op);
            const clPos = items.indexOf(it);
            if (opPos > poisonPos() && clPos > opPos && codeSpanAfter(clPos)) continue;
          }
          // A <strong> wrap already formed between this opener and the
          // closer blocks the match when the run lengths sum to a
          // multiple of 3 — but only on the closer's first match, and
          // only when the opener and closer were different run lengths
          // to begin with (a leftover ** opener may still pair across
          // a wrap, e.g. the ** closer in **a *b c** forms the outer
          // <em> across the inner <em>b c</em>). The closer passes
          // this opener by and pairs with an earlier one instead (e.g.
          // the ** closer in **x *a **b**c* y** skips the * opener and
          // forms <strong> with the ** opener, leaving both * literal).
          if (!matchedOnce && op.on !== it.on && (op.n + it.n) % 3 === 0 && !(op.n % 3 === 0 && it.n % 3 === 0)) {
            const oi0 = items.indexOf(op);
            const ci0 = items.indexOf(it);
            let blocked = false;
            if (oi0 >= 0 && ci0 > oi0) {
              for (let w = oi0 + 1; w < ci0; w++) if (items[w].k === 6 && items[w].tag === 'strong' && items[w].ch === it.ch) { blocked = true; break; }
            }
            if (blocked) continue;
          }
          oi = s;
          break;
        }
        if (oi < 0) break;
        const op = stack[oi];
        const opIdx = items.indexOf(op);
        const clIdx = items.indexOf(it);
        if (opIdx < 0 || clIdx < 0) break;
        const use = it.ch === '~' ? Math.min(op.n, it.n) : (op.n >= 2 && it.n >= 2 ? 2 : 1);
        const children = items.slice(opIdx + 1, clIdx);
        // A short closer must not steal one delimiter from a longer
        // pure opener when an inner emphasis already formed inside the
        // span (the opener is reserved for a later closer that needs
        // it for <strong>); but only on the closer's first match, and
        // only when the run lengths sum to a multiple of 3. With no
        // inner emphasis yet, the short closer may still pair with the
        // longer opener (e.g. **a b* c** forms nested <em>).
        if (!matchedOnce) {
          let hasWrap = false;
          for (let c = 0; c < children.length; c++) if (children[c].k === 6) { hasWrap = true; break; }
          if (hasWrap && it.n < op.n && op.open && !op.close && it.close && !it.open &&
              (op.n + it.n) % 3 === 0 && !(op.n % 3 === 0 && it.n % 3 === 0)) break;
        }
        matchedOnce = true;
        // A wrap whose closer could also open blocks an outer match when
        // the odd-match sum holds and the wrap's opener was a pure
        // opener: the inner closer is the nearest delimiter the outer
        // closer meets, and marked leaves the outer delimiters literal
        // (e.g. *a **b**c* does not form <em>). Only a <strong> wrap
        // of the SAME character blocks (a <del> or <em> wrap, or a
        // strong of a different character, does not — e.g. *x <del>y</del>z*
        // still forms <em>, and _x <strong>y</strong>z_ still forms
        // <em>). A bare delimiter (or text) between the wrap and the
        // closer breaks the adjacency, so only the last delimiter item
        // counts; and when the inner opener could itself both open and
        // close, the outer match still goes through (e.g. **a b*c*d**
        // forms <strong>).
        for (let c = children.length - 1; c >= 0; c--) {
          const ci = children[c];
          if (ci.k === 6) {
            if (ci.tag === 'strong' && ci.ch === it.ch && ci.cOpen && !ci.oBoth && (ci.cN + it.n) % 3 === 0 && !(ci.cN % 3 === 0 && it.n % 3 === 0)) { oi = -2; }
            break;
          }
          if (ci.k === 1) break;
        }
        if (oi === -2) break;
        const tag = it.ch === '~' ? 'del' : (use === 2 ? 'strong' : 'em');
        const wrap = { k: 6, tag, ch: it.ch, children, cN: it.n, cOpen: it.open, oBoth: op.open && op.close };
        lastWrap = wrap;
        op.n -= use;
        it.n -= use;
        const repl = [];
        if (op.n > 0) repl.push(op);
        repl.push(wrap);
        if (it.n > 0) {
          // A leftover closer run is normally rendered after the wrap,
          // but marked puts it INSIDE a <strong> wrap when the wrap's
          // last child is plain text (not starting with whitespace)
          // and an inner emphasis already formed inside (e.g.
          // **a *b*c*** -> <strong>a <em>b</em>c*</strong>, while
          // **a bcc*** -> <strong>a bcc</strong>* and
          // **a *b* c*** -> <strong>a <em>b</em> c</strong>*). The
          // leftover merges into that last text child. This only
          // applies to <strong> (use 2); an <em> wrap leaves its
          // leftover outside (e.g. *changes *else*returns** ->
          // <em>changes <em>else</em>returns*</em> is wrong; the
          // baseline is <em>changes <em>else</em>returns</em>*).
          const last = children.length > 0 ? children[children.length - 1] : null;
          let hasInnerWrap = false;
          for (let c = 0; c < children.length; c++) if (children[c].k === 6) { hasInnerWrap = true; break; }
          // Do NOT merge the leftover inside if an earlier opener of
          // the same character is still on the stack: the leftover
          // must stay a delimiter so it can form the outer wrap with
          // it (e.g. __because may __old 2*3*4 and____ -> the leftover
          // __ forms the outer <strong> with the first __, it is not
          // literal text inside the inner <strong>).
          let earlierOpener = false;
          for (let s = 0; s < stack.length; s++) if (stack[s].ch === it.ch && stack[s].open && stack[s].n > 0) { earlierOpener = true; break; }
          if (use === 2 && !earlierOpener && last !== null && last.k === 0 && hasInnerWrap && last.s.length > 0 && last.s[0] !== ' ' && last.s[0] !== '\t' && last.s[0] !== '\n') {
            for (let q = 0; q < it.n; q++) last.s += it.ch;
            it.n = 0;
          } else {
            repl.push(it);
          }
        }
        items.splice(opIdx, clIdx - opIdx + 1, ...repl);
        for (let s = stack.length - 1; s > oi; s--) {
          if (children.indexOf(stack[s]) >= 0) stack.splice(s, 1);
        }
        if (op.n === 0) stack.splice(oi, 1);
      }
      if (it.n > 0 && it.open && stack.indexOf(it) < 0) stack.push(it);
      // the splice above may have moved items; re-anchor the scan index
      // just past the wrapper (or the leftover closer) that replaced it
      const ni = items.indexOf(it);
      if (ni >= 0) idx = ni;
      else if (lastWrap !== null) idx = items.indexOf(lastWrap);
    } else if (it.open) {
      stack.push(it);
    }
  }
}

function renderItems(items, out) {
  for (let a = 0; a < items.length; a++) {
    const it = items[a];
    if (it.k === 0) out.push(esc(it.s));
    else if (it.k === 1) { for (let q = 0; q < it.n; q++) out.push(it.ch); }
    else if (it.k === 2) { out.push('<code>'); out.push(esc(it.s)); out.push('</code>'); }
    else if (it.k === 3 || it.k === 4) out.push(it.s);
    else if (it.k === 5) out.push('<br>');
    else if (it.k === 6) {
      out.push('<' + it.tag + '>');
      renderItems(it.children, out);
      out.push('</' + it.tag + '>');
    }
  }
}

// Plain text of an inline string (for image alt attributes): formatting
// stripped, HTML tags dropped, entities already decoded by the scan.
function plainText(src, refs) {
  const r = scanInline(src, refs);
  const out = [];
  renderPlain(r.items, out);
  return out.join('');
}

function renderPlain(items, out) {
  for (let a = 0; a < items.length; a++) {
    const it = items[a];
    if (it.k === 0) out.push(it.s.indexOf(SENTINEL) >= 0 ? it.s.split(SENTINEL).join('&') : it.s);
    else if (it.k === 1) { for (let q = 0; q < it.n; q++) out.push(it.ch); }
    else if (it.k === 2) out.push(it.s);
    else if (it.k === 4) out.push(it.plain || '');
    else if (it.k === 5) out.push(' ');
    else if (it.k === 6) renderPlain(it.children, out);
    // k:3 raw HTML is dropped
  }
}

// ---------------------------------------------------------------------------
// Block parsing.
//
// A line is {s, c}: the text and the absolute column of its first character
// in this container's coordinate system. Tabs advance to the next multiple
// of 4 from that column, so stripping a container prefix (a list marker, a
// '>' , an indent) keeps every later tab on its true column -- and a tab
// inside fenced or indented code stays a tab.

function isBlankLine(L) {
  const s = L.s;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch !== ' ' && ch !== '\t') return false;
  }
  return true;
}

// Columns of leading whitespace, relative to the line's own start column.
function indentCols(L) {
  const s = L.s;
  let col = L.c;
  let i = 0;
  while (i < s.length && (s[i] === ' ' || s[i] === '\t')) {
    col += s[i] === '\t' ? 4 - (col % 4) : 1;
    i++;
  }
  return col - L.c;
}

// The line with its first `n` columns removed. A tab that straddles the cut
// becomes the spaces that remain of it; the new start column is exact, so a
// tab after the cut still advances from its true column.
function stripCols(L, n) {
  const s = L.s;
  let col = L.c;
  let i = 0;
  const cut = L.c + n;
  const baseTc = L.tc !== undefined ? L.tc : L.c;
  while (i < s.length && col < cut) {
    const ch = s[i];
    if (ch === ' ') { col++; i++; }
    else if (ch === '\t') {
      const next = (col + 4) & ~3;
      if (next <= cut) { col = next; i++; }
      else return { s: ' '.repeat(next - cut) + s.slice(i + 1), c: cut, tc: baseTc + (cut - L.c) };
    } else { col++; i++; }
  }
  return { s: s.slice(i), c: col, tc: baseTc + (col - L.c) };
}

// Like stripCols, but only whitespace is removed: if the line runs out of
// leading whitespace before `n` columns, the rest of the line is kept whole
// (a fenced-code content line may be less indented than its opening fence).
function stripWsCols(L, n) {
  const s = L.s;
  let col = L.c;
  let i = 0;
  const cut = L.c + n;
  const baseTc = L.tc !== undefined ? L.tc : L.c;
  while (i < s.length && col < cut) {
    const ch = s[i];
    if (ch === ' ') { col++; i++; }
    else if (ch === '\t') {
      const next = (col + 4) & ~3;
      if (next <= cut) { col = next; i++; }
      // In fenced code, a tab straddling the fence-indent cut is
      // dropped whole (marked removes it, it does not become the
      // spaces that remain of it as stripCols does for indented
      // code and block detection).
      else return { s: s.slice(i + 1), c: cut, tc: baseTc + (cut - L.c) };
    } else break;
  }
  return { s: s.slice(i), c: col, tc: baseTc + (col - L.c) };
}

// Expand tabs in the leading whitespace of `s` that sit at a non-tab-stop
// column (startCol is the column of s[0]). A tab at a tab-stop column is
// kept as a tab. Used for indented code content, where a tab left after
// the four-column strip must read as the spaces it stands for.
function expandPartialTabs(s, startCol, expandStops) {
  let out = '';
  let col = startCol;
  let i = 0;
  while (i < s.length && (s[i] === ' ' || s[i] === '\t')) {
    if (s[i] === ' ') { out += ' '; col++; i++; }
    else {
      const next = (col + 4) & ~3;
      // In fenced code inside a container, a tab at a tab stop expands
      // to the spaces it stands for (marked never keeps a leading tab
      // there); elsewhere it is kept verbatim.
      if (col % 4 === 0 && !expandStops) { out += '\t'; col = next; i++; }
      else { out += ' '.repeat(next - col); col = next; i++; }
    }
  }
  return out + s.slice(i);
}

// The line with leading whitespace (up to 3 columns) stripped, for block
// detection. Returns {ind, content, code}.
function leadInfo(L) {
  const ind = indentCols(L);
  if (ind >= 4) return { ind, content: stripCols(L, 4), code: true };
  return { ind, content: stripCols(L, ind), code: false };
}

// Skip spaces/tabs/newlines in a definition string, but not across a blank
// line. Returns the new index, or -1.
function skipDefWs(t, p) {
  let seenNl = false;
  while (p < t.length) {
    const ch = t[p];
    if (ch === ' ' || ch === '\t') { p++; continue; }
    if (ch === '\n') {
      if (seenNl) return -1;
      seenNl = true;
      p++;
      continue;
    }
    break;
  }
  return p;
}

// Try to read a link reference definition starting at lines[i]. The
// definition may span a few lines (label, destination, title).
// Returns {endLine, label, href, title} or null. href/title are already
// backslash-unescaped (but entities are kept as written).
function tryRefDef(lines, i, end) {
  let t = '';
  for (let q = i; q < Math.min(end, i + 8); q++) {
    if (q > i) t += '\n';
    t += lines[q].s;
  }
  let p = 0;
  let col = 0;
  while (p < t.length && (t[p] === ' ' || t[p] === '\t') && col < 4) {
    col += t[p] === '\t' ? 4 - (col % 4) : 1;
    p++;
  }
  if (col >= 4 || t[p] !== '[') return null;
  const close = scanLabelEnd(t, p, true);
  if (close < 0) return null;
  const label = t.slice(p + 1, close);
  if (label.length === 0 || label.length > 999) return null;
  if (normalizeLabel(label) === '') return null;
  p = close + 1;
  while (p < t.length && (t[p] === ' ' || t[p] === '\t')) p++;
  if (t[p] !== ':') return null;
  p++;
  p = skipDefWs(t, p);
  if (p < 0 || p >= t.length) return null;
  let href = '';
  if (t[p] === '<') {
    let j = p + 1;
    while (j < t.length) {
      const ch = t[j];
      if (ch === '\\' && j + 1 < t.length && isAsciiPunct(t[j + 1])) { j += 2; continue; }
      if (ch === '\n' || ch === '<') return null;
      if (ch === '>') break;
      j++;
    }
    if (j >= t.length || t[j] !== '>') return null;
    href = t.slice(p + 1, j);
    p = j + 1;
  } else {
    const start = p;
    let depth = 0;
    while (p < t.length) {
      const ch = t[p];
      if (ch === '\\' && p + 1 < t.length && isAsciiPunct(t[p + 1])) { p += 2; continue; }
      if (ch === '(') depth++;
      else if (ch === ')') { if (depth === 0) break; depth--; }
      else if (ch === ' ' || ch === '\t' || ch === '\n') break;
      else if (ch.charCodeAt(0) < 32) return null;
      p++;
    }
    if (depth > 0) return null;
    href = t.slice(start, p);
    if (href === '') return null;
  }
  // A title must be separated from the destination by whitespace.
  if (t[p] === '"' || t[p] === "'" || t[p] === '(') return null;
  const destEnd = p;
  // Skip spaces/tabs on this line; a title may also start on the next line.
  let q = p;
  while (q < t.length && (t[q] === ' ' || t[q] === '\t')) q++;
  let title = null;
  let titleEnd = destEnd;
  if (q < t.length && t[q] === '\n') {
    // A title on the following line: if it does not parse (or has junk
    // after it), the definition is still valid without a title.
    const r = skipDefWs(t, q);
    if (r >= 0 && (t[r] === '"' || t[r] === "'" || t[r] === '(')) {
      const parsed = parseDefTitle(t, r);
      if (parsed !== null) {
        let e = parsed.end;
        while (e < t.length && (t[e] === ' ' || t[e] === '\t')) e++;
        if (e >= t.length || t[e] === '\n') { title = parsed.title; titleEnd = e; }
      }
    }
  } else if (q < t.length && (t[q] === '"' || t[q] === "'" || t[q] === '(')) {
    // A title on the same line must parse and be followed by only spaces.
    const parsed = parseDefTitle(t, q);
    if (parsed === null) return null;
    let e = parsed.end;
    while (e < t.length && (t[e] === ' ' || t[e] === '\t')) e++;
    if (e < t.length && t[e] !== '\n') return null;
    title = parsed.title;
    titleEnd = e;
  } else if (q < t.length && t[q] !== '\n') {
    return null;
  }
  const endPos = title === null ? destEnd : titleEnd;
  const consumed = t.slice(0, endPos).split('\n').length;
  return {
    endLine: i + consumed,
    label,
    href: unescapeBackslash(href),
    title: title === null ? null : unescapeBackslash(title),
  };
}

// Parse a title ('...' / "..." / (...)) starting at t[p]. The title may
// span lines, but not a blank line. Returns {title, end} (end is just past
// the closing quote) or null.
function parseDefTitle(t, p) {
  const q = t[p];
  const closeQ = q === '(' ? ')' : q;
  let j = p + 1;
  while (j < t.length) {
    const ch = t[j];
    if (ch === '\\' && j + 1 < t.length && isAsciiPunct(t[j + 1])) { j += 2; continue; }
    if (ch === '\n' && t[j + 1] === '\n') return null;
    if (ch === closeQ) return { title: t.slice(p + 1, j), end: j + 1 };
    j++;
  }
  return null;
}

// ---------------------------------------------------------------------------
// GFM tables.

function splitTableRow(line) {
  const cells = [];
  let cur = '';
  let i = 0;
  const n = line.length;
  while (i < n) {
    const ch = line[i];
    if (ch === '\\' && i + 1 < n) { cur += line[i] + line[i + 1]; i += 2; continue; }
    if (ch === '`') {
      let j = i;
      while (j < n && line[j] === '`') j++;
      const run = j - i;
      let m = j;
      let found = -1;
      while (m < n) {
        // An unescaped | is a cell separator, so a code span cannot
        // span past it: the run is literal and the | splits the row.
        // An escaped \| is span content, so the search continues past
        // it (e.g. `a \| b` is one cell).
        if (line[m] === '\\' && m + 1 < n) { m += 2; continue; }
        if (line[m] === '|') break;
        if (line[m] === '`') {
          let e = m;
          while (e < n && line[e] === '`') e++;
          if (e - m === run) { found = e; break; }
          m = e;
        } else m++;
      }
      if (found < 0) { cur += line.slice(i, j); i = j; continue; }
      // Inside a code span, \| is an escaped pipe and becomes a literal
      // | (\\ stays \\, so it is not mistaken for an escaped pipe).
      let span = line.slice(i, found);
      if (span.indexOf('\\|') >= 0) {
        let out2 = '';
        for (let q = 0; q < span.length; q++) {
          if (span[q] === '\\' && q + 1 < span.length && span[q + 1] === '|') { out2 += '|'; q++; }
          else if (span[q] === '\\' && q + 1 < span.length && span[q + 1] === '\\') { out2 += '\\\\'; q++; }
          else out2 += span[q];
        }
        span = out2;
      }
      cur += span;
      i = found;
      continue;
    }
    if (ch === '|') { cells.push(cur); cur = ''; i++; continue; }
    cur += ch;
    i++;
  }
  cells.push(cur);
  const trimmed = line.trim();
  if (trimmed.startsWith('|') && cells.length > 0 && cells[0].trim() === '') cells.shift();
  if (trimmed.endsWith('|') && cells.length > 0 && cells[cells.length - 1].trim() === '') cells.pop();
  for (let c = 0; c < cells.length; c++) cells[c] = cells[c].trim();
  return cells;
}

// If `line` is a table delimiter row, return its alignments
// ('left' | 'center' | 'right' | null per column), else null.
function tableAlignments(line) {
  const cells = splitTableRow(line);
  if (cells.length === 0) return null;
  const out = [];
  for (let c = 0; c < cells.length; c++) {
    const cell = cells[c];
    let a = 0, b = cell.length;
    while (a < b && (cell[a] === ' ' || cell[a] === '\t')) a++;
    while (b > a && (cell[b - 1] === ' ' || cell[b - 1] === '\t')) b--;
    const core = cell.slice(a, b);
    if (!/^:?-+:?$/.test(core)) return null;
    const left = core.startsWith(':');
    const right = core.endsWith(':');
    out.push(left && right ? 'center' : left ? 'left' : right ? 'right' : null);
  }
  return out;
}

// ---------------------------------------------------------------------------
// HTML blocks.

const BLOCK_TAGS = new Set([
  'address', 'article', 'aside', 'base', 'basefont', 'blockquote', 'body',
  'caption', 'center', 'col', 'colgroup', 'dd', 'details', 'dialog', 'dir',
  'div', 'dl', 'dt', 'fieldset', 'figcaption', 'figure', 'footer', 'form',
  'frame', 'frameset', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header',
  'hr', 'html', 'iframe', 'legend', 'li', 'link', 'main', 'menu', 'menuitem',
  'nav', 'noframes', 'ol', 'optgroup', 'option', 'p', 'param', 'section',
  'source', 'summary', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead',
  'title', 'tr', 'track', 'ul',
]);

// If `content` (a line with at most 3 columns of indent removed) starts an
// HTML block, return {type, endTag, kind} where kind is 'line' for types 1-5
// (the block ends at the line holding the end marker) or 'blank' for types
// 6-7 (the block ends at a blank line). Otherwise null.
function htmlBlockStart(content) {
  if (content[0] !== '<') return null;
  const low = content.toLowerCase();
  if (low.startsWith('<pre') || low.startsWith('<script') || low.startsWith('<style') || low.startsWith('<textarea')) {
    const idx = low.startsWith('<pre') ? 4 : low.startsWith('<script') ? 7 : low.startsWith('<style') ? 6 : 9;
    const after = content[idx] || '';
    if (after === '' || after === ' ' || after === '\t' || after === '>') {
      const name = low.startsWith('<pre') ? 'pre' : low.startsWith('<script') ? 'script' : low.startsWith('<style') ? 'style' : 'textarea';
      return { type: 1, endTag: '</' + name + '>', kind: 'line' };
    }
  }
  if (content.startsWith('<!--')) return { type: 2, endTag: '-->', kind: 'line' };
  if (content.startsWith('<?')) return { type: 3, endTag: '?>', kind: 'line' };
  if (content.startsWith('<![CDATA[')) return { type: 5, endTag: ']]>', kind: 'line' };
  if (content.startsWith('<!') && content[2] >= 'A' && content[2] <= 'Z') return { type: 4, endTag: '>', kind: 'line' };
  // Types 6 and 7: a line beginning with <tag or </tag, where the tag name
  // is followed by whitespace, '>', '/' or the end of the line. A
  // block-level tag name makes type 6 (the tag need not be complete on
  // this line, and anything may follow it). Any other name makes type 7
  // only when the line holds nothing but that one complete tag (and
  // trailing whitespace); anything else after it is a paragraph.
  // (pre, script, style and textarea are type 1 opening tags only, so a
  // closing </pre> is type 7.)
  const m = /^<\/?([A-Za-z][A-Za-z0-9-]*)/.exec(content);
  if (m) {
    const after = content[m[0].length] || '';
    if (after === '' || after === ' ' || after === '\t' || after === '>' || after === '/') {
      const name = m[1].toLowerCase();
      if (BLOCK_TAGS.has(name)) return { type: 6, endTag: '', kind: 'blank' };
      const te = scanHtmlTag(content, 0);
      if (te > 0 && content.slice(te).trim() === '') {
        return { type: 7, endTag: '', kind: 'blank' };
      }
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Block parsing.

// Does this content string start a block that can interrupt a paragraph?
// `inPara` is true when the check is for a paragraph continuation line (a
// '-' run is then a setext underline, not a thematic break, and a list needs
// a non-empty first item -- and a 1 for ordered lists -- to interrupt).
function startsBlock(content, inPara) {
  if (content === '') return false;
  const ch = content[0];
  if (ch === '#') {
    let n = 0;
    while (n < content.length && content[n] === '#') n++;
    if (n >= 1 && n <= 6 && (n === content.length || content[n] === ' ' || content[n] === '\t')) return true;
  }
  if (ch === '`' || ch === '~') {
    let n = 0;
    while (n < content.length && content[n] === ch) n++;
    if (n >= 3) {
      if (ch === '`' && content.slice(n).indexOf('`') >= 0) return false;
      return true;
    }
  }
  if (ch === '>') return true;
  if (ch === '<') {
    const h = htmlBlockStart(content);
    if (h && h.type <= 6) return true;
  }
  if (ch === '*' || ch === '_' || (ch === '-' && !inPara)) {
    if (isThematicBreak(content)) return true;
  }
  const mh = parseMarkerHead(content, 0);
  if (mh) {
    if (!inPara) return true;
    const rest = content.slice(mh.markerLen).replace(/^[ \t]+/, '');
    if (rest === '') return false;
    if (mh.type === 'ordered' && mh.start !== 1) return false;
    return true;
  }
  return false;
}

function isThematicBreak(content) {
  const ch = content[0];
  if (ch !== '*' && ch !== '-' && ch !== '_') return false;
  let count = 0;
  for (let i = 0; i < content.length; i++) {
    const c = content[i];
    if (c === ch) count++;
    else if (c !== ' ' && c !== '\t') return false;
  }
  return count >= 3;
}

// Is `content` a setext underline? Returns 1 for '=', 2 for '-', else 0.
// The underline must be one solid run of the same character (spaces or
// tabs are only allowed around it, never inside: "= =" is not an underline).
function setextLevel(content) {
  if (content === '') return 0;
  const ch = content[0];
  if (ch !== '=' && ch !== '-') return 0;
  let a = 0;
  let b = content.length;
  while (a < b && (content[a] === ' ' || content[a] === '\t')) a++;
  while (b > a && (content[b - 1] === ' ' || content[b - 1] === '\t')) b--;
  if (a >= b) return 0;
  for (let i = a; i < b; i++) if (content[i] !== ch) return 0;
  return ch === '=' ? 1 : 2;
}

// Parse a list marker at position `pos` in string `s`.
// Returns {type, bullet, delim, start, markerLen} or null. The marker must
// be followed by a space, a tab, or the end of the line.
function parseMarkerHead(s, pos) {
  const ch = s[pos];
  if (ch === '-' || ch === '+' || ch === '*') {
    if (pos + 1 >= s.length || s[pos + 1] === ' ' || s[pos + 1] === '\t') {
      return { type: 'bullet', bullet: ch, delim: '', start: 0, markerLen: 1 };
    }
    return null;
  }
  if (ch >= '0' && ch <= '9') {
    let j = pos;
    while (j < s.length && s[j] >= '0' && s[j] <= '9' && j - pos < 9) j++;
    if (j === pos) return null;
    const d = s[j];
    if (d !== '.' && d !== ')') return null;
    if (j + 1 >= s.length || s[j + 1] === ' ' || s[j + 1] === '\t') {
      return { type: 'ordered', bullet: '', delim: d, start: parseInt(s.slice(pos, j), 10), markerLen: j - pos + 1 };
    }
  }
  return null;
}

// Content indent of a list item whose marker starts the line `L`, in
// columns relative to the line's own start column. Five or more columns of
// whitespace after the marker mean the content indent is marker + 1; an
// empty item's content indent is marker + 1 as well.
function listContentIndent(L) {
  const s = L.s;
  let col = L.c;
  let i = 0;
  while (i < s.length && (s[i] === ' ' || s[i] === '\t')) {
    col += s[i] === '\t' ? 4 - (col % 4) : 1;
    i++;
  }
  const head = parseMarkerHead(s, i);
  if (!head) return -1;
  const markerCol = col;
  col += head.markerLen;
  i += head.markerLen;
  let w = 0;
  while (i < s.length && (s[i] === ' ' || s[i] === '\t')) {
    const adv = s[i] === '\t' ? 4 - (col % 4) : 1;
    col += adv;
    w += adv;
    i++;
  }
  if (i >= s.length) return (markerCol - L.c) + head.markerLen + 1;
  if (w >= 5) return (markerCol - L.c) + head.markerLen + 1;
  return col - L.c;
}

// The main block loop. `lines` holds the line objects of this container.
// `out` is an array of HTML pieces, or null (collect mode: walk the
// structure and gather link references only). `tight` renders paragraphs
// without <p> wrappers; `taskPrefix` is checkbox HTML to put before the
// first paragraph rendered here, if any.
function parseBlocks(lines, start, end, refs, out, tight, taskPrefix, inList, isLastItem) {
  let i = start;
  let task = taskPrefix || null;
  let prevPara = false;
  while (i < end) {
    const line = lines[i];
    if (isBlankLine(line)) { i++; continue; }
    const info = leadInfo(line);
    const ind = info.ind;
    const content = info.content.s;

    // indented code (four or more columns of indent)
    if (info.code) {
      const codeLines = [];
      let j = i;
      while (j < end) {
        const l = lines[j];
        if (isBlankLine(l)) {
          // A whitespace-only line indented four or more columns is code
          // content (its spaces past the fourth column survive); a shorter
          // blank line is a separator between code chunks.
          if (indentCols(l) >= 4) { const st = stripCols(l, 4); codeLines.push(expandPartialTabs(st.s, st.c)); j++; continue; }
          codeLines.push(''); j++; continue;
        }
        if (indentCols(l) >= 4) { const st = stripCols(l, 4); codeLines.push(expandPartialTabs(st.s, st.c)); j++; continue; }
        break;
      }
      while (codeLines.length > 0 && codeLines[codeLines.length - 1] === '') codeLines.pop();
      if (out && codeLines.length > 0) {
        out.push('<pre><code>');
        out.push(esc(codeLines.join('\n') + '\n'));
        out.push('</code></pre>\n');
      }
      task = null;
      prevPara = false;
      i = j;
      continue;
    }

    // fenced code
    const fenceCh = content[0];
    if (fenceCh === '`' || fenceCh === '~') {
      let n = 0;
      while (n < content.length && content[n] === fenceCh) n++;
      if (n >= 3) {
        let infoStr = content.slice(n);
        let okFence = true;
        if (fenceCh === '`' && infoStr.indexOf('`') >= 0) okFence = false;
        if (okFence) {
          infoStr = infoStr.replace(/^[ \t]+/, '').replace(/[ \t]+$/, '');
          const lang = unescapeBackslash(infoStr.split(/[ \t]+/)[0] || '');
          const codeLines = [];
          let j = i + 1;
          let closed = false;
          while (j < end) {
            const l = lines[j];
            const li = leadInfo(l);
            if (!isBlankLine(l) && li.ind <= 3) {
              const lc = li.content.s;
              if (lc[0] === fenceCh) {
                let m = 0;
                while (m < lc.length && lc[m] === fenceCh) m++;
                if (m >= n && /^[ \t]*$/.test(lc.slice(m))) { closed = true; break; }
              }
            }
            // Content lines lose up to the opening fence's indent — but
            // only for backtick fences. Marked does NOT strip the fence
            // indent from tilde-fence content (the lines are kept
            // verbatim). When the line came from a container (l.c > 0:
            // the container stripping already cut into the line), tabs
            // at non-tab-stop columns expand to the spaces they stand
            // for; a top-level line keeps its tabs verbatim.
            const stripped = stripWsCols(l, fenceCh === '~' ? 0 : ind);
            codeLines.push(l.c > 0 ? expandPartialTabs(stripped.s, stripped.tc !== undefined ? stripped.tc : stripped.c, true) : stripped.s);
            j++;
          }
          // One trailing blank line is dropped (the content's final newline).
          if (codeLines.length > 0 && codeLines[codeLines.length - 1] === '') codeLines.pop();
          if (out) {
            out.push('<pre><code');
            if (lang !== '') out.push(' class="language-' + escAttr(lang) + '"');
            out.push('>');
            const body = codeLines.join('\n');
            out.push(esc(codeLines.length === 0 ? '' : body + '\n'));
            out.push('</code></pre>\n');
          }
          task = null;
          prevPara = false;
          i = closed ? j + 1 : j;
          continue;
        }
      }
    }

    // ATX heading
    if (content[0] === '#') {
      let n = 0;
      while (n < content.length && content[n] === '#') n++;
      if (n >= 1 && n <= 6 && (n === content.length || content[n] === ' ' || content[n] === '\t')) {
        let text = content.slice(n).replace(/^[ \t]+/, '').replace(/[ \t]+$/, '');
        if (/^#+$/.test(text)) text = '';
        else {
          const m = /[ \t]+#+$/.exec(text);
          if (m) text = text.slice(0, text.length - m[0].length).replace(/[ \t]+$/, '');
        }
        if (out) {
          out.push('<h' + n + '>');
          out.push(inlineHtml(text, refs).html);
          out.push('</h' + n + '>\n');
        }
        task = null;
        prevPara = false;
        i++;
        continue;
      }
    }

    // HTML block
    const hb = htmlBlockStart(content);
    if (hb) {
      const htmlLines = [line.s];
      let j = i + 1;
      if (hb.kind === 'line') {
        // The end marker may already be on the first line. Never push
        // the empty last line left by the source's final newline.
        if (line.s.toLowerCase().indexOf(hb.endTag) < 0) {
          while (j < end && !(j === end - 1 && lines[j].s === '')) {
            htmlLines.push(lines[j].s);
            if (lines[j].s.toLowerCase().indexOf(hb.endTag) >= 0) { j++; break; }
            j++;
          }
        }
      } else {
        while (j < end && !isBlankLine(lines[j])) { htmlLines.push(lines[j].s); j++; }
      }
      if (out) {
        // Trailing newline: for types 1-5 the newline is suppressed only
        // by a truly empty next line (a whitespace-only line does not
        // suppress it); for types 6-7 any blank next line suppresses
        // it. The empty last line left by the source's final newline is
        // not a real blank line.
        const nextLine = j < end ? lines[j] : null;
        const isRealBlank = nextLine !== null && !(j === end - 1 && nextLine.s === '') &&
          (hb.kind === 'line' ? nextLine.s === '' : isBlankLine(nextLine));
        let emitNl = hb.kind === 'line' ? !isRealBlank : (j < end && !isRealBlank);
        // When the block is the last line of this parseBlocks call and
        // we are inside a list item, the trailing newline depends on
        // the list: a tight item never has one (the block runs straight
        // into </li>), a loose item has one only when another item
        // follows (the last item runs straight into </li> too).
        if (j >= end && inList) emitNl = !tight && !isLastItem;
        out.push(htmlLines.join('\n') + (emitNl ? '\n' : ''));
      }
      task = null;
      prevPara = false;
      i = j;
      continue;
    }

    // thematic break
    if (isThematicBreak(content)) {
      if (out) out.push('<hr>\n');
      task = null;
      prevPara = false;
      i++;
      continue;
    }

    // blockquote
    if (content[0] === '>') {
      const qLines = [];
      let j = i;
      let paraOpen = false;
      let lastWasLazy = false;
      while (j < end) {
        const l = lines[j];
        const li = leadInfo(l);
        if (li.ind <= 3 && li.content.s[0] === '>') {
          let rest = stripCols(li.content, 1);
          if (rest.s[0] === ' ') rest = stripCols(rest, 1);
          else if (rest.s[0] === '\t') {
            // A tab right after ">" sits at relative column 1 and spans
            // to the next tab stop (column 4); the optional space takes
            // 1 column, leaving 2 spaces. Compute from the relative
            // column, NOT the absolute one: inside a list item the
            // absolute column is larger and stripCols would leave 3
            // spaces (e.g. "   >\tindented" -> "   indented" instead of
            // "  indented"). The tab is replaced by the 2 spaces
            // directly; c advances by the 1 stripped column.
            rest = { s: '  ' + rest.s.slice(1), c: rest.c + 1, tc: (rest.tc !== undefined ? rest.tc : rest.c) + 1 };
          }
          // The tab-expansion column resets at a blockquote marker:
          // marked expands a tab in fenced code (or a leading tab in
          // a paragraph) inside a quote as if it sat right after one
          // "> " (column 2), however deep the nesting; a list strip,
          // by contrast, accumulates. So the tab column is the marker
          // width, not the absolute document column. `c` itself stays
          // absolute (indent and block detection depend on it).
          rest.tc = 2;
          qLines.push(rest);
          // A lazy line can only continue a paragraph, never a fenced
          // code block: paraOpen is false while a fence is unclosed.
          paraOpen = rest.s !== '' && !isBlankLine(rest) ? (updateInPara(qLines) && !hasOpenFence(qLines)) : false;
          lastWasLazy = false;
          j++;
          continue;
        }
        // A line with no '>' marker: a blank line ends the quote outright;
        // a non-blank line can only be a lazy paragraph continuation.
        if (isBlankLine(l)) break;
        if (paraOpen) {
          const lc = li.content.s;
          // A line indented four or more columns is a lazy line (its first
          // four columns are stripped); otherwise it must not start a
          // new block. Lazy lines are flagged so the paragraph loop does
          // not re-check them as block starts.
          if (li.ind >= 4 || !startsBlock(lc, false)) {
            if (setextLevel(lc) > 0 && lastWasLazy) {
              // A lazy setext underline is neutralised with four spaces
              // (so it cannot form a heading when the quote is rendered),
              // except when it is the first lazy line of the paragraph.
              qLines.push({ s: '    ' + l.s, c: 0, lazy: true });
            } else if (indentCols(l) >= 4) {
              const pl = stripCols(l, 4);
              pl.lazy = true;
              qLines.push(pl);
            } else {
              qLines.push({ s: l.s, c: l.c, lazy: true });
            }
            lastWasLazy = true;
            j++;
            continue;
          }
        }
        break;
      }
      if (out) {
        out.push('<blockquote>\n');
        parseBlocks(qLines, 0, qLines.length, refs, out, false, null, inList, isLastItem);
        out.push('</blockquote>\n');
      } else {
        parseBlocks(qLines, 0, qLines.length, refs, null, false, null, inList, isLastItem);
      }
      task = null;
      prevPara = false;
      i = j;
      continue;
    }

    // list
    const marker = parseMarkerHead(content, 0);
    if (marker) {
      const res = parseList(lines, i, end, refs, out);
      task = null;
      prevPara = false;
      i = res;
      continue;
    }

    // table (checked before the paragraph: header line + delimiter row)
    if (content.indexOf('|') >= 0 && i + 1 < end) {
      const nextInfo = leadInfo(lines[i + 1]);
      const aligns = !nextInfo.code && nextInfo.ind <= 3 ? tableAlignments(nextInfo.content.s) : null;
      if (aligns && !(content[0] === '[' && content.indexOf(']:') >= 0)) {
        const header = splitTableRow(content);
        if (aligns.length === header.length) {
          const rows = [];
          let j = i + 2;
          while (j < end) {
            const l = lines[j];
            // A whitespace-only line ends the table, except one
            // containing a tab: marked reads that as an empty row.
            if (isBlankLine(l) && l.s.indexOf('\t') < 0) break;
            const li = leadInfo(l);
            if (!li.code && li.ind <= 3 && startsBlock(li.content.s, false)) break;
            rows.push(l);
            j++;
          }
          if (out) {
            out.push('<table>\n<thead>\n<tr>\n');
            for (let c = 0; c < header.length; c++) {
              out.push('<th');
              if (aligns[c]) out.push(' align="' + aligns[c] + '"');
              out.push('>');
              out.push(inlineHtml(header[c], refs).html);
              out.push('</th>\n');
            }
            out.push('</tr>\n</thead>\n');
            if (rows.length > 0) {
              out.push('<tbody>');
              for (let r = 0; r < rows.length; r++) {
                const cells = splitTableRow(leadInfo(rows[r]).content.s);
                out.push('<tr>\n');
                for (let c = 0; c < header.length; c++) {
                  const cell = c < cells.length ? cells[c] : '';
                  out.push('<td');
                  if (aligns[c]) out.push(' align="' + aligns[c] + '"');
                  out.push('>');
                  out.push(inlineHtml(cell, refs).html);
                  out.push('</td>\n');
                }
                out.push('</tr>\n');
              }
              out.push('</tbody></table>\n');
            } else {
              out.push('</table>\n');
            }
          }
          task = null;
          prevPara = false;
          i = j;
          continue;
        }
      }
    }

    // paragraph (with leading link reference definitions, and setext)
    {
      const paraLines = [];
      let j = i;
      let setext = 0;
      let setextLine = -1;
      while (j < end) {
        const l = lines[j];
        if (isBlankLine(l)) {
          // A whitespace-only line that is the very last line of this
          // container is a paragraph line, not a separator (it carries
          // its spaces into the paragraph); any other blank line ends it.
          if (l.s !== '' && j === end - 1) { paraLines.push(l); j++; }
          break;
        }
        if (j > i) {
          // A lazy setext underline is paragraph text, but it closes the
          // paragraph: the next line starts a new block.
          if (l.lazySetext) { paraLines.push(l); j++; break; }
          // A lazy continuation line is paragraph text as-is; it is not
          // re-checked as a block start (it may look like a list marker).
          if (l.lazy) { paraLines.push(l); j++; continue; }
          const li = leadInfo(l);
          if (!li.code) {
            const sl = setextLevel(li.content.s);
            if (sl > 0 && li.ind <= 3) { setext = sl; setextLine = j; break; }
            if (li.ind <= 3 && isThematicBreak(li.content.s)) break;
            // Inside a list item any ordered marker can interrupt the
            // paragraph (start a nested list); at the top level only a
            // '1.' marker can.
            if (li.ind <= 3 && startsBlock(li.content.s, !inList)) break;
          }
        }
        paraLines.push(l);
        j++;
      }
      // consume leading link reference definitions
      let p = 0;
      let consumed = 0;
      while (p < paraLines.length) {
        const def = tryRefDef(paraLines, p, paraLines.length);
        if (!def) break;
        const key = normalizeLabel(def.label);
        if (!refs.has(key)) refs.set(key, { href: def.href, title: def.title });
        consumed = def.endLine;
        p = def.endLine;
      }
      const rest = paraLines.slice(consumed);
      if (rest.length === 0) {
        // only definitions: no output; the setext line (if any) is a new block
        task = null;
        i = setextLine >= 0 ? setextLine : j;
        continue;
      }
      if (setext > 0) {
        const srcLines = [leadInfo(rest[0]).content.s];
        for (let q = 1; q < rest.length; q++) srcLines.push(rest[q].s);
        let src = srcLines.join('\n');
        src = src.replace(/[ \t]+$/, '');
        if (out) {
          out.push('<h' + setext + '>');
          out.push(inlineHtml(src, refs).html);
          out.push('</h' + setext + '>\n');
        }
        task = null;
        prevPara = false;
        i = setextLine + 1;
        continue;
      }
      // A paragraph keeps its lines verbatim, leading spaces included;
      // a leading tab after a container marker expands to the spaces
      // it stands for (at the line's tab column), as in fenced code.
      const srcLines = [expandPartialTabs(rest[0].s, rest[0].tc !== undefined ? rest[0].tc : rest[0].c, true)];
      for (let q = 1; q < rest.length; q++) srcLines.push(expandPartialTabs(rest[q].s, rest[q].tc !== undefined ? rest[q].tc : rest[q].c, true));
      let src = srcLines.join('\n');
      // In a list item, a paragraph that ends the item loses the
      // trailing whitespace of its last line (marked right-trims the
      // item's content); at the top level it is kept, as is a paragraph
      // followed by another block in the same item.
      if (inList) {
        let k = j;
        let more = false;
        while (k < end) { if (!isBlankLine(lines[k])) { more = true; break; } k++; }
        if (!more) src = src.replace(/[ \t]+$/, '');
      }
      if (out) {
        if (!tight) out.push('<p>');
        // In a tight list item, consecutive paragraphs are separated by a
        // blank line (a lazy setext underline can split a paragraph).
        else if (prevPara) out.push('\n\n');
        if (task !== null) { out.push(task); task = null; }
        out.push(inlineHtml(src, refs).html);
        if (!tight) out.push('</p>\n');
        prevPara = true;
      } else {
        task = null;
      }
      i = j;
      continue;
    }
  }
}

// Does `lines` contain an unclosed fenced code block (a fence opening with
// no matching closer)? Used to tell a closing fence line from an opening
// one when deciding whether a blank line separates two top-level blocks.
function hasOpenFence(lines) {
  let open = null;
  for (let q = 0; q < lines.length; q++) {
    const info = leadInfo(lines[q]);
    if (info.code || info.ind > 3) continue;
    const c = info.content.s;
    if (c === '') continue;
    const ch = c[0];
    if (ch !== '`' && ch !== '~') continue;
    let n = 0;
    while (n < c.length && c[n] === ch) n++;
    if (n < 3) continue;
    if (ch === '`' && c.slice(n).indexOf('`') >= 0) continue;
    if (open === null) open = { ch, n };
    else if (ch === open.ch && n >= open.n) open = null;
  }
  return open !== null;
}

// Collect the content indents (in these lines' own coordinates) of list
// items nested inside the given item lines. A continuation line whose
// indent equals one of these is a paragraph continuation of that nested
// item, not a new top-level block (in particular, not indented code).
function nestedContentIndents(lines) {
  const indents = [];
  for (let q = 0; q < lines.length; q++) {
    const info = leadInfo(lines[q]);
    if (info.ind > 3) continue;
    const m = parseMarkerHead(info.content.s, 0);
    if (m === null) continue;
    indents.push(listContentIndent(lines[q]));
  }
  return indents;
}

// Incremental version: record the content indent of `line` (already in
// the item's stripped coordinates) in `item.nestedIndents` when the line
// itself opens a nested list item. Called on every line pushed to an item,
// so the loose heuristic never rescans the item's lines.
function noteNestedIndent(item, line) {
  const info = leadInfo(line);
  if (info.ind > 3) return;
  if (parseMarkerHead(info.content.s, 0) === null) return;
  const ci = listContentIndent(line);
  if (item.nestedIndents.indexOf(ci) < 0) item.nestedIndents.push(ci);
  if (item.nestedMarkerIndents.indexOf(info.ind) < 0) item.nestedMarkerIndents.push(info.ind);
}

// Parse a list starting at lines[i]. Returns the index just past the list.
function parseList(lines, i, end, refs, out) {
  const head = parseMarkerHead(leadInfo(lines[i]).content.s, 0);
  const contentIndent = listContentIndent(lines[i]);
  const items = [];
  let loose = false;
  let j = i;
  while (j < end) {
    const line = lines[j];
    if (j > i && isBlankLine(line)) {
      items[items.length - 1].lines.push({ s: '', c: 0 });
      items[items.length - 1].pendingBlanks++;
      j++;
      continue;
    }
    const ind = indentCols(line);
    // A line indented at least as far as the current item's content belongs
    // to that item (it may hold a nested list); only a less-indented marker
    // of the same list starts a new item. An empty item that has already
    // seen a blank line is closed: following lines are not its content.
    if (items.length > 0) {
      const cur = items[items.length - 1];
      const itemEmpty = cur.lines.every((l) => isBlankLine(l));
      if (!isBlankLine(line) && ind >= cur.contentIndent &&
          !(itemEmpty && cur.pendingBlanks > 0)) {
        if (cur.pendingBlanks > 0) {
          // Only a blank line between two top-level blocks of this item
          // makes the list loose. The continuation line, stripped of this
          // item's content indent, must start a new top-level block:
          // indented code, a block start (other than a fence closing an
          // open fenced block), or a paragraph line at indent 0. A line
          // whose indent matches a nested list item's content indent is
          // a continuation of that nested item, not a new top-level block.
          const stripped = stripCols(line, cur.contentIndent);
          const si = leadInfo(stripped);
          // A continuation line at or beyond a nested item's content
          // indent belongs to that nested item (a fenced code block or
          // paragraph inside it may sit deeper than the indent itself),
          // so it is not a new top-level block of this item.
          const inNested = cur.nestedIndents.some((ni) => si.ind >= ni);
          if (!inNested) {
            if (si.code) {
              loose = true;
            } else if (startsBlock(si.content.s, false)) {
              const lc = si.content.s;
              const isFence = lc[0] === '`' || lc[0] === '~';
              // A list marker at an indent where a nested list already
              // exists continues that nested list (the blank line is
              // inside the nested list, not between this item's blocks).
              const isNestedCont = parseMarkerHead(lc, 0) !== null &&
                cur.nestedMarkerIndents.indexOf(si.ind) >= 0;
              if (!isFence || !hasOpenFence(cur.lines)) {
                if (!isNestedCont) loose = true;
              }
            } else if (si.ind === 0) {
              loose = true;
            }
          }
        }
        cur.pendingBlanks = 0;
        const pushedLine = stripCols(line, cur.contentIndent);
        cur.lines.push(pushedLine);
        noteNestedIndent(cur, pushedLine);
        cur.inPara = updateInPara(cur.lines);
        j++;
        continue;
      }
    }
    // A thematic break line ends the list (it is not a list item).
    if (isThematicBreak(leadInfo(line).content.s)) break;
    const m = ind <= 3 ? parseMarkerHead(leadInfo(line).content.s, 0) : null;
    const sameList = m !== null && m.type === head.type &&
      (head.type === 'bullet' ? m.bullet === head.bullet : m.delim === head.delim);
    if (j === i || sameList) {
      if (j > i) {
        const prev = items[items.length - 1];
        if (prev.pendingBlanks > 0) {
          loose = true;
          while (prev.pendingBlanks > 0) { prev.lines.pop(); prev.pendingBlanks--; }
        }
      }
      const ci = listContentIndent(line);
      const first = stripCols(line, ci);
      const newItem = { lines: first.s === '' ? [] : [first], pendingBlanks: 0, contentIndent: ci, inPara: first.s !== '' ? updateInPara([first]) : false, nestedIndents: [], nestedMarkerIndents: [] };
      if (first.s !== '') noteNestedIndent(newItem, first);
      items.push(newItem);
      j++;
      continue;
    }
    if (items.length === 0) break;
    if (m !== null) break; // a different list starts here
    // lazy paragraph continuation inside the item
    const item = items[items.length - 1];
    if (item.pendingBlanks === 0 && item.inPara && !isBlankLine(line)) {
      const lc = leadInfo(line).content.s;
      // A line indented four or more columns is a lazy line (its first
      // four columns are stripped); otherwise it must not start a block.
      if (indentCols(line) >= 4 || !startsBlock(lc, false)) {
        if (setextLevel(lc) > 0) {
          // A lazy setext underline is kept as paragraph text, but it
          // closes the paragraph: the next line starts a new block.
          item.lines.push({ s: line.s, c: line.c, lazySetext: true });
        } else if (indentCols(line) >= 4) {
          const pl = stripCols(line, 4);
          pl.lazy = true;
          item.lines.push(pl);
        } else {
          item.lines.push({ s: line.s, c: line.c, lazy: true });
        }
        item.inPara = updateInPara(item.lines);
        j++;
        continue;
      }
    }
    break;
  }
  if (items.length > 0) {
    const last = items[items.length - 1];
    while (last.pendingBlanks > 0) { last.lines.pop(); last.pendingBlanks--; }
  }
  if (out) {
    if (head.type === 'bullet') out.push('<ul>\n');
    else {
      out.push('<ol');
      if (head.start !== 1) out.push(' start="' + head.start + '"');
      out.push('>\n');
    }
    for (let a = 0; a < items.length; a++) {
      const item = items[a];
      let taskPrefix = null;
      if (item.lines.length > 0) {
        const l0 = item.lines[0].s;
        const t0 = l0.replace(/^[ \t]+/, '');
        if ((t0.startsWith('[ ]') || t0.startsWith('[x]') || t0.startsWith('[X]')) &&
            (t0.length === 3 || t0[3] === ' ' || t0[3] === '\t')) {
          const checked = t0[1] === 'x' || t0[1] === 'X';
          taskPrefix = checked
            ? '<input checked="" disabled="" type="checkbox">'
            : '<input disabled="" type="checkbox">';
          item.lines[0] = { s: t0.slice(3), c: 0 };
        }
      }
      out.push('<li>');
      parseBlocks(item.lines, 0, item.lines.length, refs, out, !loose, taskPrefix, true, a === items.length - 1);
      out.push('</li>\n');
    }
    if (head.type === 'bullet') out.push('</ul>\n');
    else out.push('</ol>\n');
  } else {
    for (let a = 0; a < items.length; a++) {
      parseBlocks(items[a].lines, 0, items[a].lines.length, refs, null, false, null, true);
    }
  }
  return j;
}

// Strip leading blockquote markers ('>') and list markers from a line
// string, so updateInPara can tell whether the innermost content is a
// paragraph line (a lazy line must propagate through nested containers).
function stripContainerMarkers(s) {
  let t = s;
  for (;;) {
    const m = /^[ \t]{0,3}>[ \t]?/.exec(t);
    if (m) { t = t.slice(m[0].length); continue; }
    const lead = /^[ \t]{0,3}/.exec(t)[0];
    const rest = t.slice(lead.length);
    const mh = parseMarkerHead(rest, 0);
    if (mh) {
      let k = mh.markerLen;
      let w = 0;
      while (k < rest.length && (rest[k] === ' ' || rest[k] === '\t')) { k++; w++; }
      if (k >= rest.length || w >= 5) t = rest.slice(mh.markerLen + 1);
      else t = rest.slice(k);
      continue;
    }
    break;
  }
  return t;
}

// Is the last non-blank line of `itemLines` a paragraph line?
function updateInPara(itemLines) {
  for (let q = itemLines.length - 1; q >= 0; q--) {
    const l = itemLines[q];
    if (isBlankLine(l)) continue;
    const stripped = stripContainerMarkers(l.s);
    const info = leadInfo({ s: stripped, c: 0 });
    if (info.code) return false;
    return !startsBlock(info.content.s, true);
  }
  return false;
}

// ---------------------------------------------------------------------------
// Entry point.
export function parse(markdown) {
  const src = (typeof markdown === 'string' ? markdown : String(markdown ?? ''))
    .replace(/\r\n?/g, '\n')
    .replace(/\0/g, '�');
  const lines = src.split('\n').map((s) => ({ s, c: 0 }));
  const refs = new Map();
  // First pass: gather every link reference definition (they may be used
  // before they are defined). Second pass: render.
  parseBlocks(lines, 0, lines.length, refs, null, false, null);
  const out = [];
  parseBlocks(lines, 0, lines.length, refs, out, false, null);
  let html = out.join('');
  return html;
}
