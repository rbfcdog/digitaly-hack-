// Em memória: hash -> patient_id
const sessions: Record<string, string> = {};

export class SessionsManager {
  static addSession(hash: string, patient_id: string) {
    sessions[hash] = patient_id;
  }

  static getPatientId(hash: string) {
    return sessions[hash];
  }

  static removeSession(hash: string) {
    delete sessions[hash];
  }
}
