
let counter = 0;
const heading = document.querySelector('h1');

function count() {
   counter++;
   heading.textContent = counter;
} 

let contador = 0;
const contadorBox = document.getElementById("contador");

function atualizarTexto() {
  contadorBox.textContent = `Contador: ${contador}`;
}

// Apenas aumenta o contador ao clicar
contadorBox.addEventListener("click", () => {
  contador++;
  atualizarTexto();
});

const textContent = document.querySelector("main p");
if (textContent) {
  const textoOriginal = textContent.textContent;
  textContent.addEventListener("mouseover", () => {
    textContent.textContent = "Em primeiro o Porto e em segundo, tudo bem Benfiquista?";
    textContent.style.color = "blue";
  });
  textContent.addEventListener("mouseout", () => {
    textContent.textContent = textoOriginal;
    textContent.style.color = "black";
  });
}
const titulo = document.querySelector("header h1");
if (titulo) {
  const textoOriginal = titulo.textContent;
  titulo.addEventListener("mouseover", () => {
    titulo.textContent = "WEBB";
  });
  titulo.addEventListener("mouseout", () => {
    titulo.textContent = textoOriginal;
  });

}
const primeiraFrase = document.querySelector("main h2");
if (primeiraFrase) {
  const textoOriginal = primeiraFrase.textContent;
  primeiraFrase.addEventListener("mouseover", () => {
    primeiraFrase.textContent = "PORTOOOOO";
  });
  primeiraFrase.addEventListener("mouseout", () => {
    primeiraFrase.textContent = textoOriginal;
  });
}


const btn10 = document.getElementById("btn-10");
const btn20 = document.getElementById("btn-20");
const btn30 = document.getElementById("btn-30");

const botoes = [btn10, btn20, btn30];
botoes.forEach(botao => {
  botao.addEventListener("mouseover", () => {
    botao.style.backgroundColor = "lightgreen";
    botao.style.color = "black";
  });

  botao.addEventListener("mouseout", () => {
    botao.style.backgroundColor = "#1976d2";
    botao.style.color = "white";
  });
});

btn10.addEventListener("click", () => {
  contador += 10;
  atualizarTexto();
});

btn20.addEventListener("click", () => {
  contador += 20;
  atualizarTexto();
});

btn30.addEventListener("click", () => {
  contador += 30;
  atualizarTexto();
});
