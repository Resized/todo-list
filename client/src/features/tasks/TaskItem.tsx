import { Check, Close, Edit } from "@mui/icons-material"
import {
  Box,
  Checkbox,
  IconButton,
  Input,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  styled,
} from "@mui/material"
import type { FormEvent } from "react"
import { useEffect, useRef, useState } from "react"
import { toast } from "react-toastify"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { removeTask, selectTaskById, updateTask } from "./tasksSlice"

interface StyledListItemTextProps {
  done: boolean
}

const StyledListItemText = styled(ListItemText, {
  shouldForwardProp: prop => prop !== "done",
})<StyledListItemTextProps>(({ theme, done }) => ({
  textDecoration: done ? "line-through" : "none",
  color: done ? theme.palette.text.disabled : theme.palette.text.primary,
  "& .MuiTypography-root": {
    color: done ? theme.palette.text.disabled : theme.palette.text.primary,
  },
  "& .MuiListItemText-secondary": {
    color: done ? theme.palette.text.disabled : theme.palette.text.secondary,
  },
}))

export const TaskItem = ({ id }: { id: string }) => {
  const dispatch = useAppDispatch()
  const inputRef = useRef<HTMLInputElement>()
  const [state, setState] = useState<"idle" | "removing" | "editing">("idle")
  const isRemoving = state === "removing"
  const isEditing = state === "editing"
  const task = useAppSelector(state => selectTaskById(state, id)) // undefined after removal
  const removedTask = useRef(task)
  const [isDone, setIsDone] = useState(task?.done ?? removedTask.current.done)

  useEffect(() => {
    if (task) {
      removedTask.current = task
    }
  }, [task])

  useEffect(() => {
    // synchronize `isDone` to external updates of the task
    if (task) setIsDone(task.done)
  }, [task])

  const handleEdit = async () => {
    setState("idle")

    if (inputRef.current && inputRef.current.value !== task.content) {
      await toast
        .promise(
          dispatch(
            updateTask({ _id: task._id, content: inputRef.current.value }),
          ).unwrap(),
          {
            pending: "Pending update...",
            error: "Error updating task",
            success: "Task updated!",
          },
        )
        .catch(error => console.error(error))
    }
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    inputRef.current?.blur()
    handleEdit()
  }

  const handleDone = async () => {
    const prevDone = isDone
    if (!isEditing) {
      setIsDone(!isDone)
      await toast
        .promise(
          dispatch(updateTask({ _id: task._id, done: !isDone })).unwrap(),
          {
            pending: "Pending update...",
            error: "Error updating task",
            success: "Task updated!",
          },
        )
        .catch(error => {
          console.error(error)
          setIsDone(prevDone)
        })
    }
  }

  const handleRemove = async () => {
    if (isEditing) {
      setState("idle")
    } else {
      setState("removing")
      await toast
        .promise(dispatch(removeTask(task._id)).unwrap(), {
          pending: "Pending removal...",
          error: "Error removing task",
          success: "Task removed!",
        })
        .catch(error => {
          console.error(error)
          setState("idle")
        })
    }
  }
  return (
    <ListItem
      sx={{ "& .MuiListItemButton-root": { paddingRight: "88px" } }}
      dense
      disablePadding
      secondaryAction={
        <Stack direction="row" gap={1}>
          {isEditing ? (
            <IconButton edge="end" onClick={handleEdit} disabled={isRemoving}>
              <Check />
            </IconButton>
          ) : (
            <IconButton
              edge="end"
              onClick={() => setState("editing")}
              disabled={isRemoving}
            >
              <Edit />
            </IconButton>
          )}
          <IconButton edge="end" onClick={handleRemove} disabled={isRemoving}>
            <Close />
          </IconButton>
        </Stack>
      }
    >
      <ListItemButton
        disableRipple={isEditing}
        disabled={isRemoving}
        sx={{ borderRadius: 2, my: 0.5 }}
        onClick={handleDone}
      >
        <ListItemIcon>
          <Checkbox
            edge="start"
            checked={isDone}
            disableRipple
            disabled={isEditing}
          />
        </ListItemIcon>
        <>
          {isEditing ? (
            <Box component={"form"} onSubmit={handleSubmit} width={1}>
              <Input
                size="small"
                inputRef={inputRef}
                fullWidth
                multiline
                defaultValue={task.content}
                sx={{
                  typography: "body2",
                }}
              />
            </Box>
          ) : (
            <StyledListItemText
              done={isDone}
              primary={task?.content ?? removedTask.current.content}
              secondary={new Date(
                task?.date ?? removedTask.current.date,
              ).toLocaleString()}
              primaryTypographyProps={{
                style: {
                  overflowWrap: "anywhere",
                },
              }}
              secondaryTypographyProps={{
                fontSize: "0.8em",
                style: {
                  overflowWrap: "anywhere",
                },
              }}
            />
          )}
        </>
      </ListItemButton>
    </ListItem>
  )
}
