import { api } from "@/services/api"
import { AxiosResponse } from "axios"
import { ClientInfo, NewMessage, Message } from "@/types"

export async function queryClientInfo(patient_id: string): Promise<ClientInfo> {
  try {
    const body = { patient_id }
    console.log(body)
    const res = await api.post<ClientInfo>("api/actions/query-client-info", body)
    console.log(res)
    return res.data
  } catch (error) {
    console.error("Error:", error)
    throw error // rethrow so the caller can handle it
  }
}

export async function insertMessage(message : NewMessage): Promise<void> {
  try {
    await api.post("api/actions/insert-message", message)
  } catch (error) {
    console.error("Error:", error)
    throw error
  }
}

export async function queryAllClientMessages(patient_id: string): Promise<Message[]> {
  try {
    const body = { patient_id }
    const res = await api.post("api/actions/query-all-client-messages", body)
    return res.data
  } catch (error) {
    console.error("Error:", error)
    throw error
  }
}

export async function queryAllClientsInfo(): Promise<ClientInfo[]> {
  try {
    const body = { }
    const res = await api.post<ClientInfo[]>("api/actions/query-all-clients-info", body)
    console.log(res)
    return res.data
  } catch (error) {
    console.error("Error:", error)
    throw error // rethrow so the caller can handle it
  }
}


