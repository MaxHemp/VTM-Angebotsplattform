import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// The objects are format visualisations, not photographs of products or events.
const host = document.querySelector('.spatial-stage');
if (host) start().catch(() => { host.dataset.renderer = 'fallback'; const b=document.getElementById('stage-motion');b.disabled=true;b.textContent='Standansicht'; });

async function start() {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const renderer = new THREE.WebGLRenderer({ alpha:true, antialias:true, powerPreference:'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.setAttribute('aria-hidden','true');
  host.prepend(renderer.domElement);
  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, .04);
  scene.environment = environment.texture;
  room.dispose(); pmrem.dispose();
  const camera = new THREE.PerspectiveCamera(35, 1, .1, 80);
  const rig = new THREE.Group(); scene.add(rig);
  const navy = new THREE.MeshStandardMaterial({color:0x081630, metalness:.25, roughness:.4});
  const ink = new THREE.MeshStandardMaterial({color:0x111a2a, metalness:.75, roughness:.26});
  const silver = new THREE.MeshStandardMaterial({color:0xc6d5e6, metalness:.92, roughness:.24});
  const yellow = new THREE.MeshStandardMaterial({color:0xffd700, metalness:.3, roughness:.32});
  const paper = new THREE.MeshStandardMaterial({color:0xe3e8ef, roughness:.75});
  const petrol = new THREE.MeshStandardMaterial({color:0x063c49, metalness:.12, roughness:.55});
  const mesh = (geometry, material, parent, x=0,y=0,z=0) => {
    const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;
  };
  const box=(w,h,d,mat,parent,x=0,y=0,z=0)=>mesh(new THREE.BoxGeometry(w,h,d),mat,parent,x,y,z);
  const cylinder=(r,h,mat,parent,x=0,y=0,z=0)=>mesh(new THREE.CylinderGeometry(r,r,h,64),mat,parent,x,y,z);
  function rounded(w,h,r,depth) {
    const s=new THREE.Shape(),x=-w/2,y=-h/2;
    s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);
    s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
    s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);
    s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);
    return new THREE.ExtrudeGeometry(s,{depth,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.025,bevelThickness:.025});
  }
  await document.fonts.ready;
  const logo=await new Promise(resolve=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>resolve(null);i.src='assets/vtm-logo-weiss.png';});
  const cover=document.createElement('canvas');cover.width=768;cover.height=1024;
  const c=cover.getContext('2d');
  c.fillStyle='#0A1638';c.fillRect(0,0,768,1024);
  if(logo)c.drawImage(logo,48,54,665,118);
  c.fillStyle='#FFD700';c.fillRect(48,230,70,7);
  c.fillStyle='#a6bde2';c.font='24px "VTM Instrument",sans-serif';c.fillText('TECHNOLOGIE. VERSICHERUNG. PERSPEKTIVEN.',48,283);
  c.fillStyle='#fff';c.font='600 88px "VTM Bricolage",sans-serif';
  c.fillText('Ihr Wissen.',48,419);c.fillText('Im richtigen',48,514);c.fillText('Kontext.',48,609);
  c.strokeStyle='#2857a0';c.lineWidth=2;
  for(let i=0;i<9;i++){c.beginPath();c.moveTo(48,750+i*24);c.lineTo(720,650+i*24);c.stroke();}
  c.fillStyle='#FFD700';c.beginPath();c.arc(610,794,78,0,Math.PI*2);c.fill();
  c.fillStyle='#0A1638';c.font='500 36px "VTM Bricolage",sans-serif';c.fillText('VTM',568,805);
  c.fillStyle='#b1c4df';c.font='24px "VTM Instrument",sans-serif';c.fillText('MAGAZIN + NEWSLETTER + SOCIAL',48,960);
  const coverTexture=new THREE.CanvasTexture(cover);coverTexture.colorSpace=THREE.SRGBColorSpace;coverTexture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
  const book=new THREE.Group();book.position.set(-2.1,.27,.35);book.rotation.set(-.15,-.2,-.12);rig.add(book);
  mesh(rounded(1.9,2.62,.065,.1),navy,book,0,1.44,0);
  box(1.84,2.55,.13,paper,book,.015,1.45,.11);
  for(let i=0;i<12;i++)box(1.85,.008,.002,silver,book,.015,.25+i*.198,.18);
  const front=mesh(new THREE.PlaneGeometry(1.88,2.57),new THREE.MeshStandardMaterial({map:coverTexture,roughness:.38,metalness:.12}),book,0,1.45,.193);
  front.castShadow=false;
  const page2=mesh(rounded(1.9,2.62,.065,.06),navy,book,-.11,1.39,-.1);page2.rotation.z=.06;
  // A broadcast microphone: capsule, woven grille, yoke, stand and cable.
  const mic=new THREE.Group();mic.position.set(.25,.1,.6);rig.add(mic);
  cylinder(.67,.13,ink,mic,0,.12,0);cylinder(.61,.018,silver,mic,0,.196,0);
  cylinder(.075,1.18,silver,mic,0,.78,0);cylinder(.12,.35,ink,mic,0,.48,0);
  const head=new THREE.Group();head.position.set(0,1.64,0);head.rotation.z=-.23;mic.add(head);
  const yoke=mesh(new THREE.TorusGeometry(.51,.044,12,48,Math.PI),silver,head,0,.1,0);yoke.rotation.z=Math.PI;
  box(.09,.57,.14,silver,head,-.51,.36,0);box(.09,.57,.14,silver,head,.51,.36,0);
  const grille=document.createElement('canvas');grille.width=256;grille.height=256;
  const g=grille.getContext('2d');g.fillStyle='#1c2b40';g.fillRect(0,0,256,256);g.fillStyle='#030810';
  for(let y=0;y<256;y+=10)for(let x=0;x<256;x+=10){g.beginPath();g.arc(x+(y%20?5:0),y,3.3,0,Math.PI*2);g.fill();}
  const grid=new THREE.CanvasTexture(grille);grid.wrapS=grid.wrapT=THREE.RepeatWrapping;grid.repeat.set(3,2);
  const grilleMat=new THREE.MeshStandardMaterial({map:grid,bumpMap:grid,bumpScale:.055,metalness:.38,roughness:.6});
  mesh(new THREE.CapsuleGeometry(.365,.76,12,40),grilleMat,head,0,.65,0);
  cylinder(.372,.105,ink,head,0,.22,0);cylinder(.378,.027,yellow,head,0,.278,0);
  const badge=box(.27,.09,.01,silver,head,0,.195,.37);badge.rotation.x=-.06;
  for(const x of [-.52,.52]){const knob=cylinder(.11,.07,ink,head,x,.58,0);knob.rotation.z=Math.PI/2;}
  const cable=new THREE.CatmullRomCurve3([new THREE.Vector3(0,1.5,-.22),new THREE.Vector3(.32,.6,-.3),new THREE.Vector3(.85,.12,.05),new THREE.Vector3(1.5,.08,.85),new THREE.Vector3(2.2,.08,1)]);
  mesh(new THREE.TubeGeometry(cable,40,.022,8,false),ink,rig);
  // A circle of 25 seats expresses the curated event, rather than a generic globe.
  const table=new THREE.Group();table.position.set(2.55,.02,-.55);table.rotation.y=.1;rig.add(table);
  const top=cylinder(.98,.12,paper,table,0,.88,0);top.scale.z=.76;
  cylinder(.14,.82,silver,table,0,.44,0);cylinder(.48,.07,ink,table,0,.075,0);
  const emblem=document.createElement('canvas');emblem.width=512;emblem.height=512;
  const e=emblem.getContext('2d');e.clearRect(0,0,512,512);e.fillStyle='#0B6470';e.textAlign='center';e.font='600 130px "VTM Instrument",sans-serif';e.fillText('25',256,250);e.font='600 46px "VTM Instrument",sans-serif';e.fillText('EXPERTS',256,310);
  const et=new THREE.CanvasTexture(emblem);et.colorSpace=THREE.SRGBColorSpace;
  const mark=mesh(new THREE.PlaneGeometry(.95,.95),new THREE.MeshStandardMaterial({map:et,transparent:true,roughness:.6}),table,0,.948,0);mark.rotation.x=-Math.PI/2;mark.castShadow=false;
  // Four instanced draws for 25 complete chairs keep the mobile scene light.
  const chairParts=[
    [new THREE.BoxGeometry(.19,.055,.19),petrol,new THREE.Vector3(0,.25,0),0],
    [new THREE.BoxGeometry(.19,.22,.042),petrol,new THREE.Vector3(0,.39,-.09),-.08],
    [new THREE.CylinderGeometry(.018,.018,.24,12),silver,new THREE.Vector3(0,.12,0),0],
    [new THREE.CylinderGeometry(.085,.085,.018,16),ink,new THREE.Vector3(0,.01,0),0]
  ];
  for(const [geometry,material,position,rotation] of chairParts){
    const chairs=new THREE.InstancedMesh(geometry,material,25);chairs.castShadow=true;chairs.receiveShadow=true;
    const part=new THREE.Matrix4().makeRotationX(rotation);part.setPosition(position);
    for(let i=0;i<25;i++){
      const a=i/25*Math.PI*2,pose=new THREE.Matrix4().makeRotationY(-a-Math.PI/2);
      pose.setPosition(Math.cos(a)*1.26,.12,Math.sin(a)*.99);pose.multiply(part);chairs.setMatrixAt(i,pose);
    }
    chairs.instanceMatrix.needsUpdate=true;table.add(chairs);
  }
  const plinth=cylinder(4.25,.2,navy,rig,0,-.12,0);plinth.scale.z=.63;
  const rim=mesh(new THREE.TorusGeometry(4.25,.014,8,160),yellow,rig,0,-.014,0);rim.rotation.x=-Math.PI/2;rim.scale.y=.63;
  const floor=mesh(new THREE.PlaneGeometry(200,200),new THREE.ShadowMaterial({opacity:.3}),scene,0,-.23,0);floor.rotation.x=-Math.PI/2;floor.castShadow=false;
  scene.add(new THREE.HemisphereLight(0xc9dfff,0x10214a,.8));
  const light=new THREE.DirectionalLight(0xffffff,2.3);light.position.set(-3,7,5);light.castShadow=true;light.shadow.mapSize.set(1024,1024);light.shadow.camera.left=-6;light.shadow.camera.right=6;light.shadow.camera.top=6;light.shadow.camera.bottom=-6;light.shadow.bias=-.001;light.shadow.normalBias=.03;light.shadow.radius=4;scene.add(light);
  const blue=new THREE.PointLight(0x5c96ff,30,14);blue.position.set(4,3,-3);scene.add(blue);
  let focus=0, visible=true, paused=reduce.matches, destroyed=false, raf=0, last=0, elapsed=0, drag=0, pointerX=0, pointerY=0;
  const look=new THREE.Vector3(0,.9,0),desiredLook=look.clone();
  const positions=[new THREE.Vector3(7,5.5,11),new THREE.Vector3(.4,3.2,8.5),new THREE.Vector3(3.8,3.1,7.3),new THREE.Vector3(5.7,4.7,5.6)];
  const targets=[new THREE.Vector3(0,.9,0),new THREE.Vector3(-1.7,1.4,.2),new THREE.Vector3(.25,1.5,.4),new THREE.Vector3(2.4,.5,-.5)];
  camera.position.copy(reduce.matches?positions[0]:new THREE.Vector3(10,6,8.5));
  rig.rotation.y=reduce.matches?0:-.22;
  const labels=[...host.querySelectorAll('[data-stage-label]')],points=[new THREE.Vector3(-2,2.8,.35),new THREE.Vector3(.25,3,.6),new THREE.Vector3(2.7,1.1,-.6)];
  function render(dt=0) {
    elapsed+=dt;
    const smooth=paused?1:1-Math.exp(-dt*5);
    camera.position.lerp(positions[focus],smooth);desiredLook.copy(targets[focus]);look.lerp(desiredLook,smooth);
    rig.rotation.y=THREE.MathUtils.lerp(rig.rotation.y,drag+pointerX*.2+(paused?0:Math.sin(elapsed*.3)*.09),paused?1:.08);
    rig.rotation.x=THREE.MathUtils.lerp(rig.rotation.x,pointerY*.025,paused?1:.08);
    mic.rotation.z=paused?0:Math.sin(elapsed*.6)*.008;
    camera.lookAt(look);renderer.render(scene,camera);
    points.forEach((p,i)=>{const v=rig.localToWorld(p.clone()).project(camera);labels[i].style.left=`${(v.x*.5+.5)*100}%`;labels[i].style.top=`${(-v.y*.5+.5)*100}%`;labels[i].hidden=focus!==0&&focus!==i+1;});
  }
  function frame(time) {
    raf=0;if(destroyed||paused||!visible||document.hidden)return;
    const dt=Math.min((time-last)/1000,.05);
    if(time-last>=30){last=time;render(dt);}
    raf=requestAnimationFrame(frame);
  }
  function resume(){cancelAnimationFrame(raf);raf=0;last=performance.now();if(!paused&&visible&&!document.hidden)raf=requestAnimationFrame(frame);else render(0);}
  const resize=new ResizeObserver(()=>{const {width,height}=host.getBoundingClientRect();if(!width||!height)return;renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();render(0);});resize.observe(host);
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;host.dataset.visible=String(visible);resume();},{rootMargin:'80px'});observer.observe(host);
  const motion=document.getElementById('stage-motion');
  function motionLabel(){motion.disabled=reduce.matches;motion.textContent=reduce.matches?'Bewegung reduziert':paused?'Bewegung fortsetzen':'Bewegung pausieren';motion.setAttribute('aria-pressed',String(paused));host.dataset.motion=paused?'off':'on';}
  motion.addEventListener('click',()=>{paused=!paused;motionLabel();resume();});
  reduce.addEventListener('change',()=>{paused=reduce.matches;pointerX=pointerY=0;motionLabel();resume();});motionLabel();
  document.addEventListener('visibilitychange',resume);
  const captions=[...document.querySelectorAll('[data-stage-caption]')];
  function choose(next){focus=next;document.querySelectorAll('button[data-scene]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.scene)===next)));captions.forEach(c=>c.hidden=Number(c.dataset.stageCaption)!==next);drag=pointerX=pointerY=0;host.dataset.view=String(next);render(paused?0:.016);resume();}
  document.querySelectorAll('[data-scene]').forEach(b=>b.addEventListener('click',()=>choose(Number(b.dataset.scene))));
  labels.forEach((b,i)=>b.addEventListener('click',()=>choose(i+1)));
  let down=null;
  host.addEventListener('pointerdown',ev=>{if(ev.target!==renderer.domElement||paused)return;down={x:ev.clientX,y:ev.clientY,start:drag};});
  host.addEventListener('pointermove',ev=>{
    if(paused)return;
    const r=host.getBoundingClientRect();pointerX=(ev.clientX-r.left)/r.width-.5;pointerY=(ev.clientY-r.top)/r.height-.5;
    if(down&&Math.abs(ev.clientX-down.x)>Math.abs(ev.clientY-down.y)){drag=Math.max(-.65,Math.min(.65,down.start+(ev.clientX-down.x)*.004));}
  });
  for(const type of ['pointerup','pointercancel','pointerleave'])host.addEventListener(type,()=>{down=null;pointerX=pointerY=0;});
  renderer.domElement.addEventListener('webglcontextlost',ev=>{ev.preventDefault();destroyed=true;cancelAnimationFrame(raf);host.dataset.renderer='fallback';motion.disabled=true;motion.textContent='Standansicht';});
  window.addEventListener('pagehide',()=>{destroyed=true;cancelAnimationFrame(raf);observer.disconnect();resize.disconnect();renderer.dispose();environment.dispose();},{once:true});
  render(0);host.dataset.renderer='webgl';resume();
}
