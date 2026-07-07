/**
 * Inline text formatting: *bold* and _italic_
 */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatText(str) {
  if (!str) return "";
  let html = escapeHtml(str);
  html = html.replace(/\*([^*]+)\*/g, "<strong>$1</strong>");
  html = html.replace(/_([^_]+)_/g, "<em>$1</em>");
  return html;
}

function formatTextBlock(str) {
  if (!str) return "";
  return formatText(str).replace(/\n/g, "<br>");
}
