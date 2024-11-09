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
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import type { Task } from "./tasksSlice"
import { removeTask, selectIsDeleting, updateTask } from "./tasksSlice"

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
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [isDone, setIsDone] = useState<boolean>(task.done)
  const inputRef = useRef<HTMLInputElement>()
  const isDeleting = useAppSelector(selectIsDeleting(task.id))

  const handleEdit = async () => {
    setIsEditing(false)

    if (inputRef.current && inputRef.current.value !== task.content) {
      await toast.promise(
        dispatch(
          updateTask({ id: task.id, content: inputRef.current.value }),
        ).unwrap(),
        {
          pending: "Pending update...",
          error: "Error updating task",
          success: "Task updated!",
        },
      )
    }
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    handleEdit()
  }

  const handleDone = async () => {
    const prevDone = isDone
    if (!isEditing) {
      setIsDone(!prevDone)
      try {
        await toast.promise(
          dispatch(updateTask({ id: task.id, done: !prevDone })).unwrap(),
          {
            pending: "Pending update...",
            error: "Error updating task",
            success: "Task updated!",
          },
        )
      } catch (error) {
        setIsDone(prevDone)
      }
    }
  }

  const handleClose = () => {
    if (isEditing) {
      setIsEditing(false)
    } else {
      dispatch(removeTask(task.id))
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
            <IconButton edge="end" onClick={handleEdit} disabled={isDeleting}>
              <Check />
            </IconButton>
          ) : (
            <IconButton
              edge="end"
              onClick={() => setIsEditing(true)}
              disabled={isDeleting}
            >
              <Edit />
            </IconButton>
          )}
          <IconButton edge="end" onClick={handleClose} disabled={isDeleting}>
            <Close />
          </IconButton>
        </Stack>
      }
    >
      <ListItemButton
        disableRipple={isEditing}
        disabled={isDeleting}
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
        <Box>
          {isEditing ? (
            <form onSubmit={handleSubmit}>
              <Input
                inputRef={inputRef}
                fullWidth
                autoFocus
                defaultValue={task.content}
              />
            </form>
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
        </Box>
      </ListItemButton>
    </ListItem>
  )
}
