---
name: isy4500
description: Cambiar la luz RGB, el DPI y los botones del ratón ISY IGM 4500 WT (USB 30FA:1040) con el CLI `isy4500` de Open ISY4500 Customizer — color fijo, un color por nivel de DPI, efectos (respiración, arcoíris, espectro…), brillo, velocidad, apagar, la velocidad (DPI) de cada nivel, el nivel activo y qué hace cada botón. Úsala cuando el usuario pida poner el ratón de un color, cambiar su iluminación o efecto, apagar sus luces, cambiar su sensibilidad/DPI, reasignar un botón o saber en qué nivel de DPI está, aunque no nombre la app.
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
isy4500 level 3                      # activa el nivel 3 sin pulsar el botón
isy4500 buttons                      # función de cada botón
isy4500 button trasero ciclo-dpi     # reasigna un botón (botones: izquierdo, derecho, rueda, trasero, delantero, dpi)
isy4500 buttons factory              # botones de fábrica
isy4500 kb                           # teclado Sino Wealth: efectos, colores, plantillas
isy4500 kb effect arcoiris --brightness 4   # efecto del teclado
isy4500 kb keys buho                 # plantilla tecla a tecla (buho, atardecer, oceano, fuego, vaporwave, aurora, matrix, programador…)
isy4500 kb text HOLA --fg "#ff5a00" # texto con teclas (hasta 5 letras; mejor encendido sobre fondo apagado)
isy4500 kb restore                   # teclado a estático rojo
isy4500 listen 20                    # nivel de DPI en vivo al pulsar el botón (solo lectura)
```

Modos: `static`, `breathing`, `breathing-multi`, `rainbow`, `spectrum`, `fill`, `loop`, `enraptured`, `flicker`, `ripple`, `startrek`, `off`.
Velocidad 0-5, brillo 0-7 (7 = máximo), dirección 0/1.

## A tener en cuenta

- El ratón tiene 4 bits por canal: `#22e3ff` se ve como `#22eeff`. No hay más precisión.
- Cada uno de los 6 niveles de DPI tiene su color: el ratón cambia de color al cambiar de DPI.
- El DPI se graba en la memoria del ratón y se aplica al momento; la luz va a la RAM y se pierde al desenchufar.
- Los valores de DPI son aproximados (código × 200). Usa `--dry-run` antes si dudas.
- Funciones de botón: izquierdo, derecho, central, atras, adelante, ciclo-dpi, dpi-mas, desactivado. Siempre tiene que quedar un clic izquierdo (el CLI lo exige).
- No inventes comandos ni escribas la memoria del ratón por otras vías: un error deja el ratón sin clic.
- El teclado solo admite luz. Para plantillas y texto con su distribución real hay que calibrarlo una vez en la app (vista Teclado); el CLI usa la distribución de ejemplo.
- Si dice «Ratón no encontrado», pide al usuario que lo conecte; no hay nada más que hacer.
