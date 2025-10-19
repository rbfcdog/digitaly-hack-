import { api } from "@/services/api"
import { AxiosResponse } from "axios"
import { ClientInfo, NewMessage, Message } from "@/types"

export async function queryClientInfo(patient_id: string): Promise<AxiosResponse<ClientInfo>> {
  try {
    const body = { patient_id }
    console.log(body)
    const res = await api.post<ClientInfo>("api/actions/query-client-info", body)
    console.log(res)
    return res
  } catch (error) {
    console.error("Error:", error)
    throw error // rethrow so the caller can handle it
  }
}

export async function insertMessage(message : NewMessage): Promise<AxiosResponse> {
  try {
    const res = await api.post("api/actions/insert-message", message)
    return res
  } catch (error) {
    console.error("Error:", error)
    throw error
  }
}

export async function queryAllClientMessages(patient_id: string): Promise<AxiosResponse<Message[]>> {
  try {
    const body = { patient_id }
    const res = await api.post("api/actions/query-all-client-messages", body)
    return res
  } catch (error) {
    console.error("Error:", error)
    throw error
  }
}
