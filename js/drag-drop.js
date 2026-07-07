/**
 * Drag-and-drop reordering for CV preview sections.
 */
const DragDrop = {
  init(container, onReorder) {
    this.container = container;
    this.onReorder = onReorder;
    this.draggedEl = null;

    container.addEventListener("dragstart", this.onDragStart.bind(this));
    container.addEventListener("dragover", this.onDragOver.bind(this));
    container.addEventListener("dragleave", this.onDragLeave.bind(this));
    container.addEventListener("drop", this.onDrop.bind(this));
    container.addEventListener("dragend", this.onDragEnd.bind(this));
  },

  onDragStart(e) {
    const section = e.target.closest(".cv-draggable-section");
    if (!section) {
      e.preventDefault();
      return;
    }

    this.draggedEl = section;
    section.classList.add("is-dragging");
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", section.dataset.section);
  },

  onDragOver(e) {
    e.preventDefault();
    const target = e.target.closest(".cv-draggable-section");
    if (!target || target === this.draggedEl) return;

    e.dataTransfer.dropEffect = "move";
    target.classList.add("drag-over");

    const rect = target.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    target.classList.toggle("drag-over-top", e.clientY < midY);
    target.classList.toggle("drag-over-bottom", e.clientY >= midY);
  },

  onDragLeave(e) {
    const target = e.target.closest(".cv-draggable-section");
    if (target) {
      target.classList.remove("drag-over", "drag-over-top", "drag-over-bottom");
    }
  },

  onDrop(e) {
    e.preventDefault();
    const target = e.target.closest(".cv-draggable-section");
    if (!target || !this.draggedEl || target === this.draggedEl) return;

    const rect = target.getBoundingClientRect();
    const insertBefore = e.clientY < rect.top + rect.height / 2;

    if (insertBefore) {
      this.container.insertBefore(this.draggedEl, target);
    } else {
      this.container.insertBefore(this.draggedEl, target.nextSibling);
    }

    this.syncLayout();
    target.classList.remove("drag-over", "drag-over-top", "drag-over-bottom");
  },

  onDragEnd() {
    if (this.draggedEl) {
      this.draggedEl.classList.remove("is-dragging");
    }
    this.container
      .querySelectorAll(".cv-draggable-section")
      .forEach((el) =>
        el.classList.remove("drag-over", "drag-over-top", "drag-over-bottom")
      );
    this.draggedEl = null;
  },

  syncLayout() {
    const layout = [...this.container.querySelectorAll(".cv-draggable-section")].map(
      (el) => el.dataset.section
    );
    this.onReorder(layout);
  },
};
