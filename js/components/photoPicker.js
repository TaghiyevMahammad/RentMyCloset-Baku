// Photo upload grid: pick or drop images, they are resized in the browser before saving.
import { esc } from '../utils.js';
import { icon, resizeImage, toast } from '../ui.js';

export function createPhotoPicker(el, { max = 5, photos = [], maxSize = 1000, quality = 0.8, label = 'Add photos', onChange = () => {} } = {}) {
  let list = [...photos];
  let busy = false;

  function render() {
    el.innerHTML = `<div class="photo-picker">
      ${list
        .map(
          (p, i) => `<div class="pp-thumb">
            <img src="${esc(p)}" alt="Photo ${i + 1}">
            ${i === 0 && max > 1 ? '<span class="pp-cover">Cover</span>' : ''}
            <button type="button" class="pp-btn pp-remove" data-remove="${i}" aria-label="Remove photo ${i + 1}">${icon('x', 14)}</button>
            ${i > 0 ? `<button type="button" class="pp-btn pp-first" data-first="${i}" aria-label="Make photo ${i + 1} the cover" title="Make cover">${icon('star', 13)}</button>` : ''}
          </div>`
        )
        .join('')}
      ${list.length < max
        ? `<label class="pp-add ${busy ? 'busy' : ''}">
            ${busy ? '<span class="spinner dark"></span>' : icon('camera', 22)}
            <span>${esc(label)}</span><small>${list.length}/${max} · or drop here</small>
            <input type="file" accept="image/*" ${max > 1 ? 'multiple' : ''} hidden>
          </label>`
        : ''}
    </div>`;
  }

  async function addFiles(files) {
    const room = max - list.length;
    const chosen = [...files].slice(0, room);
    if (files.length > room) toast(`You can add up to ${max} photos.`, 'info');
    if (!chosen.length) return;
    busy = true;
    render();
    for (const f of chosen) {
      try {
        list.push(await resizeImage(f, maxSize, quality));
      } catch (err) {
        toast(err.message, 'error');
      }
    }
    busy = false;
    render();
    onChange([...list]);
  }

  el.addEventListener('change', (e) => e.target.type === 'file' && addFiles(e.target.files));
  el.addEventListener('click', (e) => {
    const rm = e.target.closest('[data-remove]');
    const first = e.target.closest('[data-first]');
    if (rm) list.splice(Number(rm.dataset.remove), 1);
    else if (first) list.unshift(...list.splice(Number(first.dataset.first), 1));
    else return;
    render();
    onChange([...list]);
  });
  el.addEventListener('dragover', (e) => {
    e.preventDefault();
    el.classList.add('drag');
  });
  el.addEventListener('dragleave', () => el.classList.remove('drag'));
  el.addEventListener('drop', (e) => {
    e.preventDefault();
    el.classList.remove('drag');
    addFiles(e.dataTransfer.files);
  });

  render();
  return { get: () => [...list], isBusy: () => busy };
}
