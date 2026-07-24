# OptionSlider

A horizontal slider component for selecting between a set of options. Each option has an icon and can carry any value type.

## Intended Behavior

### Visual Representation
- Shows a horizontal track with evenly spaced markers, one per option
- Displays a draggable handle showing the current option's icon
- Handle is centered over the current option's marker position

### Interaction
- Handle can be dragged horizontally along the track
- Movement is restricted to the horizontal axis
- Handle visually snaps to the nearest option position while dragging
- Value commits when the handle is released

### Value Selection
- Value only changes when the handle is released near a different option
- Small movements that don't cross a midpoint leave the selection unchanged
- The handle always returns to a valid option position (no free-floating state)

## Props

| Prop | Type | Description |
|------|------|-------------|
| `options` | `SliderOption<T>[]` | Ordered list of options, each with a `value` and `icon` (emoji or string) |
| `value` | `T` | The currently selected value |
| `onChange` | `(value: T) => void` | Called when the user releases the handle on a new option |
