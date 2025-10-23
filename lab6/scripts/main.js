const catalogo = document.getElementById('catalogo');
const itensCesto = document.getElementById('itens-cesto');

// Cria elemento total do cesto se não existir
let totalCestoEl = document.getElementById('total-cesto');
if (!totalCestoEl) {
    totalCestoEl = document.createElement('div');
    totalCestoEl.id = 'total-cesto';
    totalCestoEl.textContent = 'Total: € 0.00';
    if (itensCesto && itensCesto.parentNode) {
        itensCesto.parentNode.insertBefore(totalCestoEl, itensCesto);
    }
}

// Guarda os itens do cesto com id como chave
const cesto = {};

function atualizarTotal() {
    let total = 0;
    for (const id in cesto) {
        const item = cesto[id];
        total += item.preco * item.quantidade;
    }
    totalCestoEl.textContent = `Total: € ${total.toFixed(2)}`;
}

function criarProduto(produto) {
    const {id, title, price, image, description} = produto;
    const nome = produto.nome || title || 'Produto sem nome';
    const preco = (typeof produto.preco !== 'undefined') ? produto.preco : (price || 0);
    const img = produto.img || image || '';
    const alt = produto.alt || title || nome;

    const artigo = document.createElement('article');
    artigo.className = 'produto';
    artigo.setAttribute('data-id', id);

    const imagem = document.createElement('img');
    imagem.src = img || 'images/placeholder.png';
    imagem.alt = alt || nome || 'Imagem do produto';

    const titulo = document.createElement('h3');
    titulo.textContent = nome;

    const precoEl = document.createElement('p');
    precoEl.className = 'preco';
    precoEl.textContent = preco ? `Custo total: ${preco.toFixed(2)} €` : 'Custo total: —';

    const desc = document.createElement('p');
    desc.className = 'desc';
    desc.textContent = description || produto.description || '';

    const botao = document.createElement('button');
    botao.type = 'button';
    botao.textContent = '+ Adicionar ao Cesto';
    botao.addEventListener('click', () => adicionarAoCesto({id, nome, preco, img}));

    artigo.appendChild(imagem);
    artigo.appendChild(titulo);
    artigo.appendChild(precoEl);
    if(desc.textContent) artigo.appendChild(desc);
    artigo.appendChild(botao);

    return artigo;
}

function renderProduto(produto) {
    if (!catalogo) return;
    const el = criarProduto(produto);
    catalogo.appendChild(el);
}

function adicionarAoCesto({id, nome, preco, img}) {
    if (!itensCesto) return;

    if (cesto[id]) {
        // Produto já existe → aumentar quantidade
        cesto[id].quantidade += 1;
        const li = cesto[id].elemento;
        const nomeEl = li.querySelector('.item-cesto-nome');
        nomeEl.textContent = `${nome} (x${cesto[id].quantidade})`;
    } else {
        // Novo produto
        const li = document.createElement('li');
        li.setAttribute('data-id', id);
        li.className = 'item-cesto';

        const imagem = document.createElement('img');
        imagem.src = img || 'images/placeholder.png';
        imagem.alt = nome;
        imagem.className = 'item-cesto-img';

        const info = document.createElement('div');
        info.className = 'item-cesto-info';

        const nomeEl = document.createElement('span');
        nomeEl.className = 'item-cesto-nome';
        nomeEl.textContent = `${nome} (x1)`;

        const precoEl = document.createElement('span');
        precoEl.className = 'item-cesto-preco';
        precoEl.textContent = `€ ${preco.toFixed(2)}`;

        info.appendChild(nomeEl);
        info.appendChild(precoEl);

        const botaoRemover = document.createElement('button');
        botaoRemover.type = 'button';
        botaoRemover.className = 'btn-remover';
        botaoRemover.textContent = 'Remover';
        botaoRemover.title = 'Remover do cesto';
        botaoRemover.addEventListener('click', () => removerDoCesto(id));

        li.appendChild(imagem);
        li.appendChild(info);
        li.appendChild(botaoRemover);

        itensCesto.appendChild(li);

        cesto[id] = {quantidade: 1, preco, elemento: li};
    }

    atualizarTotal();
}

function removerDoCesto(id) {
    if (cesto[id]) {
        const li = cesto[id].elemento;
        if (li && li.parentNode) li.parentNode.removeChild(li);
        delete cesto[id];
        atualizarTotal();
    }
}

window.LojaLab6 = {criarProduto, renderProduto, adicionarAoCesto};

document.addEventListener('DOMContentLoaded', () => {
    if (!catalogo) {
        const cat = document.getElementById('catalogo');
        if (cat) window.catalogo = cat;
    }

    if (typeof produtos !== 'undefined' && Array.isArray(produtos)) {
        produtos.forEach(p => renderProduto(p));
    }
});
