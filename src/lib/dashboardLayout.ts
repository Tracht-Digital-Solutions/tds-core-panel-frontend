/**
 * Per-user dashboard layout (client-side arrangement of server-rendered widgets).
 *
 * The Dashboard page renders EVERY enabled widget into `.widget-slot[data-widget]`
 * sections at build time. This module then, on load, fetches the user's saved
 * layout from core-panel-api (`GET /me/dashboard-layout`) and reorders + shows/
 * hides those slots to match. An "Anpassen" edit mode lets the user drag to
 * reorder and toggle visibility, persisting via `PUT /me/dashboard-layout`.
 *
 * Progressive enhancement: with no saved layout (or the API unreachable) every
 * widget stays visible in its default order — the dashboard always works.
 */
import { API_BASE, panelFetch } from "./auth";

interface LayoutRow {
  widget_id: string;
  visible: boolean;
  sort: number;
}

const LAYOUT_URL = `${API_BASE}/me/dashboard-layout`;

export function initDashboardLayout(): void {
  const grid = document.querySelector<HTMLElement>("[data-dashboard-grid]");
  const editBtn = document.querySelector<HTMLButtonElement>("[data-dashboard-edit]");
  const saveBtn = document.querySelector<HTMLButtonElement>("[data-dashboard-save]");
  const cancelBtn = document.querySelector<HTMLButtonElement>("[data-dashboard-cancel]");
  if (!grid || !editBtn || !saveBtn || !cancelBtn) return;

  const slots = () => Array.from(grid.querySelectorAll<HTMLElement>(".widget-slot"));

  // Apply a saved layout to the DOM: order by `sort` (unknown widgets keep their
  // authored order, appended after known ones), then set visibility.
  const applyLayout = (rows: LayoutRow[]): void => {
    if (rows.length === 0) return;
    const order = new Map(rows.map((r) => [r.widget_id, r]));
    const ordered = slots().sort((a, b) => {
      const ra = order.get(a.dataset.widget ?? "");
      const rb = order.get(b.dataset.widget ?? "");
      // Known widgets sort by saved order; unknown ones sink to the end.
      const sa = ra ? ra.sort : Number.MAX_SAFE_INTEGER;
      const sb = rb ? rb.sort : Number.MAX_SAFE_INTEGER;
      return sa - sb;
    });
    for (const slot of ordered) {
      grid.appendChild(slot);
      const row = order.get(slot.dataset.widget ?? "");
      const visible = row ? row.visible : true;
      slot.classList.toggle("is-hidden", !visible);
      const cb = slot.querySelector<HTMLInputElement>("[data-widget-visible]");
      if (cb) cb.checked = visible;
    }
  };

  // Read the current DOM into a layout array (order = DOM order, visibility =
  // checkbox state). `sort` is assigned server-side from position, so send index.
  const readLayout = (): LayoutRow[] =>
    slots().map((slot, i) => ({
      widget_id: slot.dataset.widget ?? "",
      visible: slot.querySelector<HTMLInputElement>("[data-widget-visible]")?.checked ?? true,
      sort: i,
    }));

  // ---- initial load --------------------------------------------------------
  panelFetch(LAYOUT_URL)
    .then((r) => (r.ok ? r.json() : { layout: [] }))
    .then((d: { layout?: LayoutRow[] }) => applyLayout(d.layout ?? []))
    .catch(() => {
      /* API unreachable — leave the default order/visibility */
    })
    .finally(() => {
      editBtn.hidden = false;
    });

  // ---- edit mode -----------------------------------------------------------
  let snapshot: LayoutRow[] = [];

  const enterEdit = (): void => {
    snapshot = readLayout();
    grid.classList.add("is-editing");
    editBtn.hidden = true;
    saveBtn.hidden = false;
    cancelBtn.hidden = false;
    wireDrag();
  };

  const leaveEdit = (): void => {
    grid.classList.remove("is-editing");
    editBtn.hidden = false;
    saveBtn.hidden = true;
    cancelBtn.hidden = true;
  };

  editBtn.addEventListener("click", enterEdit);

  cancelBtn.addEventListener("click", () => {
    applyLayout(snapshot);
    leaveEdit();
  });

  saveBtn.addEventListener("click", () => {
    const layout = readLayout();
    saveBtn.disabled = true;
    panelFetch(LAYOUT_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ layout }),
    })
      .then((r) => {
        if (r.ok) {
          // Re-apply so a hidden widget collapses out of the grid immediately.
          applyLayout(layout);
          leaveEdit();
        }
      })
      .catch(() => {
        /* keep edit mode open so the user can retry */
      })
      .finally(() => {
        saveBtn.disabled = false;
      });
  });

  // ---- drag reorder (HTML5 DnD, only meaningful in edit mode) ---------------
  let dragging: HTMLElement | null = null;

  const wireDrag = (): void => {
    for (const slot of slots()) {
      slot.setAttribute("draggable", "true");
      const handle = slot.querySelector<HTMLElement>(".widget-slot__handle");
      // Only start a drag from the handle (so text selection etc. still works).
      slot.addEventListener("dragstart", (e) => {
        if (!grid.classList.contains("is-editing")) {
          e.preventDefault();
          return;
        }
        dragging = slot;
        slot.classList.add("is-dragging");
        e.dataTransfer?.setData("text/plain", slot.dataset.widget ?? "");
      });
      slot.addEventListener("dragend", () => {
        slot.classList.remove("is-dragging");
        dragging = null;
      });
      if (handle) handle.setAttribute("aria-hidden", "true");
    }

    grid.addEventListener("dragover", (e) => {
      if (!dragging) return;
      e.preventDefault();
      const after = slotAfter(e.clientY, e.clientX);
      if (after == null) {
        grid.appendChild(dragging);
      } else if (after !== dragging) {
        grid.insertBefore(dragging, after);
      }
    });
  };

  // The slot the dragged element should sit BEFORE, chosen by cursor position
  // (nearest slot whose centre is below/right of the cursor).
  const slotAfter = (y: number, x: number): HTMLElement | null => {
    const candidates = slots().filter((s) => s !== dragging);
    let closest: { offset: number; el: HTMLElement } | null = null;
    for (const el of candidates) {
      const box = el.getBoundingClientRect();
      // Primary axis = vertical; tie-break horizontally within a row.
      const offset = y - (box.top + box.height / 2) || x - (box.left + box.width / 2);
      if (offset < 0 && (closest == null || offset > closest.offset)) {
        closest = { offset, el };
      }
    }
    return closest?.el ?? null;
  };
}
