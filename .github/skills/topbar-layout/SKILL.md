---
name: topbar-layout
description: "Tailwind layout pattern for topbar menus and rows with mixed alignment: first element left, remaining elements right. Use when building topbar, toolbar, header row, nav row, action bar, or any flex row where the first item stays left and all others push to the right side."
argument-hint: "Describe the topbar or row elements you need to lay out"
---

# Topbar / Row Layout Pattern

## When to Use

- Building a topbar, toolbar, navigation bar, or page header row
- Creating an action bar or control row with multiple elements
- Any flex row where the **first element** should be on the **left** and **all other elements** should be grouped on the **right**

## Rule

> When the first element in a flex row should stay left and all others should push to the right, apply `first:mr-auto` to the **first element** (or all direct children).

## Implementation

Apply `first:mr-auto` to the **first child** element inside the flex container. This pushes all subsequent siblings to the right end of the row.

```tsx
// Container: flex row
<div className="flex items-center gap-2">
  {/* First element stays left — first:mr-auto pushes everything else right */}
  <Logo className="first:mr-auto" />
  <Button>Action 1</Button>
  <Button>Action 2</Button>
</div>
```

Or apply it universally via a class on all children:

```tsx
<div className="flex items-center gap-2 [&>*:first-child]:mr-auto">
  <PageTitle />
  <FilterDropdown />
  <AddButton />
</div>
```

## Pattern Summary

| Element            | Tailwind class  | Effect                             |
| ------------------ | --------------- | ---------------------------------- |
| First child        | `first:mr-auto` | Pushes trailing items to the right |
| Remaining children | (none needed)   | Stack naturally at the right       |

## Checklist

- [ ] Container has `flex` and `items-center`
- [ ] First child has `first:mr-auto` (or equivalent utility)
- [ ] No explicit `justify-between` needed — `mr-auto` is sufficient and more flexible
