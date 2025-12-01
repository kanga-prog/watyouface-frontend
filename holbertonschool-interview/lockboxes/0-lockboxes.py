#!/usr/bin/python3
"""
Module: 0-lockboxes
Determines if all boxes can be opened
"""

def canUnlockAll(boxes):
    """
    Returns True if all boxes can be opened, else False
    """
    if not boxes or type(boxes) is not list:
        return False

    n = len(boxes)
    opened = set([0])      # start with box 0 opened
    keys = set(boxes[0])   # keys inside box 0

    # Keep trying to open boxes as long as new ones get opened
    while True:
        opened_before = len(opened)

        for key in list(keys):
            if 0 <= key < n and key not in opened:
                opened.add(key)
                keys.update(boxes[key])  # collect new keys

        # If no new box was opened this round, stop
        if len(opened) == opened_before:
            break

    return len(opened) == n
