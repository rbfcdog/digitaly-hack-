import { api } from "@/services/api"

export async function queryClientInfo(clientId : string) {
    try {
        const body = { clientId }
        console.log(body)
        const res = await api.post("api/actions/query-client-info", body)
        console.log(res)
        return res
    } catch (error) {
        console.error("Error:", error);
        // return error
    }   
}