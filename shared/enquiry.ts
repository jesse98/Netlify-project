export const ENQUIRY_EMAIL = '';

export function enquiryEmail(draft: string): { href: string; includesBrief: boolean } {
  // Encode body text as data, so visitor text cannot add email header parameters.
  const wellFormed = Array.from(draft, character => {
    const code = character.charCodeAt(0);
    return character.length === 1 && code >= 0xd800 && code <= 0xdfff ? '\ufffd' : character;
  }).join('');
  const base = ENQUIRY_EMAIL ? 'mailto:' + ENQUIRY_EMAIL + '?subject=' + encodeURIComponent('Construct implementation enquiry') : '#';
  const full = base + '&body=' + encodeURIComponent(wellFormed);
  // Mail clients differ in supported URL length. Preserve the complete draft for
  // copy/download and offer a subject-only email when the encoded brief is long.
  return full.length <= 1900 ? { href: full, includesBrief: true } : { href: base, includesBrief: false };
}
