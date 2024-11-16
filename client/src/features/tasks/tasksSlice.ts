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
  id: string
  content: string
  done: boolean
  date: string
}

type MongoTask = Omit<Task, "id"> & { _id: string }

export interface TasksState {
  filterBy: FilterByType
  status: "idle" | "loading" | "failed" | "success"
  error: string | null
}
const tasksAdapter = createEntityAdapter<Task>({
  sortComparer: (a, b) => b.date.localeCompare(a.date),
})

type UpdateTask =
  | {
      id: string
      content: string
    }
  | {
      id: string
      done: boolean
    }

export const getTasks = createAsyncThunk<Task[], void, { state: RootState }>(
  "tasks/getTasks",
  async () => {
    const response = await api.get<MongoTask[]>("/tasks")
    const data = response.data
    return data.map(({ _id, ...rest }) => ({
      ...rest,
      id: _id,
    }))
  },
)

export const addTask = createAsyncThunk<Task, string, { state: RootState }>(
  "tasks/addTask",
  async (content, _thunkAPI) => {
    const response = await api.post<MongoTask>("/tasks", { content })
    const data = response.data
    return {
      ...data,
      id: data._id,
    }
  },
)

export const updateTask = createAsyncThunk<
  Task,
  UpdateTask,
  { state: RootState }
>("tasks/updateTask", async (task, _thunkAPI) => {
  const response = await api.patch<MongoTask>(`/tasks/${task.id}`, task)
  const data = response.data
  return {
    ...data,
    id: data._id,
  }
})

export const removeTask = createAsyncThunk<
  string,
  string,
  { state: RootState }
>("tasks/removeTask", async (id, _thunkAPI) => {
  await api.delete(`/tasks/${id}`)
  return id
})

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
        const { id, content, done } = action.payload
        tasksAdapter.updateOne(state, { id, changes: { content, done } })
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

export const selectDoneTasks = createSelector([selectAllTasks], tasks =>
  tasks.filter(task => task.done),
)

export const selectPendingTasks = createSelector([selectAllTasks], tasks =>
  tasks.filter(task => !task.done),
)

export const { filterChanged } = tasksSlice.actions

export default tasksSlice.reducer
