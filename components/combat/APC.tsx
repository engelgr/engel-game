import { useMemo } from 'react';
import * as THREE from 'three';
import type { Palette } from './Scene';

// Original eight-wheel silhouette: no extracted or copyrighted game geometry.
export function APC({ palette }: { palette: Palette }) {
  const hull=useMemo(()=> {
    const shape=new THREE.Shape();
    shape.moveTo(-1.4,0.85); shape.lineTo(1.4,0.85); shape.lineTo(1.55,1.4); shape.lineTo(1.25,2.05); shape.lineTo(-1.25,2.05); shape.lineTo(-1.55,1.4); shape.closePath();
    const geometry=new THREE.ExtrudeGeometry(shape,{depth:5.8,bevelEnabled:false}); geometry.translate(0,0,-2.9); return geometry;
  },[]);
  return <group>
    <mesh geometry={hull} castShadow receiveShadow><meshStandardMaterial color={palette.ground} metalness={0.35} roughness={0.72}/></mesh>
    <mesh position={[0,1.55,2.75]} rotation-x={0.4} castShadow><boxGeometry args={[2.7,0.9,0.35]}/><meshStandardMaterial color={palette.ground} roughness={0.8}/></mesh>
    {[-1,1].flatMap(side=>[-2.05,-0.75,0.65,2].map((z,i)=><group key={`${side}-${i}`} position={[side*1.5,0.65,z]} rotation-z={Math.PI/2}>
      <mesh castShadow><cylinderGeometry args={[0.68,0.68,0.47,18]}/><meshStandardMaterial color={palette.stone} roughness={0.95}/></mesh>
      <mesh position={[0,side*0.25,0]}><cylinderGeometry args={[0.34,0.34,0.06,12]}/><meshStandardMaterial color={palette.ground} metalness={0.5}/></mesh>
    </group>))}
    <mesh position={[0,2.1,-0.2]}><cylinderGeometry args={[0.65,0.75,0.2,12]}/><meshStandardMaterial color={palette.ground} metalness={0.4}/></mesh>
    <group position={[0,2.35,0]}>
      <mesh castShadow><boxGeometry args={[0.9,0.65,0.8]}/><meshStandardMaterial color={palette.ground} metalness={0.4}/></mesh>
      <mesh position={[0,0.18,1.1]} rotation-x={Math.PI/2} castShadow><cylinderGeometry args={[0.085,0.11,1.8,8]}/><meshStandardMaterial color={palette.stone} metalness={0.7}/></mesh>
      <mesh position={[0.4,0.3,0.1]}><boxGeometry args={[0.2,0.22,0.25]}/><meshStandardMaterial color={palette.sky} metalness={0.8} roughness={0.2}/></mesh>
    </group>
    {[-1,1].map(side=><group key={side}>
      <mesh position={[side*1.31,1.72,-0.3]}><boxGeometry args={[0.12,0.6,2.9]}/><meshStandardMaterial color={palette.ground} roughness={0.9}/></mesh>
      {[0,1,2,3,4].map(i=><mesh key={i} position={[side*1.4,1.8,-1.5+i*0.6]}><boxGeometry args={[0.12,0.07,0.35]}/><meshStandardMaterial color={palette.stone}/></mesh>)}
      <mesh position={[side*0.92,2.09,1.6]} rotation-x={-0.2}><boxGeometry args={[0.45,0.07,0.32]}/><meshStandardMaterial color={palette.stone} metalness={0.7}/></mesh>
      <mesh position={[side*1.2,1.65,3]}><sphereGeometry args={[0.12,8,8]}/><meshStandardMaterial color={palette.sky} emissive={palette.sky} emissiveIntensity={0.6}/></mesh>
      <mesh position={[side*1.15,3.05,-2.3]}><cylinderGeometry args={[0.018,0.025,2,5]}/><meshStandardMaterial color={palette.stone}/></mesh>
    </group>)}
  </group>;
}