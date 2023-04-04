import { ref, watchEffect } from 'vue'

export function usePersistedRef(key, initialValue) {
  // Check if value exists in localStorage
  // If it doesn't, then we need to initialize it using the initialValue argument
  const persistedValue = window.localStorage.getItem(key)
  const value = persistedValue ? JSON.parse(persistedValue) : initialValue
  const persistentRef = ref(value)

  // Save new value of ref to localStorage whenever it changes
  watchEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(persistentRef.value))
  })

  // Return ref (reactive value)
  return persistentRef
}
