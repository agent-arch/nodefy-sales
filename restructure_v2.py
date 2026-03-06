#!/usr/bin/env python3
"""Restructure: move revenue/pipeline sections from overview to pipeline tab."""

with open('src/app/page.tsx', 'r') as f:
    lines = f.readlines()

# 1-indexed boundaries (converted to 0-indexed in slicing)
# Block A (MOVE): lines 3016-3779 (Revenue Scoreboard through Client Cohort closing div)
# KEEP in overview: lines 3780-3918 (blank, Client Stats, Ads, Alerts, Client Health Grid)
# Block B (MOVE): lines 3919-4363 (Sales Velocity through Retainer Spreiding closing div)
# KEEP overview closing: lines 4364-4366 (</div> for space-y-4, ), })())

block_a = lines[3015:3779]  # 0-indexed: includes 3015 through 3778
block_b = lines[3918:4363]  # 0-indexed: includes 3918 through 4362

print(f"Block A: {len(block_a)} lines")
print(f"  First: {block_a[0].strip()[:80]}")
print(f"  Last:  {block_a[-1].strip()[:80]}")
print(f"Block B: {len(block_b)} lines")
print(f"  First: {block_b[0].strip()[:80]}")
print(f"  Last:  {block_b[-1].strip()[:80]}")

# Remove block B first (later in file)
result = lines[:3918] + lines[4363:]
# Now remove block A (earlier)
result = result[:3015] + result[3779:]

# Verify overview structure after removal
# The overview should now have: header + Client Stats + Ads + Alerts + Client Health Grid
# Find the overview closing
for i, line in enumerate(result):
    if "activeTab === 'overview'" in line and '(() => {' in line:
        ov_start = i
    if "activeTab === 'pipeline'" in line and '(() => {' in line:
        pipe_start = i
        break

# Print around the overview end
ov_content = result[ov_start:pipe_start]
print(f"\nOverview section: {len(ov_content)} lines (was {4366-2993+1})")

# Find pipeline IIFE
print(f"Pipeline IIFE at line {pipe_start+1}")

# Find where to insert variables in the pipeline IIFE
# Insert after the existing variable declarations, before return(
pipe_return = None
for i in range(pipe_start, pipe_start + 60):
    if 'return (' in result[i]:
        pipe_return = i
        break
print(f"Pipeline return( at line {pipe_return+1}")

# Variables to add to pipeline IIFE
pipeline_vars = [
    "            // === Revenue/Pipeline variables (moved from overview) ===\n",
    "            const TARGET_ARR = 2000000\n",
    "            const arrProgress = Math.min((RETAINER_ARR / TARGET_ARR) * 100, 100)\n",
    "            const allOpenDeals = data.pipelineDeals.filter(d => !CLOSED_STAGE_IDS.has(d.stageId))\n",
    "            const pipelineTotalAll = allOpenDeals.reduce((s, d) => s + (d.value || 0), 0)\n",
    "            const offerteDeals = allOpenDeals.filter(d => d.stageId === 'decisionmakerboughtin')\n",
    "            const openVoorOfferte = allOpenDeals.filter(d => d.stageId === 'qualifiedtobuy')\n",
    "            const topDeals = [...allOpenDeals].filter(d => d.value && d.value > 0).sort((a, b) => (b.value || 0) - (a.value || 0)).slice(0, 5)\n",
    "            const dealsNeedingAction = allOpenDeals.filter(d => !nextSteps[d.id] || nextSteps[d.id].trim() === '')\n",
    "            const dealsWithoutValue = allOpenDeals.filter(d => !d.value || d.value === 0)\n",
    "            const alertClients = CLIENT_PERFORMANCE.filter(c => c.health === 'warning' || c.health === 'critical')\n",
    "\n",
]

# Insert variables before return
result = result[:pipe_return] + pipeline_vars + result[pipe_return:]

# Now find insertion point for the moved blocks in pipeline tab
# Find {/* Kanban columns */} or similar content marker
kanban_line = None
for i in range(pipe_start, len(result)):
    if 'Kanban columns' in result[i]:
        kanban_line = i
        break

print(f"Kanban columns at line {kanban_line+1}")

# In the moved blocks, we need to replace variable names that conflict
# The overview used `openDeals` and `pipelineTotal`, but pipeline IIFE already has `pipelineDeals` and `activePipelineValue`
# We renamed to `allOpenDeals` and `pipelineTotalAll` to avoid conflicts
# Now update the blocks to use the new names

def fix_block(block):
    """Replace overview variable names with pipeline equivalents."""
    fixed = []
    for line in block:
        # Replace openDeals references (but not offerteDeals, topDeals, etc.)
        # Be careful: openDeals is used as standalone, not as part of other names
        # Actually, the moved blocks reference openDeals which was computed from ALL pipelines
        # In the pipeline tab, we computed allOpenDeals for the same purpose
        line = line.replace('openDeals.length', 'allOpenDeals.length')
        line = line.replace('openDeals.filter', 'allOpenDeals.filter')
        # pipelineTotal -> pipelineTotalAll (only exact matches)
        line = line.replace('pipelineTotal', 'pipelineTotalAll')
        fixed.append(line)
    return fixed

block_a_fixed = fix_block(block_a)
block_b_fixed = fix_block(block_b)

# Add separator and insert blocks before Kanban columns
separator = [
    "\n",
    "              {/* ============================================ */}\n",
    "              {/* REVENUE & PIPELINE ANALYTICS */}\n", 
    "              {/* ============================================ */}\n",
]

result = result[:kanban_line] + separator + block_a_fixed + ["\n"] + block_b_fixed + ["\n"] + result[kanban_line:]

# Write output
with open('src/app/page.tsx', 'w') as f:
    f.writelines(result)

print(f"\nDone! Total lines: {len(result)} (original: {len(lines)})")
