//t

// AUTH 

const AUTH_KEY = 'market49-user';
const USERS_KEY = 'market49-users';

function getUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || '{}'); }
  catch { return {}; }
}

function getUser() {
  return localStorage.getItem(AUTH_KEY);
}

function signIn(email, password) {
  email = email.toLowerCase().trim();
  const users = getUsers();

  // first time using this email? register them
  if (!users[email]) {
    users[email] = password;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    localStorage.setItem(AUTH_KEY, email);
    return { ok: true, isNew: true };
  }

  // existing user? check password
  if (users[email] !== password) {
    return { ok: false, error: 'Incorrect password.' };
  }

  localStorage.setItem(AUTH_KEY, email);
  return { ok: true, isNew: false };
}

function signOut() {
  localStorage.removeItem(AUTH_KEY);
}



// CART HELPERS 
const CART_KEY = 'market49-cart';

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(item, qty = 1) {
  const cart = getCart();
  const existing = cart.find(c => c.id === item.id);
  if (existing) {
    existing.qty = Math.min(10, existing.qty + qty);
  } else {
    cart.push({ ...item, qty: Math.min(10, qty) });
  }
  saveCart(cart);
}

function removeFromCart(id) {
  saveCart(getCart().filter(c => c.id !== id));
}

function updateQty(id, qty) {
  const cart = getCart();
  const item = cart.find(c => c.id === id);
  if (item) {
    item.qty = Math.max(1, Math.min(10, qty));
    saveCart(cart);
  }
}

function cartTotal() {
  return getCart().reduce((sum, item) => {
    const price = parseFloat(item.price.replace(/[^0-9.]/g, '')) || 0;
    return sum + price * item.qty;
  }, 0);
}

function cartCount() {
  return getCart().reduce((sum, item) => sum + item.qty, 0);
}

function updateCartBadge() {
  const badges = document.querySelectorAll('.cart-badge');
  const count = cartCount();
  badges.forEach(b => {
    b.textContent = count;
    b.style.display = count > 0 ? 'flex' : 'none';
  });
}




const listings = [
  { name: 'Calculus Textbook, 3rd Ed.', price: '$35.00', page: 'listing-detail.html' },
  { name: 'Mechanical Keyboard',        price: '$60.00', page: 'listing-detail.html' },
  { name: 'HDMI Cable 6ft',             price: '$12.00', page: 'listing-detail.html' },
  { name: 'Adjustable Desk Lamp',       price: '$25.00', page: 'listing-detail.html' },
  { name: 'North Face Backpack',        price: '$45.00', page: 'listing-detail.html' },
  { name: '24" Monitor',                price: '$120.00', page: 'listing-detail.html' },
  { name: 'Scientific Calculator',      price: '$15.00', page: 'listing-detail.html' },
  { name: 'Dorm Mini Fridge',           price: '$80.00', page: 'listing-detail.html' },
  { name: 'Laptop Stand',               price: '$22.00', page: 'listing-detail.html' },
  { name: 'USB-C Hub',                  price: '$30.00', page: 'listing-detail.html' },
];

document.addEventListener('DOMContentLoaded', () => {


  // AUTH UI 
  const authLink = document.getElementById('navAuthLink');
  const user = getUser();

  if (authLink) {
    if (user) {
      authLink.textContent = `Sign Out (${user})`;
      authLink.href = '#';
      authLink.addEventListener('click', (e) => {
        e.preventDefault();
        signOut();
        window.location.reload();
      });
    } else {
      authLink.textContent = 'Sign In';
      authLink.href = 'signin.html';
    }
  }

  // sign in form
  const signinForm = document.getElementById('signinForm');
  if (signinForm) {
    const emailField = document.getElementById('signinEmail');
    const passwordField = document.getElementById('signinPassword');
    const emailErr = document.getElementById('emailErr');
    const passwordErr = document.getElementById('passwordErr');

    signinForm.addEventListener('submit', (e) => {
      e.preventDefault();
      [emailField, passwordField].forEach(f => f.classList.remove('error'));

      const email = emailField.value.trim();
      const password = passwordField.value;

      let valid = true;
      if (!email || !email.includes('@')) {
        emailErr.textContent = 'Enter a valid email.';
        emailField.classList.add('error');
        valid = false;
      }
      if (password.length < 6) {
        passwordErr.textContent = 'Password must be at least 6 characters.';
        passwordField.classList.add('error');
        valid = false;
      }
      if (!valid) return;

      const result = signIn(email, password);
      if (!result.ok) {
        passwordErr.textContent = result.error;
        passwordField.classList.add('error');
        return;
      }

      showSpinner();
      setTimeout(() => { window.location.href = 'index.html'; }, 600);
    });
  }






// show posted listings on listings.html
  const grid = document.getElementById('listingsGrid');
  if (grid) {
    const posted = JSON.parse(localStorage.getItem('market49-listings') || '[]');
    posted.forEach(item => {
      grid.insertAdjacentHTML('afterbegin', `
  <a href="listing-detail.html?id=${item.id}" class="card" data-name="${item.name}">
    <div class="card-img"><img src="${item.image || 'https://placehold.co/400x300/e0e0e0/666?text=' + encodeURIComponent(item.name)}" alt="${item.name}"></div>
    <div class="card-body">
      <p class="card-name">${item.name}</p>
      <p class="card-price">${item.price}</p>
    </div>
    <div class="card-footer">
      <span></span>
      <div class="card-actions">
        <button class="like-btn" aria-label="Save">🤍</button>
        <button class="add-cart-btn" aria-label="Add to cart">🛒</button>
        
      </div>
    </div>
  </a>
`);
    });
  }





  // hamburger
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
      });
    });

    document.addEventListener('click', (e) => {
      if (!mobileMenu.contains(e.target) && !hamburger.contains(e.target)) {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
      }
    });
  }

  // active page
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.mobile-menu a').forEach(link => {
    if (link.getAttribute('href') === currentPage) {
      link.classList.add('active');
    }
  });

  // dark mode
  const togglePill = document.getElementById('darkToggle');

  function updateDarkToggleLabel() {
    if (!togglePill) return;
    const isDark = document.body.classList.contains('dark');
    togglePill.setAttribute(
      'aria-label',
      isDark ? 'Switch to light mode' : 'Switch to dark mode'
    );
  }

  if (localStorage.getItem('market49-dark') === 'true') {
    document.body.classList.add('dark');
  }

  updateDarkToggleLabel();

  if (togglePill) {
    togglePill.addEventListener('click', () => {
      document.body.classList.toggle('dark');
      localStorage.setItem(
        'market49-dark',
        document.body.classList.contains('dark')
      );
      updateDarkToggleLabel();
    });
  }

  // search
  const searchInput       = document.getElementById('searchInput');
  const searchSuggestions = document.getElementById('searchSuggestions');

  if (searchInput && searchSuggestions) {
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.trim().toLowerCase();

      if (!query) {
        searchSuggestions.innerHTML = '';
        searchSuggestions.classList.remove('visible');
        return;
      }

      const posted = JSON.parse(localStorage.getItem('market49-listings') || '[]')
  .map(item => ({ name: item.name, price: item.price, page: `listing-detail.html?id=${item.id}` }));

const matches = [...posted, ...listings].filter(item =>
  item.name.toLowerCase().includes(query)
);

      if (matches.length === 0) {
        searchSuggestions.innerHTML = '<div class="suggestion-empty">No results found</div>';
      } else {
        searchSuggestions.innerHTML = matches.map(item => `
          <div class="suggestion-item" data-page="${item.page}">
            <span>${item.name}</span>
            <span style="color:var(--text-muted); font-size:12px;">${item.price}</span>
          </div>
        `).join('');
      }

      searchSuggestions.classList.add('visible');

      searchSuggestions.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('click', () => {
          showSpinner();
          setTimeout(() => {
            window.location.href = item.dataset.page;
          }, 600);
        });
      });
    });

    document.addEventListener('click', (e) => {
      if (!searchInput.contains(e.target) && !searchSuggestions.contains(e.target)) {
        searchSuggestions.classList.remove('visible');
      }
    });

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && searchInput.value.trim()) {
        showSpinner();
        setTimeout(() => {
          window.location.href = `listings.html?q=${encodeURIComponent(searchInput.value.trim())}`;
        }, 600);
      }
    });
  }

  // spinner
  function showSpinner() {
    const overlay = document.getElementById('spinnerOverlay');
    if (overlay) overlay.classList.add('visible');
  }

  function hideSpinner() {
    const overlay = document.getElementById('spinnerOverlay');
    if (overlay) overlay.classList.remove('visible');
  }

  // delivery toggle
  document.querySelectorAll('.delivery-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.delivery-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // like button
  document.querySelectorAll('.like-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      btn.classList.toggle('liked');
      btn.textContent = btn.classList.contains('liked') ? '❤️' : '🤍';
    });
  });

  // checkout form
  const checkoutForm = document.getElementById('checkoutForm');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;

      checkoutForm.querySelectorAll('[required]').forEach(field => {
        field.classList.remove('error', 'success');
        if (!field.value.trim()) {
          field.classList.add('error');
          valid = false;
        } else {
          field.classList.add('success');
        }
      });

      if (valid) {
        showSpinner();
        setTimeout(() => {
          window.location.href = 'order-confirmed.html';
        }, 1200);
      }
    });

    checkoutForm.querySelectorAll('input').forEach(input => {
      input.addEventListener('input', () => {
        if (input.value.trim()) {
          input.classList.remove('error');
          input.classList.add('success');
        }
      });
    });
  }

  // post listing form
  const postForm = document.getElementById('postForm');
  if (postForm) {
    const imageInput = document.getElementById('postImage');
    const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 2MB

    function readImageAsDataURL(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Failed to read image'));
        reader.readAsDataURL(file);
      });
    }

    postForm.querySelectorAll('input, textarea, select').forEach(field => {
      field.addEventListener('input', () => {
        if (field.value.trim()) {
          field.classList.remove('error');
        }
      });
    });

    postForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const title     = document.getElementById('postTitle');
      const price     = document.getElementById('postPrice');
      const condition = document.getElementById('postCondition');
      const category  = document.getElementById('postCategory');
      const desc      = document.getElementById('postDesc');
      const imageErr  = document.getElementById('imageError');

      let valid = true;
      [title, price, condition, category, desc].forEach(field => {
        field.classList.remove('error', 'success');
        if (!field.value.trim()) {
          field.classList.add('error');
          valid = false;
        } else {
          field.classList.add('success');
        }
      });

      if (price.value && Number(price.value) < 0) {
        price.classList.add('error');
        valid = false;
      }

      let imageData = null;
      imageErr.style.display = 'none';
      if (imageInput.files && imageInput.files[0]) {
        const file = imageInput.files[0];
        if (file.size > MAX_IMAGE_BYTES) {
          imageErr.textContent = 'Image is over 5MB. Pick a smaller file.';
          imageErr.style.display = 'block';
          valid = false;
        } else {
          try {
            imageData = await readImageAsDataURL(file);
          } catch {
            imageErr.textContent = 'Could not read that image.';
            imageErr.style.display = 'block';
            valid = false;
          }
        }
      }

      if (!valid) return;

      const newListing = {
        id: 'usr_' + Date.now(),
        name: title.value.trim(),
        price: '$' + Number(price.value).toFixed(2),
        condition: condition.value,
        category: category.value,
        description: desc.value.trim(),
        image: imageData,
        createdAt: new Date().toISOString(),
        page: 'listing-detail.html'
      };

      try {
        const existing = JSON.parse(localStorage.getItem('market49-listings') || '[]');
        existing.unshift(newListing);
        localStorage.setItem('market49-listings', JSON.stringify(existing));
      } catch (err) {
        imageErr.textContent = 'Could not save — storage is full. Try a smaller image.';
        imageErr.style.display = 'block';
        return;
      }

      sessionStorage.setItem('market49-last-posted', newListing.id);

      showSpinner();
      setTimeout(() => {
        window.location.href = 'listing-posted.html';
      }, 800);
    });
  }


  // update cart badge on every page load
  updateCartBadge();

  // listing cards: add to cart button
  document.querySelectorAll('#listingsGrid .card').forEach(card => {
    const btn = card.querySelector('.add-cart-btn');
    if (!btn) return;

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const name = card.dataset.name || card.querySelector('.card-name')?.textContent || 'Item';
      const price = card.querySelector('.card-price')?.textContent || '$0.00';
      const img = card.querySelector('.card-img img')?.src || '';
      const id = 'card_' + name.toLowerCase().replace(/\s+/g, '_');

      addToCart({ id, name, price, image: img }, 1);

      btn.classList.add('added');
      btn.textContent = '✓';
      setTimeout(() => {
        btn.classList.remove('added');
        btn.textContent = '🛒';
      }, 1000);
    });
  });

  // listing detail page: quantity stepper + add to cart
  const detailQty = document.getElementById('detailQty');
  const addToCartBtn = document.getElementById('addToCartBtn');

  if (detailQty) {
    const input = detailQty.querySelector('input');
    detailQty.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        let val = parseInt(input.value, 10) || 1;
        if (btn.dataset.action === 'inc') val = Math.min(10, val + 1);
        if (btn.dataset.action === 'dec') val = Math.max(1, val - 1);
        input.value = val;
      });
    });
    input.addEventListener('change', () => {
      let val = parseInt(input.value, 10) || 1;
      input.value = Math.max(1, Math.min(10, val));
    });
  }

  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', () => {
      const qty = parseInt(detailQty?.querySelector('input').value, 10) || 1;
      const name = document.querySelector('.listing-title')?.textContent.trim() || 'Item';
      const price = document.querySelector('.listing-price')?.textContent.trim() || '$0.00';
      const img = document.querySelector('.listing-img img')?.src || '';
      const id = 'detail_' + name.toLowerCase().replace(/\s+/g, '_');

      addToCart({ id, name, price, image: img }, qty);

      const original = addToCartBtn.textContent;
      addToCartBtn.textContent = `✓ Added (${qty})`;
      addToCartBtn.disabled = true;
      setTimeout(() => {
        addToCartBtn.textContent = original;
        addToCartBtn.disabled = false;
      }, 1500);
    });
  }

  // cart page render
  const cartList = document.getElementById('cartList');
  if (cartList) {
    renderCart();

    function renderCart() {
      const cart = getCart();
      const empty = document.getElementById('cartEmpty');
      const summary = document.getElementById('cartSummary');

      if (cart.length === 0) {
        cartList.innerHTML = '';
        empty.style.display = 'block';
        summary.style.display = 'none';
        return;
      }

      empty.style.display = 'none';
      summary.style.display = 'block';

      cartList.innerHTML = cart.map(item => `
        <div class="cart-item" data-id="${item.id}">
          <div class="cart-item-img">
            ${item.image ? `<img src="${item.image}" alt="${item.name}">` : ''}
          </div>
          <div class="cart-item-info">
            <span class="cart-item-name">${item.name}</span>
            <span class="cart-item-price">${item.price}</span>
            <div class="qty-stepper" data-cart-qty>
              <button type="button" data-action="dec" aria-label="Decrease">−</button>
              <input type="number" value="${item.qty}" min="1" max="10" aria-label="Quantity">
              <button type="button" data-action="inc" aria-label="Increase">+</button>
            </div>
          </div>
          <div class="cart-item-controls">
            <button class="cart-remove-btn" data-remove>Remove</button>
          </div>
        </div>
      `).join('');

      const total = cartTotal();
      document.getElementById('cartSubtotal').textContent = '$' + total.toFixed(2);
      document.getElementById('cartTotalAmount').textContent = '$' + total.toFixed(2);

      // wire up controls
      cartList.querySelectorAll('.cart-item').forEach(row => {
        const id = row.dataset.id;
        const stepper = row.querySelector('[data-cart-qty]');
        const input = stepper.querySelector('input');

        stepper.querySelectorAll('button').forEach(btn => {
          btn.addEventListener('click', () => {
            let val = parseInt(input.value, 10) || 1;
            if (btn.dataset.action === 'inc') val = Math.min(10, val + 1);
            if (btn.dataset.action === 'dec') val = Math.max(1, val - 1);
            updateQty(id, val);
            renderCart();
          });
        });

        input.addEventListener('change', () => {
          updateQty(id, parseInt(input.value, 10) || 1);
          renderCart();
        });

        row.querySelector('[data-remove]').addEventListener('click', () => {
          removeFromCart(id);
          renderCart();
        });
      });
    }
  }



  // listing-posted confirmation page
  const postedSummary = document.getElementById('postedSummary');
  if (postedSummary) {
    const lastId = sessionStorage.getItem('market49-last-posted');
    if (lastId) {
      const all = JSON.parse(localStorage.getItem('market49-listings') || '[]');
      const posted = all.find(l => l.id === lastId);
      if (posted) {
        postedSummary.innerHTML = `
          <div class="row"><span class="label">Title</span><span class="value">${posted.name}</span></div>
          <div class="row"><span class="label">Price</span><span class="value">${posted.price}</span></div>
          <div class="row"><span class="label">Category</span><span class="value">${posted.category}</span></div>
          <div class="row"><span class="label">Condition</span><span class="value">${posted.condition}</span></div>
        `;
      }
      sessionStorage.removeItem('market49-last-posted');
    }
  }

});