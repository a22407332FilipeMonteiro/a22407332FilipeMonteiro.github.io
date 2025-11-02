const API_URL = "https://deisishop.pythonanywhere.com/products";
const API_CATEGORIES = "https://deisishop.pythonanywhere.com/categories";
const STORAGE_KEY = "cesto";

const formatEUR = (n) =>
  (Number(n) || 0).toLocaleString("pt-PT", { style: "currency", currency: "EUR" });

const getCart = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
const saveCart = (cart) => localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
const totalFrom = (cart) =>
  cart.reduce((s, i) => s + (Number(i.price) || 0) * (Number(i.qty) || 0), 0);

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
let view = { categoria: "", ordem: "", termo: "" };
let contadorReferencia = 0;

function gerarReferencia() {
  const prefixo = "301024";
  const sufixo = String(contadorReferencia).padStart(4, "0");
  contadorReferencia = (contadorReferencia + 1) % 10000;
  return `${prefixo}-${sufixo}`;
}

function renderProducts(list) {
  if (!els.products) return;
  els.products.innerHTML = "";
  list.forEach((p) => {
    const id = String(p.id);
    const title = p.title || p.nome || p.name || "Produto";
    const description = p.description || p.descricao || "";
    const image = p.image || p.thumbnail || p.img || "images/placeholder.png";
    const price = Number(p.price || p.preco || 0) || 0;
    const card = document.createElement("article");
    card.className = "produto";  
    card.innerHTML = `
      <img src="${image}" alt="${title}" loading="lazy">
      <h3>${title}</h3>
      <p class="desc">${description}</p>
      <p class="preco">${formatEUR(price)}</p>
      <button data-id="${id}">+ Adicionar ao Cesto</button>
    `;
    const btn = card.querySelector("button");
    if (btn) btn.addEventListener("click", () => addToCart(id));
    els.products.appendChild(card);
  });
}

function aplicarFiltrosOrdenacaoPesquisa() {
  let lista = [...products];
  if (view.categoria) {
    lista = lista.filter(
      (p) => String(p.category || p.categoria || "").toLowerCase() === view.categoria.toLowerCase()
    );
  }
  if (view.termo) {
    const t = view.termo.toLowerCase();
    lista = lista.filter((p) => String(p.title || p.nome || p.name || "").toLowerCase().includes(t));
  }
  if (view.ordem === "asc") {
    lista.sort((a, b) => (Number(a.price || a.preco) || 0) - (Number(b.price || b.preco) || 0));
  } else if (view.ordem === "desc") {
    lista.sort((a, b) => (Number(b.price || b.preco) || 0) - (Number(a.price || a.preco) || 0));
  }
  renderProducts(lista);
}

function preencherCategorias(opcoes) {
  if (!els.filtro) return;
  els.filtro.innerHTML = '<option value="">Todas as categorias</option>';
  opcoes.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    els.filtro.appendChild(opt);
  });
}

function renderCart(cart) {
  if (!els.cart || !els.total) return;
  els.cart.innerHTML = "";
  if (!cart.length) {
    els.cart.innerHTML = "<p>O cesto está vazio.</p>";
  } else {
    cart.forEach((item) => {
      const div = document.createElement("div");
      div.className = "item-cesto";
      div.innerHTML = `
        <img src="${item.image}" alt="${item.title}" class="item-cesto-img" loading="lazy">
        <div class="item-cesto-info">
            <span class="item-cesto-nome">${item.title}</span>
            <span class="item-cesto-preco">${formatEUR(item.price)} / un.</span>
            <span>Quantidade: ${item.qty}</span>
        </div>
        <button class="btn-remover" data-id="${item.id}">Remover</button>
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
      title: prod.title || prod.nome || prod.name || "Produto",
      image: prod.image || prod.thumbnail || prod.img || "images/placeholder.png",
      price: Number(prod.price || prod.preco) || 0,
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
    els.erroCompra.textContent = "O cesto está vazio.";
    return;
  }
  let total = totalFrom(cart);
  if (els.isStudent && els.isStudent.checked) total *= 0.75;
  const finalValue = Number(total.toFixed(2));
  const totalFormatado = formatEUR(finalValue);
  const ref = gerarReferencia();
  els.valorFinal.innerHTML = `<strong>Valor final a pagar (com eventuais descontos): ${totalFormatado}</strong>`;
  els.ref.textContent = `Referência de pagamento: ${ref}`;
  els.erroCompra.textContent = "";
}

document.addEventListener("DOMContentLoaded", function () {
  if (!localStorage.getItem(STORAGE_KEY)) saveCart([]);

  // carregar produtos da API
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
      if (els.products) els.products.innerHTML = "<p>Não foi possível carregar os produtos.</p>";
    });

  // carregar categorias da API; se falhar, extrair das products
  fetch(API_CATEGORIES)
    .then((r) => {
      if (!r.ok) throw new Error("Network error");
      return r.json();
    })
    .then((cats) => {
      const arr = Array.isArray(cats) ? cats : [];
      if (arr.length) preencherCategorias(arr);
      else {
        const aPartirDosProdutos = [...new Set(products.map((p) => p.category || p.categoria).filter(Boolean))];
        preencherCategorias(aPartirDosProdutos);
      }
    })
    .catch(() => {
      const aPartirDosProdutos = [...new Set(products.map((p) => p.category || p.categoria).filter(Boolean))];
      if (aPartirDosProdutos.length && els.filtro) preencherCategorias(aPartirDosProdutos);
    });

  if (els.filtro) {
    els.filtro.addEventListener("change", (e) => {
      view.categoria = e.target.value;
      aplicarFiltrosOrdenacaoPesquisa();
    });
  }
  if (els.ordenar) {
    els.ordenar.addEventListener("change", (e) => {
      view.ordem = e.target.value;
      aplicarFiltrosOrdenacaoPesquisa();
    });
  }
  if (els.search) {
    els.search.addEventListener("input", (e) => {
      view.termo = e.target.value;
      aplicarFiltrosOrdenacaoPesquisa();
    });
  }
  if (els.btnComprar) els.btnComprar.addEventListener("click", comprar);
});