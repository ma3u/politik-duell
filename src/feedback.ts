// Feedback über GitHub Issues (Formular .github/ISSUE_TEMPLATE/feedback.yml). Die Felder lassen sich per
// Adresse vorausfüllen; gesendet wird erst, wenn man auf GitHub selbst absendet (dort öffentlich sichtbar).

export const FEEDBACK_REPO = 'https://github.com/ma3u/politik-duell'

export function feedbackLink({ titel, wo, art }: { titel?: string; wo?: string; art?: string } = {}): string {
  const p = new URLSearchParams({ template: 'feedback.yml' })
  if (titel) p.set('title', `[Feedback] ${titel}`)
  if (wo) p.set('wo', wo)
  if (art) p.set('art', art)
  return `${FEEDBACK_REPO}/issues/new?${p}`
}
