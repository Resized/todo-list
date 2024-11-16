import { api } from "../../api/api"
import type { AppStore } from "../../app/store"
import { makeStore } from "../../app/store"
import type { Task } from "./tasksSlice"
import {
  addTask,
  getTasks,
  removeTask,
  selectAllTasks,
  selectIsAdding,
  selectIsFetching,
  updateTask,
} from "./tasksSlice"

// Mock API responses
jest.mock("../../api/api")

describe("tasksSlice", () => {
  const mockTask: Task = {
    id: "1",
    content: "Test task",
    done: false,
    date: new Date().toISOString(),
  }

  let store: AppStore

  beforeEach(() => {
    store = makeStore()
  })

  it("should handle initial state", () => {
    const state = store.getState().tasks
    expect(state.isFetching).toBe(false)
    expect(state.isAdding).toBe(false)
    expect(state.deletingTaskIds).toHaveLength(0)
    expect(state.updatingTaskIds).toHaveLength(0)
  })

  it("should handle getTasks.pending", async () => {
    ;(api.get as jest.Mock).mockResolvedValueOnce({ data: [mockTask] })
    await store.dispatch(getTasks())
    const state = store.getState().tasks
    expect(selectAllTasks(state)).toEqual([mockTask])
    expect(selectIsFetching(state)).toBe(false)
  })

  it("should handle addTask.pending and addTask.fulfilled", async () => {
    const newTaskContent = "New task"
    const newTask = { ...mockTask, id: "2", content: newTaskContent }(
      api.post as jest.Mock,
    ).mockResolvedValueOnce({ data: newTask })

    await act(async () => {
      await store.dispatch(addTask(newTaskContent))
    })

    const state = store.getState().tasks
    expect(selectAllTasks(state)).toContainEqual(newTask)
    expect(selectIsAdding(state)).toBe(false)
  })

  it("should handle updateTask.pending and updateTask.fulfilled", async () => {
    const updatedTask = { ...mockTask, done: true }(
      api.patch as jest.Mock,
    ).mockResolvedValueOnce({ data: updatedTask })

    await store.dispatch(updateTask({ id: mockTask.id, done: true }))

    const state = store.getState().tasks
    expect(selectAllTasks(state)).toContainEqual(updatedTask)
  })

  it("should handle removeTask.pending and removeTask.fulfilled", async () => {
    ;(api.delete as jest.Mock).mockResolvedValueOnce({})

    await store.dispatch(removeTask(mockTask.id))

    const state = store.getState().tasks
    expect(selectAllTasks(state)).not.toContainEqual(mockTask)
  })
})
