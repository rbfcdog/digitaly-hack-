import { api } from "@/services/api"
import { AxiosResponse } from "axios"
import { ClientInfo, NewMessage, Message, PatientAnalysis } from "@/types"

export async function agentConversation(patient_id: string): Promise<AxiosResponse<PatientAnalysis>> {
  try {
    const body = { patient_id }
    console.log(body)
    const res = await api.post<PatientAnalysis>("api/actions/agent-conversation", body)
    console.log(res)
    return res
  } catch (error) {
    console.error("Error:", error)
    throw error // rethrow so the caller can handle it
  }
}
