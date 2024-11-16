import { ToggleButton, ToggleButtonGroup } from "@mui/material"
import type { FilterByType } from "./types/types"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { filterChanged, selectFilterBy } from "./tasksSlice"

export function TaskFilterBy() {
  const dispatch = useAppDispatch()
  const filterBy = useAppSelector(selectFilterBy)

  function handleFilterChange(
    _e: React.MouseEvent<HTMLElement>,
    newValue: FilterByType,
  ) {
    if (newValue !== null) {
      dispatch(dispatch(filterChanged(newValue)))
    }
  }

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
