/**
 * CV section definitions — maps layout keys to labels and render logic.
 */
const CV_SECTIONS = {
  header: {
    label: "Personal Information",
    dataKey: "personal",
    type: "object",
    fields: {
      name: { label: "Name", type: "text" },
      phone: { label: "Phone", type: "tel" },
      email: { label: "Email", type: "email" },
      linkedin: { label: "LinkedIn (display text)", type: "text", placeholder: "LinkedIn" },
      linkedinUrl: { label: "LinkedIn URL", type: "url", placeholder: "https://linkedin.com/in/..." },
      github: { label: "GitHub (display text)", type: "text", placeholder: "GitHub" },
      githubUrl: { label: "GitHub URL", type: "url", placeholder: "https://github.com/..." },
      instagram: { label: "Instagram (display text)", type: "text", placeholder: "Instagram" },
      instagramUrl: { label: "Instagram URL", type: "url", placeholder: "https://instagram.com/..." },
    },
  },
  summary: {
    label: "Summary",
    dataKey: "summary",
    type: "string",
    field: { label: "Professional Summary", type: "textarea", formatted: true },
  },
  skills: {
    label: "Technical Skills",
    dataKey: "skills",
    type: "skillCategories",
    itemLabel: "Category",
    fields: {
      label: { label: "Category", type: "text", placeholder: "Languages" },
      value: { label: "Skills", type: "text", placeholder: "JavaScript, TypeScript", formatted: true },
    },
  },
  experience: {
    label: "Experience",
    dataKey: "experience",
    type: "experienceList",
    itemLabel: "Role",
    fields: {
      role: { label: "Role / Title", type: "text", formatted: true },
      startDate: { label: "Start Date", type: "text", placeholder: "June 2025" },
      endDate: { label: "End Date", type: "text", placeholder: "Present" },
      company: { label: "Company", type: "text", formatted: true },
      location: { label: "Location", type: "text", placeholder: "Gurgaon, India" },
    },
  },
  projects: {
    label: "Projects",
    dataKey: "projects",
    type: "projectList",
    itemLabel: "Project",
    fields: {
      name: { label: "Project Name", type: "text", formatted: true },
      techStack: { label: "Tech Stack", type: "text", placeholder: "React, Node.js, MongoDB" },
      linkText: { label: "Link Text", type: "text", placeholder: "Project Link" },
      linkUrl: { label: "Link URL", type: "url" },
    },
  },
  certifications: {
    label: "Certifications",
    dataKey: "certifications",
    type: "educationList",
    itemLabel: "Certification",
    fields: {
      name: { label: "Certification Name", type: "text", formatted: true },
      description: { label: "Description", type: "text", formatted: true },
      completedDate: { label: "Date of Completion", type: "text", placeholder: "Jan 2024" },
      linkText: { label: "Certificate Link Text", type: "text", placeholder: "View Certificate" },
      linkUrl: { label: "Certificate Link URL", type: "url" },
    },
  },
  education: {
    label: "Education",
    dataKey: "education",
    type: "educationList",
    itemLabel: "Entry",
    fields: {
      institution: { label: "Institution", type: "text", formatted: true },
      location: { label: "Location", type: "text", placeholder: "Ghaziabad" },
      degree: { label: "Degree", type: "text", formatted: true },
      startDate: { label: "Start Date", type: "text", placeholder: "Aug 2017" },
      endDate: { label: "End Date", type: "text", placeholder: "May 2021" },
    },
  },
};

const STORAGE_KEY = "cv-builder-data-v4";

const DEFAULT_CV = {
  meta: {
    templateId: "default",
    layout: ["header", "summary", "skills", "experience", "projects", "certifications", "education"],
  },
  personal: {
    name: "",
    phone: "",
    email: "",
    linkedin: "",
    linkedinUrl: "",
    github: "",
    githubUrl: "",
    instagram: "",
    instagramUrl: "",
  },
  summary: "",
  skills: [
    { label: "Languages", value: "" },
    { label: "Frameworks", value: "" },
    { label: "Developer Tools", value: "" },
    { label: "Testing", value: "" },
    { label: "Cloud & Backend", value: "" },
    { label: "Currently Exploring", value: "" },
  ],
  experience: [
    {
      role: "",
      startDate: "",
      endDate: "",
      company: "",
      location: "",
      bullets: [""],
    },
  ],
  projects: [
    {
      name: "",
      techStack: "",
      linkText: "",
      linkUrl: "",
      bullets: [""],
    },
  ],
  certifications: [
    {
      name: "",
      description: "",
      completedDate: "",
      linkText: "",
      linkUrl: "",
    },
  ],
  education: [
    {
      institution: "",
      location: "",
      degree: "",
      startDate: "",
      endDate: "",
    },
  ],
};

function getDefaultLayout() {
  return Object.keys(CV_SECTIONS);
}

function getSectionDef(sectionId) {
  return CV_SECTIONS[sectionId] || null;
}

function humanizeFieldKey(key) {
  if (key.endsWith("Url")) {
    return `${humanizeFieldKey(key.slice(0, -3))} URL`;
  }
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

function inferFieldDef(key) {
  if (key === "email") return { label: "Email", type: "email" };
  if (key === "phone") return { label: "Phone", type: "tel" };
  if (key.endsWith("Url")) {
    return {
      label: humanizeFieldKey(key),
      type: "url",
      placeholder: "https://...",
    };
  }
  return { label: humanizeFieldKey(key), type: "text" };
}

/** Merge schema field defs with any extra keys found in JSON data. */
function getMergedFields(schemaFields, dataObj, excludeKeys = []) {
  const fields = { ...(schemaFields || {}) };
  const exclude = new Set(excludeKeys);
  const dataKeys = Object.keys(dataObj || {}).filter((k) => !exclude.has(k));

  dataKeys.forEach((key) => {
    if (!fields[key]) fields[key] = inferFieldDef(key);
  });

  const schemaOrder = Object.keys(schemaFields || {});
  const extras = dataKeys.filter((k) => !schemaOrder.includes(k)).sort();
  const order = [...schemaOrder, ...extras].filter((k) => !exclude.has(k));

  return { fields, order };
}

function getContactFieldOrder(personal) {
  const schemaOrder = Object.keys(CV_SECTIONS.header?.fields || {}).filter(
    (k) => k !== "name"
  );
  const displayKeys = Object.keys(personal || {}).filter(
    (k) => k !== "name" && !k.endsWith("Url")
  );
  const ordered = schemaOrder.filter((k) => displayKeys.includes(k));
  const extras = displayKeys.filter((k) => !ordered.includes(k)).sort();
  return [...ordered, ...extras];
}

function ensureValidData(data) {
  const merged = deepMerge(structuredClone(DEFAULT_CV), data || {});

  if (!merged.meta) merged.meta = {};
  if (!merged.meta.templateId) merged.meta.templateId = "default";

  const knownSections = getDefaultLayout();
  if (!Array.isArray(merged.meta.layout) || merged.meta.layout.length === 0) {
    merged.meta.layout = [...knownSections];
  } else {
    merged.meta.layout = merged.meta.layout.filter((id) =>
      knownSections.includes(id)
    );
    knownSections.forEach((id) => {
      if (!merged.meta.layout.includes(id)) {
        if (id === "certifications") {
          const eduIdx = merged.meta.layout.indexOf("education");
          if (eduIdx >= 0) merged.meta.layout.splice(eduIdx, 0, id);
          else merged.meta.layout.push(id);
        } else {
          merged.meta.layout.push(id);
        }
      }
    });
  }

  if (!Array.isArray(merged.skills) || merged.skills.length === 0) {
    merged.skills = structuredClone(DEFAULT_CV.skills);
  } else {
    merged.skills = merged.skills.map((s) => ({
      label: s.label || "",
      value: s.value || "",
    }));
  }

  if (!Array.isArray(merged.experience) || merged.experience.length === 0) {
    merged.experience = structuredClone(DEFAULT_CV.experience);
  } else {
    merged.experience = merged.experience.map((item) => ({
      ...structuredClone(DEFAULT_CV.experience[0]),
      ...item,
      bullets: Array.isArray(item.bullets) ? item.bullets : [""],
    }));
  }

  if (!Array.isArray(merged.projects) || merged.projects.length === 0) {
    merged.projects = structuredClone(DEFAULT_CV.projects);
  } else {
    merged.projects = merged.projects.map((item) => ({
      ...structuredClone(DEFAULT_CV.projects[0]),
      ...item,
      bullets: Array.isArray(item.bullets) ? item.bullets : [""],
    }));
  }

  if (!Array.isArray(merged.education) || merged.education.length === 0) {
    merged.education = structuredClone(DEFAULT_CV.education);
  } else {
    merged.education = merged.education.map((item) => ({
      ...structuredClone(DEFAULT_CV.education[0]),
      ...item,
    }));
  }

  if (!Array.isArray(merged.certifications) || merged.certifications.length === 0) {
    merged.certifications = structuredClone(DEFAULT_CV.certifications);
  } else {
    merged.certifications = merged.certifications.map((item) => ({
      ...structuredClone(DEFAULT_CV.certifications[0]),
      ...item,
    }));
  }

  merged.personal = {
    ...structuredClone(DEFAULT_CV.personal),
    ...(merged.personal || {}),
  };

  return merged;
}

function deepMerge(target, source) {
  const output = structuredClone(target);
  if (!source || typeof source !== "object") return output;

  for (const key of Object.keys(source)) {
    const srcVal = source[key];
    const tgtVal = output[key];

    if (Array.isArray(srcVal)) {
      output[key] = structuredClone(srcVal);
    } else if (
      srcVal &&
      typeof srcVal === "object" &&
      !Array.isArray(srcVal) &&
      tgtVal &&
      typeof tgtVal === "object" &&
      !Array.isArray(tgtVal)
    ) {
      output[key] = deepMerge(tgtVal, srcVal);
    } else {
      output[key] = srcVal;
    }
  }

  return output;
}

function saveCvData(data) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadCvData() {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return ensureValidData(JSON.parse(raw));
  } catch {
    return null;
  }
}

function clearCvData() {
  sessionStorage.removeItem(STORAGE_KEY);
}

function downloadJson(data, filename = "cv-data.json") {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
