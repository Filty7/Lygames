# Web lygames.cz

Statický web na GitHub Pages (větev `main`, kořen repozitáře), doména lygames.cz.
Hlavní stránka je `index.html`, každá hra je ve vlastní složce `hry/<nazev-hry>/index.html`.

## Měření návštěv – při každé úpravě hry zachovat

Každý `index.html` (hlavní stránka i každá hra) musí mít těsně před `</body>` tento řádek:

```html
<script src="/stats.js" defer></script>
```

Když hru nahrazuješ novou verzí (třeba z artefaktu), řádek do nové verze vždy znovu vlož, jinak se hra
přestane počítat ve statistikách. Totéž platí pro nově přidanou hru. Do `stats.js` nesahej, pokud o to
uživatel výslovně nežádá.

`stats.js` posílá anonymní data (bez cookies a IP) do Supabase, projekt `thats-life`
(`ttgjzbpglgerxvbmaqdt`), tabulka `public.lyg_events` přes funkci `public.lyg_track(text)`.
Stránka hry se v datech jmenuje podle názvu své složky v `hry/`, hlavní stránka je `home`.
