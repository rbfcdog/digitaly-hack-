import { supabase } from "../../config/supabase";
import { ClientInfo } from "../../types";

export class supabaseService {

    static async query_client_info(clientId: string) : Promise<ClientInfo>{

        const { data, error } = await supabase
        .from("client_info")
        .select("*")
        .eq("patient_id", clientId)
        .single<ClientInfo>();

        if (error) {
            throw new Error(`Error fetching client info: ${error.message}`);
        }
        return data;
    }
}
