# Big Sim model showcase

Open `index.html` in a browser for the full local gallery. The header links to focused pages for people and horses, weapons and artillery, the world and battlefield, field props, every model close-up, all seven animations, interactive infantry and cavalry formation studies, and the five-view British Redcoat art study. The Redcoat model is an art study and is not integrated into gameplay. `model-closeups.html` includes a close-up render and source path for every exported GLB and glTF model under `art/`; [`../../MODEL-CLOSEUPS.md`](../../MODEL-CLOSEUPS.md) renders that catalog directly on GitHub. `model-showcase-board.jpg` is a quick overview image, and `big-sim-model-showcase.zip` packages the gallery, all source-model close-ups, model cards, prop catalog, town and fountain studies, interiors, battlefield views, seven animation clips, and credits for sharing.

[`media-manifest.json`](media-manifest.json) records SHA-256 hashes for every gallery image and animation alongside its source asset. Run `art/model_showcase/build_showcase.py --check-media` to find changed, missing, or untracked media. After rebuilding or rerendering the stale files, run it with `--record-media` to accept the refreshed hashes.

The gallery covers the Winged Hussar and close armor view, Napoleonic people and horse source models, weapon and artillery families, 55 cataloged town, camp, farm, and battlefield props with close material studies, field kits, village buildings, the 180 × 90 m early-19th-century city edge with 22 mapped placements from 14 building models, dedicated shopfront and work-bay details, and a separate Hercules fountain with one anatomy close-up and one bronze-shield close-up. It also includes six CC0 town texture packs, floor-by-floor interior plans, six furnished room close-ups, a full oil-lantern view and its metal/glass material close-up, and terrain. The lantern's custom cast-iron and brass maps are generated for Big Sim and embedded in its GLB. Alternate LOD exports are grouped under their master. The five mounted motion loops are Blender previews; the infantry volley and cannon discharge are Unity inspection captures. This collection does not establish general Unity runtime or performance status.

The five latest ground-polish cards use Unity captures from `art/battlefield/previews/unity/ground-polish/`: the wide field overview, farm entrance, crop edge, lane by the farmhouse, and tree-lined wagon lane. These show current battlefield presentation alongside the standalone Blender studies. Four AI concept renders are labeled separately; they reinterpret source captures for presentation and are not raw game screenshots.

## Refresh

For the fourteen rebuilt fieldwork and farm models, follow `art/battlefield/FIELD_PROPS.md`. After rendering and assembling their sheets, `python art/model_showcase/refresh_field_props.py` updates just their fifteen gallery images, catalog records and relevant pages. The full build below also refreshes the combined board and archive.

The cannon card layers a browser-rendered orange flash, fire, and sparks over the Unity capture. The captured smoke remains a separate layer. `cannon-firing-poster.webp` is the still used when reduced motion is requested.

Render a close-up image for every GLB and glTF model under `art/` before rebuilding the showcase:

```powershell
& 'C:/Program Files/Blender Foundation/Blender 5.1/blender.exe' --background --factory-startup --threads 2 --python-exit-code 1 --python art/model_showcase/render_art_model_closeups.py -- --engine workbench
```

Render the imported people, horse, cannon, and sabre portraits with:

```powershell
& 'C:/Program Files/Blender Foundation/Blender 5.1/blender.exe' --background --factory-startup --threads 2 --python-exit-code 1 --python art/model_showcase/render_imported_models.py
```

Refresh the Hercules fountain, anatomy, bronze-shield and center-grip close-ups, plus the shopfront and work-bay details, with the render commands in `art/city_buildings/README.md`.

Rebuild the gallery and package after the close-up render pass with:

```powershell
& 'C:/Users/Darren/AppData/Local/Programs/Python/Python310/python.exe' art/model_showcase/build_showcase.py --skip-board
```

The close-up page does not change the overview board. Omit `--skip-board` when the main model-card collection also needs a new board render.

Check which source pictures or published showcase files have changed with:

```powershell
& 'C:/Users/Darren/AppData/Local/Programs/Python/Python310/python.exe' art/model_showcase/build_showcase.py --check-media
```

The hash manifest records both each source asset and the image or animation included in the gallery. Refresh changed media first; then use `--record-media` to accept the new hashes. It refuses to accept a changed model source when its close-up image has not also changed. Publish updated showcase files to `SpaceFoon/big-sim-model-showcase` and verify the Pages deployment before finishing media work.

See `CREDITS.md` before sharing the images.

To refresh the standalone armor render:

```powershell
& 'C:/Program Files/Blender Foundation/Blender 5.1/blender.exe' --background --factory-startup --threads 2 --python-exit-code 1 --python art/model_showcase/render_armor_only.py
```

To refresh the five high-resolution battlefield views from the saved source scene (1920 x 1080, two Blender threads; Blender uses OPTIX when available; tall distant smoke banks are hidden in all views):

```powershell
& 'C:/Program Files/Blender Foundation/Blender 5.1/blender.exe' --background art/battlefield/Battlefield.blend --threads 2 --python-exit-code 1 --python art/model_showcase/render_battlefield_views.py -- --width 1920 --samples 6
```

To rebuild the infantry volley GIF from locally available Unity inspection frames in `.build/animation/`:

```powershell
& 'C:/Users/Darren/AppData/Local/Programs/Python/Python310/python.exe' art/model_showcase/prepare_motion_sources.py
```

The ready-to-share GIFs are already included in `source_media/` or the battlefield preview folder, so this capture step is needed only when those local frames are being refreshed.
