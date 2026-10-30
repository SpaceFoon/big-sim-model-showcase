# Model showcase credits

This archive contains renders and a gallery page. It does not contain the raw source models. Credit the original artists when sharing images that show their adapted assets.

## Original Big Sim models

Armor, wings, horse tack, kopia, saddle weapons, the olive artillery and caisson, village and period-town buildings, the Hercules fountain, oil street lantern, presentation-only interiors, terrain, and the procedural scenery, fieldwork, and player-item kits were authored for Big Sim. The 55 cataloged placeable-prop models and their embedded PBR maps are also original Big Sim work. The battlefield scene uses CC0 surface textures from Poly Haven; source maps and licenses are recorded in `art/battlefield/textures/cc0/manifest.json` in the project repository.

The fourteen rebuilt fieldwork, boundary and farm masters use original Big Sim geometry and generated 512 px albedo, roughness and tangent-normal maps in `art/battlefield/textures/field_props/`. Their textured GLBs and matching vertex-coloured Unity FBXs retain separate inspection and runtime material paths.

The fountain, figure pose, stone treatment, shield, club, and waterworks were authored for Big Sim. Its anatomy uses the MakeHuman base mesh bundled with MPFB; that mesh file explicitly carries a CC0 dedication dated September 2020. The header credits Data Collection AB, Joel Palmius, and Jonas Hauquier as the holders at dedication. The fountain is a generic period-inspired interpretation of Heidelberg's public-history reference, not a scan or replica.

## CC0 town textures

Town building and city-edge previews use six 1K PBR materials from Poly Haven: [Plastered Wall 04](https://polyhaven.com/a/plastered_wall_04), [Old Stone Wall](https://polyhaven.com/a/old_stone_wall), [Clay Roof Tiles](https://polyhaven.com/a/clay_roof_tiles), [Wood Planks](https://polyhaven.com/a/wood_planks), [Wood Floor](https://polyhaven.com/a/wood_floor), and [Cobblestone Floor 001](https://polyhaven.com/a/cobblestone_floor_001). All are CC0. Their color, OpenGL normal, roughness, and displacement downloads, source URLs, and SHA-256 hashes are recorded in `art/city_buildings/textures/cc0/manifest.json`.

The oil lantern's limestone uses the CC0 Old Stone Wall maps above. Its cast iron and brass use six original tileable Big Sim detail maps for diffuse variation, roughness, and OpenGL tangent-space normals; the PNG sources are in `art/city_buildings/textures/lamp_generated/` and are embedded in the GLB.

## CC0 battlefield textures

Battlefield prop and material previews use nine 1K CC0 material sets from Poly Haven: Sparse Grass, Brown Mud, Wood Planks, Plastered Wall 04, Roof Tiles, Old Stone Wall, Hessian 230, Metal Plate 02, and Brown Leather. Diffuse, OpenGL normal, roughness, and displacement sources are recorded with download URLs and SHA-256 hashes in `art/battlefield/textures/cc0/manifest.json`; Metal Plate 02 also includes metalness.

## Adapted CC BY 4.0 models

- **Andy Woodhead**, [Infantry - rigged for UE4/5](https://sketchfab.com/3d-models/infantry-rigged-for-ue45-free-download-771050587ce248498178aee2c2f88f36): infantry portrait and derived project infantry.
- **Andy Woodhead**, [Hussar - rigged for UE4/5](https://sketchfab.com/3d-models/hussar-rigged-for-ue45-free-download-aa5a353357974d2dbd4b18d34ec9a7bc): Napoleonic light hussar source model.
- **Andy Woodhead**, [Artillery crew 1815](https://sketchfab.com/3d-models/artillery-crew-1815-rigged-for-ue45-98747e8ba0e547eaba65136919734bf2): artillery crew portrait and adapted rider head and hands.
- **abhayexe**, [Horse Rigged (Game Ready)](https://sketchfab.com/3d-models/horse-riggedgame-ready-bc64f4ff7966474ca9bacd42fa73a754): horse source model used for the horse portrait and Winged Hussar.
- **perceval-66**, [Cannon-GRIBEAUVAL](https://sketchfab.com/3d-models/cannon-gribeauval-6c6e70a71a114e20b5d7ebdf81bbaecf): Gribeauval cannon source model.
- **Timothy Hsu**, [PBR Prussian Blücher Sabre](https://sketchfab.com/3d-models/pbr-prussian-blucher-sabre-3861fb329f1146778d3242d61a6a4e0c): Blücher sabre source model.
- **Booba Booba**, [Stylized Medieval village external furniture](https://sketchfab.com/3d-models/stylized-medieval-village-external-furniture-80c25af6364e446c88529d3c07728f9d): licensed fallback furniture shown in the village source scene.
- **Fri13Day**, [Wagon](https://sketchfab.com/3d-models/wagon-6f6a0d8816c44f8f90993e1c68ae4e09): licensed wagon source used in battlefield dressing.
- **Nicholas-3D**, [Tents Model Free](https://sketchfab.com/3d-models/tents-model-free-af039b90cb0a4a28ab60bc42662e5946): tent source used in battlefield dressing.

All listed Sketchfab source models are licensed under [Creative Commons Attribution 4.0](https://creativecommons.org/licenses/by/4.0/). Their source files and license records are retained in `art/battlefield/imports/`; project changes are described in `art/battlefield/THIRD_PARTY.md` and `art/winged_hussar/RIDER_ATTRIBUTION.md`.

The five-view British Redcoat art study adapts the body, head, hands, uniform meshes, and rig from **Andy Woodhead**, [Infantry - rigged for UE4/5 - free download](https://sketchfab.com/3d-models/infantry-rigged-for-ue45-free-download-771050587ce248498178aee2c2f88f36), under CC BY 4.0. It depicts a weapon-free 52nd (Oxfordshire) Light Infantry private. The model is an art study and is not integrated into gameplay.

## Showcase scope

The cannon card layers a browser-rendered orange flash, fire, and sparks over the Unity capture. The captured smoke remains a separate layer.

The collection groups alternate LODs and repeated exports under their model family. It includes Blender source renders, not a claim that every source model has passed Unity runtime or performance review. The five latest farm and battlefield ground-polish views are Unity captures from October 24, 2026. Four separately labeled AI concept renders are illustrative visual treatments based on source captures, not raw game screenshots. The five mounted loops are Blender source previews. The infantry volley and cannon discharge are Unity inspection captures; they show presentation clips, not authoritative battlefield outcomes.

`model-closeups.html` and the root `MODEL-CLOSEUPS.md` show one close-up render for every exported GLB and glTF model under `art/`. Each close-up card names the source file; the GitHub Markdown catalog groups all images by asset family.
