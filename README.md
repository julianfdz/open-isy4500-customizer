# Open ISY4500 Customizer

Software libre para la iluminación del ratón **ISY IGM 4500 WT** (marca propia de MediaMarkt, fabricante Imtron GmbH), que se vende sin software de configuración.

*Open-source RGB customizer for the ISY IGM 4500 WT gaming mouse (USB `30FA:1040`, Instant Microelectronics chip). Electron + node-hid, with a CLI for scripts and AI agents.*

- **Color**: estilos predefinidos con un clic, 11 efectos de luz (estático, respiración, respiración multicolor, ola arcoíris, ciclo de espectro, llenar y vaciar, bucle, éxtasis, parpadeo, onda, Star Trek), brillo, velocidad, dirección y color RGB libre.
- **DPI**: velocidad (200–4800 DPI) y color de cada uno de los 6 niveles, grabado en la memoria del ratón; nivel activo en vivo.
- **Botones**: prueba en vivo de todos los botones.
- **CLI `isy4500`** y skill para agentes de IA (`skills/isy4500/SKILL.md`).

Interfaz en español, negro sobre blanco. Windows (también debería funcionar en Linux/macOS con permisos HID, sin probar).

## Uso

```bash
npm install
npm run dev          # app en desarrollo
npm run dist         # instalador de Windows en dist/
node bin/isy4500.mjs color "#ff0000"
```

## Protocolo

El ratón usa el chip de **Instant Microelectronics** (VID `0x30FA`), el mismo que OpenRGB soporta como *AntEsports GM600* (mismo PID `0x1040`, [InstantMouseController](https://gitlab.com/CalcProgrammer1/OpenRGB/-/tree/master/Controllers/InstantMouseController)). Comprobado en este ratón:

| Qué | Canal | Paquete (8 bytes) |
|---|---|---|
| Modo | Feature report `0x07`, interfaz 1, usage page `0xFF01` | `07 13 FF MS DB 0L M0 00` |
| Color | igual | `07 14 KG RB 00 00 00 00` |
| Botón DPI | Input report `0x06`, usage page `0xFF00` | `06 F6 0N` |

- `M` modo (byte alto del valor del modo; los modos `0xB8–0xBB` llevan además `B0` en el byte 6), `S` velocidad 0-5, `D` dirección 0/1, `B` = `0xB` (máscara de LEDs), `L` = `0xF` − brillo (0-7).
- `K` = 2 × nivel de DPI (0-5): cada nivel tiene su color. `R`, `G`, `B` = `0xF` − canal/16 (4 bits por canal, invertidos).
- `N` = nivel de DPI nuevo (0-5). Llega un segundo informe `8x` en cada pulsación que se ignora.

Diferencia con OpenRGB: en este ratón el modo `0x08` es la respiración de un color y `0x09` la multicolor. Luz y colores van a la RAM del ratón: se pierden al desenchufarlo (opción «Reaplicar al abrir»).

### Memoria de configuración (DPI)

Sacado del software oficial del **Advance GTA 250** (mismo chip, `30FA:1030`, descargado de advance.tm.fr y analizado sin ejecutarlo) y comprobado en este ratón:

| Operación | Paquetes |
|---|---|
| Leer | `07 18 05 i DIR_L DIR_H 00 len-1` + GetFeature (dato en el byte 1), cierre `07 18 00 …` tras cada bloque de 8 |
| Grabar | `07 18 03 i DIR_L DIR_H dato len-1` por byte → `07 18 09 00 DIR_L DIR_H 00 len-1` → `07 18 00 00 DIR_L DIR_H 00 00` |
| Recargar | `07 18 10 00 …` → `07 18 00 …` (aplica la memoria al momento; borra la luz puesta en RAM) |

| Dirección | Contenido |
|---|---|
| `0x00` | Cabecera `5A 03 A5` + PID/VID |
| `0x08`–`0x10[0]` | Mapa de botones (`21 22 23 24 25 26 …` = cada botón con su función). **Escribir aquí sin saber qué se hace deja el ratón sin clic izquierdo.** |
| `0x10` | DPI: byte 3 = bit 4 del código de cada nivel; bytes 5–7 = 4 bits bajos, dos niveles por byte. Fábrica: códigos 6, 8, 12, 13, 15, 18 |
| `0x18` | Byte 0 bits 0–2 = nivel de DPI activo; byte 1 = niveles habilitados (`3F`) |
| `0x20`– | Colores y efecto de fábrica |

Códigos de DPI válidos: los 23 del software oficial (1–24 sin el 11); DPI aproximado = código × 200. La app solo escribe el bloque `0x10`, lo verifica al leerlo de vuelta y lo restaura si no cuadra. No se escribe firmware nunca. La reasignación de botones está localizada pero aún no implementada.

`tools/` guarda los scripts de investigación (enumeración, lectura y escritura de la memoria, escucha de eventos, medidor de cuentas del sensor).

## Créditos y licencia

Protocolo descubierto por el proyecto [OpenRGB](https://openrgb.org) (Morgan Guimard y colaboradores); este proyecto lo reimplementa desde cero en JavaScript. Código bajo licencia MIT. Hecho por Buho Corps Systems. No está afiliado a ISY, Imtron, MediaMarkt ni Instant Microelectronics.
