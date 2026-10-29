/* Pointer events support mouse, touch and pen without blocking normal scrolling. */
function startTaskDrag(event, row, handle) {
  if (event.button !== 0 || !sortMode || handle.disabled) return;
  event.preventDefault();
  const rows = () => [...taskList.querySelectorAll(':scope > .task-row.sorting')];
  if (rows().length < 2) return;
  const original = rows();
  const pointerId = event.pointerId;
  let y = event.clientY;
  let frame;
  let ended = false;

  row.classList.add('is-dragging');
  document.body.classList.add('task-drag-active');
  const reorderAtPointer = () => {
    // Drag only among peers: daily anchors and early reminders keep their places.
    const targets = rows().filter(candidate => candidate !== row && candidate.dataset.sortGroup === row.dataset.sortGroup);
    const target = targets.find(candidate => y < candidate.getBoundingClientRect().top + candidate.getBoundingClientRect().height / 2);
    if (target) taskList.insertBefore(row, target);
    else if (targets.length) targets.at(-1).after(row);
  };
  const tick = () => {
    if (ended) return;
    const edge = 90;
    const speed = y < edge ? -Math.min(18, (edge - y) / 4) : y > innerHeight - edge ? Math.min(18, (y - innerHeight + edge) / 4) : 0;
    if (speed) window.scrollBy(0, speed);
    reorderAtPointer();
    frame = requestAnimationFrame(tick);
  };
  const move = e => { if (e.pointerId === pointerId) { y = e.clientY; reorderAtPointer(); } };
  const finish = e => {
    if (e.pointerId !== pointerId || ended) return;
    ended = true;
    cancelAnimationFrame(frame);
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', finish);
    window.removeEventListener('pointercancel', finish);
    row.classList.remove('is-dragging');
    document.body.classList.remove('task-drag-active');
    if (e.type === 'pointerup') {
      const ids = rows().map(candidate => candidate.dataset.taskId);
      const items = currentItems();
      const byId = new Map(items.map(item => [item.id, item]));
      const slots = new Set(ids);
      let index = 0;
      setCurrentItems(items.map(item => slots.has(item.id) ? byId.get(ids[index++]) : item));
      if (sortHint) sortHint.textContent = 'הסדר נשמר · אפשר להמשיך לגרור או ללחוץ סיימתי';
    } else {
      original.forEach(candidate => taskList.insertBefore(candidate, taskList.querySelector('.done-block')));
    }
    if (handle.hasPointerCapture(pointerId)) handle.releasePointerCapture(pointerId);
    handle.focus({preventScroll: true});
  };
  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', finish);
  window.addEventListener('pointercancel', finish);
  frame = requestAnimationFrame(tick);
}
