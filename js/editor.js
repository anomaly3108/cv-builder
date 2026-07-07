let cvData = null;

const previewEl = document.getElementById("cv-preview");
const formContainer = document.getElementById("form-container");
const templateCss = document.getElementById("template-css");

async function initEditor() {
  cvData = loadCvData();

  if (!cvData) {
    try {
      cvData = ensureValidData(await fetchDefaultCv());
      saveCvData(cvData);
    } catch {
      window.location.href = "index.html";
      return;
    }
  }

  applyTemplate(cvData.meta?.templateId || "default");
  renderAll();

  DragDrop.init(previewEl, (layout) => {
    cvData.meta.layout = layout;
    saveCvData(cvData);
    FormBuilder.build(formContainer, cvData, onFormChange);
  });

  document.getElementById("btn-download").addEventListener("click", () => {
    const name = cvData.personal?.name?.trim();
    const filename = name
      ? `${name.toLowerCase().replace(/\s+/g, "-")}-cv.json`
      : "cv-data.json";
    downloadJson(cvData, filename);
  });

  document.getElementById("btn-print").addEventListener("click", printCv);
}

async function fetchDefaultCv() {
  const response = await fetch("data/default-cv.json");
  if (!response.ok) throw new Error("Failed to load default CV");
  return response.json();
}

function applyTemplate(templateId) {
  templateCss.href = `templates/${templateId}/template.css`;
}

function onFormChange(data, options = {}) {
  cvData = data;
  saveCvData(cvData);
  TemplateRenderer.render(previewEl, cvData);
  if (options.rebuildForms) {
    FormBuilder.build(formContainer, cvData, onFormChange);
  }
}

function renderAll() {
  FormBuilder.build(formContainer, cvData, onFormChange);
  TemplateRenderer.render(previewEl, cvData);
}

function printCv() {
  const html = TemplateRenderer.renderPrintDocument(cvData);
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Pop-up blocked. Please allow pop-ups to print your CV.");
    return;
  }
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
  };
}

initEditor();
