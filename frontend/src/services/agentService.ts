import { api } from "@/services/api"
import { AxiosResponse } from "axios"
import { ClientInfo } from "@/types"

export async function queryClientInfo(clientId: string): Promise<AxiosResponse<ClientInfo>> {
  try {
    const body = { clientId }
    console.log(body)
    const res = await api.post<ClientInfo>("api/actions/query-client-info", body)
    console.log(res)
    return res
  } catch (error) {
    console.error("Error:", error)
    throw error // rethrow so the caller can handle it
  }
}