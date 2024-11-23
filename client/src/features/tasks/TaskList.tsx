import {
  Box,
  Button,
  CircularProgress,
  Collapse,
  Divider,
  List,
  Stack,
  Typography,
  useTheme,
} from "@mui/material"
import type { ReactNode } from "react"
import { useCallback, useEffect } from "react"
import { toast } from "react-toastify"
import { TransitionGroup } from "react-transition-group"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { TaskItem } from "./TaskItem"
import {
  addClientTask,
  getTasks,
  removeClientTask,
  selectAllTasks,
  selectDoneTasks,
  selectFetchStatus,
  selectFilterBy,
  selectPendingTasks,
  Task,
  updateClientTask,
} from "./tasksSlice"
import { Update } from "@reduxjs/toolkit"

export const TaskList = () => {
  const status = useAppSelector(selectFetchStatus)
  const dispatch = useAppDispatch()
  const theme = useTheme()
  const filterBy = useAppSelector(selectFilterBy)

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

  const fetchTasks = useCallback(() => {
    try {
      void toast.promise(dispatch(getTasks()).unwrap(), {
        pending: "Pending fetch...",
        error: "Error fetching tasks",
        success: "Tasks fetched!",
      })
    } catch (error) {
      console.error(error)
    }
  }, [dispatch])

  useEffect(() => {
    if (status !== "idle") return
    fetchTasks()
  }, [dispatch, fetchTasks, status])

  useEffect(() => {
    const eventSource = new EventSource(
      `${import.meta.env.VITE_API_URL}/tasks/events`,
    )
    eventSource.onopen = () => console.log("Connected to event source...")

    eventSource.addEventListener("taskCreated", event => {
      toast.success("Task created!")
      const data = JSON.parse(event.data)
      dispatch(addClientTask(data))
    })

    eventSource.addEventListener("taskRemoved", event => {
      toast.success("Task removed!")
      const data = JSON.parse(event.data)
      dispatch(removeClientTask(data._id))
    })

    eventSource.addEventListener("taskUpdated", event => {
      toast.success("Task updated!")
      const data = JSON.parse(event.data)
      dispatch(updateClientTask(data))
    })

    eventSource.onerror = error => {
      console.error(error)
    }

    return () => {
      eventSource.close()
    }
  }, [])

  let content: ReactNode

  if (status === "failed") {
    content = (
      <Stack
        minHeight={"inherit"}
        sx={{ gap: 2 }}
        justifyContent={"center"}
        alignSelf={"center"}
      >
        <Typography color="error">Error fetching tasks...</Typography>
        <Button onClick={fetchTasks}>Retry</Button>
      </Stack>
    )
  } else if (status === "loading") {
    content = (
      <Stack
        minHeight={"inherit"}
        justifyContent={"center"}
        alignItems={"center"}
      >
        <CircularProgress />
      </Stack>
    )
  } else {
    content = (
      <List disablePadding>
        <TransitionGroup>
          {tasks.length > 0 ? (
            tasks.map((task, index) => (
              <Collapse key={task._id}>
                <>
                  <TaskItem {...task} />
                  {index < tasks.length - 1 && <Divider />}
                </>
              </Collapse>
            ))
          ) : (
            <Collapse collapsedSize={0} key={"no-tasks"}>
              <Typography
                color="textSecondary"
                padding={2}
                sx={{ userSelect: "none" }}
              >
                No Tasks here...
              </Typography>
            </Collapse>
          )}
        </TransitionGroup>
      </List>
    )
  }
  return (
    <Stack
      sx={{
        minHeight: theme.spacing(20),
        maxHeight: theme.spacing(80),
        overflow: "auto",
      }}
    >
      {content}
    </Stack>
  )
}
