#!/usr/bin/env python3
"""Restructure: move revenue/pipeline sections from overview to pipeline tab."""

with open('src/app/page.tsx', 'r') as f:
    lines = f.readlines()

# All 1-indexed, converted to 0-indexed in code
# Block A (MOVE): lines 3016-3780 (Revenue Scoreboard through end of Client Cohort, before Client Stats)
# Block B (MOVE): lines 3919-4362 (Sales Velocity through Retainer Spreiding IIFE closing)
# Pipeline insertion: before line 5043 ({/* Kanban columns */})
# But we need to account for line shifts after removing block A

# Step 1: Extract blocks
block_a = lines[3015:3780]  # 0-indexed: 3015 to 3779 inclusive
block_b = lines[3918:4362]  # 0-indexed: 3918 to 4361 inclusive

print(f"Block A: {len(block_a)} lines (Revenue Scoreboard → Client Cohort)")
print(f"Block B: {len(block_b)} lines (Sales Velocity → Retainer Spreiding)")
print(f"Block A first: {block_a[0].strip()[:80]}")
print(f"Block A last: {block_a[-1].strip()[:80]}")
print(f"Block B first: {block_b[0].strip()[:80]}")
print(f"Block B last: {block_b[-1].strip()[:80]}")

# Step 2: Remove blocks from overview (remove block B first since it's later)
# Remove block B (lines 3919-4362, 0-indexed 3918-4361)
new_lines = lines[:3918] + lines[4362:]

# Now block A is still at the same position (before block B)
# Remove block A (lines 3016-3780, 0-indexed 3015-3779)
new_lines = new_lines[:3015] + new_lines[3780:]

# Step 3: Compute variables that moved sections need in the pipeline tab IIFE
# The overview IIFE has variables like pipelineTotal, openDeals, etc.
# We need to add these to the pipeline tab IIFE
# The pipeline tab IIFE already has its own variable calculations
# We need to add the missing ones

# Variables needed by moved sections:
pipeline_vars = """            // === Revenue/Pipeline variables (moved from overview) ===
            const TARGET_ARR = 2000000
            const arrProgress = Math.min((RETAINER_ARR / TARGET_ARR) * 100, 100)
            const pipelineTotal = data.pipelineDeals.filter(d => !CLOSED_STAGE_IDS.has(d.stageId)).reduce((s, d) => s + (d.value || 0), 0)
            const openDeals = data.pipelineDeals.filter(d => !CLOSED_STAGE_IDS.has(d.stageId))
            const offerteDeals = openDeals.filter(d => d.stageId === 'decisionmakerboughtin')
            const openVoorOfferte = openDeals.filter(d => d.stageId === 'qualifiedtobuy')
            const topDeals = [...openDeals].filter(d => d.value && d.value > 0).sort((a, b) => (b.value || 0) - (a.value || 0)).slice(0, 5)
            const dealsNeedingAction = openDeals.filter(d => !nextSteps[d.id] || nextSteps[d.id].trim() === '')
            const dealsWithoutValue = openDeals.filter(d => !d.value || d.value === 0)
            const alertClients = CLIENT_PERFORMANCE.filter(c => c.health === 'warning' || c.health === 'critical')

"""

# Step 4: Find the pipeline tab IIFE in the modified file and add variables + moved sections
# Need to find the pipeline tab in the new_lines array
# Original pipeline was at line 4945 (1-indexed)
# After removing block_a (765 lines) and block_b (444 lines) = 1209 lines removed
# New pipeline position: 4945 - 1209 = 3736 (approx)

pipeline_iife_line = None
for i, line in enumerate(new_lines):
    if "activeTab === 'pipeline'" in line and '(() => {' in line:
        pipeline_iife_line = i
        break

print(f"\nPipeline IIFE at new line {pipeline_iife_line + 1}")

# Find where the pipeline IIFE's variable declarations end (before return statement)
pipeline_return_line = None
for i in range(pipeline_iife_line, pipeline_iife_line + 60):
    if 'return (' in new_lines[i]:
        pipeline_return_line = i
        break

print(f"Pipeline return at new line {pipeline_return_line + 1}")

# Insert the variables just before the return statement
var_lines = pipeline_vars.split('\n')
var_lines = [line + '\n' for line in var_lines]

new_lines = new_lines[:pipeline_return_line] + var_lines + new_lines[pipeline_return_line:]

# Now find the Kanban columns comment to insert moved sections before it
kanban_line = None
for i in range(pipeline_iife_line, len(new_lines)):
    if '{/* Kanban columns */}' in new_lines[i] or 'Kanban columns' in new_lines[i]:
        kanban_line = i
        break

print(f"Kanban columns at new line {kanban_line + 1}")

# Insert both blocks (A then B) before the Kanban columns
# Add a separator comment
separator = ['\n', '              {/* ============================================ */}\n', '              {/* REVENUE & PIPELINE ANALYTICS (moved from overview) */}\n', '              {/* ============================================ */}\n']

new_lines = new_lines[:kanban_line] + separator + block_a + ['\n'] + block_b + ['\n'] + new_lines[kanban_line:]

# Step 5: Also need to keep alertClients in overview since Alerts section uses it
# Check if overview still has alertClients defined
# The overview IIFE still has the alertClients line at its original position (was in the variable block at top)
# Let me verify - the overview variables are at lines 2994-3007 (original)
# alertClients is defined at line 2540 as a module-level const: 
#   const alertClients = CLIENT_PERFORMANCE.filter(...)
# So it's already module-level! Great, no need to add it to overview.

# Wait, let me re-check. The grep showed line 2540 has alertClients definition.
# But the overview IIFE at line 2993 starts with variable declarations.
# Let me check if alertClients is used inside the IIFE from a local or module-level var.

# From the read: alertClients is at line 2540 which is BEFORE the overview IIFE at 2993
# So it's a module-level constant. Good - both tabs can access it.

# Step 6: Write the file
with open('src/app/page.tsx', 'w') as f:
    f.writelines(new_lines)

print(f"\nDone! Total lines: {len(new_lines)} (was {len(lines)})")
print("Sections moved from overview to pipeline tab successfully.")
