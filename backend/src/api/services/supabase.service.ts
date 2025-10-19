import { supabase } from "../../config/supabase";
import { ClientInfo, Message, NewMessage } from "../../types";

export class supabaseService {

    static async queryClientInfo(patient_id: string) : Promise<ClientInfo>{
        const { data, error } = await supabase
        .from("client_info")
        .select("*")
        .eq("patient_id", patient_id)
        .single<ClientInfo>();

        if (error) {
            throw new Error(`Error fetching client info: ${error.message}`);
        }

        return data;
    }

    static async insertMessage(message : NewMessage) : Promise<void>{
        const { error } = await supabase
        .from("messages")
        .insert([message]);

        if (error) {
            throw new Error(`Error inserting message: ${error.message}`);
        }
    }

    static async queryAllClientMessages(patient_id: string): Promise<Message[]> {

        const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("patient_id", patient_id)
        .order("created_at", { ascending: true });

        if (error) {
            throw new Error(`Error fetching client messages: ${error.message}`);
        }

        return data;
    }

    static async querySessionClientMessages(patient_id: string, session_id: string): Promise<Message[]> {

        const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("patient_id", patient_id)
        .eq("session_id", session_id)
        .order("created_at", { ascending: true });

        if (error) {
            throw new Error(`Error fetching session client messages: ${error.message}`);
        }
        return data;
    }


    static async queryAllClientsInfo(): Promise<ClientInfo[]> {

        const { data, error } = await supabase
        .from("client_info")
        .select("*");

        if (error) {
            throw new Error(`Error fetching all clients info: ${error.message}`);
        }

        return data;
    }

}
