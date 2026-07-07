let pendingCvData = null;

const loaderEl = document.getElementById("home-loader");
const uploadReadyEl = document.getElementById("upload-ready");
const uploadFilenameEl = document.getElementById("upload-filename");
const fileInput = document.getElementById("json-upload");
const uploadLabel = document.getElementById("upload-label");

function showLoader() {
  loaderEl.hidden = false;
}

function hideLoader() {
  loaderEl.hidden = true;
}

function showUploadReady(filename) {
  uploadFilenameEl.textContent = filename;
  uploadReadyEl.hidden = false;
  uploadLabel.classList.add("is-disabled");
}

function resetUploadState() {
  pendingCvData = null;
  uploadReadyEl.hidden = true;
  uploadFilenameEl.textContent = "";
  fileInput.value = "";
  uploadLabel.classList.remove("is-disabled");
}

async function fetchDefaultCv() {
  const response = await fetch("data/default-cv.json");
  if (!response.ok) throw new Error("Failed to load CV template");
  return response.json();
}

document.getElementById("btn-download-template").addEventListener("click", async () => {
  try {
    const data = ensureValidData(await fetchDefaultCv());
    downloadJson(data, "cv-template.json");
  } catch (err) {
    alert("Could not download template: " + err.message);
  }
});

fileInput.addEventListener("change", async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  showLoader();
  resetUploadState();
  pendingCvData = null;

  try {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const text = await file.text();
    const parsed = JSON.parse(text);
    pendingCvData = ensureValidData(parsed);
    showUploadReady(file.name);
  } catch {
    alert("Invalid JSON file. Please upload a valid CV JSON file.");
    fileInput.value = "";
  } finally {
    hideLoader();
  }
});

document.getElementById("btn-start-editing").addEventListener("click", () => {
  if (!pendingCvData) return;
  saveCvData(pendingCvData);
  window.location.href = "editor.html";
});

document.getElementById("btn-upload-another").addEventListener("click", () => {
  resetUploadState();
  fileInput.click();
});
