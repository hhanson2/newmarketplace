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

  // dark mode-updated
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

      const matches = listings.filter(item =>
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

});