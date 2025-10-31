
document.addEventListener('DOMContentLoaded', () => {
  const p = document.querySelector('main p');
  if (p) {
    const original = p.textContent;
    p.addEventListener('mouseover', () => p.textContent = 'Obrigado por passares!');
    p.addEventListener('mouseout', () => p.textContent = original);
  }


  const pinta = document.querySelector('pinta');
  ['Red','Green','Blue'].forEach(name => {
    const btn = document.querySelector('#btn' + name);
    if (btn && pinta) btn.addEventListener('click', () => pinta.style.color = name.toLowerCase());
  });


  const colorCycleInput = document.querySelector('#colorCycleInput');
  if (colorCycleInput) {
    const colors = ['yellow','red','blue','gray'];
    let i = 0;
    colorCycleInput.addEventListener('input', () => {
      colorCycleInput.style.backgroundColor = colors[i];
      i = (i + 1) % colors.length;
    });
  }


  const colorEnInput = document.querySelector('#colorEnInput');
  const submitColor = document.querySelector('#submitColor');
  function validColor(s) { const st = new Option().style; st.color = s; return st.color !== ''; }
  if (submitColor && colorEnInput) {
    const apply = () => {
      const v = colorEnInput.value.trim();
      if (!v) return;
      if (validColor(v)) document.body.style.backgroundColor = v;
      else { colorEnInput.style.border = '2px solid #d33'; setTimeout(() => colorEnInput.style.border = '', 800); }
    };
    submitColor.addEventListener('click', (e) => { e.preventDefault(); apply(); });
    
  }


  const countBtn = document.getElementById('countBtn');
  const countText = document.getElementById('countText');
  let count = 0;
  if (countBtn && countText) {
    countBtn.addEventListener('click', () => {
      count += 1;
      countText.textContent = count;
      console.log('contador:', count);
    });
  }
});

