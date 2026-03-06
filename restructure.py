#!/usr/bin/env python3
"""Restructure: move revenue/pipeline sections from overview to pipeline tab."""

with open('src/app/page.tsx', 'r') as f:
    lines = f.readlines()

# Line numbers (1-indexed) from grep
# MOVE sections (from overview):
# Block A: lines 3016-3780 (Revenue Scoreboard through Client Cohort, before Client Stats)
# Block B: lines 3919-4366 (Sales Velocity, MRR Waterfall, Deal Age, Retainer Spreiding, before closing of overview)

# KEEP in overview: 
# - Header: ~3006-3015
# - Client Stats: 3781-3804
# - Channel breakdown (Meta/Google Ads): 3805-3849
# - Alerts: 3850-3867
# - Client Health Grid: 3868-3918

# Pipeline tab starts at line 4945, content starts after "return (" and "<div className="space-y-4">"
# We need to find the right insertion point

# Let's identify the exact boundaries
# Block A to move: from "=== REVENUE SCOREBOARD ===" to just before "Client Stats"
block_a_start = 3016 - 1  # 0-indexed
block_a_end = 3781 - 1    # exclusive (Client Stats line)

# Block B to move: from "=== SALES VELOCITY ===" to just before the closing of overview IIFE
block_b_start = 3919 - 1
# Find the end: after Retainer Spreiding, there should be closing tags
# Line 4369 is KLANTEN TAB, so overview ends before that
# Let me find the closing </div> and })() for overview
# The overview IIFE closes with:  })()}  preceded by </div> ) 
# Looking at the structure: after Retainer Spreiding div closes, there's </div> ) })()}
# From the read, line ~4366-4368 should be:
#   </div>
#   )
#   })()}
block_b_end = 3919 - 1  # We'll calculate this differently

# Let me just read and figure out exact boundaries
# Actually, let me approach this differently: 
# 1. Extract the overview section
# 2. Identify what stays and what moves
# 3. Reconstruct

# Find overview IIFE boundaries
overview_start = None
overview_end = None
pipeline_start = None

for i, line in enumerate(lines):
    if "activeTab === 'overview'" in line and '(() => {' in line:
        overview_start = i
    if "activeTab === 'pipeline'" in line and '(() => {' in line:
        pipeline_start = i

# The overview section ends with })()}  before the next tab
# Find the })() that closes the overview IIFE
# It should be the line just before KLANTEN TAB comment or pipeline tab
# Line 4369 (1-indexed) = "{/* KLANTEN TAB..."
# So overview ends around 4366-4368

# Let me find })()}  between line 4350 and 4370
for i in range(4350, min(4380, len(lines))):
    stripped = lines[i].strip()
    if stripped == '})()}':
        overview_end = i
        break

print(f"Overview: {overview_start+1} to {overview_end+1}")
print(f"Pipeline: {pipeline_start+1}")

# Now extract the blocks to move
# Block A: Revenue Scoreboard through Client Cohort (before Client Stats)
block_a = lines[block_a_start:block_a_end]
print(f"Block A: lines {block_a_start+1}-{block_a_end} ({len(block_a)} lines)")

# Block B: Sales Velocity through Retainer Spreiding
# Find where Client Health Grid section ends and Sales Velocity starts
# Sales Velocity starts at line 3919 (1-indexed)
# It should end just before Client Stats... wait no, Client Health Grid is at 3868
# and Sales Velocity is at 3919, which is AFTER Client Health Grid
# So Block B = lines 3919 to just before the overview closing

# Find the end of Retainer Spreiding section
# After Retainer Spreiding, there's the closing </div> for space-y-4 and ) for return
# Lines should be like:
#   </div>    <- closes Retainer Spreiding
#   </div>    <- closes space-y-4 
#   )         <- closes return (...)
#   })()}     <- closes IIFE

# Let's find the </div> that closes space-y-4 div
# Between Retainer Spreiding end and })()}, there should be:
#             </div>
#             )
#           })()}

# From the read output at line ~4365:
#             </div>
#             )
#           })()}

# So block B goes from line 3919 to just before the </div> that's part of the closing
# That means block B end = the line of first </div> after Retainer Spreiding content

# Let me find the end of the Retainer Spreiding div
# Retainer Spreiding starts at 4291. It's a self-contained div. 
# After its closing </div>, we have the overview's closing sequence

# Find the closing sequence after Retainer Spreiding
retainer_start = 4291 - 1  # 0-indexed
# Count braces/divs to find where Retainer Spreiding div ends
depth = 0
retainer_end = retainer_start
for i in range(retainer_start, len(lines)):
    line = lines[i]
    # Count opening divs
    depth += line.count('<div')
    depth -= line.count('</div')
    if depth <= 0 and i > retainer_start:
        retainer_end = i + 1  # inclusive end
        break

print(f"Retainer Spreiding ends at line {retainer_end}")
block_b = lines[block_b_start:retainer_end]
print(f"Block B: lines {block_b_start+1}-{retainer_end} ({len(block_b)} lines)")

# Now find the pipeline tab insertion point
# After pipeline tab's "return (" and "<div className="space-y-4">"
# and after the header section
# We want to insert BEFORE the existing pipeline content but AFTER the header

# Find the pipeline tab's return statement
pipeline_return = None
for i in range(pipeline_start, pipeline_start + 60):
    if 'return (' in lines[i]:
        pipeline_return = i
        break

# Find the first <div className="space-y-4"> after return
pipeline_space_div = None
for i in range(pipeline_return, pipeline_return + 5):
    if 'space-y-4' in lines[i]:
        pipeline_space_div = i
        break

# Find the end of the header section in pipeline tab
# Looking for the closing </div> of the header
# The header section starts with "Header with pipeline tabs" comment
# and includes pipeline selector tabs, search, etc.
# Let me find a good insertion point - after the pipeline tabs row

# Actually, let me find where the kanban/stage content starts
# Look for the stage filter or kanban section
pipeline_content_start = None
for i in range(pipeline_start, pipeline_start + 200):
    stripped = lines[i].strip()
    # The pipeline tab has: header, pipeline tabs, search, then stage filters/kanban
    # Let's find the first major content section after the header
    if 'Stage filter' in lines[i] or 'Kanban' in lines[i] or 'stageFilter' in lines[i]:
        pipeline_content_start = i
        break

if pipeline_content_start is None:
    # Try another approach - find where groupedDeals or filteredDeals is used for rendering
    for i in range(pipeline_start + 50, pipeline_start + 200):
        if 'groupedDeals' in lines[i] and ('map' in lines[i] or '.filter' in lines[i]):
            # Go back to find the section start
            for j in range(i, pipeline_start, -1):
                if '{/*' in lines[j]:
                    pipeline_content_start = j
                    break
            break

print(f"Pipeline content starts around line {pipeline_content_start+1 if pipeline_content_start else 'NOT FOUND'}")

# Let me just find the exact insertion point by looking at the pipeline tab structure more carefully
# Read lines around pipeline_start + 50 to 100
for i in range(pipeline_start + 40, min(pipeline_start + 120, len(lines))):
    stripped = lines[i].strip()
    if stripped and ('{/*' in stripped or 'className' in stripped):
        print(f"  Line {i+1}: {stripped[:100]}")
