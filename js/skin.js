/* Epochenkrieg – Rahmen-Look: verzierte Rahmen und Eck-Schnörkel als SVG-Bilder, Farbe nach Zeitalter (CSS-Variable --fr).
   Die Bilder werden hier erzeugt und als CSS-Variablen (--orn-edge, --orn-c1..c4, --orn-sm) auf <body> gesetzt; css/style.css (Block "Rahmen 3") benutzt sie. */
const SKIN=(()=>{
  const enc=s=>'url("data:image/svg+xml,'+encodeURIComponent(s)+'")';
  const shade=(hex,f)=>{const n=parseInt(hex.slice(1),16),r=(n>>16)&255,g=(n>>8)&255,b=n&255,m=v=>Math.max(0,Math.min(255,Math.round(v*f)));return '#'+[m(r),m(g),m(b)].map(v=>v.toString(16).padStart(2,'0')).join('')};
  function build(col){
    const hi=shade(col,1.25),lo=shade(col,.55),dk=shade(col,.22);
    const defs=`<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${hi}"/><stop offset=".5" stop-color="${col}"/><stop offset="1" stop-color="${lo}"/></linearGradient></defs>`;
    /* Rahmenkante (48x48, Schnitt 16): geschnitzter Holz-/Steinrahmen mit Goldkanten */
    const edge=`<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">${defs}
      <rect x="1" y="1" width="46" height="46" rx="5" fill="#241b13" stroke="url(#g)" stroke-width="2"/>
      <rect x="4.5" y="4.5" width="39" height="39" rx="3" fill="none" stroke="#0a0705" stroke-width="3"/>
      <rect x="7.5" y="7.5" width="33" height="33" rx="2" fill="none" stroke="${lo}" stroke-width="1"/>
      <rect x="10.5" y="10.5" width="27" height="27" rx="1.5" fill="none" stroke="url(#g)" stroke-width="1.2" opacity=".85"/></svg>`;
    const sm=`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">${defs}
      <rect x=".8" y=".8" width="22.4" height="22.4" rx="3.5" fill="#1d1812" stroke="url(#g)" stroke-width="1.6"/>
      <rect x="3.6" y="3.6" width="16.8" height="16.8" rx="2" fill="none" stroke="#050403" stroke-width="1.6"/>
      <rect x="5.6" y="5.6" width="12.8" height="12.8" rx="1" fill="none" stroke="${lo}" stroke-width=".7"/></svg>`;
    /* Eck-Schnörkel (44x44, links oben); die anderen drei Ecken sind gespiegelt */
    const corner=t=>`<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44">${defs}<g transform="${t}">
      <g fill="none" stroke="url(#g)" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 36 V11 Q3 3 11 3 H36" stroke-width="2.4"/>
        <path d="M9 30 V14 Q9 9 14 9 H30" stroke-width="1.1" opacity=".75"/>
        <path d="M15 15 q7 -9 15 -3 q-8 -1 -9 7 q-3 -2 -6 -4z" stroke-width="1.4"/>
        <path d="M3 24 q-5 3 -1 8 M24 3 q3 -5 8 -1" stroke-width="1.4"/></g>
      <circle cx="6" cy="6" r="3.4" fill="url(#g)" stroke="${dk}" stroke-width=".8"/><circle cx="5.2" cy="5.2" r="1" fill="#fff" opacity=".55"/>
      <path d="M38 3 l5 0 l-2.5 3z M3 38 l0 5 l3 -2.5z" fill="${col}"/></g></svg>`;
    return{edge:enc(edge),sm:enc(sm),c1:enc(corner('')),c2:enc(corner('translate(44 0) scale(-1 1)')),c3:enc(corner('translate(0 44) scale(1 -1)')),c4:enc(corner('translate(44 44) scale(-1 -1)'))};
  }
  let last='';
  function apply(){
    const b=document.body;if(!b)return;let col=getComputedStyle(b).getPropertyValue('--fr').trim()||'#e3b66a';if(col[0]!=='#')col='#e3b66a';if(col.length===4)col='#'+[1,2,3].map(i=>col[i]+col[i]).join('');
    if(col===last)return;last=col;const s=build(col),st=b.style;
    st.setProperty('--orn-edge',s.edge);st.setProperty('--orn-sm',s.sm);st.setProperty('--orn-c1',s.c1);st.setProperty('--orn-c2',s.c2);st.setProperty('--orn-c3',s.c3);st.setProperty('--orn-c4',s.c4)}
  function fit(){const t=document.getElementById('top');if(t)document.body.style.setProperty('--topH',(t.offsetHeight+4)+'px')}
  function init(){apply();fit();try{new ResizeObserver(fit).observe(document.getElementById('top'))}catch(_){addEventListener('resize',fit)}try{new MutationObserver(apply).observe(document.body,{attributes:true,attributeFilter:['data-ep']})}catch(_){}}
  return{apply,init}
})();
SKIN.init();
