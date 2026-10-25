// Medidor de cuentas del sensor (Raw Input de Windows, sin aceleración del puntero).
// Abre una ventana pequeña: pasa el ratón de un borde a otro de la alfombrilla y muestra las cuentas en X.
// Espacio = poner a cero. Compilar: csc /target:winexe tools\RawCount.cs
using System;
using System.Drawing;
using System.Runtime.InteropServices;
using System.Windows.Forms;

class RawCount : Form
{
    [StructLayout(LayoutKind.Sequential)] struct RAWINPUTDEVICE { public ushort UsagePage, Usage; public uint Flags; public IntPtr Target; }
    [DllImport("user32.dll")] static extern bool RegisterRawInputDevices(RAWINPUTDEVICE[] d, uint n, uint size);
    [DllImport("user32.dll")] static extern uint GetRawInputData(IntPtr h, uint cmd, byte[] data, ref uint size, uint header);

    long sumX, sumY, absX;
    readonly Label label = new Label { Dock = DockStyle.Fill, Font = new Font("Segoe UI", 20), TextAlign = ContentAlignment.MiddleCenter };

    RawCount()
    {
        Text = "Cuentas del sensor"; Width = 520; Height = 220; TopMost = true; KeyPreview = true;
        Controls.Add(label); Show0();
        KeyDown += (s, e) => { if (e.KeyCode == Keys.Space) { sumX = sumY = absX = 0; Show0(); } };
        var dev = new[] { new RAWINPUTDEVICE { UsagePage = 1, Usage = 2, Flags = 0x100 /* INPUTSINK */, Target = Handle } };
        RegisterRawInputDevices(dev, 1, (uint)Marshal.SizeOf(typeof(RAWINPUTDEVICE)));
    }

    void Show0() { label.Text = "X: " + Math.Abs(sumX) + "   (recorrido " + absX + ")\r\nEspacio = poner a cero"; }

    protected override void WndProc(ref Message m)
    {
        if (m.Msg == 0x00FF) // WM_INPUT
        {
            uint hs = (uint)(IntPtr.Size == 8 ? 24 : 16), size = 0;
            GetRawInputData(m.LParam, 0x10000003, null, ref size, hs);
            var buf = new byte[size];
            if (GetRawInputData(m.LParam, 0x10000003, buf, ref size, hs) == size && BitConverter.ToUInt32(buf, 0) == 0)
            {
                int o = (int)hs; // RAWMOUSE: usFlags(2) pad(2) buttons(4) rawButtons(4) lLastX(4) lLastY(4)
                int dx = BitConverter.ToInt32(buf, o + 12), dy = BitConverter.ToInt32(buf, o + 16);
                sumX += dx; sumY += dy; absX += Math.Abs(dx); Show0();
            }
        }
        base.WndProc(ref m);
    }

    [STAThread] static void Main() { Application.Run(new RawCount()); }
}
