// ARM template expression evaluator.
// Evaluates a subset of ARM template functions needed for architecture discovery:
//   parameters('x')     → the parameter's defaultValue
//   variables('x')      → the variable's evaluated value
//   concat(a, b, c)     → string concatenation
//   resourceId(...)     → synthesized ARM resource ID
//   subscription().id   → placeholder subscription id
//   resourceGroup().*   → placeholder resource group values
// Any expression it cannot evaluate is returned unchanged (raw template string).

const PLACEHOLDER_SUB = '00000000-0000-0000-0000-000000000000';
const PLACEHOLDER_RG  = 'arm-import';

export function createEvaluator(template) {
  const params = template?.parameters || {};
  const vars   = template?.variables  || {};

  // Cache evaluated variables (in case they reference each other)
  const varCache = new Map();

  const paramValue = (name) => {
    const p = params[name];
    if (!p) return name;                // leave as-is if missing
    if (Object.prototype.hasOwnProperty.call(p, 'defaultValue')) return p.defaultValue;
    return name;
  };

  const varValue = (name) => {
    if (varCache.has(name)) return varCache.get(name);
    const raw = vars[name];
    const evaluated = evalNode(raw);
    varCache.set(name, evaluated);
    return evaluated;
  };

  // Evaluate a value (string, object, or array) — walks all nested strings.
  function evalNode(node) {
    if (node == null) return node;
    if (typeof node === 'string') return evalString(node);
    if (Array.isArray(node)) return node.map(evalNode);
    if (typeof node === 'object') {
      const out = {};
      for (const [k, v] of Object.entries(node)) out[k] = evalNode(v);
      return out;
    }
    return node;
  }

  // Evaluate a string. If it's an ARM expression `[ ... ]`, parse and evaluate.
  function evalString(str) {
    if (typeof str !== 'string' || str.length < 3) return str;
    // ARM expressions start with `[` and end with `]` (but `[[` is an escaped literal)
    if (str.startsWith('[[')) return str.slice(1);   // literal escape
    if (str.startsWith('[') && str.endsWith(']')) {
      try {
        const inner = str.slice(1, -1).trim();
        const val = evalExpr(inner);
        return typeof val === 'string' ? val : (val ?? str);
      } catch {
        return str;
      }
    }
    return str;
  }

  // Evaluate an expression string (without surrounding [ ])
  // Handles function calls and dotted property accesses at the top level.
  function evalExpr(expr) {
    const parsed = parseCall(expr);
    if (!parsed) {
      // No function call — maybe a literal string or number
      if (/^'[^']*'$/.test(expr)) return expr.slice(1, -1);
      if (/^-?\d+(\.\d+)?$/.test(expr)) return Number(expr);
      if (expr === 'true') return true;
      if (expr === 'false') return false;
      if (expr === 'null') return null;
      return expr;
    }

    const { name, args, tail } = parsed;
    const evaluatedArgs = args.map(evalExpr);
    let value;

    switch (name.toLowerCase()) {
      case 'parameters':
        value = paramValue(evaluatedArgs[0]);
        // parameter value might itself be an expression string
        if (typeof value === 'string') value = evalString(value);
        break;
      case 'variables':
        value = varValue(evaluatedArgs[0]);
        break;
      case 'concat':
        value = evaluatedArgs.map(v => v == null ? '' : String(v)).join('');
        break;
      case 'format': {
        const [fmt, ...rest] = evaluatedArgs;
        value = String(fmt).replace(/\{(\d+)\}/g, (_, i) => rest[Number(i)] ?? '');
        break;
      }
      case 'tolower':
        value = String(evaluatedArgs[0] ?? '').toLowerCase();
        break;
      case 'toupper':
        value = String(evaluatedArgs[0] ?? '').toUpperCase();
        break;
      case 'trim':
        value = String(evaluatedArgs[0] ?? '').trim();
        break;
      case 'replace':
        value = String(evaluatedArgs[0] ?? '').split(evaluatedArgs[1]).join(evaluatedArgs[2] ?? '');
        break;
      case 'substring':
        value = String(evaluatedArgs[0] ?? '').substr(evaluatedArgs[1] || 0, evaluatedArgs[2]);
        break;
      case 'guid':
        value = 'guid-placeholder';
        break;
      case 'uniquestring':
        value = 'uniq-placeholder';
        break;
      case 'resourceid':
        value = buildResourceId(evaluatedArgs);
        break;
      case 'subscriptionresourceid':
        value = buildResourceId(evaluatedArgs, { scope: 'subscription' });
        break;
      case 'extensionresourceid':
        value = buildResourceId(evaluatedArgs.slice(1), { parent: evaluatedArgs[0] });
        break;
      case 'subscription':
        value = { id: `/subscriptions/${PLACEHOLDER_SUB}`, subscriptionId: PLACEHOLDER_SUB };
        break;
      case 'resourcegroup':
        value = { id: `/subscriptions/${PLACEHOLDER_SUB}/resourceGroups/${PLACEHOLDER_RG}`, name: PLACEHOLDER_RG, location: 'eastus' };
        break;
      case 'reference':
      case 'listkeys':
      case 'listsecrets':
        // Runtime-only functions — return the resource id as best guess
        value = evaluatedArgs[0];
        break;
      case 'if':
        value = evaluatedArgs[0] ? evaluatedArgs[1] : evaluatedArgs[2];
        break;
      case 'coalesce':
        value = evaluatedArgs.find(v => v !== null && v !== undefined);
        break;
      case 'first':
        value = Array.isArray(evaluatedArgs[0]) ? evaluatedArgs[0][0] : evaluatedArgs[0];
        break;
      case 'last':
        value = Array.isArray(evaluatedArgs[0]) ? evaluatedArgs[0][evaluatedArgs[0].length - 1] : evaluatedArgs[0];
        break;
      case 'length':
        value = (evaluatedArgs[0] || '').length;
        break;
      case 'equals':
        value = evaluatedArgs[0] === evaluatedArgs[1];
        break;
      case 'not':
        value = !evaluatedArgs[0];
        break;
      case 'and':
        value = evaluatedArgs.every(Boolean);
        break;
      case 'or':
        value = evaluatedArgs.some(Boolean);
        break;
      case 'contains':
        value = String(evaluatedArgs[0] || '').includes(String(evaluatedArgs[1] || ''));
        break;
      case 'array':
        value = Array.isArray(evaluatedArgs[0]) ? evaluatedArgs[0] : [evaluatedArgs[0]];
        break;
      case 'json':
        try { value = JSON.parse(evaluatedArgs[0]); } catch { value = evaluatedArgs[0]; }
        break;
      default:
        // Unknown function — return concatenation of args as fallback
        value = evaluatedArgs.join('/');
        break;
    }

    // Apply trailing property access (.id, .name, [0], etc.)
    if (tail) value = applyTail(value, tail);
    return value;
  }

  function applyTail(value, tail) {
    let cursor = 0;
    while (cursor < tail.length) {
      const ch = tail[cursor];
      if (ch === '.') {
        // property access
        cursor++;
        let propEnd = cursor;
        while (propEnd < tail.length && /[\w]/.test(tail[propEnd])) propEnd++;
        const prop = tail.slice(cursor, propEnd);
        value = value && typeof value === 'object' ? value[prop] : value;
        cursor = propEnd;
      } else if (ch === '[') {
        const end = tail.indexOf(']', cursor);
        if (end === -1) break;
        const idxExpr = tail.slice(cursor + 1, end);
        const idx = evalExpr(idxExpr);
        value = value != null ? value[idx] : value;
        cursor = end + 1;
      } else {
        cursor++;
      }
    }
    return value;
  }

  function buildResourceId(args) {
    if (!args || args.length === 0) return null;
    // resourceId([subscriptionId, resourceGroup,] resourceType, resourceName [, subResourceName ...])
    let sub = PLACEHOLDER_SUB;
    let rg  = PLACEHOLDER_RG;
    let idx = 0;
    // Detect optional subscription/rg leading args (36-char guid pattern for sub)
    if (typeof args[0] === 'string' && /^[a-f0-9-]{20,}$/i.test(args[0])) {
      sub = args[idx++];
    }
    if (args.length - idx >= 3 && typeof args[idx] === 'string' && !args[idx].includes('/')) {
      // Ambiguous — assume RG when the first arg is not a type (no `/`) and >= 3 args left
      rg = args[idx++];
    }
    const typePath = String(args[idx++] || '');
    const nameParts = args.slice(idx).map(v => v == null ? '' : String(v));
    // Compose /providers/{ns}/{typeA}/{nameA}/{typeB}/{nameB}...
    const typeSegments = typePath.split('/');
    const ns = typeSegments.shift();
    let path = `/subscriptions/${sub}/resourceGroups/${rg}/providers/${ns}`;
    for (let i = 0; i < typeSegments.length; i++) {
      path += `/${typeSegments[i]}`;
      if (nameParts[i]) path += `/${nameParts[i]}`;
    }
    return path;
  }

  // Parse `func(a, b, c).prop[0]` → { name:'func', args:['a','b','c'], tail:'.prop[0]' }
  function parseCall(expr) {
    const m = expr.match(/^([a-zA-Z_][\w]*)\s*\(/);
    if (!m) return null;
    const name = m[1];
    const openIdx = m[0].length - 1;
    // Find matching close paren
    let depth = 0;
    let closeIdx = -1;
    let inQuote = false;
    for (let i = openIdx; i < expr.length; i++) {
      const c = expr[i];
      if (c === "'") inQuote = !inQuote;
      if (inQuote) continue;
      if (c === '(') depth++;
      else if (c === ')') { depth--; if (depth === 0) { closeIdx = i; break; } }
    }
    if (closeIdx === -1) return null;
    const argsStr = expr.slice(openIdx + 1, closeIdx);
    const args = splitArgs(argsStr);
    const tail = expr.slice(closeIdx + 1);
    return { name, args, tail };
  }

  // Split a comma-separated arg list respecting nested parens and quotes.
  function splitArgs(str) {
    const out = [];
    let depth = 0;
    let inQuote = false;
    let start = 0;
    for (let i = 0; i < str.length; i++) {
      const c = str[i];
      if (c === "'") inQuote = !inQuote;
      if (inQuote) continue;
      if (c === '(' || c === '[') depth++;
      else if (c === ')' || c === ']') depth--;
      else if (c === ',' && depth === 0) {
        out.push(str.slice(start, i).trim());
        start = i + 1;
      }
    }
    if (str.slice(start).trim()) out.push(str.slice(start).trim());
    return out;
  }

  return { eval: evalNode, evalString };
}

// Convenience: synthesize an ARM resource ID from type + name + rg (used when
// a resource has no explicit `id` and we need one to be resolvable).
export function synthesizeResourceId(azureType, name, resourceGroup = PLACEHOLDER_RG, subscription = PLACEHOLDER_SUB) {
  const [ns, ...typeSegments] = String(azureType || '').split('/');
  const nameParts = String(name || '').split('/');
  let path = `/subscriptions/${subscription}/resourceGroups/${resourceGroup}/providers/${ns}`;
  for (let i = 0; i < typeSegments.length; i++) {
    path += `/${typeSegments[i]}`;
    if (nameParts[i]) path += `/${nameParts[i]}`;
  }
  return path;
}

export const ARM_PLACEHOLDERS = { subscription: PLACEHOLDER_SUB, resourceGroup: PLACEHOLDER_RG };
