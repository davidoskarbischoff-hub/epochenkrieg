/* FBX-Figuren mit Unreal-artigem Skelett (Root, Pelvis, Spine_01..03, Clavicle_L, Upperarm_L … Ball_R) spielfertig machen:
   1) Z-oben → Y-oben, Zentimeter → Meter (Massstab job.rig.scale), Skelett aus der Bindepose (TransformLink) neu aufgebaut, Vertexfarben weg (waren fast alle 0 = schwarz)
   2) Knochen bekommen die Namen und Achsen des Quaternius-Skeletts (Hips, Abdomen, Torso, Chest, Neck, Head, ShoulderL, UpperArmL, LowerArmL, WristL, UpperLegL …),
      damit Spielcode (Hand-Werkzeuge, Bücken, Blickrichtung, Reiter) und Clips 1:1 passen
   3) Animationen einer Quaternius-Figur (job.rig.from, z. B. models/neu/Farmer.glb) werden übertragen: Weltdrehung je Knochen = Weltdrehung des Quellknochens,
      vorher werden die Gliedmassen auf die Bindepose der Quelle ausgerichtet (T-Pose ↔ T-Pose, Beine gerade); Hüfthöhe nach Beinlänge skaliert
   4) Ruhepose = erstes Bild von Idle (natürlich stehend statt T-Pose, wichtig für Deko-Figuren ohne Animation)
   Job-Felder: rig:{scale:.0104, from:'models/neu/Farmer.glb', clips:['Idle','Walk',…] (leer = nur Ruhepose), rest:'Idle'} – Beispiel: menschen.json */
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {mergeVertices} from 'three/addons/utils/BufferGeometryUtils.js';

/* Ziel (FBX) → [neuer Name, Quellknochen, Richtungs-Kind der Quelle (für die Ausrichtung)] */
/* Rumpf, Hals und Schlüsselbein ohne Ausrichtung (eigene Haltung bleibt, sonst schaut der Kopf nach oben); nur Arme, Beine, Finger werden ausgerichtet */
const MAP={Root:['Root'],Pelvis:['Hips','Hips'],Spine_01:['Abdomen','Abdomen'],Spine_02:['Torso','Torso'],Spine_03:['Chest','Chest'],Neck_01:['Neck','Neck'],Head:['Head','Head']};
for(const s of['L','R'])Object.assign(MAP,{['Clavicle_'+s]:['Shoulder'+s,'Shoulder'+s],['Upperarm_'+s]:['UpperArm'+s,'UpperArm'+s,'LowerArm'+s],
  ['Lowerarm_'+s]:['LowerArm'+s,'LowerArm'+s,'Wrist'+s],['Hand_'+s]:['Wrist'+s,'Wrist'+s],['Thigh_'+s]:['UpperLeg'+s,'UpperLeg'+s,'LowerLeg'+s],
  ['Calf_'+s]:['LowerLeg'+s,'LowerLeg'+s,'Foot'+s],['Foot_'+s]:['Foot'+s,'Foot'+s],['Ball_'+s]:['Toe'+s],
  /* Finger: Quaternius hat Mittelhandknochen (…1) am Handgelenk, die FBX-Finger beginnen am Knöchel (…2) */
  ['Index_01_'+s]:['Index1'+s,'Index2'+s,'Index3'+s],['Index_02_'+s]:['Index2'+s,'Index3'+s,'Index4'+s],['Index_03_'+s]:['Index3'+s,'Index4'+s],
  ['Ring_01_'+s]:['Ring1'+s,'Middle2'+s,'Middle3'+s],['Ring_02_'+s]:['Ring2'+s,'Middle3'+s,'Middle4'+s],['Ring_03_'+s]:['Ring3'+s,'Middle4'+s],
  ['Thumb_01_'+s]:['Thumb1'+s,'Thumb2'+s,'Thumb3'+s],['Thumb_02_'+s]:['Thumb2'+s,'Thumb3'+s],['Thumb_03_'+s]:['Thumb3'+s]});

const V=()=>new THREE.Vector3(),Q=()=>new THREE.Quaternion();
const dec=m=>{const p=V(),q=Q(),s=V();m.decompose(p,q,s);return{p,q,s}};

export async function rebuild(obj,job){
  const rig=job.rig||{},s=rig.scale||.01,info={};
  let mesh=null;obj.traverse(o=>{if(o.isSkinnedMesh&&!mesh)mesh=o});if(!mesh)throw new Error('keine SkinnedMesh');
  const C=new THREE.Matrix4().makeRotationX(-Math.PI/2);/* Z oben → Y oben */
  const fb=mesh.skeleton.bones,n=fb.length,idx=new Map(fb.map((b,i)=>[b,i]));
  const par=fb.map(b=>idx.has(b.parent)?idx.get(b.parent):-1);
  const order=[];const visit=i=>{order.push(i);fb.forEach((b,j)=>{if(par[j]===i)visit(j)})};fb.forEach((b,i)=>{if(par[i]<0)visit(i)});
  /* Bindepose der FBX (TransformLink = Inverse der boneInverses) in Y-oben-Metern */
  const Pb=[],Rorig=[];fb.forEach((b,i)=>{const d=dec(C.clone().multiply(mesh.skeleton.boneInverses[i].clone().invert()));Pb[i]=d.p.multiplyScalar(s);Rorig[i]=d.q});
  /* Quelle: Bindepose (Weltlage = Meshwelt × inverse IBM) und Bone-Objekte */
  let src=null,Ps={},Rs={},sb={};
  if(rig.from){const gl=await new GLTFLoader().loadAsync('/repo/'+rig.from);gl.scene.updateMatrixWorld(true);let sm=null;gl.scene.traverse(o=>{if(o.isSkinnedMesh&&!sm)sm=o});
    const A=sm.matrixWorld.clone().multiply(sm.bindMatrix);sm.skeleton.bones.forEach((b,i)=>{const d=dec(A.clone().multiply(sm.skeleton.boneInverses[i].clone().invert()));Ps[b.name]=d.p;Rs[b.name]=d.q;sb[b.name]=b});src=gl}
  const map=i=>MAP[fb[i].name]||[fb[i].name],srcOf=i=>{const k=map(i)[1];return k&&Rs[k]?k:null};
  const tIdx={};fb.forEach((b,i)=>{const m=map(i);if(m[1])tIdx[m[1]]=i});
  /* Referenzpose: Gliedmassen der Reihe nach auf die Richtung der Quell-Bindepose drehen (G = Drehung des Teilbaums gegenüber der FBX-Bindepose) */
  const G=[],Pr=[];for(const i of order){const p=par[i],Gp=p<0?Q():G[p];Pr[i]=p<0?Pb[i].clone():Pr[p].clone().add(Pb[i].clone().sub(Pb[p]).applyQuaternion(Gp));G[i]=Gp.clone();
    const sk=srcOf(i),ck=map(i)[2];if(sk&&ck&&Ps[ck]&&tIdx[ck]!==undefined){const c=tIdx[ck],dt=Pb[c].clone().sub(Pb[i]).applyQuaternion(Gp).normalize(),ds=Ps[ck].clone().sub(Ps[sk]).normalize();
      if(dt.lengthSq()>.5&&ds.lengthSq()>.5)G[i]=new THREE.Quaternion().setFromUnitVectors(dt,ds).multiply(Gp)}}
  /* Knochenachsen in der Referenzpose: wie die Quelle (gleiche lokale Drehungen) – sonst die alten Achsen mitgedreht; Wurzel = Einheit */
  const Fr=[],Fb=[];for(const i of order){const sk=srcOf(i);Fr[i]=sk?Rs[sk].clone():par[i]<0?Q():G[i].clone().multiply(Rorig[i]);Fb[i]=G[i].clone().invert().multiply(Fr[i])}
  const lp=[],lq=[];for(const i of order){const p=par[i];if(p<0){lp[i]=Pr[i].clone();lq[i]=Fr[i].clone();continue}const ip=Fr[p].clone().invert();lp[i]=Pr[i].clone().sub(Pr[p]).applyQuaternion(ip);lq[i]=ip.multiply(Fr[i])}
  /* neues Skelett */
  const bones=fb.map((b,i)=>{const nb=new THREE.Bone();nb.name=map(i)[0];return nb});
  for(const i of order){const p=par[i];if(p>=0)bones[p].add(bones[i]);bones[i].position.copy(lp[i]);bones[i].quaternion.copy(lq[i])}
  const inv=bones.map((b,i)=>new THREE.Matrix4().compose(Pb[i],Fb[i],new THREE.Vector3(1,1,1)).invert());
  /* Mesh: Vertexfarben weg, in Y-oben-Meter, zusammenfassen */
  let g=mesh.geometry.clone();for(const k of Object.keys(g.attributes))if(!['position','normal','uv','skinIndex','skinWeight'].includes(k))g.deleteAttribute(k);/* Vertexfarben, 2. UV-Satz weg */
  g.applyMatrix4(new THREE.Matrix4().makeScale(s,s,s).multiply(C).multiply(mesh.bindMatrix));const nv0=g.attributes.position.count;g=mergeVertices(g,1e-5);info.verts=nv0+'→'+g.attributes.position.count;
  /* kleiner: Knochen-Nummern als Byte, Gewichte als normierte Bytes (Summe 255) */
  {const si=g.attributes.skinIndex,sw=g.attributes.skinWeight,N=si.count,I=new Uint8Array(N*4),Wt=new Uint8Array(N*4);
    for(let v=0;v<N;v++){let sum=0,w=[0,1,2,3].map(c=>sw.getComponent(v,c));const t=w.reduce((a,b)=>a+b,0)||1;w=w.map(x=>Math.round(x/t*255));sum=w.reduce((a,b)=>a+b,0);
      const mx=w.indexOf(Math.max(...w));w[mx]+=255-sum;for(let c=0;c<4;c++){I[v*4+c]=si.getComponent(v,c);Wt[v*4+c]=w[c]}}
    g.setAttribute('skinIndex',new THREE.Uint8BufferAttribute(I,4));g.setAttribute('skinWeight',new THREE.Uint8BufferAttribute(Wt,4,true))}
  const mats=[].concat(mesh.material).map(m=>{const t=m.map;if(t){t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;t.needsUpdate=true}
    return new THREE.MeshStandardMaterial({name:m.name,map:t||null,color:t?0xffffff:m.color,roughness:.85,metalness:0})});
  const sm2=new THREE.SkinnedMesh(g,mats.length>1?mats:mats[0]);sm2.name=mesh.name;
  const root=new THREE.Group();root.name=job.name||mesh.name;const top=order.filter(i=>par[i]<0);for(const i of top)root.add(bones[i]);root.add(sm2);
  root.updateMatrixWorld(true);sm2.bind(new THREE.Skeleton(bones,inv),new THREE.Matrix4());
  /* Animationen übertragen */
  const clips=[];let rest=null;
  if(src){const hipS=sb.Hips,hipT=tIdx.Hips,ratio=Pb[hipT].y/(Ps.Hips.y||1),restN=rig.rest||'Idle';info.ratio=+ratio.toFixed(3);
    const mixer=new THREE.AnimationMixer(src.scene);
    for(const cn of new Set([...(rig.clips||[]),restN])){const clip=src.animations.find(c=>c.name.split('|').pop()===cn);if(!clip){info['fehlt_'+cn]=1;continue}
      const ts=new Set([0,clip.duration]);for(const tr of clip.tracks)for(const t of tr.times)ts.add(+t.toFixed(4));const times=[...ts].sort((a,b)=>a-b);
      const qv=bones.map(()=>[]),pv=[];mixer.stopAllAction();mixer.uncacheRoot(src.scene);const act=mixer.clipAction(clip);act.play();
      const W=[],Pw=[],tmp=Q(),hp=V();
      for(const t of times){mixer.setTime(t);src.scene.updateMatrixWorld(true);hipS.getWorldPosition(hp);
        for(const i of order){const p=par[i],Wp=p<0?Q():W[p],Pp=p<0?V():Pw[p],sk=srcOf(i);
          W[i]=sk?sb[sk].getWorldQuaternion(Q()):Wp.clone().multiply(lq[i]);
          Pw[i]=i===hipT?Pr[i].clone().add(hp.clone().sub(Ps.Hips).multiplyScalar(ratio)):Pp.clone().add(lp[i].clone().applyQuaternion(Wp));
          if(sk){const l=Wp.clone().invert().multiply(W[i]),a=qv[i];if(a.length){tmp.fromArray(a,a.length-4);if(tmp.dot(l)<0){l.x=-l.x;l.y=-l.y;l.z=-l.z;l.w=-l.w}}a.push(l.x,l.y,l.z,l.w)}
          if(i===hipT){const l=Pw[i].clone().sub(Pp).applyQuaternion(Wp.clone().invert());pv.push(l.x,l.y,l.z)}}}
      /* auf 1e-4 runden, gleichbleibende Schlüssel zusammenfassen (optimize) */
      const rnd=a=>a.map(x=>Math.round(x*1e4)/1e4);
      const tracks=[];bones.forEach((b,i)=>{if(qv[i].length)tracks.push(new THREE.QuaternionKeyframeTrack(b.name+'.quaternion',times,rnd(qv[i])).optimize())});
      tracks.push(new THREE.VectorKeyframeTrack(bones[hipT].name+'.position',times,rnd(pv)).optimize());
      if((rig.clips||[]).includes(cn))clips.push(new THREE.AnimationClip(cn,clip.duration,tracks));
      if(cn===restN){rest={};bones.forEach((b,i)=>{if(qv[i].length)rest[i]={q:qv[i].slice(0,4)}});rest[hipT]=Object.assign(rest[hipT]||{},{p:pv.slice(0,3)})}}}
  /* Ruhepose: erstes Bild von Idle */
  if(rest)for(const i in rest){if(rest[i].q)bones[i].quaternion.fromArray(rest[i].q);if(rest[i].p)bones[i].position.fromArray(rest[i].p)}
  root.updateMatrixWorld(true);root.animations=clips;info.clips=clips.map(c=>c.name+':'+c.duration.toFixed(2));info.bones=bones.length;
  return {root,info}}
