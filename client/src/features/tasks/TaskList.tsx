import {
  Box,
  CircularProgress,
  Collapse,
  Divider,
  List,
  Stack,
  Typography,
  useTheme,
} from "@mui/material"
import { useEffect } from "react"
import { TransitionGroup } from "react-transition-group"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { TaskItem } from "./TaskItem"
import {
  getTasks,
  selectAllTasks,
  selectDoneTasks,
  selectIsFetching,
  selectPendingTasks,
} from "./tasksSlice"
import type { FilterByType } from "./types/types"

interface TaskListProps {
  filterBy: FilterByType
}

export const TaskList = ({ filterBy }: TaskListProps) => {
  const isFetching = useAppSelector(selectIsFetching)
  const dispatch = useAppDispatch()
  const theme = useTheme()
  let tasksSelect:
    | typeof selectAllTasks
    | typeof selectDoneTasks
    | typeof selectPendingTasks
  switch (filterBy) {
    case "done":
      tasksSelect = selectDoneTasks
      break
    case "pending":
      tasksSelect = selectPendingTasks
      break
    default:
      tasksSelect = selectAllTasks
      break
  }

  const tasks = useAppSelector(tasksSelect)

  useEffect(() => {
    dispatch(getTasks())
  }, [dispatch])

  return (
    <Box maxHeight={theme.spacing(50)} overflow={"auto"}>
      {isFetching ? (
        <CircularProgress />
      ) : (
        <>
          <List>
            <TransitionGroup>
              {tasks.length > 0 ? (
                tasks.map((task, index) => (
                  <Collapse key={task.id}>
                    <div>
                      <TaskItem {...task} />
                      {index < tasks.length - 1 && <Divider />}
                    </div>
                  </Collapse>
                ))
              ) : (
                <Collapse>
                  <Typography color="textSecondary">
                    No Tasks here...
                  </Typography>
                </Collapse>
              )}
            </TransitionGroup>
          </List>
        </>
      )}
    </Box>
  )
}
