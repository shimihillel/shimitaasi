/* V27.1 — an optional, isolated calendar enhancement.
 * Only invokes the existing month-arrow buttons; never changes stored data.
 * In RTL: swipe right for the next month, left for the previous month.
 * Native taps, vertical scrolling, zoom and the existing arrows still work.
 */
(() => {
  "use strict";

  const grid = document.getElementById("futureCalendarGrid");
  const dialog = document.getElementById("futureDialog");
  const panel = document.getElementById("futureCalendarPanel");
  const previous = document.getElementById("calendarPrevButton");
  const next = document.getElementById("calendarNextButton");
  if (!grid || !dialog || !panel || !previous || !next ||
      !("PointerEvent" in window)) return;

  const SLOP = 12;
  const AXIS_RATIO = 1.4;
  let gesture = null;
  let ignoreClickUntil = 0;

  function calendarIsOpen() {
    return dialog.open && !panel.hidden;
  }

  function releaseGesture() {
    const active = gesture;
    gesture = null;
    if (active && grid.hasPointerCapture(active.id)) {
      grid.releasePointerCapture(active.id);
    }
  }

  function suppressGestureClick() {
    // A dragged calendar day must not select a day in the newly drawn month.
    ignoreClickUntil = performance.now() + 450;
  }

  grid.addEventListener("pointerdown", (event) => {
    if (!calendarIsOpen() || event.pointerType === "mouse" ||
        !event.isPrimary || event.button !== 0) return;
    // Leave edge gestures to the browser / operating system.
    if (event.clientX < 24 || event.clientX > window.innerWidth - 24) return;
    releaseGesture();
    gesture = {
      id: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startTime: performance.now(),
      horizontal: false
    };
  }, { passive: true });

  grid.addEventListener("pointermove", (event) => {
    if (!gesture || event.pointerId !== gesture.id) return;
    if (!calendarIsOpen()) { releaseGesture(); return; }
    const dx = Math.abs(event.clientX - gesture.startX);
    const dy = Math.abs(event.clientY - gesture.startY);
    if (!gesture.horizontal) {
      if (dy > SLOP && dy >= dx) {
        // Commit to vertical scrolling, never change months afterwards.
        releaseGesture();
        return;
      }
      if (dx < SLOP || dx <= dy * AXIS_RATIO) return;
      gesture.horizontal = true;
      grid.setPointerCapture(event.pointerId);
    }
    if (event.cancelable) event.preventDefault();
  }, { passive: false });

  grid.addEventListener("pointerup", (event) => {
    if (!gesture || event.pointerId !== gesture.id) return;
    const active = gesture;
    const dx = event.clientX - active.startX;
    const dy = event.clientY - active.startY;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    const threshold = Math.max(48, Math.min(80, grid.clientWidth * 0.18));
    const isHorizontal = active.horizontal || (absX > SLOP && absX > absY * AXIS_RATIO);
    releaseGesture();

    if (isHorizontal) {
      suppressGestureClick();
      if (event.cancelable) event.preventDefault();
    }
    if (!isHorizontal || !calendarIsOpen() || absX < threshold ||
        absX <= absY * AXIS_RATIO || performance.now() - active.startTime > 1500) return;

    const rtl = getComputedStyle(grid).direction === "rtl";
    const moveForward = rtl ? dx > 0 : dx < 0;
    (moveForward ? next : previous).click();

    // Cosmetic feedback only. Missing animation APIs do not affect navigation.
    if (typeof grid.animate === "function" &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      grid.animate([
        { opacity: 0.7, transform: `translateX(${dx > 0 ? -8 : 8}px)` },
        { opacity: 1, transform: "translateX(0)" }
      ], { duration: 140, easing: "ease-out" });
    }
  }, { passive: false });

  grid.addEventListener("click", (event) => {
    // detail === 0 is a keyboard or programmatic activation, not a swipe click.
    if (event.detail !== 0 && performance.now() < ignoreClickUntil) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);

  grid.addEventListener("pointercancel", (event) => {
    if (gesture && gesture.id === event.pointerId) {
      if (gesture.horizontal) suppressGestureClick();
      releaseGesture();
    }
  });
  grid.addEventListener("lostpointercapture", (event) => {
    // Ignore a child button losing its implicit capture to this grid.
    if (event.target === grid && gesture && gesture.id === event.pointerId) releaseGesture();
  });

  // A second finger cancels navigation so pinch-to-zoom is never a month swipe.
  document.addEventListener("pointerdown", (event) => {
    if (gesture && event.pointerId !== gesture.id) {
      suppressGestureClick();
      releaseGesture();
    }
  }, { capture: true, passive: true });
  dialog.addEventListener("close", releaseGesture);
  window.addEventListener("blur", releaseGesture);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) releaseGesture();
  });
})();
