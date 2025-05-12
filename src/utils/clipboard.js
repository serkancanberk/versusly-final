export const copyToClipboard = async (text, setCopied, copyTimeoutRef) => {
  try {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
  } catch (err) {
    console.error('Failed to copy URL: ', err);
  }
}; 