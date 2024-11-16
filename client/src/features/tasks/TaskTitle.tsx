import { Brightness4, Brightness7 } from "@mui/icons-material"
import { IconButton, Stack, Typography } from "@mui/material"

interface TaskTitleProps {
  darkMode: boolean
  handleThemeChange: () => void
}

export function TaskTitle({ darkMode, handleThemeChange }: TaskTitleProps) {
  return (
    <Stack direction="row" justifyContent="space-between" mb={1.5}>
      <Typography color="primary" variant="h4" sx={{ fontWeight: "bold" }}>
        TODO LIST
      </Typography>
      <IconButton onClick={handleThemeChange}>
        {darkMode ? <Brightness7 /> : <Brightness4 />}
      </IconButton>
    </Stack>
  )
}
