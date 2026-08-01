// Weekly digest email — HTML template builder.
// Kept as a plain string builder to avoid pulling any templating deps into
// Cloudflare Pages Functions runtime.

/**
 * @param {{
 *   userName: string,
 *   userEmail: string,
 *   diagramCount: number,
 *   totalExports: number,
 *   loginStreak: number,
 *   validationsRun: number,
 *   recentDiagrams: Array<{ name: string, updatedAt: string, itemCount: number }>,
 *   articles: Array<{ slug: string, title: string, excerpt: string, category: string, icon: string, readTime: string }>,
 *   unsubscribeUrl: string,
 *   appUrl: string,
 *   nextStep: { icon: string, title: string, body: string } | null,
 * }} data
 * @returns {{ subject: string, html: string, text: string }}
 */
export function buildDigestEmail(data) {
  const {
    userName,
    userEmail,
    diagramCount,
    totalExports,
    loginStreak,
    validationsRun,
    recentDiagrams = [],
    articles = [],
    unsubscribeUrl,
    appUrl = 'https://cloudcanvas.co',
    nextStep,
  } = data;

  const subject = diagramCount > 0
    ? `Your Cloud Canvas week — ${diagramCount} diagram${diagramCount === 1 ? '' : 's'}, ${totalExports} export${totalExports === 1 ? '' : 's'}`
    : `Design your first Azure architecture — Cloud Canvas Designer`;

  const displayName = userName || (userEmail || '').split('@')[0] || 'there';

  const statsRow = `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 20px 0;">
      <tr>
        ${[
          { label: 'Diagrams', value: diagramCount, color: '#0078D4' },
          { label: 'Exports', value: totalExports, color: '#10b981' },
          { label: 'Validations', value: validationsRun, color: '#8b5cf6' },
          { label: 'Streak', value: loginStreak ? `${loginStreak}🔥` : '—', color: '#f59e0b' },
        ]
          .map(
            (s) => `
              <td align="center" width="25%" style="padding: 12px 6px; background: #f8fafc; border-radius: 10px;">
                <div style="font-size: 22px; font-weight: 800; color: ${s.color}; line-height: 1;">${s.value}</div>
                <div style="font-size: 11px; color: #64748b; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.4px; font-weight: 600;">${s.label}</div>
              </td>
              ${s.label !== 'Streak' ? '<td width="8"></td>' : ''}
            `
          )
          .join('')}
      </tr>
    </table>
  `;

  const nextStepBlock = nextStep
    ? `
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 20px 0; background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-radius: 12px;">
        <tr>
          <td style="padding: 20px 22px;">
            <div style="font-size: 12px; font-weight: 700; color: #0078D4; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
              ${nextStep.icon} Suggested this week
            </div>
            <div style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 6px;">${nextStep.title}</div>
            <div style="font-size: 13px; color: #475569; line-height: 1.55;">${nextStep.body}</div>
          </td>
        </tr>
      </table>
    `
    : '';

  const diagramsList =
    recentDiagrams.length === 0
      ? ''
      : `
        <h2 style="font-size: 16px; margin: 28px 0 12px; color: #0f172a; font-weight: 700;">Your recent diagrams</h2>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
          ${recentDiagrams
            .slice(0, 5)
            .map(
              (d) => `
                <tr>
                  <td style="padding: 12px 14px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; margin-bottom: 8px;">
                    <div style="font-size: 14px; font-weight: 700; color: #0f172a;">📐 ${escapeHtml(d.name)}</div>
                    <div style="font-size: 12px; color: #64748b; margin-top: 4px;">${d.itemCount} services · updated ${friendlyDate(d.updatedAt)}</div>
                  </td>
                </tr>
                <tr><td height="8"></td></tr>
              `
            )
            .join('')}
        </table>
      `;

  const articlesList =
    articles.length === 0
      ? ''
      : `
        <h2 style="font-size: 16px; margin: 28px 0 12px; color: #0f172a; font-weight: 700;">Fresh from the blog</h2>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
          ${articles
            .slice(0, 3)
            .map(
              (a) => `
                <tr>
                  <td style="padding: 14px 16px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px;">
                    <div style="font-size: 11px; font-weight: 700; color: #0078D4; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
                      ${a.icon} ${escapeHtml(a.category)}
                    </div>
                    <a href="${appUrl}/blog/${a.slug}" style="color: #0f172a; font-size: 14px; font-weight: 700; text-decoration: none; display: block; margin-bottom: 4px;">${escapeHtml(a.title)}</a>
                    <div style="font-size: 12.5px; color: #64748b; line-height: 1.5;">${escapeHtml(a.excerpt)}</div>
                    <div style="font-size: 11px; color: #94a3b8; margin-top: 8px;">${a.readTime}</div>
                  </td>
                </tr>
                <tr><td height="10"></td></tr>
              `
            )
            .join('')}
        </table>
      `;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(subject)}</title>
</head>
<body style="margin: 0; padding: 0; background: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0f172a;">
  <div style="max-width: 620px; margin: 0 auto; padding: 24px 16px;">
    <!-- Brand header -->
    <div style="text-align: center; margin-bottom: 20px;">
      <div style="display: inline-block; padding: 10px 18px; border-radius: 999px; background: #ffffff; border: 1px solid #e2e8f0;">
        <span style="font-size: 16px; font-weight: 700; color: #0f172a; letter-spacing: -0.01em;">
          ☁️ Cloud Canvas <span style="color: #0078D4;">Designer</span>
        </span>
      </div>
    </div>

    <!-- Main card -->
    <div style="background: #ffffff; border-radius: 16px; padding: 28px 24px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px -6px rgba(15, 23, 42, 0.1);">

      <div style="font-size: 12px; color: #64748b; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 6px;">
        Your Monday digest
      </div>
      <h1 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 8px; letter-spacing: -0.01em;">
        Hey ${escapeHtml(displayName)} 👋
      </h1>
      <p style="font-size: 14px; color: #475569; line-height: 1.55; margin: 0;">
        Here's what your Cloud Canvas workspace looks like this week — a snapshot to help you keep architectures in sight.
      </p>

      ${statsRow}
      ${nextStepBlock}
      ${diagramsList}
      ${articlesList}

      <!-- CTA -->
      <div style="text-align: center; margin: 32px 0 8px;">
        <a href="${appUrl}/home" style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #0078D4 0%, #0091EA 100%); color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; border-radius: 10px; box-shadow: 0 6px 16px -6px rgba(0, 120, 212, 0.5);">
          Open my dashboard →
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 20px 8px; color: #94a3b8; font-size: 11.5px; line-height: 1.6;">
      Cloud Canvas Designer · Built by Arunim's IT Café<br />
      You are receiving this because you signed up at ${escapeHtml(new URL(appUrl).host)}.
      <br />
      <a href="${unsubscribeUrl}" style="color: #94a3b8; text-decoration: underline;">Unsubscribe from weekly digest</a>
    </div>
  </div>
</body>
</html>
`;

  const text = [
    `Hey ${displayName},`,
    ``,
    `Your Monday digest from Cloud Canvas Designer.`,
    ``,
    `Diagrams: ${diagramCount}   Exports: ${totalExports}   Validations: ${validationsRun}   Streak: ${loginStreak} day(s)`,
    ``,
    nextStep ? `Suggested next: ${nextStep.title} — ${nextStep.body}` : '',
    ``,
    recentDiagrams.length
      ? 'Your recent diagrams:\n' + recentDiagrams.slice(0, 5).map((d) => `  • ${d.name} — ${d.itemCount} services, updated ${friendlyDate(d.updatedAt)}`).join('\n')
      : '',
    ``,
    articles.length
      ? 'Fresh from the blog:\n' + articles.slice(0, 3).map((a) => `  • ${a.title}\n    ${appUrl}/blog/${a.slug}`).join('\n')
      : '',
    ``,
    `Open your dashboard: ${appUrl}/home`,
    ``,
    `Unsubscribe: ${unsubscribeUrl}`,
  ]
    .filter(Boolean)
    .join('\n');

  return { subject, html, text };
}

function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function friendlyDate(iso) {
  if (!iso) return 'recently';
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}
