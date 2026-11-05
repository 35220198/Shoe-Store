(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const money = n => '$' + n.toFixed(2);

  const products = [
    { id: 1, name: 'Nike Air Max',     price: 89.99, c: { main: '#e11d2e', toe: '#ffffff', acc: '#111827', sole: '#ffffff' } },
    { id: 2, name: 'Adidas Ultraboost', price: 79.99, c: { main: '#dfe3ea', toe: '#f8fafc', acc: '#111827', sole: '#ffffff' } },
    { id: 3, name: 'Puma Runner',       price: 69.99, c: { main: '#161b2e', toe: '#2a3150', acc: '#ffffff', sole: '#eef1f8' } },
    { id: 4, name: 'Reebok Classic',    price: 59.99, c: { main: '#ef2b2b', toe: '#ff6b6b', acc: '#ffffff', sole: '#ffffff' } }
  ];
  const slides = [
    { bg1: '#1236c9', bg2: '#6d28d9', c: { main: '#2448e0', toe: '#ffffff', acc: '#0a1366', sole: '#ffffff' } },
    { bg1: '#b91c1c', bg2: '#f97316', c: { main: '#ef2b2b', toe: '#ffffff', acc: '#111827', sole: '#ffffff' } },
    { bg1: '#0f172a', bg2: '#334155', c: { main: '#1f2937', toe: '#374151', acc: '#ffd60a', sole: '#f1f5f9' } }
  ];
  const vars = c => `--main:${c.main};--toe:${c.toe};--acc:${c.acc};--sole:${c.sole}`;

  // Optional real photos: drop shoe1.png ... shoe4.png and hero-shoes.png next to index.html
  const photo = (file, make, host) => {
    const img = new Image();
    img.onload = () => host(make(img));
    img.src = file;
  };

  // Header / menu
  const toggle = $('.menu-toggle'), nav = $('#nav');
  const setMenu = o => { nav.classList.toggle('open', o); toggle.setAttribute('aria-expanded', o); };
  toggle.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  nav.addEventListener('click', e => e.target.tagName === 'A' && setMenu(false));
  addEventListener('resize', () => innerWidth > 860 && setMenu(false));
  $('#year').textContent = new Date().getFullYear();

  // Toast
  const toast = $('#toast'); let tt;
  const say = m => { toast.textContent = m; toast.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => toast.classList.remove('show'), 2600); };

  // Hero slider
  const hero = $('#hero'), shoe = $('#heroShoe'), dots = $('#dots');
  let cur = 0, timer;
  dots.innerHTML = slides.map((_, i) => `<button role="tab" aria-label="Colour ${i + 1}" aria-selected="${i === 0}"></button>`).join('');
  const show = i => {
    cur = i; const s = slides[i];
    hero.style.setProperty('--bg1', s.bg1); hero.style.setProperty('--bg2', s.bg2);
    shoe.setAttribute('style', vars(s.c));
    shoe.classList.remove('swap'); void shoe.getBoundingClientRect(); shoe.classList.add('swap');
    [...dots.children].forEach((b, k) => b.setAttribute('aria-selected', k === i));
  };
  const auto = () => { clearInterval(timer); timer = setInterval(() => show((cur + 1) % slides.length), 5000); };
  dots.addEventListener('click', e => { const k = [...dots.children].indexOf(e.target); if (k > -1) { show(k); auto(); } });
  hero.addEventListener('mouseenter', () => clearInterval(timer));
  hero.addEventListener('mouseleave', auto);
  shoe.setAttribute('style', vars(slides[0].c)); auto();
  photo('hero-shoes.png', img => { img.className = 'hero-img'; img.alt = 'Featured sneaker'; return img; }, img => { clearInterval(timer); shoe.replaceWith(img); });

  // Product grid
  $('#grid').innerHTML = products.map(p => `
    <article class="card">
      <div class="pic" id="pic${p.id}" style="${vars(p.c)}"><svg class="shoe" role="img" aria-label="${p.name}"><use href="#shoe"/></svg></div>
      <h3>${p.name}</h3><p class="price">${money(p.price)}</p>
      <button class="btn btn-blue add" data-id="${p.id}">Add to Cart</button>
    </article>`).join('');
  products.forEach(p => photo(`shoe${p.id}.png`, img => { img.alt = p.name; return img; }, img => $('#pic' + p.id).firstElementChild.replaceWith(img)));

  // Cart
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem('stepup-cart')) || []; } catch (e) {}
  const save = () => { try { localStorage.setItem('stepup-cart', JSON.stringify(cart)); } catch (e) {} };
  const drawer = $('#drawer'), overlay = $('#overlay');
  const openCart = o => {
    drawer.classList.toggle('open', o); overlay.classList.toggle('show', o);
    drawer.setAttribute('aria-hidden', !o); document.body.style.overflow = o ? 'hidden' : '';
  };
  const render = () => {
    const count = cart.reduce((n, i) => n + i.qty, 0);
    const total = cart.reduce((n, i) => n + i.qty * products.find(p => p.id === i.id).price, 0);
    $('#badge').textContent = count; $('#total').textContent = money(total);
    $('#items').innerHTML = cart.length ? cart.map(i => {
      const p = products.find(x => x.id === i.id);
      return `<div class="line"><div class="pic" style="${vars(p.c)}"><svg class="shoe"><use href="#shoe"/></svg></div>
        <div><h4>${p.name}</h4><small>${money(p.price)}</small>
        <div class="qty"><button data-act="dec" data-id="${p.id}" aria-label="Fewer">&minus;</button><span>${i.qty}</span><button data-act="inc" data-id="${p.id}" aria-label="More">+</button></div></div>
        <button class="rm" data-act="rm" data-id="${p.id}">Remove</button></div>`;
    }).join('') : '<p class="empty">Your cart is empty.<br>Add a pair from the shop.</p>';
    save();
  };
  $('#grid').addEventListener('click', e => {
    const b = e.target.closest('.add'); if (!b) return;
    const id = +b.dataset.id, f = cart.find(i => i.id === id);
    f ? f.qty++ : cart.push({ id, qty: 1 });
    render(); say(`${products.find(p => p.id === id).name} added to cart`);
    const bd = $('#badge'); bd.classList.remove('bump'); void bd.offsetWidth; bd.classList.add('bump');
    b.textContent = 'Added \u2713'; b.classList.add('added'); setTimeout(() => { b.textContent = 'Add to Cart'; b.classList.remove('added'); }, 1200);
  });
  $('#items').addEventListener('click', e => {
    const b = e.target.closest('[data-act]'); if (!b) return;
    const id = +b.dataset.id, it = cart.find(i => i.id === id);
    if (b.dataset.act === 'inc') it.qty++;
    if (b.dataset.act === 'dec') it.qty--;
    if (b.dataset.act === 'rm' || it.qty < 1) cart = cart.filter(i => i.id !== id);
    render();
  });
  $('#openCart').addEventListener('click', () => openCart(true));
  $('#closeCart').addEventListener('click', () => openCart(false));
  overlay.addEventListener('click', () => openCart(false));
  addEventListener('keydown', e => e.key === 'Escape' && openCart(false));
  $('#checkout').addEventListener('click', () => {
    if (!cart.length) return say('Your cart is empty.');
    cart = []; render(); openCart(false); say('Thanks! Your order was placed (demo).');
  });
  render();
})();
