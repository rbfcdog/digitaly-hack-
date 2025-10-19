import { api } from "@/services/api"
import { SessionResponse } from "@/types"

export async function startSession(patient_id: string) : Promise<SessionResponse> {
  try {
    const body = { patient_id }
    console.log(body)
    const res = await api.post<SessionResponse>("api/actions/create-session", body)
    console.log(res)
    return res.data
  } catch (error) {
    console.error("Error:", error)
    throw error // rethrow so the caller can handle it
  }
}
