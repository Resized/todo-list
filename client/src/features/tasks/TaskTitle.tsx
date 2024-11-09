import { Brightness4, Brightness7 } from "@mui/icons-material"
import { IconButton, Typography } from "@mui/material"

interface TaskTitleProps {
  darkMode: boolean
  handleThemeChange: () => void
}

export function TaskTitle({ darkMode, handleThemeChange }: TaskTitleProps) {
  return (
    <>
      <Typography color="primary" variant="h4">
        TODO LIST
      </Typography>
      <IconButton onClick={handleThemeChange}>
        {darkMode ? <Brightness7 /> : <Brightness4 />}
      </IconButton>
    </>
  )
}
