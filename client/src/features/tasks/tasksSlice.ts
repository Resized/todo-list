import type { PayloadAction } from "@reduxjs/toolkit"
import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit"
import { api } from "../../api/api"
import type { RootState } from "../../app/store"
import type { FilterByType } from "./types/types"

export type Task = {
  _id: string
  content: string
  done: boolean
  date: string
}

export interface TasksState {
  filterBy: FilterByType
  status: "idle" | "loading" | "failed" | "success"
  error: string | null
}
const tasksAdapter = createEntityAdapter({
  selectId: (task: Task) => task._id,
  sortComparer: (a, b) => b.date.localeCompare(a.date),
})

type UpdateTask = {
  _id: string
  content?: string
  done?: boolean
}

export const getTasks = createAsyncThunk("tasks/getTasks", async () => {
  const response = await api.get<Task[]>("/tasks")
  const data = response.data
  return data
})

export const addTask = createAsyncThunk(
  "tasks/addTask",
  async (content: string, _thunkAPI) => {
    const response = await api.post<Task>("/tasks", { content })
    const data = response.data
    return data
  },
)

export const updateTask = createAsyncThunk(
  "tasks/updateTask",
  async (task: UpdateTask, _thunkAPI) => {
    const response = await api.patch<Task>(`/tasks/${task._id}`, task)
    const data = response.data
    return data
  },
)

export const removeTask = createAsyncThunk(
  "tasks/removeTask",
  async (id: string, _thunkAPI) => {
    await api.delete(`/tasks/${id}`)
    return id
  },
)

export const tasksSlice = createSlice({
  name: "tasks",
  initialState: tasksAdapter.getInitialState<TasksState>({
    filterBy: "all",
    status: "idle",
    error: null,
  }),
  reducers: {
    filterChanged(state, action: PayloadAction<FilterByType>) {
      state.filterBy = action.payload
    },
    addClientTask: tasksAdapter.addOne,
    removeClientTask: tasksAdapter.removeOne,
    updateClientTask(state, action: PayloadAction<Task>) {
      tasksAdapter.updateOne(state, {
        id: action.payload._id,
        changes: { content: action.payload.content, done: action.payload.done },
      })
    },
  },
  extraReducers(builder) {
    builder
      .addCase(getTasks.pending, state => {
        state.status = "loading"
      })
      .addCase(getTasks.fulfilled, (state, action) => {
        state.status = "success"
        tasksAdapter.setAll(state, action.payload)
      })
      .addCase(getTasks.rejected, (state, action) => {
        state.status = "failed"
        if (action.error.message) state.error = action.error.message
      })

    builder
      .addCase(addTask.fulfilled, (state, action) => {
        tasksAdapter.addOne(state, action.payload)
      })
      .addCase(addTask.rejected, (state, action) => {
        if (action.error.message) state.error = action.error.message
      })

    builder
      .addCase(updateTask.fulfilled, (state, action) => {
        const { _id, content, done } = action.payload
        tasksAdapter.updateOne(state, { id: _id, changes: { content, done } })
      })
      .addCase(updateTask.rejected, (state, action) => {
        if (action.error.message) state.error = action.error.message
      })

    builder
      .addCase(removeTask.fulfilled, (state, action) => {
        tasksAdapter.removeOne(state, action.payload)
      })
      .addCase(removeTask.rejected, (state, action) => {
        if (action.error.message) state.error = action.error.message
      })
  },
})

export const {
  selectAll: selectAllTasks,
  selectById: selectTaskById,
  selectTotal: selectTotalTasks,
  selectIds: selectTasksIds,
} = tasksAdapter.getSelectors((state: RootState) => state.tasks)

export const selectFetchStatus = (state: RootState) => state.tasks.status
export const selectTasksError = (state: RootState) => state.tasks.error

export const selectFilterBy = (state: RootState) => state.tasks.filterBy

export const selectTasksByFilter = createSelector(
  [selectAllTasks, selectFilterBy],
  (tasks, filterBy) =>
    tasks.filter(task => {
      switch (filterBy) {
        case "done":
          return task.done
        case "pending":
          return !task.done
        default:
          return true
      }
    }),
)

export const {
  filterChanged,
  addClientTask,
  removeClientTask,
  updateClientTask,
} = tasksSlice.actions

export default tasksSlice.reducer
