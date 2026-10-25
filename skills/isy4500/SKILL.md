---
name: isy4500
description: Cambiar la luz RGB y el DPI del ratón ISY IGM 4500 WT (USB 30FA:1040) con el CLI `isy4500` de Open ISY4500 Customizer — color fijo, un color por nivel de DPI, efectos (respiración, arcoíris, espectro…), brillo, velocidad, apagar, la velocidad (DPI) de cada nivel y el nivel activo. Úsala cuando el usuario pida poner el ratón de un color, cambiar su iluminación o efecto, apagar sus luces, cambiar su sensibilidad/DPI o saber en qué nivel de DPI está, aunque no nombre la app.
---

# isy4500 · luz del ratón ISY IGM 4500 WT

Habla con el ratón directamente por USB (no hace falta tener la app abierta; si lo está, se actualiza sola).
Todas las órdenes aceptan `--json` (salida estructurada) y `--dry-run` (enseña los paquetes sin mandarlos).

## Órdenes

```bash
isy4500 status                       # ¿conectado? + configuración guardada
isy4500 color "#ff0000"              # rojo fijo en los 6 niveles de DPI
isy4500 color "#00ff00" --dpi 2      # solo el nivel 2 (1-6)
isy4500 colors "#0f0" ...            # 6 colores, uno por nivel (formato #rrggbb)
isy4500 mode breathing --speed 3     # efecto (isy4500 modes)
isy4500 mode static --brightness 4   # brillo 0-7 (solo static, fill, loop)
isy4500 preset fuego                 # estilo hecho (isy4500 presets)
isy4500 off                          # apagar
isy4500 dpi                          # DPI de cada nivel (lee la memoria del ratón)
isy4500 dpi 800 1200 1600 2400 3200 4800   # graba los 6 niveles (200-4800, de 200 en 200, sin 2200)
isy4500 dpi 2400 --level 3           # solo un nivel
isy4500 dpi factory                  # valores de fábrica
isy4500 listen 20                    # nivel de DPI en vivo al pulsar el botón (solo lectura)
```

Modos: `static`, `breathing`, `breathing-multi`, `rainbow`, `spectrum`, `fill`, `loop`, `enraptured`, `flicker`, `ripple`, `startrek`, `off`.
Velocidad 0-5, brillo 0-7 (7 = máximo), dirección 0/1.

## A tener en cuenta

- El ratón tiene 4 bits por canal: `#22e3ff` se ve como `#22eeff`. No hay más precisión.
- Cada uno de los 6 niveles de DPI tiene su color: el ratón cambia de color al cambiar de DPI.
- El DPI se graba en la memoria del ratón y se aplica al momento; la luz va a la RAM y se pierde al desenchufar.
- Los valores de DPI son aproximados (código × 200). Usa `--dry-run` antes si dudas.
- Reasignar botones no está implementado. No inventes comandos ni escribas la memoria por otras vías.
- Si dice «Ratón no encontrado», pide al usuario que lo conecte; no hay nada más que hacer.
