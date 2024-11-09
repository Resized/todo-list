import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit"
import { api } from "../../api/api"
import type { RootState } from "../../app/store"

export type Task = {
  id: string
  content: string
  done: boolean
  date: string
}

type MongoTask = Omit<Task, "id"> & { _id: string }

interface TasksState {
  isAdding: boolean
  isFetching: boolean
  deletingTaskIds: string[]
  updatingTaskIds: string[]
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
  async (content, thunkAPI) => {
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
>("tasks/updateTask", async (task, thunkAPI) => {
  const response = await api.patch<MongoTask>(`/tasks/${task.id}`, task)
  const data = response.data
  return {
    ...data,
    id: data._id,
  }
})

export const removeTask = createAsyncThunk<void, string, { state: RootState }>(
  "tasks/removeTask",
  async (id, thunkAPI) => {
    await api.delete(`/tasks/${id}`)
  },
)

export const tasksSlice = createSlice({
  name: "tasks",
  initialState: tasksAdapter.getInitialState<TasksState>({
    isAdding: false,
    isFetching: false,
    deletingTaskIds: [],
    updatingTaskIds: [],
    error: null,
  }),
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(getTasks.pending, state => {
        state.isFetching = true
      })
      .addCase(getTasks.fulfilled, (state, action) => {
        state.isFetching = false
        tasksAdapter.setAll(state, action.payload)
      })
      .addCase(getTasks.rejected, (state, action) => {
        state.isFetching = false
        if (action.error.message) state.error = action.error.message
      })

    builder
      .addCase(addTask.pending, state => {
        state.isAdding = true
      })
      .addCase(addTask.fulfilled, (state, action) => {
        state.isAdding = false
        tasksAdapter.addOne(state, action.payload)
      })
      .addCase(addTask.rejected, (state, action) => {
        state.isAdding = false
        if (action.error.message) state.error = action.error.message
      })

    builder
      .addCase(updateTask.pending, (state, action) => {
        state.updatingTaskIds.push(action.meta.arg.id)
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.updatingTaskIds = state.updatingTaskIds.filter(
          taskId => taskId !== action.meta.arg.id,
        )
        const { id, content, done } = action.payload
        tasksAdapter.updateOne(state, { id, changes: { content, done } })
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.updatingTaskIds = state.updatingTaskIds.filter(
          taskId => taskId !== action.meta.arg.id,
        )
        if (action.error.message) state.error = action.error.message
      })

    builder
      .addCase(removeTask.pending, (state, action) => {
        state.deletingTaskIds.push(action.meta.arg)
      })
      .addCase(removeTask.fulfilled, (state, action) => {
        state.deletingTaskIds = state.deletingTaskIds.filter(
          taskId => taskId !== action.meta.arg,
        )
        tasksAdapter.removeOne(state, action.meta.arg)
      })
      .addCase(removeTask.rejected, (state, action) => {
        state.deletingTaskIds = state.deletingTaskIds.filter(
          taskId => taskId !== action.meta.arg,
        )
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

export const selectIsAdding = (state: RootState) => state.tasks.isAdding
export const selectIsFetching = (state: RootState) => state.tasks.isFetching
export const selectTasksError = (state: RootState) => state.tasks.error

export const selectIsDeleting = (taskId: string) =>
  createSelector(
    [(state: RootState) => state.tasks.deletingTaskIds],
    deletingTaskIds => deletingTaskIds.includes(taskId),
  )

export const selectIsUpdating = (taskId: string) =>
  createSelector(
    [(state: RootState) => state.tasks.updatingTaskIds],
    updatingTaskIds => updatingTaskIds.includes(taskId),
  )

export const selectDoneTasks = createSelector([selectAllTasks], tasks =>
  tasks.filter(task => task.done),
)

export const selectPendingTasks = createSelector([selectAllTasks], tasks =>
  tasks.filter(task => !task.done),
)

export default tasksSlice.reducer
