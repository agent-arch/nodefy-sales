#!/usr/bin/env python3
"""Restructure: move revenue/pipeline sections from overview to pipeline tab."""

with open('src/app/page.tsx', 'r') as f:
    lines = f.readlines()

# 0-indexed line numbers
# Block A to MOVE: lines 3015-3779 (Revenue Scoreboard through Client Cohort)
# KEEP: lines 3780-3918 (Client Stats, Meta/Google Ads, Alerts, Client Health Grid)  
# Block B to MOVE: lines 3918-4362 (Sales Velocity, MRR Waterfall, Deal Age, Retainer Spreiding)
# Overview closing: lines 4359-4361 (</div> ) })())

# Pipeline insertion point: line 5042 (before {/* Kanban columns */})

block_a_start = 3016 - 1  # line 3016 = "=== REVENUE SCOREBOARD ==="
block_a_end = 3781 - 1    # line 3781 = "Client Stats" (exclusive, this stays)

block_b_start = 3919 - 1  # line 3919 = "=== SALES VELOCITY ==="
# Find end of block B: it's the last </div> of Retainer Spreiding
# From the test, Retainer Spreiding ends at line 4363, but we need to check
# The overview closing is </div>\n)\n})()}
# Let's find the three closing lines before })()}

# overview })() is at line 4362 (0-indexed 4361)
# Before that: ) at 4360, </div> at 4359
# So block B should go up to line 4359 (exclusive) = line 4358 (inclusive)
# Wait, let me re-check. The script said overview ends at 4362 (1-indexed)
# which means })() is at 0-indexed 4361.
# Before that we need </div> and ) which close the return() and <div space-y-4>
# So the actual content ends before those closing tags.

# Let me find the exact boundary
for i in range(4355, 4365):
    print(f"Line {i+1}: {lines[i].rstrip()}")

