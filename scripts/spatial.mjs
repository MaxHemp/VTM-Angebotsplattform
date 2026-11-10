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
  const {podcast,tablet,eventFrame}=await createStudioObjects(rig,renderer);
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
  const look=new THREE.Vector3(0,1.5,0),desiredLook=look.clone();
  const positions=Array.from({length:4},()=>new THREE.Vector3());
  const targets=Array.from({length:4},()=>new THREE.Vector3());
  function compose(width,height){
    const compact=matchMedia('(max-width:760px)').matches,aspect=width/height;
    host.dataset.layout=compact?'compact':'wide';
    if(compact){
      tablet.position.set(-1.25,3.8,0);tablet.scale.setScalar(.72);
      podcast.position.set(.90,2.8,0);podcast.scale.setScalar(.72);
      eventFrame.position.set(0,1.2,0);eventFrame.scale.setScalar(.90);
      targets[0].set(.2,2.65,0);positions[0].set(.2,2.85,Math.max(6.4,5.4/aspect)/(2*Math.tan(THREE.MathUtils.degToRad(14))));
      targets[1].copy(tablet.position);positions[1].set(-1.9,3.95,Math.max(2.8,2.1/aspect)/(2*Math.tan(THREE.MathUtils.degToRad(14))));
      targets[2].set(1.1,3.72,0);positions[2].set(1.35,3.95,7.8);
      targets[3].copy(eventFrame.position);positions[3].set(.4,1.4,Math.max(2.6,3.1/aspect)/(2*Math.tan(THREE.MathUtils.degToRad(14))));
    }else{
      tablet.position.set(-4.25,1.55,0);tablet.scale.setScalar(1);
      podcast.position.set(0,0,0);podcast.scale.setScalar(1);
      eventFrame.position.set(4.25,1.32,0);eventFrame.scale.setScalar(1.15);
      targets[0].set(0,1.5,0);positions[0].set(.35,2.05,Math.max(4.5,12.8/aspect)/(2*Math.tan(THREE.MathUtils.degToRad(14))));
      targets[1].copy(tablet.position);positions[1].set(-3.6,1.9,6.5);
      targets[2].set(.35,1.35,0);positions[2].set(.75,1.8,9.0);
      targets[3].copy(eventFrame.position);positions[3].set(4.9,1.7,6.4);
    }
    floor.visible=!compact;
  }
  const initial=host.getBoundingClientRect();compose(initial.width,initial.height);
  camera.position.copy(positions[0]);if(!paused)camera.position.z+=1;
  look.copy(targets[0]);rig.rotation.y=0;
  function render(dt=0) {
    elapsed+=dt;
    const smooth=paused?1:1-Math.exp(-dt*5);
    camera.position.lerp(positions[focus],smooth);desiredLook.copy(targets[focus]);look.lerp(desiredLook,smooth);
    rig.rotation.y=THREE.MathUtils.lerp(rig.rotation.y,drag+pointerX*.12+(paused?0:Math.sin(elapsed*.19)*.018),paused?1:.08);
    rig.rotation.x=THREE.MathUtils.lerp(rig.rotation.x,pointerY*.025,paused?1:.08);
    // Equipment stays mechanically still; only the viewing angle moves.
    camera.lookAt(look);renderer.render(scene,camera);

  }
  function frame(time) {
    raf=0;if(destroyed||paused||!visible||document.hidden)return;
    const dt=Math.min((time-last)/1000,.05);
    if(time-last>=30){last=time;render(dt);}
    raf=requestAnimationFrame(frame);
  }
  function resume(){cancelAnimationFrame(raf);raf=0;last=performance.now();if(!paused&&visible&&!document.hidden)raf=requestAnimationFrame(frame);else render(0);}
  const resize=new ResizeObserver(()=>{const {width,height}=host.getBoundingClientRect();if(!width||!height)return;compose(width,height);renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();render(0);});resize.observe(host);
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;host.dataset.visible=String(visible);resume();},{rootMargin:'80px'});observer.observe(host);
  const motion=document.getElementById('stage-motion');
  function motionLabel(){motion.disabled=reduce.matches;motion.textContent=reduce.matches?'Bewegung reduziert':paused?'Bewegung fortsetzen':'Bewegung pausieren';motion.setAttribute('aria-pressed',String(paused));host.dataset.motion=paused?'off':'on';}
  motion.addEventListener('click',()=>{paused=!paused;motionLabel();resume();});
  reduce.addEventListener('change',()=>{paused=reduce.matches;pointerX=pointerY=0;motionLabel();resume();});motionLabel();
  document.addEventListener('visibilitychange',resume);
  const captions=[...document.querySelectorAll('[data-stage-caption]')];
  function choose(next){focus=next;tablet.visible=next===0||next===1;podcast.visible=next===0||next===2;eventFrame.visible=next===0||next===3;document.querySelectorAll('button[data-scene]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.scene)===next)));captions.forEach(c=>c.hidden=Number(c.dataset.stageCaption)!==next);drag=pointerX=pointerY=0;host.dataset.view=String(next);render(paused?0:.016);resume();}
  document.querySelectorAll('[data-scene]').forEach(b=>b.addEventListener('click',()=>choose(Number(b.dataset.scene))));

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
