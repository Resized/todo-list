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
import { useRef, useState } from "react"
import { toast } from "react-toastify"
import { useAppDispatch } from "../../app/hooks"
import type { Task } from "./tasksSlice"
import { removeTask, updateTask } from "./tasksSlice"

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

export const TaskItem = ({ ...task }: Task) => {
  const dispatch = useAppDispatch()
  const inputRef = useRef<HTMLInputElement>()
  const [state, setState] = useState<"idle" | "removing" | "editing">("idle")
  const isRemoving = state === "removing"
  const isEditing = state === "editing"
  const isDone = task.done

  const handleEdit = () => {
    setState("idle")

    if (inputRef.current && inputRef.current.value !== task.content) {
      try {
        void toast.promise(
          dispatch(
            updateTask({ _id: task._id, content: inputRef.current.value }),
          ).unwrap(),
          {
            pending: "Pending update...",
            error: "Error updating task",
            success: "Task updated!",
          },
        )
      } catch (error) {
        console.error(error)
      }
    }
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    inputRef.current?.blur()
    handleEdit()
  }

  const handleDone = () => {
    if (!isEditing) {
      try {
        void toast.promise(
          dispatch(updateTask({ _id: task._id, done: !isDone })).unwrap(),
          {
            pending: "Pending update...",
            error: "Error updating task",
            success: "Task updated!",
          },
        )
      } catch (error) {
        console.error(error)
      }
    }
  }

  const handleRemove = () => {
    if (isEditing) {
      setState("idle")
    } else {
      setState("removing")
      try {
        void toast.promise(dispatch(removeTask(task._id)).unwrap(), {
          pending: "Pending removal...",
          error: "Error removing task",
          success: "Task removed!",
        })
      } catch (error) {
        console.error(error)
        setState("idle")
      }
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
              primary={task.content}
              secondary={new Date(task.date).toLocaleString()}
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
