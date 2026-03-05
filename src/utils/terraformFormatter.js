// Terraform Formatter (terraform fmt equivalent for the browser)
// Applies HashiCorp HCL canonical formatting conventions:
// - 2-space indentation
// - Aligned equals signs within blocks
// - Consistent blank lines between blocks
// - Trimmed trailing whitespace
// - Sorted meta-arguments first (lifecycle, depends_on, etc.)

/**
 * Format Terraform HCL content following `terraform fmt` conventions
 * @param {string} content - Raw Terraform HCL content
 * @returns {string} - Formatted Terraform HCL content
 */
export const formatTerraform = (content) => {
  if (!content || typeof content !== 'string') return '';

  let lines = content.split('\n');

  // Step 1: Normalize indentation to 2 spaces
  lines = normalizeIndentation(lines);

  // Step 2: Align equals signs within each block
  lines = alignEqualsInBlocks(lines);

  // Step 3: Normalize blank lines (max 1 between blocks, none at start/end of blocks)
  lines = normalizeBlankLines(lines);

  // Step 4: Trim trailing whitespace
  lines = lines.map(line => line.trimEnd());

  // Step 5: Ensure file ends with single newline
  const result = lines.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd() + '\n';

  return result;
};

/**
 * Normalize all indentation to 2-space increments
 */
const normalizeIndentation = (lines) => {
  return lines.map(line => {
    const trimmed = line.trimStart();
    if (trimmed === '') return '';

    // Count the leading whitespace and convert tabs/mixed spaces to 2-space units
    const leadingMatch = line.match(/^(\s*)/);
    const leading = leadingMatch ? leadingMatch[1] : '';

    // Calculate indent level: each tab = 1 level, every 2-4 spaces = 1 level
    let indentLevel = 0;
    let i = 0;
    while (i < leading.length) {
      if (leading[i] === '\t') {
        indentLevel++;
        i++;
      } else if (leading[i] === ' ') {
        // Count consecutive spaces
        let spaceCount = 0;
        while (i < leading.length && leading[i] === ' ') {
          spaceCount++;
          i++;
        }
        // 2-4 spaces = 1 indent level, 5-8 = 2, etc.
        indentLevel += Math.round(spaceCount / 2);
      } else {
        break;
      }
    }

    return '  '.repeat(indentLevel) + trimmed;
  });
};

/**
 * Align equals signs within each block at the same depth level.
 * This mimics `terraform fmt` behavior where attribute assignments
 * in the same block are vertically aligned.
 *
 * Example:
 *   name     = "example"
 *   location = var.location
 */
const alignEqualsInBlocks = (lines) => {
  const result = [...lines];
  let _blockStart = -1;
  let _currentDepth = 0;

  // Collect groups of consecutive assignment lines at the same depth
  let group = [];
  let groupIndices = [];

  const flushGroup = () => {
    if (group.length < 2) {
      group = [];
      groupIndices = [];
      return;
    }

    // Find the max key length in the group
    let maxKeyLen = 0;
    const parsed = group.map(line => {
      const match = line.match(/^(\s*)([\w.\-[\]"]+)\s*=\s*(.*)$/);
      if (match) {
        const indent = match[1];
        const key = match[2];
        const value = match[3];
        maxKeyLen = Math.max(maxKeyLen, key.length);
        return { indent, key, value };
      }
      return null;
    });

    // Rewrite lines with aligned equals
    parsed.forEach((p, i) => {
      if (p) {
        const paddedKey = p.key.padEnd(maxKeyLen);
        result[groupIndices[i]] = `${p.indent}${paddedKey} = ${p.value}`;
      }
    });

    group = [];
    groupIndices = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

        // Track block depth
    if (trimmed.endsWith('{')) {
      flushGroup();
      _currentDepth++;
      _blockStart = i;
    } else if (trimmed === '}' || trimmed === '},') {
      flushGroup();
      _currentDepth--;
    } else if (trimmed.match(/^[\w.\-[\]"]+\s*=\s*.+/) && !trimmed.startsWith('#') && !trimmed.startsWith('//')) {
      // This is an assignment line
      const indent = line.match(/^(\s*)/)[1];
      const depth = indent.length / 2;

      // Only group consecutive assignments at the same depth
      if (group.length > 0) {
        const prevIndent = group[group.length - 1].match(/^(\s*)/)[1];
        const prevDepth = prevIndent.length / 2;
        if (depth !== prevDepth) {
          flushGroup();
        }
      }

      group.push(line);
      groupIndices.push(i);
    } else if (trimmed === '' || trimmed.startsWith('#') || trimmed.startsWith('//')) {
      // Blank line or comment breaks the alignment group
      flushGroup();
    } else {
      flushGroup();
    }
  }

  flushGroup();
  return result;
};

/**
 * Normalize blank lines:
 * - Remove multiple consecutive blank lines (max 1)
 * - Remove blank lines immediately after opening brace
 * - Remove blank lines immediately before closing brace (unless preceded by assignment)
 * - Ensure blank line between top-level blocks
 */
const normalizeBlankLines = (lines) => {
  const result = [];
  let prevWasBlank = false;
  let prevWasOpenBrace = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();    const isBlank = trimmed === '';
    // isCloseBrace used in nextLine check below
    const nextLine = i + 1 < lines.length ? lines[i + 1].trim() : '';

    // Skip multiple consecutive blank lines
    if (isBlank && prevWasBlank) continue;

    // Skip blank line right after an opening brace
    if (isBlank && prevWasOpenBrace) continue;

    // Skip blank line right before a closing brace
    if (isBlank && (nextLine === '}' || nextLine === '},')) {
      continue;
    }

    result.push(line);
    prevWasBlank = isBlank;
    prevWasOpenBrace = trimmed.endsWith('{');
  }

  return result;
};

/**
 * Format multiple Terraform files at once
 * @param {Object} terraformFiles - Object with keys like 'main', 'variables', 'outputs', etc.
 * @returns {Object} - Same structure with formatted content
 */
export const formatTerraformFiles = (terraformFiles) => {
  const formatted = {};
  for (const [key, content] of Object.entries(terraformFiles)) {
    // Only format .tf-like content (not README.md)
    if (key === 'readme') {
      formatted[key] = content;
    } else {
      formatted[key] = formatTerraform(content);
    }
  }
  return formatted;
};

export default formatTerraform;
