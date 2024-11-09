import { Button, Stack, TextField } from "@mui/material"
import type { FormEvent } from "react"
import { useEffect, useRef } from "react"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { addTask, selectIsAdding } from "./tasksSlice"

export const AddTask = () => {
  const inputRef = useRef<HTMLInputElement>(null)
  const dispatch = useAppDispatch()
  const isAdding = useAppSelector(selectIsAdding)

  useEffect(() => {
    inputRef.current?.focus()
  }, [isAdding])

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const form = e.currentTarget

    if (inputRef.current?.value) {
      dispatch(addTask(inputRef.current.value))
    }

    form.reset()
  }

  return (
    <form onSubmit={handleSubmit}>
      <Stack direction="row" gap={1} justifyContent="center">
        <TextField
          disabled={isAdding}
          autoFocus
          focused
          fullWidth
          label="Add task here..."
          inputRef={inputRef}
          size="small"
        />
        <Button disabled={isAdding} variant="contained" type="submit">
          ADD
        </Button>
      </Stack>
    </form>
  )
}
