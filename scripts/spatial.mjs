import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { createStudioObjects } from './studio-objects.mjs';

// The objects are format visualisations, not photographs of products or events.
const host = document.querySelector('.spatial-stage');
if (host) start().catch(() => { host.dataset.renderer = 'fallback'; const b=document.getElementById('stage-motion');b.disabled=true;b.textContent='Standansicht'; });

async function start() {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const renderer = new THREE.WebGLRenderer({ alpha:true, antialias:true, powerPreference:'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = .92;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;
  renderer.domElement.setAttribute('aria-hidden','true');
  host.prepend(renderer.domElement);
  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, .04);
  scene.environment = environment.texture;
  room.dispose(); pmrem.dispose();
  const camera = new THREE.PerspectiveCamera(28, 1, .1, 80);
  const rig = new THREE.Group(); scene.add(rig);
  await document.fonts.ready;
  const {microphoneAssembly,tablet,eventFrame}=await createStudioObjects(rig,renderer);
  scene.environmentIntensity=.48;
  RectAreaLightUniformsLib.init();
  const key=new THREE.RectAreaLight(0xf4f6ff,7,3.5,5.5);key.position.set(-3,5,5);key.lookAt(.2,1.6,0);scene.add(key);
  const rim=new THREE.RectAreaLight(0xd4e1fa,5,1.5,4);rim.position.set(4.5,3.5,-2);rim.lookAt(.7,1.6,.5);scene.add(rim);
  const fill=new THREE.RectAreaLight(0xffffff,1.3,3,3);fill.position.set(0,1.7,5);fill.lookAt(0,1.7,0);scene.add(fill);
  scene.add(new THREE.HemisphereLight(0xcbd7ee,0x060b17,.22));
  const shadowLight=new THREE.DirectionalLight(0xffffff,1.1);shadowLight.position.set(-3,7,5);shadowLight.castShadow=true;
  shadowLight.shadow.mapSize.set(1024,1024);shadowLight.shadow.camera.left=-5;shadowLight.shadow.camera.right=6;shadowLight.shadow.camera.top=6;shadowLight.shadow.camera.bottom=-4;
  shadowLight.shadow.bias=-.0004;shadowLight.shadow.normalBias=.012;shadowLight.shadow.radius=5;shadowLight.shadow.blurSamples=8;scene.add(shadowLight);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.ShadowMaterial({opacity:.2}));floor.rotation.x=-Math.PI/2;floor.position.y=-.05;floor.receiveShadow=true;scene.add(floor);
  let focus=0, visible=true, paused=reduce.matches, destroyed=false, raf=0, last=0, elapsed=0, drag=0, pointerX=0, pointerY=0;
  const look=new THREE.Vector3(.25,1.65,0),desiredLook=look.clone();
  const positions=[new THREE.Vector3(2.6,2.4,9.8),new THREE.Vector3(-2.6,1.9,6.3),new THREE.Vector3(2,2.25,5.2),new THREE.Vector3(2.9,1.6,4.5)];
  const targets=[new THREE.Vector3(.25,1.65,0),new THREE.Vector3(-1.42,1.55,-.3),new THREE.Vector3(.55,2.15,1.12),new THREE.Vector3(2.18,1.21,-1.1)];
  camera.position.copy(reduce.matches?positions[0]:new THREE.Vector3(4.2,2.7,10.8));
  rig.rotation.y=reduce.matches?0:-.06;
  const labels=[...host.querySelectorAll('[data-stage-label]')],points=[new THREE.Vector3(-1.42,3.2,-.3),new THREE.Vector3(.7,3.4,1.12),new THREE.Vector3(2.18,2.4,-1.1)];
  function render(dt=0) {
    elapsed+=dt;
    const smooth=paused?1:1-Math.exp(-dt*5);
    camera.position.lerp(positions[focus],smooth);desiredLook.copy(targets[focus]);look.lerp(desiredLook,smooth);
    rig.rotation.y=THREE.MathUtils.lerp(rig.rotation.y,drag+pointerX*.12+(paused?0:Math.sin(elapsed*.19)*.018),paused?1:.08);
    rig.rotation.x=THREE.MathUtils.lerp(rig.rotation.x,pointerY*.025,paused?1:.08);
    // Equipment stays mechanically still; only the viewing angle moves.
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
  function choose(next){focus=next;tablet.visible=next===0||next===1;microphoneAssembly.visible=next===0||next===2;eventFrame.visible=next===0||next===3;document.querySelectorAll('button[data-scene]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.scene)===next)));captions.forEach(c=>c.hidden=Number(c.dataset.stageCaption)!==next);drag=pointerX=pointerY=0;host.dataset.view=String(next);render(paused?0:.016);resume();}
  document.querySelectorAll('[data-scene]').forEach(b=>b.addEventListener('click',()=>choose(Number(b.dataset.scene))));
  labels.forEach((b,i)=>b.addEventListener('click',()=>choose(i+1)));
  let down=null;
  host.addEventListener('pointerdown',ev=>{if(ev.target!==renderer.domElement||paused)return;down={x:ev.clientX,y:ev.clientY,start:drag};});
  host.addEventListener('pointermove',ev=>{
    if(paused)return;
    const r=host.getBoundingClientRect();pointerX=(ev.clientX-r.left)/r.width-.5;pointerY=(ev.clientY-r.top)/r.height-.5;
    if(down&&Math.abs(ev.clientX-down.x)>Math.abs(ev.clientY-down.y)){drag=Math.max(-.35,Math.min(.35,down.start+(ev.clientX-down.x)*.003));}
  });
  for(const type of ['pointerup','pointercancel','pointerleave'])host.addEventListener(type,()=>{down=null;pointerX=pointerY=0;});
  renderer.domElement.addEventListener('webglcontextlost',ev=>{ev.preventDefault();destroyed=true;cancelAnimationFrame(raf);host.dataset.renderer='fallback';motion.disabled=true;motion.textContent='Standansicht';});
  window.addEventListener('pagehide',()=>{destroyed=true;cancelAnimationFrame(raf);observer.disconnect();resize.disconnect();renderer.dispose();environment.dispose();},{once:true});
  render(0);host.dataset.renderer='webgl';resume();
}
