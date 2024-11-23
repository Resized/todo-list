import { Button, CircularProgress, Stack, TextField } from "@mui/material"
import type { FormEvent } from "react"
import { useEffect, useRef, useState } from "react"
import { toast } from "react-toastify"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { addTask, selectFetchStatus } from "./tasksSlice"

export const AddTask = () => {
  const inputRef = useRef<HTMLInputElement>(null)
  const dispatch = useAppDispatch()
  const [addStatus, setAddStatus] = useState<"idle" | "loading">("idle")
  const fetchStatus = useAppSelector(selectFetchStatus)
  const isAdding = addStatus === "loading"

  useEffect(() => {
    inputRef.current?.focus()
  }, [isAdding])

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const form = e.currentTarget

    if (inputRef.current?.value) {
      const loadingTimeout = setTimeout(() => {
        setAddStatus("loading")
      }, 100)

      try {
        void toast.promise(dispatch(addTask(inputRef.current.value)).unwrap(), {
          pending: "Adding task...",
          error: "Error adding task",
          success: "Task added!",
        })
      } catch (error) {
        console.error(error)
      }
      clearTimeout(loadingTimeout)
    }

    setAddStatus("idle")
    form.reset()
  }

  return (
    <form onSubmit={handleSubmit}>
      <Stack direction="row" gap={1} justifyContent="center">
        <TextField
          disabled={isAdding || fetchStatus !== "success"}
          focused
          fullWidth
          label="Add task here..."
          inputRef={inputRef}
          size="small"
        />
        <Button
          disabled={isAdding || fetchStatus !== "success"}
          variant="contained"
          type="submit"
          endIcon={isAdding && <CircularProgress size="1rem" color="inherit" />}
        >
          ADD
        </Button>
      </Stack>
    </form>
  )
}
