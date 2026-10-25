# Open ISY4500 Customizer

Software libre para la iluminación del ratón **ISY IGM 4500 WT** (marca propia de MediaMarkt, fabricante Imtron GmbH), que se vende sin software de configuración.

*Open-source RGB customizer for the ISY IGM 4500 WT gaming mouse (USB `30FA:1040`, Instant Microelectronics chip). Electron + node-hid, with a CLI for scripts and AI agents.*

- **Color**: estilos predefinidos con un clic, 11 efectos de luz (estático, respiración, respiración multicolor, ola arcoíris, ciclo de espectro, llenar y vaciar, bucle, éxtasis, parpadeo, onda, Star Trek), brillo, velocidad, dirección y color RGB libre.
- **DPI**: un color distinto para cada uno de los 6 niveles de DPI, y el nivel activo en vivo al pulsar el botón.
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

Diferencia con OpenRGB: en este ratón el modo `0x08` es la respiración de un color y `0x09` la multicolor.

Solo se usan estos dos comandos de iluminación: la app no escribe firmware. Ni los valores de DPI ni la reasignación de botones están documentados, así que no se ofrecen.

`tools/` guarda los scripts de investigación (enumeración, lectura del feature report, escucha de eventos, primeras pruebas).

## Créditos y licencia

Protocolo descubierto por el proyecto [OpenRGB](https://openrgb.org) (Morgan Guimard y colaboradores); este proyecto lo reimplementa desde cero en JavaScript. Código bajo licencia MIT. Hecho por Buho Corps Systems. No está afiliado a ISY, Imtron, MediaMarkt ni Instant Microelectronics.
