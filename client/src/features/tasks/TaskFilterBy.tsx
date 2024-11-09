import { ToggleButton, ToggleButtonGroup } from "@mui/material"
import type { FilterByType } from "./types/types"

interface TaskFilterByProps {
  filterBy: FilterByType
  handleFilterChange: (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    newValue: FilterByType,
  ) => void
}

export function TaskFilterBy({
  filterBy,
  handleFilterChange,
}: TaskFilterByProps) {
  return (
    <ToggleButtonGroup
      size="small"
      onChange={handleFilterChange}
      value={filterBy}
      exclusive
      fullWidth
      color="primary"
    >
      <ToggleButton value="all">All</ToggleButton>
      <ToggleButton value="done">Done</ToggleButton>
      <ToggleButton value="pending">Pending</ToggleButton>
    </ToggleButtonGroup>
  )
}
