import {
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
import { setClientId } from "../../api/api"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { TaskItem } from "./TaskItem"
import {
  addClientTask,
  getTasks,
  removeClientTask,
  selectFetchStatus,
  selectTasksByFilter,
  updateClientTask,
} from "./tasksSlice"

export const TaskList = () => {
  const status = useAppSelector(selectFetchStatus)
  const dispatch = useAppDispatch()
  const theme = useTheme()
  const tasks = useAppSelector(selectTasksByFilter)

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

    // Add handler for connected event
    eventSource.addEventListener("connected", event => {
      const data = JSON.parse(event.data)
      setClientId(data.clientId) // Set the client ID from the API module
    })

    eventSource.addEventListener("taskCreated", event => {
      const data = JSON.parse(event.data)
      dispatch(addClientTask(data))
      // Only show toast if we didn't create the task ourselves
      toast.success("New task created by another client!")
    })

    eventSource.addEventListener("taskRemoved", event => {
      const data = JSON.parse(event.data)
      dispatch(removeClientTask(data._id))
      // Only show toast if we didn't remove the task ourselves
      toast.success("Task removed by another client!")
    })

    eventSource.addEventListener("taskUpdated", event => {
      const data = JSON.parse(event.data)
      dispatch(updateClientTask(data))
      // Only show toast if we didn't update the task ourselves
      toast.success("Task updated by another client!")
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
                  <TaskItem id={task._id} />
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
