import * as THREE from 'three';

// One scene unit represents roughly 10 cm. Keep real equipment proportions.
export async function createStudioObjects(rig, renderer) {
  const graphite=new THREE.MeshPhysicalMaterial({color:0x17191e,metalness:.86,roughness:.33,clearcoat:.18,clearcoatRoughness:.35});
  const black=new THREE.MeshStandardMaterial({color:0x111316,metalness:.24,roughness:.48});
  const steel=new THREE.MeshStandardMaterial({color:0x707782,metalness:1,roughness:.27});
  const rubber=new THREE.MeshStandardMaterial({color:0x08090b,roughness:.86});
  const mesh=(geometry,material,parent,x=0,y=0,z=0)=>{
    const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;
  };
  const box=(w,h,d,mat,parent,x=0,y=0,z=0)=>mesh(new THREE.BoxGeometry(w,h,d),mat,parent,x,y,z);
  const cylinder=(r,h,mat,parent,x=0,y=0,z=0)=>mesh(new THREE.CylinderGeometry(r,r,h,48),mat,parent,x,y,z);
  function outline(w,h,r) {
    const s=new THREE.Shape(),x=-w/2,y=-h/2;
    s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);
    s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
    s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);
    s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s;
  }
  const rounded=(w,h,r,depth)=>new THREE.ExtrudeGeometry(outline(w,h,r),{depth,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.008,bevelThickness:.008,curveSegments:12});
  function roundedFace(w,h,r){
    const g=new THREE.ShapeGeometry(outline(w,h,r)),p=g.getAttribute('position'),uv=g.getAttribute('uv');
    for(let i=0;i<p.count;i++)uv.setXY(i,(p.getX(i)+w/2)/w,(p.getY(i)+h/2)/h);
    return g;
  }
  async function image(src){return new Promise(resolve=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>resolve(null);i.src=src;});}
  const [logo,article,event,eventLogo]=await Promise.all(['assets/vtm-logo-weiss.png','assets/format-article.webp','assets/experts-poster.webp','assets/25experts-logo-horizontal-on-dark.svg'].map(image));
  function texture(canvas){const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return t;}
  function coverImage(ctx,img,x,y,w,h){if(!img)return;const scale=Math.max(w/img.width,h/img.height);const sw=w/scale,sh=h/scale;ctx.drawImage(img,(img.width-sw)/2,(img.height-sh)/2,sw,sh,x,y,w,h);}
  function noise(size,base,range,repeat){
    const data=new Uint8Array(size*size*4);let seed=85391;
    for(let i=0;i<data.length;i+=4){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const v=Math.round(base+(seed/4294967296-.5)*range);data[i]=data[i+1]=data[i+2]=v;data[i+3]=255;}
    const t=new THREE.DataTexture(data,size,size);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(repeat,repeat);t.magFilter=THREE.LinearFilter;t.minFilter=THREE.LinearMipmapLinearFilter;t.generateMipmaps=true;t.needsUpdate=true;return t;
  }
  // A thin, machined digital display. No paper block or oversized book spine.
  const screen=document.createElement('canvas');screen.width=1024;screen.height=1400;const c=screen.getContext('2d');
  c.fillStyle='#0A1638';c.fillRect(0,0,1024,1400);
  if(logo)c.drawImage(logo,68,70,880,156);
  c.fillStyle='#91a6ca';c.font='23px "VTM Instrument",sans-serif';c.fillText('KI  /  AUTOMATISIERUNG  /  VERSICHERUNG',68,292);
  c.fillStyle='#FFD700';c.fillRect(68,355,66,5);
  c.fillStyle='#fff';c.font='500 87px "VTM Bricolage",sans-serif';c.fillText('Technologie',68,476);c.fillText('verstehen.',68,574);c.fillText('Versicherung',68,696);c.fillText('gestalten.',68,794);
  coverImage(c,article,68,885,888,320);
  c.fillStyle='#bccbe3';c.font='29px "VTM Instrument",sans-serif';c.fillText('Perspektiven aus der Versicherungswelt',68,1280);
  c.fillStyle='#6e88b3';c.font='22px "VTM Instrument",sans-serif';c.fillText('MAGAZIN   +   NEWSLETTER   +   SOCIAL',68,1330);
  const displayTexture=texture(screen);
  const tablet=new THREE.Group();tablet.position.set(-1.42,1.55,-.30);tablet.rotation.set(-.09,.16,-.045);rig.add(tablet);
  mesh(rounded(2.18,3.08,.13,.055),graphite,tablet);
  mesh(new THREE.ShapeGeometry(outline(2.155,3.055,.12)),new THREE.MeshPhysicalMaterial({color:0x020304,metalness:.12,roughness:.18,clearcoat:1,clearcoatRoughness:.12}),tablet,0,0,.064);
  // A backlit display sits under a separate antireflective glass layer.
  const screenMaterial=new THREE.MeshBasicMaterial({map:displayTexture,toneMapped:false});
  mesh(roundedFace(2.015,2.755,.055),screenMaterial,tablet,0,-.014,.068).castShadow=false;
  mesh(roundedFace(2.015,2.755,.055),new THREE.MeshPhysicalMaterial({color:0x000000,transparent:true,opacity:.065,roughness:.15,clearcoat:1,clearcoatRoughness:.12,specularIntensity:.25,depthWrite:false}),tablet,0,-.014,.071).castShadow=false;
  const cameraLens=mesh(new THREE.CircleGeometry(.016,20),new THREE.MeshPhysicalMaterial({color:0x14253c,metalness:.65,roughness:.07,clearcoat:1}),tablet,0,1.464,.074);cameraLens.castShadow=false;
  box(.026,.23,.025,steel,tablet,-1.1,.83,.017);box(.026,.14,.025,steel,tablet,-1.1,.51,.017);
  box(.29,.016,.019,black,tablet,0,-1.55,.022);
  // A discreet rear support, dimensioned like an actual tablet kickstand.
  const support=box(1.05,2.2,.035,graphite,tablet,0,-.52,-.33);support.rotation.x=-.39;

  // A modern dynamic broadcast microphone: acoustic foam, powder-coated body,
  // machined fasteners, a real yoke and a mechanically connected boom arm.
  const microphoneAssembly=new THREE.Group();rig.add(microphoneAssembly);
  const mic=new THREE.Group();mic.position.set(.79,1.88,1.12);microphoneAssembly.add(mic);
  const head=new THREE.Group();head.rotation.z=.66;head.rotation.x=.12;mic.add(head);
  const grain=noise(256,128,70,5);
  const bodyMaterial=new THREE.MeshStandardMaterial({color:0x141619,metalness:.42,roughness:.48,bumpMap:grain,bumpScale:.002});
  const foamGrain=noise(128,128,130,2);
  const foam=new THREE.MeshPhysicalMaterial({color:0x1b1e22,map:noise(128,180,105,2),roughness:.98,metalness:0,bumpMap:foamGrain,bumpScale:.0075,sheen:.12,sheenColor:0x64666a,sheenRoughness:.9});
  const contour=[[0,-.55],[.27,-.55],[.31,-.52],[.325,-.46],[.325,.67],[.31,.75],[0,.75]].map(p=>new THREE.Vector2(...p));
  mesh(new THREE.LatheGeometry(contour,64),bodyMaterial,head);
  mesh(new THREE.CapsuleGeometry(.35,.55,16,64),foam,head,0,1.05,0);
  cylinder(.329,.045,rubber,head,0,.60,0);
  cylinder(.273,.06,graphite,head,0,-.57,0);
  const rear=cylinder(.16,.18,black,head,0,-.69,0);
  cylinder(.165,.025,steel,head,0,-.77,0);
  // Rear vents are fine recessed slots, not a bright toy grille.
  for(let i=0;i<8;i++){
    const a=i/8*Math.PI*2;
    const vent=box(.012,.19,.022,rubber,head,Math.cos(a)*.327,-.25,Math.sin(a)*.327);vent.rotation.y=-a;
  }
  const y=new THREE.Shape();
  y.moveTo(-.47,.48);y.lineTo(-.47,-.29);y.quadraticCurveTo(-.47,-.47,-.29,-.47);y.lineTo(.29,-.47);y.quadraticCurveTo(.47,-.47,.47,-.29);y.lineTo(.47,.48);y.lineTo(.405,.48);y.lineTo(.405,-.26);y.quadraticCurveTo(.405,-.395,.26,-.395);y.lineTo(-.26,-.395);y.quadraticCurveTo(-.405,-.395,-.405,-.26);y.lineTo(-.405,.48);y.closePath();
  mesh(new THREE.ExtrudeGeometry(y,{depth:.072,bevelEnabled:true,bevelSize:.008,bevelThickness:.008,bevelSegments:3,curveSegments:12}),bodyMaterial,head,0,0,-.04);
  for(const side of [-1,1]){
    const screw=cylinder(.085,.13,graphite,head,side*.458,.30,0);screw.rotation.z=Math.PI/2;
    const washer=cylinder(.091,.012,steel,head,side*.407,.30,0);washer.rotation.z=Math.PI/2;
    box(.012,.065,.017,rubber,head,side*.53,.30,.018);
  }
  const badge=document.createElement('canvas');badge.width=256;badge.height=64;const bc=badge.getContext('2d');bc.fillStyle='#171a1e';bc.fillRect(0,0,256,64);bc.fillStyle='#aab0ba';bc.font='500 32px sans-serif';bc.textAlign='center';bc.fillText('BROADCAST',128,43);
  mesh(new THREE.PlaneGeometry(.30,.075),new THREE.MeshStandardMaterial({map:texture(badge),roughness:.6}),head,0,-.1,.329).castShadow=false;
  head.updateMatrixWorld(true);
  const mount=head.localToWorld(new THREE.Vector3(0,-.45,-.02));
  const elbow=new THREE.Vector3(3.4,3.25,-.75),base=new THREE.Vector3(3.9,.12,-.9);
  function beam(a,b,width,depth,material,parent=microphoneAssembly){const mid=a.clone().add(b).multiplyScalar(.5),m=box(width,a.distanceTo(b),depth,material,parent,...mid.toArray());m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),b.clone().sub(a).normalize());return m;}
  for(const [a,b] of [[base,elbow],[elbow,mount]]){
    for(const z of [-.07,.07])beam(a.clone().add(new THREE.Vector3(0,0,z)),b.clone().add(new THREE.Vector3(0,0,z)),.065,.045,bodyMaterial);
  }
  for(const point of [elbow,mount]){
    const joint=cylinder(.105,.22,graphite,microphoneAssembly,...point.toArray());joint.rotation.x=Math.PI/2;
    const cap=cylinder(.055,.225,steel,microphoneAssembly,...point.toArray());cap.rotation.x=Math.PI/2;
  }
  box(.24,.20,.27,graphite,microphoneAssembly,base.x,.09,base.z);
  const cable=new THREE.CatmullRomCurve3([
    head.localToWorld(new THREE.Vector3(0,-.80,0)),
    new THREE.Vector3(1.55,1.12,1.08),new THREE.Vector3(2.18,1.94,.48),
    elbow.clone().add(new THREE.Vector3(.05,-.15,.09)),new THREE.Vector3(3.94,.09,-.73),new THREE.Vector3(5.8,.025,-.2)
  ]);
  mesh(new THREE.TubeGeometry(cable,64,.017,10,false),rubber,microphoneAssembly);

  // Event imagery at the same physical scale as the equipment. No miniature venue.
  const eventCanvas=document.createElement('canvas');eventCanvas.width=1280;eventCanvas.height=960;const ec=eventCanvas.getContext('2d');
  ec.fillStyle='#0B1F26';ec.fillRect(0,0,1280,960);coverImage(ec,event,0,0,1280,730);
  const fade=ec.createLinearGradient(0,500,0,760);fade.addColorStop(0,'#0B1F2600');fade.addColorStop(1,'#0B1F26');ec.fillStyle=fade;ec.fillRect(0,500,1280,260);
  if(eventLogo)ec.drawImage(eventLogo,65,750,440,98);
  ec.fillStyle='#e2e8e8';ec.font='35px "VTM Instrument",sans-serif';ec.fillText('Zeit für die Fragen, die zählen.',65,898);
  ec.fillStyle='#c1cacc';ec.font='19px "VTM Instrument",sans-serif';ec.textAlign='right';ec.fillText('Symbolszene · KI-generiert',1220,690);
  const eventTexture=texture(eventCanvas);
  const eventFrame=new THREE.Group();eventFrame.position.set(2.18,1.08,-1.10);eventFrame.rotation.set(-.07,-.22,.015);rig.add(eventFrame);
  mesh(rounded(2.85,2.16,.025,.045),graphite,eventFrame);
  mesh(new THREE.PlaneGeometry(2.79,2.095),new THREE.MeshPhysicalMaterial({map:eventTexture,emissiveMap:eventTexture,emissive:0xffffff,emissiveIntensity:.2,roughness:.45,clearcoat:.65,clearcoatRoughness:.2,envMapIntensity:.12}),eventFrame,0,0,.054).castShadow=false;
  const backSupport=box(1.15,1.6,.028,graphite,eventFrame,0,-.25,-.34);backSupport.rotation.x=-.43;
  return {microphoneAssembly, tablet, eventFrame};
}
