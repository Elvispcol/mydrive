# MyDrive — Prompt para v0.dev

Pega cada bloque por separado en v0.dev. Genera las pantallas en orden;
al final pide a v0 que las conecte con navegación.

---

## PROMPT 1 — Tablero del administrador (la pantalla central)

```
Build a fleet management dashboard called "MyDrive" for a Colombian logistics company.
This is the admin's command center — the most important screen of the app.

Tech: Next.js App Router, Tailwind CSS, shadcn/ui components. Use Spanish for all UI text.

Layout: sidebar navigation on the left, main content on the right.

Sidebar:
- Logo "MyDrive" with a small blue truck icon at the top
- Nav items (with icons): Tablero, Novedades, Tareas, Vehículos, Conductores, Configuración
- Current user at the bottom: "Carlos Mendoza · Admin Región Caribe"
- Active item: Tablero (highlighted)

Main content — "Tablero" page:

Top row — 4 stat cards:
1. "Novedades abiertas" — value: 7 — red badge — icon: alert triangle
2. "Tareas pendientes" — value: 12 — orange badge — icon: clipboard
3. "Preoperacionales hoy" — value: 34/40 — green — icon: check circle
4. "Vehículos activos" — value: 40 — blue — icon: truck

Middle section — "Novedades recientes" (left, 60% width):
A list of 4 novedades as cards, each with:
- Color-coded left border (red=crítica, orange=alta, yellow=media)
- Title, vehicle plate, origin tag (chip), time ago, status badge
Data:
1. "Falla en frenos" — OPQ-845 — chip "Preoperacional" red — "hace 23 min" — badge "Abierta" red
2. "Choque leve en parqueadero" — KLM-321 — chip "Evento" orange — "hace 2 h" — badge "En proceso" yellow
3. "Aceite bajo (crítico)" — TUV-112 — chip "Preoperacional" red — "hace 3 h" — badge "Abierta" red
4. "Llanta en mal estado" — ABC-567 — chip "Preoperacional" orange — "ayer" — badge "Abierta" red
Each card has a "Ver detalle →" link.

Right panel — "Tareas de hoy" (40% width):
A compact task list with checkboxes:
- [ ] Revisar frenos OPQ-845 — asignada a: Pedro Gómez — vence hoy — priority chip "Alta" red
- [x] Cambio de aceite TUV-112 — asignada a: Luis Torres — completada — strikethrough text
- [ ] Revisión post-choque KLM-321 — asignada a: María Ríos — vence mañana — "Media" orange
- [ ] SOAT vence en 5 días — GHI-990 — sin asignar — "Baja" gray
Button at bottom: "+ Nueva tarea"

Bottom section — "Cumplimiento de preoperacionales — últimos 7 días":
A simple bar chart (use recharts) showing daily completion percentage:
Lun 78%, Mar 85%, Mié 90%, Jue 82%, Vie 88%, Sáb 70%, Hoy 85%
Color: blue bars, horizontal grid lines, percentage labels on top of bars.

Color scheme: white background, blue-600 as primary (#2563EB), clean corporate look.
Make it pixel-perfect, professional, and information-dense but not cluttered.
```

---

## PROMPT 2 — App del conductor (móvil)

```
Build the mobile app screen for a truck driver using MyDrive fleet management system.
This is a mobile-first web app. Use Spanish for all text.

Tech: Next.js, Tailwind CSS, shadcn/ui. Mobile viewport (390px wide). No sidebar.

Show TWO screens side by side as a preview (or as separate tabs):

--- SCREEN A: Preoperacional diario ---

Top bar:
- Back arrow, title "Preoperacional diario", date "Jueves 19 jun 2025"

Vehicle card at top:
- Plate: OPQ-845 in large bold text
- "Camión · Chevrolet NHR · 2021" subtitle
- Green badge "Asignado a ti"

Checklist section — title "Inspección del vehículo":
Render 8 checklist items as toggle rows. Each row: checkbox on left, item text, optional "crítico" red chip.
Items:
1. ✅ Nivel de aceite del motor — (crítico) 
2. ✅ Presión de llantas (4 ruedas)
3. ❌ Estado de frenos — (crítico) — row highlighted in red-50 background, red border left
4. ✅ Luces delanteras y traseras
5. ✅ Cinturón de seguridad
6. ⬜ Limpia parabrisas (not answered yet)
7. ⬜ Nivel de agua radiador — (crítico)
8. ⬜ Espejos laterales y retrovisor

Below item 3 (the failed one), show an expanded note field:
- Label: "Nota sobre la falla (opcional)"
- Textarea with placeholder text: "Ej: El pedal está muy blando..."
- Currently filled: "El pedal está muy blando, siento que cede más de lo normal"

Bottom — fixed footer:
- Warning banner in amber: "⚠ Tienes 1 falla crítica. Se generará una novedad automáticamente."
- Large button "Enviar preoperacional" — blue, full width, disabled until all items answered

--- SCREEN B: Reportar evento ---

Top bar: back arrow, "Reportar evento"

Form with sections:

Section "¿Qué pasó?":
- Select field "Tipo de evento" — currently showing: "Choque / colisión"
- Options would be: Choque/colisión, Daño mecánico, Robo/intento de robo, Accidente personal, Otro

Section "Descripción":
- Textarea — filled with: "Choque leve en el parqueadero de la empresa cliente. El otro vehículo tenía las luces apagadas."

Section "Foto del evento":
- Upload area with camera icon — shows a thumbnail of an uploaded photo (use a placeholder gray box with camera icon and text "1 foto adjunta")

Section "Ubicación":
- "📍 Ubicación detectada: Barranquilla, Atlántico" — green check
- Small map placeholder (gray rounded box, 100% wide, 120px tall, with a pin icon in center)

Bottom fixed button: "Reportar evento" — red button (this is urgent), full width.

Style: clean white cards, rounded corners, blue primary, mobile spacing.
Show both screens as iPhone-style mockups with rounded corners and a subtle shadow.
```

---

## PROMPT 3 — Vista del director

```
Build the director/executive dashboard for MyDrive fleet management system.
The director sees the whole company across all regions. Use Spanish for all text.

Tech: Next.js, Tailwind CSS, shadcn/ui. Full desktop layout.

Same sidebar as the admin dashboard but:
- Current user: "Ana Lucía Vargas · Directora de Flota"
- Active item: Tablero

Main content — "Resumen nacional":

Top: Page title "Resumen nacional" + date range selector showing "Últimos 30 días" + "Exportar informe" button (outline)

Row 1 — 5 KPI cards:
1. "Total vehículos" — 127 — blue — truck icon
2. "Cumplimiento preoperacional" — 87% — green — trend arrow up +3%
3. "Novedades abiertas" — 23 — red — alert icon
4. "Mantenimientos este mes" — 18 — purple — wrench icon
5. "Conductores activos hoy" — 94/127 — gray — users icon

Row 2 — two charts side by side:

Left chart (60%): "Novedades por región — últimos 30 días"
Grouped bar chart with 4 regions:
- Caribe: Abiertas 7, Cerradas 15
- Andina: Abiertas 9, Cerradas 22
- Pacífico: Abiertas 4, Cerradas 11
- Orinoquia: Abiertas 3, Cerradas 8
Colors: red for abiertas, green for cerradas. Legend below. Y-axis 0-25.

Right chart (40%): "Estado de la flota"
Donut chart:
- Activos: 98 (77%) — blue
- En mantenimiento: 18 (14%) — orange  
- Inactivos: 11 (9%) — gray
Legend with counts on the right side of donut.

Row 3 — "Detalle por región" table:
Columns: Región | Vehículos | Conductores | Preop. hoy | Novedades abiertas | Tareas pendientes | Administrador
Data rows:
| Caribe | 34 | 28 | 29/34 (85%) 🟢 | 7 🔴 | 12 | Carlos Mendoza |
| Andina | 51 | 44 | 46/51 (90%) 🟢 | 9 🔴 | 18 | Sofía Ramírez |
| Pacífico | 27 | 22 | 20/27 (74%) 🟡 | 4 🟡 | 7 | Andrés Castro |
| Orinoquia | 15 | 11 | 11/15 (73%) 🟡 | 3 🟡 | 5 | Laura Jiménez |
Each row has "Ver región →" link. Sortable columns. Alternating row colors.

Bottom row — "Últimas novedades críticas" (across all regions):
Same novedad card list as admin but showing region column too. Show 3 cards.

Color scheme: same blue-600 primary, clean white, professional executive look.
Add a subtle top banner in blue-50: "Vista de director · Acceso nacional completo"
```

---

## PROMPT 4 — Conectar todo con navegación

```
Take the three screens I've built (admin dashboard, conductor mobile app, director dashboard)
and connect them into a single Next.js app with the following navigation:

1. Create a simple landing/login selector page (no real auth, just demo):
   - Title: "MyDrive" with truck icon
   - Subtitle: "Selecciona tu perfil para la demo"
   - Three large clickable cards:
     a. "Director de flota" → goes to director dashboard (Ana Lucía Vargas)
     b. "Administrador de región" → goes to admin dashboard (Carlos Mendoza · Caribe)
     c. "Conductor" → goes to conductor mobile view (Juan Pérez · OPQ-845)
   - Each card has an icon, role name, and a description in gray text
   - Clean centered layout, white background, cards in a row on desktop / stacked on mobile

2. In the admin dashboard, make the novedad cards clickable:
   - Clicking "Ver detalle →" on "Falla en frenos — OPQ-845" opens a detail panel (slide-over or modal):
     - Title, vehicle info, origin, priority badge, status
     - Timeline: "Preoperacional enviado → Novedad creada → (pendiente: asignar tarea)"
     - Button "Crear tarea" (primary blue) and "Cerrar novedad" (outline red)
     - "Crear tarea" opens a small form: assignee select, due date, priority select, notes

3. In the conductor view, make the "Enviar preoperacional" button show a success state:
   - After clicking, show a success screen:
     - Green checkmark animation
     - "Preoperacional enviado" in large text
     - "Se generó 1 novedad automáticamente por la falla en frenos"
     - "El administrador Carlos Mendoza fue notificado"
     - Button "Ir al inicio"

Keep all the existing UI exactly as designed. Only add the connecting logic.
Use Next.js App Router with proper routing (/admin, /director, /conductor).
```
