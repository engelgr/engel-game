<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep the combat experience client-only on the index route; WebGL and browser audio must never render server-side.
- Keep combat rules in a browser-independent simulation module and mirror its state into the HUD at a throttled rate; frame updates must not re-render the whole interface.
- Use verified CC0 model assets served through project asset pointers or explicitly disclosed original procedural fallbacks, never extracted War Thunder assets, so the game can be distributed independently.
