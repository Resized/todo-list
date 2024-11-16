import {
  Box,
  Container,
  createTheme,
  CssBaseline,
  Paper,
  Stack,
  styled,
  ThemeProvider,
} from "@mui/material"
import { useMemo, useState } from "react"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import "./App.css"
import { AddTask } from "./features/tasks/AddTask"
import { TaskFilterBy } from "./features/tasks/TaskFilterBy"
import { TaskList } from "./features/tasks/TaskList"
import { TaskTitle } from "./features/tasks/TaskTitle"

const StyledPaper = styled(Paper)(({ theme }) => ({
  // maxHeight: `calc(100vh - ${theme.spacing(2)})`,
  maxHeight: `min(800px, calc(100vh - ${theme.spacing(4)}))`,
  height: "fit-content",
  padding: theme.spacing(3),
  borderRadius: theme.spacing(3),
  display: "flex",
  flexDirection: "column",
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
}))

const App = () => {
  const [darkMode, setDarkMode] = useState(false)

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

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      <div
        className="App"
        style={{
          minHeight: "100vh",
          padding: theme.spacing(2),
          display: "flex",
          alignItems: "center",
        }}
      >
        <Container maxWidth="sm">
          <StyledPaper elevation={3}>
            <TaskTitle
              darkMode={darkMode}
              handleThemeChange={handleThemeChange}
            />
            <Stack
              gap={2}
              sx={{
                overflow: "hidden", // Single overflow control point
                pt: 1, // Add some margin top if needed
              }}
            >
              <AddTask />
              <TaskFilterBy />
              <TaskList />
            </Stack>
          </StyledPaper>
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
