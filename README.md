# Frente de Aço

**Frente de Aço** é um jogo independente de combate com blindados, em português. O jogador controla um veículo em um campo de batalha, enfrenta unidades inimigas e conquista cinco setores para concluir a campanha.

## Como jogar

1. Abra `index.html` em um navegador moderno. Se preferir servir os arquivos localmente, execute `python3 -m http.server 8000` na pasta do projeto e acesse `http://localhost:8000`.
2. Selecione **Iniciar operação**.
3. Use o joystick virtual no celular ou o teclado no computador para conduzir o blindado até o setor indicado.
4. No computador, mire com o mouse e dispare com **Espaço** ou clique. No celular, use o botão de disparo.
5. Permaneça no ponto de captura até completar o progresso. Elimine ou afaste os inimigos que disputam o setor.
6. Ao concluir uma fase, escolha **Próxima fase**. Se o blindado for destruído, escolha **Tente novamente** para reiniciar a fase atual.

## Controles

| Ação | Teclado e mouse | Celular |
| --- | --- | --- |
| Avançar / recuar | `W` / `S` | Joystick virtual para cima / para baixo |
| Virar | `A` / `D` | Joystick virtual para a esquerda / para a direita |
| Acelerar | `Shift` | — |
| Mirar | Mover o mouse | — |
| Disparar | `Espaço` | Botão de disparo |
| Tentar novamente após ser derrotado | `R` | Botão **Tente novamente** |

## Campanha

A campanha tem cinco fases. Cada uma tem um ponto de captura, uma região, posições de inimigos e uma paleta de cenário próprios:

1. **Entroncamento** — Frente Leste
2. **Posto da Serra** — Serra do Norte
3. **Fazenda** — Campos do Oeste
4. **Depósito Sul** — Distrito do Depósito
5. **Travessia Oeste** — Acesso ao Rio

O número de inimigos aumenta conforme a campanha avança. A primeira fase começa com três. Ao completar a quinta fase, **Jogar novamente** inicia uma nova campanha.

## Regras e interface

- Em telas de até 700 px de largura, o jogo mostra o joystick e o botão de disparo para toque.
- Em telas mais largas, o jogo usa `W`, `A`, `S`, `D` e `Espaço`; o mouse controla a mira.
- A interface muda de modo automaticamente se a largura da tela mudar.
- Conquiste o ponto indicado ao entrar no círculo e manter o setor livre de inimigos próximos.
- Os disparos consomem munição e têm intervalo de recarga.
- O blindado tem integridade limitada; impactos inimigos causam dano.
- O mapa tático mostra a posição do jogador, dos inimigos e do ponto de captura.
- A vegetação e as pedras não são colocadas sobre a estrada principal.

## Implementação

- O jogo roda no navegador e renderiza a arena em um elemento `canvas` 2D.
- A lógica de condução, combate, captura e progressão está no JavaScript embutido em `index.html`.
- Os veículos, o terreno, as construções e os efeitos visuais são desenhados de forma procedural para este projeto; não são modelos extraídos de outros jogos.
- O jogo não exige conta, servidor de jogo ou instalação de dependências para ser aberto como página estática.
