/**
 * Renders the CV preview from JSON data.
 */
const TemplateRenderer = {
  render(container, data) {
    container.innerHTML = "";
    const layout = data.meta?.layout || getDefaultLayout();

    layout.forEach((sectionId, index) => {
      const sectionEl = this.renderSection(sectionId, data);
      if (!sectionEl) return;

      sectionEl.classList.add("cv-section", "cv-draggable-section");
      sectionEl.dataset.section = sectionId;
      sectionEl.dataset.index = String(index);
      sectionEl.setAttribute("draggable", "true");

      const handle = document.createElement("div");
      handle.className = "cv-drag-handle";
      handle.title = "Drag to reorder";
      handle.innerHTML = "⠿";
      handle.setAttribute("draggable", "false");
      sectionEl.prepend(handle);

      container.appendChild(sectionEl);
    });
  },

  renderSection(sectionId, data) {
    switch (sectionId) {
      case "header":
        return this.renderHeader(data.personal || {});
      case "summary":
        return this.renderSummary(data.summary);
      case "skills":
        return this.renderSkills(data.skills || []);
      case "experience":
        return this.renderExperience(data.experience || []);
      case "projects":
        return this.renderProjects(data.projects || []);
      case "certifications":
        return this.renderCertifications(data.certifications || []);
      case "education":
        return this.renderEducation(data.education || []);
      default:
        return null;
    }
  },

  renderHeader(personal) {
    const section = document.createElement("section");
    section.className = "cv-header";

    const contactParts = getContactFieldOrder(personal)
      .filter((key) => personal[key])
      .map((key) => {
        const urlKey = `${key}Url`;
        const url = personal[urlKey];
        const text = formatText(personal[key]);
        if (url) {
          return `<a href="${escapeHtml(url)}">${text}</a>`;
        }
        return text;
      });

    section.innerHTML = `
      <h1 class="cv-name">${formatText(personal.name || "Your Name")}</h1>
      ${contactParts.length ? `<p class="cv-contact">${contactParts.join('<span class="cv-contact-sep">|</span>')}</p>` : ""}
    `;
    return section;
  },

  renderSummary(text) {
    if (!text?.trim()) return null;
    const section = document.createElement("section");
    section.innerHTML = `
      <h2 class="cv-section-title">Summary</h2>
      <p class="cv-summary">${formatTextBlock(text)}</p>
    `;
    return section;
  },

  renderSkills(skills) {
    const filtered = skills.filter((s) => s.label?.trim() || s.value?.trim());
    if (!filtered.length) return null;

    const section = document.createElement("section");
    const list = document.createElement("ul");
    list.className = "cv-skills-list";

    filtered.forEach((skill) => {
      const li = document.createElement("li");
      li.className = "cv-skill-item";
      li.innerHTML = `<span class="cv-skill-label">${formatText(skill.label)}:</span> ${formatText(skill.value)}`;
      list.appendChild(li);
    });

    section.innerHTML = `<h2 class="cv-section-title">Technical Skills</h2>`;
    section.appendChild(list);
    return section;
  },

  renderExperience(items) {
    const filtered = items.filter((item) => hasContent(item, ["bullets"]));
    if (!filtered.length) return null;

    const section = document.createElement("section");
    section.innerHTML = `<h2 class="cv-section-title">Experience</h2>`;

    filtered.forEach((item) => {
      const entry = document.createElement("div");
      entry.className = "cv-entry";
      entry.innerHTML = `
        <div class="cv-entry-header">
          <span class="cv-entry-role">${formatText(item.role || "Role")}</span>
          <span class="cv-entry-dates">${formatDateRange(item.startDate, item.endDate)}</span>
        </div>
        <div class="cv-entry-subheader">
          <span class="cv-entry-company">${formatText(item.company || "Company")}</span>
          ${item.location ? `<span class="cv-entry-location">${formatText(item.location)}</span>` : ""}
        </div>
        ${renderBulletList(item.bullets)}
      `;
      section.appendChild(entry);
    });

    return section;
  },

  renderProjects(items) {
    const filtered = items.filter((item) => hasContent(item, ["bullets"]));
    if (!filtered.length) return null;

    const section = document.createElement("section");
    section.innerHTML = `<h2 class="cv-section-title">Projects</h2>`;

    filtered.forEach((item) => {
      const entry = document.createElement("div");
      entry.className = "cv-entry";

      const leftParts = [];
      if (item.name) leftParts.push(`<span class="cv-project-name">${formatText(item.name)}</span>`);
      if (item.techStack) {
        leftParts.push(`<span class="cv-project-tech">${formatText(item.techStack)}</span>`);
      }

      const linkHtml = item.linkText
        ? item.linkUrl
          ? `<a href="${escapeHtml(item.linkUrl)}">${formatText(item.linkText)}</a>`
          : formatText(item.linkText)
        : "";

      entry.innerHTML = `
        <div class="cv-project-header">
          <span class="cv-project-left">${leftParts.join('<span class="cv-project-sep">|</span>')}</span>
          ${linkHtml ? `<span class="cv-project-link">${linkHtml}</span>` : ""}
        </div>
        ${renderBulletList(item.bullets)}
      `;
      section.appendChild(entry);
    });

    return section;
  },

  renderCertifications(items) {
    const filtered = items.filter((item) => hasContent(item));
    if (!filtered.length) return null;

    const section = document.createElement("section");
    section.innerHTML = `<h2 class="cv-section-title">Certifications</h2>`;

    filtered.forEach((item) => {
      const entry = document.createElement("div");
      entry.className = "cv-entry";

      const linkHtml = item.linkText
        ? item.linkUrl
          ? `<a href="${escapeHtml(item.linkUrl)}">${formatText(item.linkText)}</a>`
          : formatText(item.linkText)
        : "";

      entry.innerHTML = `
        <div class="cv-entry-subheader">
          <span class="cv-entry-institution">${formatText(item.name || "Certification")}</span>
          ${item.completedDate ? `<span class="cv-entry-location">${formatText(item.completedDate)}</span>` : ""}
        </div>
        <div class="cv-entry-header">
          <span class="cv-entry-degree">${formatText(item.description || "")}</span>
          ${linkHtml ? `<span class="cv-entry-dates cv-cert-link">${linkHtml}</span>` : ""}
        </div>
      `;
      section.appendChild(entry);
    });

    return section;
  },

  renderEducation(items) {
    const filtered = items.filter((item) => hasContent(item));
    if (!filtered.length) return null;

    const section = document.createElement("section");
    section.innerHTML = `<h2 class="cv-section-title">Education</h2>`;

    filtered.forEach((item) => {
      const entry = document.createElement("div");
      entry.className = "cv-entry";
      entry.innerHTML = `
        <div class="cv-entry-subheader">
          <span class="cv-entry-institution">${formatText(item.institution || "Institution")}</span>
          ${item.location ? `<span class="cv-entry-location">${formatText(item.location)}</span>` : ""}
        </div>
        <div class="cv-entry-header">
          <span class="cv-entry-degree">${formatText(item.degree || "Degree")}</span>
          <span class="cv-entry-dates">${formatDateRange(item.startDate, item.endDate)}</span>
        </div>
      `;
      section.appendChild(entry);
    });

    return section;
  },

  renderPrintDocument(data) {
    const templateId = data.meta?.templateId || "default";
    const layout = data.meta?.layout || getDefaultLayout();

    const sectionsHtml = layout
      .map((id) => {
        const el = this.renderSection(id, data);
        if (!el) return "";
        el.classList.add("cv-section");
        el.dataset.section = id;
        return el.outerHTML;
      })
      .join("");

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(data.personal?.name || "CV")}</title>
  <link rel="stylesheet" href="templates/${templateId}/template.css">
  <style>
    @page { size: A4; margin: 12mm; }
    body { margin: 0; background: #fff; }
    .cv-drag-handle { display: none !important; }
    .cv-draggable-section { cursor: default !important; }
  </style>
</head>
<body>
  <article class="cv-template">${sectionsHtml}</article>
</body>
</html>`;
  },
};

function formatDateRange(start, end) {
  if (!start && !end) return "";
  if (start && end) return `${formatText(start)} – ${formatText(end)}`;
  return formatText(start || end);
}

function renderBulletList(items) {
  const bullets = (items || []).filter((b) => String(b || "").trim());
  if (!bullets.length) return "";
  return `<ul class="cv-bullets">${bullets.map((b) => `<li>${formatText(b)}</li>`).join("")}</ul>`;
}

function hasContent(obj, excludeKeys = []) {
  return Object.entries(obj).some(([key, val]) => {
    if (excludeKeys.includes(key)) return false;
    if (Array.isArray(val)) return val.some((v) => String(v || "").trim());
    return String(val || "").trim();
  }) || (obj.bullets && obj.bullets.some((b) => String(b || "").trim()));
}
