/**
 * Prevents mouse wheel from changing number input values
 * while allowing page scroll to continue
 */
export const preventNumberInputScroll = (e: React.WheelEvent<HTMLInputElement>) => {
  // Blur the input to prevent value change
  e.currentTarget.blur()
  // Don't prevent default - let the page scroll
}

/**
 * Props to add to number inputs to prevent scroll from changing values
 * while still allowing page scroll
 */
export const numberInputProps = {
  onWheel: preventNumberInputScroll,
  // Prevent arrow key value changes when scrolling with keyboard
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
    // If user is holding shift/ctrl/cmd while using arrow keys, prevent value change
    if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && 
        (e.shiftKey || e.ctrlKey || e.metaKey)) {
      e.preventDefault()
    }
  }
}