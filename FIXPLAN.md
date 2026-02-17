# 🔧 Dashboard Fix Plan — Alles Top Maken

## Huidige Issues

### 🔴 CRITICAL (Broken)
1. **Forecast grafieken onzichtbaar** — bars renderen als dunne lijntjes (h-8 container + percentage height = broken)
2. **Scenario's berekening potentieel fout** — Optimistisch €1.19M, Realistisch €1.06M, Pessimistisch €927K. Maar ARR is al €1.016M, dus "pessimistisch" zou niet lager moeten zijn dan huidige ARR

### 🟡 MEDIUM (Werkt maar niet optimaal)
3. **Forecast tab is kaal** — geen 2026 projectie lijn, geen vergelijking met target €1.5M, geen gap visualisatie
4. **Strategy tab mist KPI scoreboard** — de originele versie had 5 editable KPI cards met auto-status (groen/geel/rood)
5. **Strategy tab mist quarterly goals** — per-Q targets met status
6. **Prospects count niet in nav** — Pipeline toont "60" maar Prospects toont geen count
7. **Retainers tab** — moet gecheckt worden of ARR/MRR correct renderen
8. **Overview tab** — health grid en aandachtspunten moeten gecheckt worden

### 🟢 NICE TO HAVE
9. **Mobile responsive** — bottom tab bar was eerder gebouwd, moet gecheckt worden
10. **Dark/Light mode toggle** — werkt het correct?
11. **Deal values in pipeline** — AmountInput wordt maar 2x gebruikt, moet overal consistent zijn

## Fix Plan (Prioriteit Volgorde)

### Fix 1: Forecast Grafieken
**Probleem:** `h-8` container met flex items die `height: X%` gebruiken. Percentage heights werken niet goed in flex containers zonder expliciete hoogte op het kind-element.

**Oplossing:** Verander de bar rendering:
```tsx
// Van:
<div className="flex gap-0.5 h-8 items-end">
  <div style={{ height: `${(r.revenue / maxRev) * 100}%` }} />

// Naar: gebruik een grotere container (h-20 = 80px) en bereken pixel heights
<div className="flex gap-0.5 items-end" style={{ height: '80px' }}>
  <div style={{ height: `${Math.max((r.revenue / maxRev) * 80, 2)}px` }} />
```

### Fix 2: Scenario's Berekening
De scenario's moeten gebaseerd zijn op HUIDIGE ARR + nieuwe deals, niet op historische groei:
- **Base**: Huidige ARR (€1.016M)
- **Optimistisch**: Base + €483K gap × 80% = ~€1.4M
- **Realistisch**: Base + €483K gap × 50% = ~€1.26M  
- **Pessimistisch**: Base + €483K gap × 20% = ~€1.11M

### Fix 3: Forecast Tab Uitbreiden
- 2026 maandelijkse projectie (base retainers + verwachte nieuwe deals)
- Target lijn op €1.5M/12 = €125K/mnd
- Gap visualisatie (hoeveel mist er nog)
- Vergelijking met vorig jaar zelfde maand

### Fix 4: Strategy KPI Scoreboard
5 KPI cards terugzetten:
1. MRR (auto-calculated van retainers)
2. ARR (auto-calculated)
3. Actieve klanten (count)
4. Gem. retainer (ARR / klanten)
5. Nieuwe deals YTD

Elk met: huidige waarde, target, status (groen/geel/rood), progress bar

### Fix 5: Quarterly Goals
Per kwartaal:
- Q1: €350K target
- Q2: €375K
- Q3: €387.5K
- Q4: €387.5K
Met progress bars en status

### Fix 6: Prospects Count in Nav
Voeg count toe aan Prospects nav item (281)

### Fix 7: Retainers Verificatie
Check of:
- ARR = €1.016.690
- MRR = €84.724
- Per-client per-month grid correct rendert
- Summary cards dynamisch zijn

### Fix 8: Overview Verificatie
Check of:
- Health grid alle klanten toont
- Aandachtspunten sectie aanwezig is
- Unknown clients als lege cirkel

## Uitvoering
Alles in één subagent die chirurgisch fixt, build test, en deploy.
