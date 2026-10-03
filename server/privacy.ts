// Masks contact details in pasted resume text before it is sent to the model.
export function maskContactInfo(text: string): string {
  return text
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, '[email hidden]')
    .replace(/(?:https?:\/\/)?(?:www\.)?(?:linkedin\.com|github\.com)\/[^\s,;)]+/gi, '[profile link hidden]')
    .replace(/(?<!\d)\+?\d[\d\s().-]{8,}\d(?!\d)/g, (m) => {
      const digits = m.replace(/\D/g, '').length;
      return digits >= 10 && digits <= 13 ? '[phone hidden]' : m;
    });
}
