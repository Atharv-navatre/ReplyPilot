// Chrome storage helpers
interface StorageData {
  replyCount: number
  lastUsed?: string
}

const DEFAULT_DATA: StorageData = {
  replyCount: 0
}

export async function getStorageData(): Promise<StorageData> {
  const result = await chrome.storage.local.get(DEFAULT_DATA)
  return result as StorageData
}

export async function incrementReplyCount(): Promise<number> {
  const data = await getStorageData()
  const newCount = data.replyCount + 1
  
  await chrome.storage.local.set({
    replyCount: newCount,
    lastUsed: new Date().toISOString()
  })
  
  return newCount
}

export async function getReplyCount(): Promise<number> {
  const data = await getStorageData()
  return data.replyCount
}
