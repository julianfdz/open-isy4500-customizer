---
name: isy4500
description: Cambiar la luz RGB del ratón ISY IGM 4500 WT (USB 30FA:1040) con el CLI `isy4500` de Open ISY4500 Customizer — color fijo, un color por nivel de DPI, efectos (respiración, arcoíris, espectro…), brillo, velocidad, apagar, y leer el nivel de DPI activo. Úsala cuando el usuario pida poner el ratón de un color, cambiar su iluminación o efecto, apagar sus luces o saber en qué nivel de DPI está, aunque no nombre la app.
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
isy4500 listen 20                    # nivel de DPI en vivo al pulsar el botón (solo lectura)
```

Modos: `static`, `breathing`, `breathing-multi`, `rainbow`, `spectrum`, `fill`, `loop`, `enraptured`, `flicker`, `ripple`, `startrek`, `off`.
Velocidad 0-5, brillo 0-7 (7 = máximo), dirección 0/1.

## A tener en cuenta

- El ratón tiene 4 bits por canal: `#22e3ff` se ve como `#22eeff`. No hay más precisión.
- Cada uno de los 6 niveles de DPI tiene su color: el ratón cambia de color al cambiar de DPI.
- No se pueden cambiar los valores de DPI ni reasignar botones: no están en el protocolo conocido. No inventes comandos.
- Si dice «Ratón no encontrado», pide al usuario que lo conecte; no hay nada más que hacer.
