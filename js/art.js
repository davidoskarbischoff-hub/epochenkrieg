/* Epochenkrieg – Symbole für die Oberfläche (SVG, 16x16): Ressourcen und Bevölkerung, gleicher Stil mit dunklem Umriss.
   (Die Figuren und Gebäude selbst stehen in models3d.js.) */
const ART=(()=>{
/* Symbole für Ressourcen (SVG, 16x16): gleicher Stil mit dunklem Umriss */
const SV='stroke="#2a2119" stroke-width="1" stroke-linejoin="round"';
const ICONS={
  food:`<circle cx="5.2" cy="10.2" r="3.6" fill="#d23c47" ${SV}/><circle cx="10.8" cy="9.4" r="3.6" fill="#e04b55" ${SV}/><path d="M8 6.4C7.6 3.6 9.6 2 12.4 2c.2 2.6-1.6 4.4-4.4 4.4z" fill="#62ab4a" ${SV}/><circle cx="4" cy="9" r=".9" fill="#fff" opacity=".7"/><circle cx="9.7" cy="8.2" r=".9" fill="#fff" opacity=".7"/>`,
  wood:`<circle cx="4.6" cy="11.4" r="3.5" fill="#b27a3e" ${SV}/><circle cx="11.4" cy="11.4" r="3.5" fill="#b27a3e" ${SV}/><circle cx="8" cy="5.2" r="3.5" fill="#b27a3e" ${SV}/><circle cx="4.6" cy="11.4" r="1.7" fill="#e3b97a" stroke="#6b4a2b" stroke-width=".8"/><circle cx="11.4" cy="11.4" r="1.7" fill="#e3b97a" stroke="#6b4a2b" stroke-width=".8"/><circle cx="8" cy="5.2" r="1.7" fill="#e3b97a" stroke="#6b4a2b" stroke-width=".8"/>`,
  stone:`<polygon points="1.6,12 3.6,6 8.6,2.6 14,6.6 13.2,12.6 7.4,14.4" fill="#aeaaa0" ${SV}/><polygon points="3.6,6 8.6,2.6 14,6.6 8.8,8.6" fill="#dcd8cd" ${SV}/><polyline points="8.8,8.6 7.4,14.4" fill="none" stroke="#2a2119" stroke-width=".8"/>`,
  iron:`<polygon points="2.6,7 13.4,7 15,12.6 1,12.6" fill="#65738a" ${SV}/><polygon points="2.6,7 13.4,7 12.2,4 3.8,4" fill="#a4b2c6" ${SV}/><circle cx="8" cy="9.8" r="1.1" fill="#f0903a"/>`,
  gold:`<circle cx="8" cy="8" r="6.2" fill="#e6c35a" ${SV}/><circle cx="8" cy="8" r="4.2" fill="none" stroke="#a07a1a" stroke-width="1.1"/><path d="M8 5v6M6.4 6.6h2.6a1 1 0 010 2H6.4" fill="none" stroke="#a07a1a" stroke-width="1"/>`,
  oil:`<path d="M8 1.5C5.6 5.2 3.6 7.4 3.6 10a4.4 4.4 0 008.8 0C12.4 7.4 10.4 5.2 8 1.5z" fill="#1d1a18" ${SV}/><path d="M6 10a2.2 2.2 0 001.6 2.1" fill="none" stroke="#6d6a66" stroke-width="1"/>`,
  pop:`<circle cx="8" cy="4.8" r="3" fill="#e8c29a" ${SV}/><path d="M1.8 15c0-4.4 2.6-6 6.2-6s6.2 1.6 6.2 6z" fill="#5f8fd3" ${SV}/>`
};
const icon=n=>{const u=(typeof ICON3!=='undefined'&&ICON3.res)?ICON3.res(n):null;return u?`<img class="ic ic-${n}" src="${u}" alt="">`:`<svg class="ic ic-${n}" viewBox="0 0 16 16" aria-hidden="true">${ICONS[n]||''}</svg>`};
/* ---------------- Gebäude (Draufsicht, gleicher Stil) ----------------
   E: {m: Materialfarben der Epoche, tc/tcd/tcl: Teamfarben, t: Zeit, ep: Epoche} */
function flag(c,x,y,len,col,t,seed){c.strokeStyle=OUT;c.lineWidth=3;c.beginPath();c.moveTo(x,y);c.lineTo(x,y-len);c.stroke();c.strokeStyle='#cbb88f';c.lineWidth=1.4;c.beginPath();c.moveTo(x,y);c.lineTo(x,y-len);c.stroke();
  const w=Math.sin(t*3+seed)*2.2;poly(c,[[x,y-len],[x+len*.75,y-len+3+w],[x+len*.6,y-len*.62+w],[x,y-len*.55]],col)}
function rrect(c,x,y,w,h,fill,rad){c.fillStyle=fill;c.beginPath();c.roundRect?c.roundRect(x,y,w,h,rad||2):c.rect(x,y,w,h);c.fill();c.lineWidth=1.3;c.strokeStyle=OUT;c.stroke()}
function crenel(c,r,n,col){c.fillStyle=col;for(let i=0;i<n;i++){const a=i/n*6.283;c.fillRect(Math.cos(a)*r-2.2,Math.sin(a)*r-2.2,4.4,4.4)}}
function bld(c,b,E){
  const r=b.r,m=E.m,seed=b.id||0;
  c.save();c.translate(b.x,b.y);c.lineJoin='round';c.lineCap='round';
  switch(b.type){
  case'hq':{ // Siedlungshalle mit Ringmauer
    c.fillStyle=m.wall;c.beginPath();c.arc(0,0,r,0,6.283);c.fill();c.lineWidth=1.4;c.strokeStyle=OUT;c.stroke();
    if(E.ep>=2)crenel(c,r-3,24,m.line);else{c.fillStyle=m.line;for(let i=0;i<28;i++){const a=i/28*6.283;c.beginPath();c.arc(Math.cos(a)*(r-3),Math.sin(a)*(r-3),2.6,0,6.283);c.fill()}}
    if(E.ep>=3)for(let i=0;i<4;i++){const a=i*1.5708+.785;circ(c,Math.cos(a)*r*.92,Math.sin(a)*r*.92,r*.17,m.roof)}
    c.fillStyle=m.roof;c.beginPath();c.arc(0,0,r*.64,0,6.283);c.fill();c.stroke();
    c.strokeStyle='rgba(0,0,0,.28)';c.lineWidth=1;for(let i=0;i<10;i++){const a=i/10*6.283;c.beginPath();c.moveTo(Math.cos(a)*r*.2,Math.sin(a)*r*.2);c.lineTo(Math.cos(a)*r*.64,Math.sin(a)*r*.64);c.stroke()}
    c.fillStyle='rgba(255,255,255,.16)';c.beginPath();c.moveTo(0,0);c.arc(0,0,r*.64,3.5,4.9);c.closePath();c.fill();
    circ(c,0,0,r*.2,E.tc);shine(c,-r*.06,-r*.06,r*.07);flag(c,r*.15,-r*.1,r*.62,E.tc,E.t,seed);break}
  case'house':{c.rotate(.25);const w=r*2,h=r*1.7;
    rrect(c,-r,-h/2,w,h,m.wall,2);c.fillStyle=m.roof;c.beginPath();c.rect(-r*.92,-h/2+2,w-r*.16,h-4);c.fill();c.strokeStyle=OUT;c.lineWidth=1.2;c.stroke();
    c.fillStyle='rgba(255,255,255,.18)';c.fillRect(-r*.92,-h/2+2,w-r*.16,(h-4)/2);c.fillStyle='rgba(0,0,0,.2)';c.fillRect(-r*.92,0,w-r*.16,(h-4)/2-.5);
    line(c,-r*.92,0,r*.92,0,1.6,'rgba(0,0,0,.5)');c.strokeStyle='rgba(0,0,0,.2)';c.lineWidth=1;for(let i=1;i<6;i++){c.beginPath();c.moveTo(-r*.92+i*r*.3,-h/2+2);c.lineTo(-r*.92+i*r*.3,h/2-2);c.stroke()}
    if(E.ep>=1){c.fillStyle=m.line;c.fillRect(r*.45,-h*.38,r*.3,r*.3);c.strokeStyle=OUT;c.strokeRect(r*.45,-h*.38,r*.3,r*.3)}
    rrect(c,-r*.2,h/2-3,r*.4,5,E.tc,1);break}
  case'store':{rrect(c,-r,-r*.78,2*r,1.56*r,m.wall,2);c.fillStyle=m.roof;c.fillRect(-r*.92,-r*.7,r*1.84,r*.62);c.strokeStyle=OUT;c.lineWidth=1;c.strokeRect(-r*.92,-r*.7,r*1.84,r*.62);
    c.fillStyle='rgba(255,255,255,.16)';c.fillRect(-r*.92,-r*.7,r*1.84,r*.3);
    [[-.55,.28],[0,.28],[.55,.28],[-.28,.62-.1],[.28,.62-.1]].forEach(([x,y],i)=>{rrect(c,x*r-5,y*r-4,10,9,i%2?'#a9834f':'#8d6a3e',1);line(c,x*r-5,y*r,x*r+5,y*r,.8,'rgba(0,0,0,.45)')});
    rrect(c,-r,-r*.78,5,1.56*r,E.tc,1);break}
  case'barracks':{rrect(c,-r,-r,2*r,2*r,m.wall,2);c.fillStyle=m.line;for(let i=-3;i<=3;i++){c.fillRect(i*r*.28-2,-r-2,4,4);c.fillRect(i*r*.28-2,r-2,4,4)}
    rrect(c,-r*.72,-r*.72,r*1.44,r*1.44,m.roof,2);c.fillStyle='rgba(255,255,255,.16)';c.fillRect(-r*.72,-r*.72,r*1.44,r*.7);line(c,-r*.72,0,r*.72,0,1.6,'rgba(0,0,0,.5)');
    // Waffenständer
    for(let i=0;i<3;i++){line(c,-r*.4+i*r*.4,r*.2,-r*.4+i*r*.4,r*.58,1.6,'#6b4f31');line(c,-r*.46+i*r*.4,r*.2,-r*.34+i*r*.4,r*.2,1.2,'#c7ccd3')}
    flag(c,r*.85,-r*.85,r*.9,E.tc,E.t,seed);break}
  case'tower':{circ(c,0,0,r,m.wall);crenel(c,r-2,10,m.line);circ(c,0,0,r*.62,m.roof);c.fillStyle='rgba(255,255,255,.2)';c.beginPath();c.moveTo(0,0);c.arc(0,0,r*.62,3.6,5);c.closePath();c.fill();
    for(let i=0;i<4;i++){const a=i*1.5708+.78;c.fillStyle='#1d1812';c.fillRect(Math.cos(a)*r*.78-1,Math.sin(a)*r*.78-1,2.4,2.4)}
    circ(c,0,0,r*.28,E.tc);flag(c,0,-2,r*1.3,E.tc,E.t,seed);break}
  case'castle':{rrect(c,-r,-r,2*r,2*r,m.wall,3);c.fillStyle=m.line;for(let i=-4;i<=4;i++){c.fillRect(i*r*.22-2,-r-3,4,5);c.fillRect(i*r*.22-2,r-2,4,5);c.fillRect(-r-3,i*r*.22-2,5,4);c.fillRect(r-2,i*r*.22-2,5,4)}
    rrect(c,-r*.62,-r*.62,r*1.24,r*1.24,m.roof,2);c.fillStyle='rgba(255,255,255,.16)';c.fillRect(-r*.62,-r*.62,r*1.24,r*.62);line(c,-r*.62,0,r*.62,0,1.4,'rgba(0,0,0,.45)');
    for(const[cx,cy]of[[-r,-r],[r,-r],[-r,r],[r,r]]){circ(c,cx,cy,r*.34,m.wall);circ(c,cx,cy,r*.2,m.roof);shine(c,cx-2,cy-2,2)}
    circ(c,0,0,r*.26,E.tc);flag(c,0,-2,r*1.1,E.tc,E.t,seed);break}
  case'harbor':{c.rotate(b.ang||0);
    c.fillStyle='#8a6a42';c.fillRect(r*.35,-r*.34,r*1.25,r*.68);c.strokeStyle=OUT;c.lineWidth=1.2;c.strokeRect(r*.35,-r*.34,r*1.25,r*.68);c.strokeStyle='rgba(0,0,0,.35)';c.lineWidth=1;for(let i=1;i<6;i++){c.beginPath();c.moveTo(r*.35+i*r*.21,-r*.34);c.lineTo(r*.35+i*r*.21,r*.34);c.stroke()}
    for(const[px,py]of[[r*1.6,-r*.34],[r*1.6,r*.34],[r*1.0,-r*.34],[r*1.0,r*.34]])circ(c,px,py,2.6,'#5b4228',.9);
    rrect(c,-r,-r*.72,r*1.5,r*1.44,m.wall,2);c.fillStyle=m.roof;c.fillRect(-r*.92,-r*.64,r*1.34,r*.6);c.strokeStyle=OUT;c.strokeRect(-r*.92,-r*.64,r*1.34,r*.6);c.fillStyle='rgba(255,255,255,.16)';c.fillRect(-r*.92,-r*.64,r*1.34,r*.28);
    circ(c,r*1.05,r*.55,r*.16,'#cbb88f',.8);circ(c,-r*.25,r*.32,r*.2,E.tc);
    c.restore();c.save();c.translate(b.x,b.y);flag(c,-r*.2,-r*.55,r*.7,E.tc,E.t,seed);break}
  case'wall':{circ(c,0,0,r,m.wall);c.strokeStyle='rgba(0,0,0,.35)';c.lineWidth=1;c.beginPath();c.moveTo(-r*.8,0);c.lineTo(r*.8,0);c.moveTo(0,-r*.8);c.lineTo(0,0);c.moveTo(-r*.4,0);c.lineTo(-r*.4,r*.8);c.moveTo(r*.4,0);c.lineTo(r*.4,r*.8);c.stroke();shine(c,-r*.3,-r*.35,r*.25);break}
  default:circ(c,0,0,r,m.wall)}
  c.restore();
}
return{icon};
})();
