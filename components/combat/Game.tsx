import { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Crosshair, Shield, Radio, Volume2, VolumeX, Maximize, Pause, Play, RotateCcw, ChevronRight, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Flag, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { newCombat, type CombatState } from '@/lib/combat';
import { toggleAudio } from '@/lib/game-audio';
import { Scene, type Inputs, type Palette } from './Scene';

export function Game() {
  const state=useRef<CombatState>(newCombat()), inputs=useRef<Inputs>({keys:new Set(),aim:0,fire:false,throttle:0,steer:0});
  const [hud,setHud]=useState(newCombat()), [muted,setMuted]=useState(false), [palette,setPalette]=useState<Palette>();
  const [notice,setNotice]=useState('');
  const root=useRef<HTMLDivElement>(null);
  useEffect(()=> {
    const style=getComputedStyle(document.documentElement);
    const token=(name:string)=>style.getPropertyValue(name).trim();
    setPalette({sky:token('--scene-sky'),ground:token('--scene-ground'),stone:token('--scene-stone'),accent:token('--scene-accent'),enemy:token('--scene-accent'),tracer:token('--scene-tracer')});
    const down=(e:KeyboardEvent)=> { if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault(); inputs.current.keys.add(e.code); if(e.code==='Escape') { if(state.current.phase==='playing')state.current.phase='paused'; else if(state.current.phase==='paused')state.current.phase='playing'; sync(); } };
    const up=(e:KeyboardEvent)=>inputs.current.keys.delete(e.code);
    const blur=()=> { inputs.current.keys.clear();inputs.current.fire=false;if(state.current.phase==='playing') {state.current.phase='paused';sync();} };
    window.addEventListener('keydown',down);window.addEventListener('keyup',up);window.addEventListener('blur',blur);
    return ()=>{window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('blur',blur);};
  },[]);
  useEffect(()=>{ if(!hud.notice)return; setNotice(hud.notice); const timer=setTimeout(()=>setNotice(''),2000);return ()=>clearTimeout(timer);},[hud.kills,hud.ammo,hud.notice]);
  function sync() { const s=state.current;setHud({...s,enemies:s.enemies.map(e=>({...e}))}); }
  function start() { state.current=newCombat();state.current.phase='playing';inputs.current.aim=0; inputs.current.keys.clear();sync(); }
  function pause() { state.current.phase=state.current.phase==='paused'?'playing':'paused';sync(); }
  const time=`${String(Math.floor(hud.time/60)).padStart(2,'0')}:${String(Math.floor(hud.time%60)).padStart(2,'0')}`;
  return <div className="game-shell" ref={root}>
    <header className="game-header">
      <a href="/" className="brand"><span className="brand-mark"><Shield size={21}/></span><span>IRON<span className="text-primary">FRONT</span><small>ARMORED COMBAT</small></span></a>
      <div className="operation-heading"><span className="status-dot"/> OPERAÇÃO HORIZONTE <span className="header-divider"/> <span className="text-muted-foreground">ZONA DE COMBATE 07</span></div>
      <div className="header-tools"><span className="connection"><Radio size={13}/> SOLO</span><Button variant="ghost" size="icon" title={muted?'Ativar áudio':'Silenciar'} aria-label={muted?'Ativar áudio':'Silenciar'} onClick={()=>setMuted(toggleAudio())}>{muted?<VolumeX/>:<Volume2/>}</Button><Button variant="ghost" size="icon" title="Tela cheia" aria-label="Tela cheia" onClick={()=>{if(document.fullscreenElement)void document.exitFullscreen();else void root.current?.requestFullscreen();}}><Maximize/></Button></div>
    </header>
    <main className={`battlefield ${hud.phase==='ready'?'is-ready':''}`} onPointerMove={e=>{if(e.pointerType==='mouse'&&state.current.phase==='playing')inputs.current.aim=((e.clientX/e.currentTarget.clientWidth)-0.5)*1.4;}}>
      {palette&&<Canvas shadows dpr={1} camera={{position:[10,7,-35],fov:55}} gl={{antialias:true}}><Scene state={state} inputs={inputs} palette={palette} sync={sync}/></Canvas>}
      <div className="scene-shade"/>
      <div className="hud-top"><div><span className="eyebrow">MISSÃO / 01</span><h2>Tomada de território</h2><p><Target size={13}/> Neutralizar unidades hostis <b>{hud.kills} / 5</b></p></div><div className="timer"><span className="eyebrow">TEMPO DE OPERAÇÃO</span><strong>{time}</strong><div className="timer-status"><span className="status-dot"/>{hud.phase==='playing'?'EM COMBATE':hud.phase==='ready'?'EM POSIÇÃO':hud.phase==='paused'?'EM ESPERA':'ENCERRADA'}</div></div></div>
      <div className="compass"><span>NO</span><span>330</span><span>345</span><b>N</b><span>15</span><span>30</span><span>NE</span><i/></div>
      <div className="zone-label"><Flag size={12}/> SETOR ALPHA <span>38° 24′ N · 44° 08′ E</span></div>
      {hud.phase==='ready'&&<section className="ready-panel"><div className="eyebrow"><span className="red-line"/> PRONTO PARA O COMBATE</div><h1>IRON<br/><span>FRONT</span></h1><p>Operação Horizonte</p><div className="mission-brief">05 UNIDADES HOSTIS <span>•</span> 01 BLINDADO</div><Button className="deploy-button" onClick={start}>INICIAR OPERAÇÃO <ChevronRight size={18}/></Button><div className="independent-label">COMBATE SOLO · EDIÇÃO INDEPENDENTE</div></section>}
      {hud.phase==='playing'&&<><div className="reticle"><span/><span/><span/><span/><i/></div><div className="range-label">{Math.round(Math.hypot((hud.enemies.find(e=>e.hp>0)?.x??hud.x)-hud.x,(hud.enemies.find(e=>e.hp>0)?.z??hud.z)-hud.z))} m <span>AP · 25 mm</span></div>{notice&&<div className="hit-notice"><Crosshair size={20}/>{notice}</div>}<Button className="pause-button" size="icon" variant="ghost" title="Pausar" aria-label="Pausar" onClick={pause}><Pause/></Button></>}
      {['paused','won','lost'].includes(hud.phase)&&<div className="result-overlay"><section><span className="eyebrow">OPERAÇÃO HORIZONTE</span><h2>{hud.phase==='paused'?'OPERAÇÃO PAUSADA':hud.phase==='won'?'MISSÃO CUMPRIDA':'BLINDADO ABATIDO'}</h2><p>{hud.kills} alvos neutralizados · {time}</p><Button size="lg" onClick={hud.phase==='paused'?pause:start}>{hud.phase==='paused'?<Play/>:<RotateCcw/>}{hud.phase==='paused'?'CONTINUAR':'NOVA OPERAÇÃO'}</Button></section></div>}
      <div className="lower-hud"><div className="vehicle-status"><div className="eyebrow">SEU BLINDADO</div><h3>APC-8 <span>RECON</span></h3><div className="armor"><Shield size={15}/><span>INTEGRIDADE</span><b>{hud.hp}%</b></div><progress max="100" value={hud.hp} aria-label="Integridade do blindado"/><div className="speed"><strong>{Math.round(Math.abs(hud.speed)*3.6)}</strong><span>km/h</span><span className="gear">{hud.speed<0?'R':'D'}<small>TRANSMISSÃO</small></span></div></div>
        <div className="weapon-status"><div className="weapon-icon"><Crosshair size={30}/></div><div><span className="eyebrow">CANHÃO AUTOMÁTICO</span><h3>25 mm <span>AP</span></h3><p><strong>{String(hud.ammo).padStart(2,'0')}</strong> / 60 <span>{hud.reload>0?'RECARREGANDO':'PRONTO'}</span></p></div></div>
        <div className="minimap"><div className="map-grid"><span className="map-road"/><span className="map-sector">A</span><span className="map-player" style={{left:`${(hud.x+75)/150*100}%`,top:`${100-(hud.z+45)/170*100}%`,transform:`rotate(${-hud.yaw*180/Math.PI}deg)`}}>▲</span>{hud.enemies.filter(e=>e.hp>0).map(e=><span key={e.id} className="map-enemy" style={{left:`${(e.x+75)/150*100}%`,top:`${100-(e.z+45)/170*100}%`}}>◆</span>)}<span className="map-north">N</span></div><div className="map-caption">MAPA TÁTICO <span>150 m</span></div></div>
      </div>
      <div className="touch-controls"><div className="touch-pad">{[{icon:ArrowUp,key:'KeyW',label:'Avançar'},{icon:ArrowLeft,key:'KeyA',label:'Esquerda'},{icon:ArrowDown,key:'KeyS',label:'Recuar'},{icon:ArrowRight,key:'KeyD',label:'Direita'}].map(({icon:Icon,key,label})=><Button key={key} size="icon" variant="secondary" aria-label={label} onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);inputs.current.keys.add(key);}} onPointerUp={()=>inputs.current.keys.delete(key)} onPointerCancel={()=>inputs.current.keys.delete(key)}><Icon/></Button>)}</div><Button className="touch-fire" size="icon" aria-label="Disparar" onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);inputs.current.fire=true;}} onPointerUp={()=>inputs.current.fire=false} onPointerCancel={()=>inputs.current.fire=false}><Crosshair/></Button></div>
    </main>
    <footer className="game-footer"><div className="control-hints"><span><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> MOVIMENTO</span><i/><span><Crosshair size={13}/> MOUSE · MIRA</span><i/><span><kbd>SPACE</kbd> DISPARAR</span><i/><span><kbd>ESC</kbd> PAUSAR</span></div><span className="footer-build">IRONFRONT <span> / </span> V.01</span></footer>
  </div>;
}