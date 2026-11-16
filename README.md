# markdown-fast

A fast, dependency-free Markdown renderer for Node. `parse(markdown)` returns
exactly the HTML that marked 18.1.3 renders with its default options
(GFM on, breaks off), for CommonMark 0.31.2 plus the GFM extensions:
tables, task lists, strikethrough, and extended autolinks.

It is a single-pass block parser plus a single-pass inline parser, written
from the CommonMark and GFM specs. Plain paragraphs take a fast path, and
the inline scanner jumps straight to the next special character instead of
re-tokenizing with regular expressions, which is where most of the speed
comes from.

## Files

- `parse.js` — the renderer. Dependency-free ES module, exports `parse()`.
- `main.ts` — the harness driver: reads `/input/cases.json`, writes
  `/output/html.json`.

## Usage

```js
import { parse } from './parse.js';

parse('# Hello\n\nSome *emphasised* text.\n');
// '<h1>Hello</h1>\n<p>Some <em>emphasised</em> text.</p>\n'
```

## License

MIT. See `LICENSE`.
