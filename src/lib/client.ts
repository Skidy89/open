import makeWASocket, { GroupMetadata, UserFacingSocketConfig, WASocket as socket } from "@skidy89/baileys";

export const groupMetadata = new Map<string, GroupMetadata>()

export class WASocket {
    constructor(config: UserFacingSocketConfig) {
        // you can create a function instead?
        // yes
        // im so fucking tired of types so im use this
        this.init(config)
    }
    private async init(config: UserFacingSocketConfig):  Promise<WASocket> {
        let socket: socket | null = makeWASocket(config)
        try {
            await Object.assign(this, socket)
        
        return this
    } finally {
        socket = null
    }
    }
    public async fetchGroup (jid: string) {
        const cached = groupMetadata.get(jid)
        if (cached) {
            const meta = await this.groupMetadata(jid).catch(() => null)
            if (!meta) return void {}
            groupMetadata.set(jid, meta)
            return cached
        }
        return cached
    }
    public user: socket['user'];
    public ev: socket['ev'];
    public ws: socket['ws'];
    public relayMessage: socket["relayMessage"];
    public requestPairingCode: socket["requestPairingCode"];
    public sendMessageAck: socket["sendMessageAck"];
    public rejectCall: socket["rejectCall"];
    public readMessages: socket["readMessages"];
    public waUploadToServer: socket["waUploadToServer"];
    public groupMetadata: socket["groupMetadata"];
    public groupCreate: socket["groupCreate"];
    public groupLeave: socket["groupLeave"];
    public groupParticipantsUpdate: socket["groupParticipantsUpdate"];
    public groupUpdateSubject: socket["groupUpdateSubject"];
    public groupInviteCode: socket["groupInviteCode"];
    public groupRevokeInvite: socket["groupRevokeInvite"];
    public groupAcceptInvite: socket["groupAcceptInvite"];
    public groupAcceptInviteV4: socket["groupAcceptInviteV4"];
    public groupToggleEphemeral: socket["groupToggleEphemeral"];
    public groupFetchAllParticipating: socket['groupFetchAllParticipating']
    public groupSettingUpdate: socket["groupSettingUpdate"];
    public groupMemberAddMode: socket["groupMemberAddMode"];
    public groupJoinApprovalMode: socket["groupJoinApprovalMode"];
    public sendPresenceUpdate: socket["sendPresenceUpdate"];
    public presenceSubscribe: socket["presenceSubscribe"];
    public profilePictureUrl: socket["profilePictureUrl"];
    public onWhatsApp: socket["onWhatsApp"];
    public updateProfilePicture: socket["updateProfilePicture"];
    public removeProfilePicture: socket["removeProfilePicture"];
    public updateProfileStatus: socket["updateProfileStatus"];
    public updateProfileName: socket["updateProfileName"];
    public updateBlockStatus: socket["updateBlockStatus"];
    public authState: socket["authState"];
    public query: socket["query"];
    public uploadPreKeysToServerIfRequired: socket["uploadPreKeysToServerIfRequired"];
    public sendMessage: socket["sendMessage"];
}