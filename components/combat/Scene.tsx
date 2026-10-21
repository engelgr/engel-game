import { Suspense, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Environment, Lightformer, Html, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import vehicleAsset from '@/assets/armored-vehicle.glb.asset.json';
import { drive, fire, tick, type CombatState } from '@/lib/combat';
import { shotAudio } from '@/lib/game-audio';
import { APC } from './APC';

export interface Inputs { keys: Set<string>; aim: number; fire: boolean; throttle: number; steer: number }
export interface Palette { sky: string; ground: string; stone: string; accent: string; enemy: string; tracer: string }

function Vehicle({ enemy = false }: { enemy?: boolean }) {
  const { scene } = useGLTF(vehicleAsset.url);
  const object = useMemo(() => {
    const clone = scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    clone.scale.multiplyScalar(5.7 / Math.max(size.x, size.z, 0.001));
    const scaled = new THREE.Box3().setFromObject(clone), center = scaled.getCenter(new THREE.Vector3());
    clone.position.set(-center.x, -scaled.min.y, -center.z);
    clone.traverse(o => { if (o instanceof THREE.Mesh) { o.castShadow=true; o.receiveShadow=true; if(enemy && o.material instanceof THREE.MeshStandardMaterial) { o.material=o.material.clone(); o.material.color.multiplyScalar(0.65); } } });
    return clone;
  }, [scene, enemy]);
  return <primitive object={object} />;
}

function Ground({ palette }: { palette: Palette }) {
  const { geo, map } = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(420, 420, 100, 100);
    const pos = geometry.getAttribute('position');
    for(let i=0;i<pos.count;i++) {
      const x=pos.getX(i), z=-pos.getY(i);
      const edge=Math.max(0, Math.abs(x)-65)/30;
      const far=Math.max(0, Math.abs(z-35)-110)/35;
      pos.setZ(i,(Math.sin(x*0.06)*Math.cos(z*0.045)+1.8)*(edge+far)*8);
    }
    geometry.computeVertexNormals();
    const canvas=document.createElement('canvas'); canvas.width=canvas.height=256;
    const c=canvas.getContext('2d');
    if(c) { c.fillStyle=palette.ground; c.fillRect(0,0,256,256); for(let i=0;i<7000;i++) { c.fillStyle=i%3===0?palette.stone:palette.ground; c.globalAlpha=0.18+(i%5)*0.07; c.fillRect((i*71)%256,(i*113+Math.floor(i/256)*17)%256,2,2); } }
    const texture=new THREE.CanvasTexture(canvas); texture.wrapS=texture.wrapT=THREE.RepeatWrapping; texture.repeat.set(26,26); texture.colorSpace=THREE.SRGBColorSpace;
    return {geo:geometry,map:texture};
  },[palette]);
  return <><mesh rotation-x={-Math.PI/2} receiveShadow><primitive object={geo} attach="geometry"/><meshStandardMaterial map={map} roughness={1} /></mesh>
    <mesh rotation-x={-Math.PI/2} position={[0,0.03,35]} receiveShadow><planeGeometry args={[11,200]}/><meshStandardMaterial color={palette.stone} map={map} roughness={1}/></mesh>
    {Array.from({length:18},(_,i)=><mesh key={i} position={[0,0.05,-42+i*10]} rotation-x={-Math.PI/2}><planeGeometry args={[0.12,3]}/><meshStandardMaterial color={palette.sky}/></mesh>)}
  </>;
}

export function Scene({ state, inputs, palette, sync }: { state: React.RefObject<CombatState>; inputs: React.RefObject<Inputs>; palette: Palette; sync: () => void }) {
  const player=useRef<THREE.Group>(null);
  const enemies=useRef(new Map<number,THREE.Group>());
  const tracer=useRef<THREE.Mesh>(null);
  const flash=useRef<THREE.Mesh>(null);
  const accumulator=useRef(0), shotLife=useRef(0);
  const cameraPos=useMemo(()=>new THREE.Vector3(),[]), look=useMemo(()=>new THREE.Vector3(),[]);
  useFrame(({camera}, rawDt)=> {
    const dt=Math.min(rawDt,0.05), s=state.current, input=inputs.current;
    if(s.phase==='playing') {
      const k=input.keys;
      drive(s, input.throttle+(Number(k.has('KeyW')||k.has('ArrowUp'))-Number(k.has('KeyS')||k.has('ArrowDown'))), input.steer+(Number(k.has('KeyD')||k.has('ArrowRight'))-Number(k.has('KeyA')||k.has('ArrowLeft'))), dt);
      tick(s,dt);
      if((input.fire||k.has('Space'))&&s.reload<=0&&s.ammo>0) {
        const target=fire(s,input.aim); shotAudio(target?.hp===0); shotLife.current=0.16;
        if(tracer.current) { const yaw=s.yaw+input.aim; const distance=target?Math.hypot(target.x-s.x,target.z-s.z):70; tracer.current.position.set(s.x+Math.sin(yaw)*distance/2,1.7,s.z+Math.cos(yaw)*distance/2); tracer.current.rotation.set(0,yaw,0); tracer.current.scale.z=distance; }
      }
    }
    shotLife.current=Math.max(0,shotLife.current-dt);
    if(tracer.current) tracer.current.visible=shotLife.current>0;
    if(flash.current) { flash.current.visible=shotLife.current>0; flash.current.position.set(s.x+Math.sin(s.yaw+input.aim)*3,2,s.z+Math.cos(s.yaw+input.aim)*3); }
    if(player.current) { player.current.position.set(s.x,0,s.z); player.current.rotation.y=s.yaw; }
    for(const e of s.enemies) { const g=enemies.current.get(e.id); if(g) { g.visible=e.hp>0; g.position.set(e.x,0,e.z); g.rotation.y=Math.atan2(s.x-e.x,s.z-e.z); } }
    if(s.phase==='ready') { cameraPos.set(s.x+10,7,s.z-13); look.set(s.x,1.6,s.z+5); }
    else { cameraPos.set(s.x-Math.sin(s.yaw+input.aim)*13,7,s.z-Math.cos(s.yaw+input.aim)*13); look.set(s.x+Math.sin(s.yaw+input.aim)*30,1.6,s.z+Math.cos(s.yaw+input.aim)*30); }
    camera.position.lerp(cameraPos,1-Math.exp(-5*dt)); camera.lookAt(look);
    accumulator.current+=dt; if(accumulator.current>0.1) { accumulator.current=0; sync(); }
  });
  return <>
    <color attach="background" args={[palette.sky]}/><fog attach="fog" args={[palette.sky,95,260]}/>
    <hemisphereLight args={[palette.sky,palette.ground,1.8]}/>
    <directionalLight position={[-40,60,-20]} intensity={2.4} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-camera-left={-75} shadow-camera-right={75} shadow-camera-top={110} shadow-camera-bottom={-55} shadow-camera-far={180}/>
    <Environment resolution={64}><Lightformer intensity={1.5} position={[0,20,0]} scale={[100,100,1]} rotation-x={-Math.PI/2}/></Environment>
    <Ground palette={palette}/>
    <group ref={player}><APC palette={palette}/></group>
    <Suspense fallback={null}>
      {state.current.enemies.map(e=><group key={e.id} ref={g=>{if(g) enemies.current.set(e.id,g); else enemies.current.delete(e.id);}} position={[e.x,0,e.z]}>
        <Vehicle enemy/>
        <mesh position={[0,4,0]} rotation-z={Math.PI/4}><ringGeometry args={[0.32,0.42,4]}/><meshBasicMaterial color={palette.accent} side={THREE.DoubleSide}/></mesh>
      </group>)}
    </Suspense>
    <mesh ref={tracer} visible={false}><boxGeometry args={[0.045,0.045,1]}/><meshBasicMaterial color={palette.tracer}/></mesh>
    <mesh ref={flash} visible={false}><sphereGeometry args={[0.35,8,8]}/><meshBasicMaterial color={palette.tracer}/></mesh>
    <mesh position={[0,0.1,62]} rotation-x={-Math.PI/2}><ringGeometry args={[13.8,14,64]}/><meshBasicMaterial color={palette.accent}/></mesh>
  </>;
}