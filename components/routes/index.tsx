import { createFileRoute } from "@tanstack/react-router";
import { Game } from '@/components/combat/Game';
export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({meta: [
    {title:'IRONFRONT — Combate blindado'},
    {name:'description',content:'Entre na Operação Horizonte: um jogo independente de combate com blindados, alvos hostis e campo de batalha 3D.'},
    {property:'og:title',content:'IRONFRONT — Combate blindado'},
    {property:'og:description',content:'Comande seu blindado e neutralize as unidades hostis na Operação Horizonte.'},
    {property:'og:type',content:'website'},
    {name:'twitter:card',content:'summary_large_image'},
  ]}),
  component: Game,
});
