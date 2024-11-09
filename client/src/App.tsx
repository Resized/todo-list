import {
  Container,
  createTheme,
  CssBaseline,
  Paper,
  Stack,
  ThemeProvider,
} from "@mui/material"
import type React from "react"
import { useMemo, useState } from "react"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import "./App.css"
import { AddTask } from "./features/tasks/AddTask"
import { TaskFilterBy } from "./features/tasks/TaskFilterBy"
import { TaskList } from "./features/tasks/TaskList"
import { TaskTitle } from "./features/tasks/TaskTitle"
import type { FilterByType } from "./features/tasks/types/types"

const App = () => {
  const [darkMode, setDarkMode] = useState(false)
  const [filterBy, setFilterBy] = useState<FilterByType>("all")

  const handleThemeChange = () => setDarkMode(!darkMode)

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? "dark" : "light",
        },
      }),
    [darkMode],
  )

  const handleFilterChange = (
    e: React.MouseEvent<HTMLElement>,
    newValue: FilterByType,
  ) => {
    if (newValue !== null) setFilterBy(newValue)
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      <div className="App">
        <Container maxWidth="sm">
          <Stack height="100vh" justifyContent="center">
            <Paper
              elevation={3}
              sx={{
                maxHeight: `calc(100vh - ${theme.spacing(2)})`,
                overflow: "hidden",
                p: 3,
                borderRadius: 3,
                "&::before": {
                  content: "''",
                  display: "block",
                  position: "absolute",
                  zIndex: -1,
                  inset: 0,
                  backgroundImage:
                    "radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))",
                  backgroundRepeat: "no-repeat",
                  ...theme.applyStyles("dark", {
                    backgroundImage:
                      "radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))",
                  }),
                },
              }}
            >
              <Stack direction="row" justifyContent="space-between" mb={1.5}>
                <TaskTitle
                  darkMode={darkMode}
                  handleThemeChange={handleThemeChange}
                />
              </Stack>
              <Stack direction="column" gap={2}>
                <AddTask />
                <TaskFilterBy
                  filterBy={filterBy}
                  handleFilterChange={handleFilterChange}
                />
                <TaskList filterBy={filterBy} />
              </Stack>
            </Paper>
          </Stack>
        </Container>

        <ToastContainer
          theme={theme.palette.mode}
          newestOnTop
          hideProgressBar
          autoClose={2000}
          draggable
          closeOnClick
        />
      </div>
    </ThemeProvider>
  )
}

export default App
