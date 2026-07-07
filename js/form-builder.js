/**
 * Builds editable forms dynamically from CV JSON structure.
 */
const FORMAT_HINT = "Use *bold* and _italic_ for formatting";

const FormBuilder = {
  collapseState: {},

  build(container, data, onChange) {
    container.innerHTML = "";
    const layout = data.meta?.layout || getDefaultLayout();

    this.buildSectionOrderPanel(container, data, layout, onChange);

    layout.forEach((sectionId) => {
      const def = getSectionDef(sectionId);
      if (!def) return;

      const { panel, body } = this.createCollapsibleSection(sectionId, def.label);

      switch (def.type) {
        case "object":
          this.buildObjectFields(body, def, data[def.dataKey], (val) => {
            data[def.dataKey] = val;
            onChange(data);
          });
          break;
        case "string":
          this.buildStringField(body, def, data[def.dataKey], (val) => {
            data[def.dataKey] = val;
            onChange(data);
          });
          break;
        case "skillCategories":
          this.buildSkillCategories(body, def, data[def.dataKey], (val) => {
            data[def.dataKey] = val;
            onChange(data);
          });
          break;
        case "experienceList":
          this.buildExperienceList(body, def, data[def.dataKey], (val) => {
            data[def.dataKey] = val;
            onChange(data);
          });
          break;
        case "projectList":
          this.buildProjectList(body, def, data[def.dataKey], (val) => {
            data[def.dataKey] = val;
            onChange(data);
          });
          break;
        case "educationList":
          this.buildEducationList(body, def, data[def.dataKey], (val) => {
            data[def.dataKey] = val;
            onChange(data);
          });
          break;
      }

      container.appendChild(panel);
    });
  },

  createCollapsibleSection(sectionId, title) {
    const panel = document.createElement("div");
    panel.className = "form-section form-section-collapsible";
    panel.dataset.section = sectionId;

    const expanded =
      this.collapseState[sectionId] ?? (sectionId === "header");
    if (expanded) panel.classList.add("is-expanded");

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "form-section-toggle";
    toggle.setAttribute("aria-expanded", String(expanded));

    const chevron = document.createElement("span");
    chevron.className = "form-section-chevron";
    chevron.setAttribute("aria-hidden", "true");
    chevron.textContent = "▸";

    const titleEl = document.createElement("span");
    titleEl.className = "form-section-title";
    titleEl.textContent = title;

    toggle.appendChild(chevron);
    toggle.appendChild(titleEl);

    const body = document.createElement("div");
    body.className = "form-section-body";

    toggle.addEventListener("click", () => {
      const isExpanded = panel.classList.toggle("is-expanded");
      this.collapseState[sectionId] = isExpanded;
      toggle.setAttribute("aria-expanded", String(isExpanded));
    });

    panel.appendChild(toggle);
    panel.appendChild(body);

    return { panel, body };
  },

  buildSectionOrderPanel(container, data, layout, onChange) {
    const { panel, body } = this.createCollapsibleSection(
      "section-order",
      "Section Order"
    );

    const hint = document.createElement("p");
    hint.className = "form-section-hint";
    hint.textContent = "Reorder main CV sections. You can also drag sections in the preview.";
    body.appendChild(hint);

    const list = document.createElement("div");
    list.className = "order-list";

    const render = () => {
      list.innerHTML = "";
      const currentLayout = data.meta.layout || getDefaultLayout();

      currentLayout.forEach((sectionId, index) => {
        const def = getSectionDef(sectionId);
        if (!def) return;

        const row = document.createElement("div");
        row.className = "order-list-item";

        const label = document.createElement("span");
        label.className = "order-list-label";
        label.textContent = `${index + 1}. ${def.label}`;
        row.appendChild(label);

        row.appendChild(
          this.createOrderButtons(currentLayout, index, (newOrder) => {
            data.meta.layout = newOrder;
            onChange(data, { rebuildForms: true });
          }, render)
        );

        list.appendChild(row);
      });
    };

    render();
    body.appendChild(list);
    container.appendChild(panel);
  },

  createOrderButtons(items, index, onReorder, rerender) {
    const wrap = document.createElement("div");
    wrap.className = "order-controls";

    const upBtn = document.createElement("button");
    upBtn.type = "button";
    upBtn.className = "btn btn-ghost btn-sm btn-order";
    upBtn.title = "Move up";
    upBtn.textContent = "↑";
    upBtn.disabled = index === 0;
    upBtn.addEventListener("click", () => {
      const next = [...items];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      onReorder(next);
      rerender();
    });

    const downBtn = document.createElement("button");
    downBtn.type = "button";
    downBtn.className = "btn btn-ghost btn-sm btn-order";
    downBtn.title = "Move down";
    downBtn.textContent = "↓";
    downBtn.disabled = index === items.length - 1;
    downBtn.addEventListener("click", () => {
      const next = [...items];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      onReorder(next);
      rerender();
    });

    wrap.appendChild(upBtn);
    wrap.appendChild(downBtn);
    return wrap;
  },

  createArrayItemHeader(def, items, index, onChange, render) {
    const header = document.createElement("div");
    header.className = "array-item-header";

    const title = document.createElement("span");
    title.textContent = `${def.itemLabel} ${index + 1}`;
    header.appendChild(title);

    const actions = document.createElement("div");
    actions.className = "array-item-actions";

    actions.appendChild(
      this.createOrderButtons(items, index, (newOrder) => {
        items.splice(0, items.length, ...newOrder);
        onChange([...items]);
      }, render)
    );

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "btn btn-ghost btn-sm";
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener("click", () => {
      items.splice(index, 1);
      onChange([...items]);
      render();
    });
    actions.appendChild(removeBtn);

    header.appendChild(actions);
    return header;
  },

  buildObjectFields(container, def, obj, onChange) {
    obj = obj || {};
    const { fields, order } = getMergedFields(def.fields || {}, obj);

    order.forEach((key) => {
      const fieldDef = fields[key];
      if (!fieldDef) return;

      container.appendChild(
        this.createFieldGroup(fieldDef.label, fieldDef.type, obj[key] || "", fieldDef.placeholder, (value) => {
          obj[key] = value;
          onChange({ ...obj });
        }, fieldDef.formatted)
      );
    });
  },

  buildStringField(container, def, value, onChange) {
    container.appendChild(
      this.createFieldGroup(def.field.label, def.field.type, value || "", def.field.placeholder, onChange, def.field.formatted)
    );
  },

  buildSkillCategories(container, def, items, onChange) {
    this.buildSimpleArrayList(container, def, items, onChange, () => ({ label: "", value: "" }));
  },

  buildExperienceList(container, def, items, onChange) {
    this.buildArrayWithBullets(container, def, items, onChange, () => ({
      role: "",
      startDate: "",
      endDate: "",
      company: "",
      location: "",
      bullets: [""],
    }));
  },

  buildProjectList(container, def, items, onChange) {
    this.buildArrayWithBullets(container, def, items, onChange, () => ({
      name: "",
      techStack: "",
      linkText: "",
      linkUrl: "",
      bullets: [""],
    }));
  },

  buildEducationList(container, def, items, onChange) {
    this.buildSimpleArrayList(container, def, items, onChange, () => {
      const blank = {};
      Object.keys(def.fields || {}).forEach((key) => (blank[key] = ""));
      return blank;
    });
  },

  buildSimpleArrayList(container, def, items, onChange, blankItem) {
    items = items || [];
    const list = document.createElement("div");
    list.className = "array-list";

    const hint = document.createElement("p");
    hint.className = "form-section-hint";
    hint.textContent = `Use ↑ ↓ to reorder ${def.itemLabel.toLowerCase()} entries.`;
    container.appendChild(hint);

    const render = () => {
      list.innerHTML = "";

      items.forEach((item, index) => {
        const card = document.createElement("div");
        card.className = "array-item";
        card.appendChild(this.createArrayItemHeader(def, items, index, onChange, render));

        const { fields, order } = getMergedFields(def.fields, item, ["bullets"]);

        order.forEach((key) => {
          const fieldDef = fields[key];
          if (!fieldDef) return;

          card.appendChild(
            this.createFieldGroup(fieldDef.label, fieldDef.type, item[key] || "", fieldDef.placeholder, (value) => {
              item[key] = value;
              onChange([...items]);
            }, fieldDef.formatted)
          );
        });

        list.appendChild(card);
      });

      const addBtn = document.createElement("button");
      addBtn.type = "button";
      addBtn.className = "btn btn-secondary btn-sm";
      addBtn.textContent = `Add ${def.itemLabel}`;
      addBtn.addEventListener("click", () => {
        items.push(blankItem());
        onChange([...items]);
        render();
      });
      list.appendChild(addBtn);
    };

    render();
    container.appendChild(list);
  },

  buildArrayWithBullets(container, def, items, onChange, blankItem) {
    items = items || [];
    const list = document.createElement("div");
    list.className = "array-list";

    const hint = document.createElement("p");
    hint.className = "form-section-hint";
    hint.textContent = `Use ↑ ↓ to reorder ${def.itemLabel.toLowerCase()} entries.`;
    container.appendChild(hint);

    const render = () => {
      list.innerHTML = "";

      items.forEach((item, index) => {
        const card = document.createElement("div");
        card.className = "array-item";
        card.appendChild(this.createArrayItemHeader(def, items, index, onChange, render));

        const { fields, order } = getMergedFields(def.fields, item, ["bullets"]);

        order.forEach((key) => {
          const fieldDef = fields[key];
          if (!fieldDef) return;

          card.appendChild(
            this.createFieldGroup(fieldDef.label, fieldDef.type, item[key] || "", fieldDef.placeholder, (value) => {
              item[key] = value;
              onChange([...items]);
            }, fieldDef.formatted)
          );
        });

        card.appendChild(
          this.createFieldGroup("Bullet points (one per line)", "lines", (item.bullets || []).join("\n"), null, (text) => {
            item.bullets = text.split("\n");
            onChange([...items]);
          }, true)
        );

        list.appendChild(card);
      });

      const addBtn = document.createElement("button");
      addBtn.type = "button";
      addBtn.className = "btn btn-secondary btn-sm";
      addBtn.textContent = `Add ${def.itemLabel}`;
      addBtn.addEventListener("click", () => {
        items.push(blankItem());
        onChange([...items]);
        render();
      });
      list.appendChild(addBtn);
    };

    render();
    container.appendChild(list);
  },

  createFieldGroup(label, type, value, placeholder, onChange, formatted) {
    const group = document.createElement("div");
    group.className = "form-group";

    const lbl = document.createElement("label");
    lbl.textContent = label;
    group.appendChild(lbl);

    if (formatted) {
      const hint = document.createElement("span");
      hint.className = "form-hint";
      hint.textContent = FORMAT_HINT;
      group.appendChild(hint);
    }

    let input;
    if (type === "textarea" || type === "lines") {
      input = document.createElement("textarea");
      input.rows = type === "lines" ? 5 : 4;
    } else {
      input = document.createElement("input");
      input.type = type === "text" ? "text" : type;
    }

    input.value = value;
    if (placeholder) input.placeholder = placeholder;

    input.addEventListener("input", () => onChange(input.value));
    group.appendChild(input);

    return group;
  },
};
