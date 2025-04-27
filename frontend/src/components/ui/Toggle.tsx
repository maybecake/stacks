import React, { useState } from 'react'
import * as RadixToggle from '@radix-ui/react-toggle'
import './Toggle.css'

interface ToggleProps {
  id: string
  label: string
  defaultPressed?: boolean
  disabled?: boolean
  onPressedChange?: (pressed: boolean) => void
}

export const Toggle: React.FC<ToggleProps> = ({
  id,
  label,
  defaultPressed = false,
  disabled = false,
  onPressedChange,
}) => {
  const [isPressed, setIsPressed] = useState(defaultPressed)

  const handlePressedChange = (pressed: boolean) => {
    setIsPressed(pressed)
    onPressedChange?.(pressed)
  }

  const labelClasses = [
    'toggle__label',
    !isPressed && 'toggle__label--off',
    disabled && 'toggle__label--disabled'
  ].filter(Boolean).join(' ')

  return (
    <div className="toggle__item">
      <label 
        className={labelClasses}
        htmlFor={id}
      >
        {label}
        <div className="toggle__line" />
      </label>
      <RadixToggle.Root
        className="toggle"
        id={id}
        aria-label={label}
        pressed={isPressed}
        onPressedChange={handlePressedChange}
        disabled={disabled}
      >
        <span className="toggle__indicator" />
      </RadixToggle.Root>
    </div>
  )
} 