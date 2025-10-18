import { supabase } from "../../config/supabase";
import { ClientInfo } from "../../types";

export class supabaseService {

    static async query_client_info() : Promise<ClientInfo>{

        const { data, error } = await supabase
            .from<ClientInfo>('client_info')
            .select('*')
            .single();

        if (error) {
            throw new Error(`Error fetching client info: ${error.message}`);
        }
        return data;
    }
    
