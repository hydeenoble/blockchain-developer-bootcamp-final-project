# Contract security measures

## SWC-103 (Floating pragma)

Specific compiler pragma `>=0.4.22 <0.9.0` used in contracts to avoid accidental bug inclusion through outdated compiler versions.

## Modifiers used only for validation

All modifiers in contract(s) only validate data with `require` statements.

## Pull over push

All functions that modify state are based on receiving calls rather than making contract calls.
