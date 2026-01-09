const API_URL = "https://deisishop.pythonanywhere.com/products";
const API_CATEGORIES = "https://deisishop.pythonanywhere.com/categories";
const STORAGE_KEY = "cesto";

const formatEUR = (n) =>
  (Number(n) || 0).toLocaleString("en-GB", { style: "currency", currency: "EUR" });

const PLACEHOLDER_IMAGE = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='150'><rect width='100%' height='100%' fill='%23eeeeee'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23888888' font-size='14'>No image</text></svg>";

const API_ORIGIN = new URL(API_URL).origin;

function getImageUrl(path) {
  if (!path) return PLACEHOLDER_IMAGE;
  try {
    return new URL(path, API_ORIGIN).href;
  } catch (e) {
    return PLACEHOLDER_IMAGE;
  }
}

const getCart = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
const saveCart = (cart) => localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
const totalFrom = (cart) =>
  cart.reduce((s, i) => s + (Number(i.price)) * (Number(i.qty)), 0);

const els = {
  products: document.querySelector("#catalogo"), 
  cart: document.querySelector("#itens-cesto"),
  total: document.querySelector("#total"),
  filtro: document.querySelector("#filtroCategorias"),
  ordenar: document.querySelector("#ordenarPreco"),
  search: document.querySelector("#pesquisarNome"),
  btnComprar: document.querySelector("#btnComprar"),
  isStudent: document.querySelector("#deisiStudent"),
  cupao: document.querySelector("#cupao"),
  valorFinal: document.querySelector("#valorFinal"),
  ref: document.querySelector("#referenciaPagamento"),
  erroCompra: document.querySelector("#erroCompra"),
};

let products = [];
let view = { category: "", order: "", term: "" };



function renderProducts(list) {
  if (!els.products) return;
  els.products.innerHTML = "";
  list.forEach((p) => {
    const id = String(p.id);
    const title = p.title;
    const description = p.description;
    const image = getImageUrl(p.image);
    const price = Number(p.price);
    const card = document.createElement("article");
    card.className = "produto";  
    card.innerHTML = `
      <img src="${image}" alt="${title}" loading="lazy" onerror="this.onerror=null;this.src='${PLACEHOLDER_IMAGE}'">
      <h3>${title}</h3>
      <p class="desc">${description}</p>
      <p class="preco">${formatEUR(price)}</p>
      <button data-id="${id}">+ Add to Cart</button>
    `;
    const btn = card.querySelector("button");
    if (btn) btn.addEventListener("click", () => addToCart(id));
    els.products.appendChild(card);
  });
}

function aplicarFiltrosOrdenacaoPesquisa() {
  let lista = [...products];
  if (view.category) {
    lista = lista.filter(
      (p) => String(p.category).toLowerCase() === view.category.toLowerCase()
    );
  }
  if (view.term) {
    const t = view.term.toLowerCase();
    lista = lista.filter((p) => String(p.title).toLowerCase().includes(t));
  }
  if (view.order === "asc") {
    lista.sort((a, b) => (Number(a.price)) - (Number(b.price)));
  } else if (view.order === "desc") {
    lista.sort((a, b) => (Number(b.price)) - (Number(a.price)));
  }
  renderProducts(lista);
}

function preencherCategorias() {
  if (!els.filtro) return;

  const categoriasFixas = ["T-shirts", "Canecas", "Meias"];

  els.filtro.innerHTML = '<option value="">Todas as categorias</option>';

  categoriasFixas.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c.toLowerCase(); // valor interno
    opt.textContent = c;         // texto visível
    els.filtro.appendChild(opt);
  });
}


function renderCart(cart) {
  if (!els.cart || !els.total) return;
  els.cart.innerHTML = "";
  if (!cart.length) {
    els.cart.innerHTML = "<p>Cart is empty.</p>";
  } else {
    cart.forEach((item) => {
      const div = document.createElement("div");
      div.className = "item-cesto";
      div.innerHTML = `
        <img src="${item.image}" alt="${item.title}" class="item-cesto-img" loading="lazy">
        <div class="item-cesto-info">
            <span class="item-cesto-nome">${item.title}</span>
            <span class="item-cesto-preco">${formatEUR(item.price)} / unit</span>
            <span>Quantity: ${item.qty}</span>
        </div>
          <button class="btn-remover" data-id="${item.id}">Remove</button>
      `;
      const rem = div.querySelector(".btn-remover");
      if (rem) rem.addEventListener("click", () => removeFromCart(item.id));
      els.cart.appendChild(div);
    });
  }
  els.total.textContent = formatEUR(totalFrom(cart));
}

function addToCart(id) {
  const prod = products.find((x) => String(x.id) === String(id));
  if (!prod) return;
  const cart = getCart();
  const found = cart.find((i) => String(i.id) === String(id));
  if (found) found.qty += 1;
  else
    cart.push({
      id: prod.id,
      title: prod.title,
      image: getImageUrl(prod.image),
      price: Number(prod.price),
      qty: 1,
    });
  saveCart(cart);
  renderCart(cart);
}

function removeFromCart(id) {
  const cart = getCart().filter((i) => String(i.id) !== String(id));
  saveCart(cart);
  renderCart(cart);
}

async function comprar() {
  if (!els.valorFinal || !els.ref || !els.erroCompra) return;

  els.valorFinal.textContent = "";
  els.ref.textContent = "";
  els.erroCompra.textContent = "";

  const cart = getCart();

  if (!cart.length) {
    els.erroCompra.textContent = "Cart is empty.";
    return;
  }

  const productsIds = [];
  cart.forEach(item => {
    for (let i = 0; i < item.qty; i++) {
      productsIds.push(item.id);
    }
  });

  const payload = {
    products: productsIds,
    student: !!(els.isStudent && els.isStudent.checked),
    coupon: els.cupao && els.cupao.value ? els.cupao.value : "",
    name: "Cliente DEISI"
  };

  try {
    const response = await fetch("https://deisishop.pythonanywhere.com/buy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "accept": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      els.erroCompra.textContent =
        data.error || data.message || "Purchase failed.";
      return;
    }

    
    els.valorFinal.innerHTML =
      `<strong>Total to pay: ${formatEUR(data.totalCost)}</strong>`;

    els.ref.textContent =
      `Payment reference: ${data.reference}`;

    // Limpar carrinho
    saveCart([]);
    renderCart([]);

  } catch (e) {
    els.erroCompra.textContent = "Network error. Try again later.";
  }
}



document.addEventListener("DOMContentLoaded", function () {
  if (!localStorage.getItem(STORAGE_KEY)) saveCart([]);

  preencherCategorias();

  fetch(API_URL)
    .then((r) => {
      if (!r.ok) throw new Error("Network error");
      return r.json();
    })
    .then((data) => {
      products = Array.isArray(data) ? data : [];
      aplicarFiltrosOrdenacaoPesquisa();
      renderCart(getCart());
    })
    .catch(() => {
      if (els.products) els.products.innerHTML = "<p>Unable to load products.</p>";
    });

  fetch(API_CATEGORIES)
    .then((r) => {
      if (!r.ok) throw new Error("Network error");
      return r.json();
    })
    .then((cats) => {
      const arr = Array.isArray(cats) ? cats : [];
      if (arr.length) preencherCategorias(arr);
      else {
        const aPartirDosProdutos = [...new Set(products.map((p) => p.category).filter(Boolean))];
        preencherCategorias(aPartirDosProdutos);
      }
    })
    .catch(() => {
      const aPartirDosProdutos = [...new Set(products.map((p) => p.category).filter(Boolean))];
      if (aPartirDosProdutos.length && els.filtro) preencherCategorias(aPartirDosProdutos);
    });

  if (els.filtro) {
    els.filtro.addEventListener("change", (e) => {
      view.category = e.target.value;
      aplicarFiltrosOrdenacaoPesquisa();
    });
  }
  if (els.ordenar) {
    els.ordenar.addEventListener("change", (e) => {
      view.order = e.target.value;
      aplicarFiltrosOrdenacaoPesquisa();
    });
  }
  if (els.search) {
    els.search.addEventListener("input", (e) => {
      view.term = e.target.value;
      aplicarFiltrosOrdenacaoPesquisa();
    });
  }
  if (els.btnComprar) els.btnComprar.addEventListener("click", comprar);
});