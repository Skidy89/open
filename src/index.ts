// @ts-check
import  { BaileysEventMap, DisconnectReason, makeCacheableSignalKeyStore } from "@skidy89/baileys"
import pino, { Logger } from "pino"
import { groupMetadata, WASocket } from "./lib/client"
import qrcode from "qrcode-terminal";
import { Boom } from "@hapi/boom";
import chalk from "chalk";
import {useSQLiteAuthState} from '@skidy89/mysql-baileys'
(async() => {
    const DEFAULT_CACHE_NAME = "open"
    let retries = 0
    const session = new Map<string, WASocket>()
    const logger: Logger = pino({ level: "debug" })
    const { state, saveCreds } = await useSQLiteAuthState('skid', './auth.db', logger)
    async function connectionUpdate(up: BaileysEventMap["connection.update"]) {
        const {qr, connection, lastDisconnect, receivedPendingNotifications } = up
        if (qr) {
            qrcode.generate(qr, { small: true })
        }
        switch (connection) {
            case 'open':
                return
            case 'close':
                const reason = new Boom(lastDisconnect?.error).output.statusCode
                let text: string
                switch (reason) {
                    case DisconnectReason.connectionLost:
                    case DisconnectReason.forbidden:
                    case DisconnectReason.badSession:
                    case DisconnectReason.timedOut:
                    case DisconnectReason.unavailableService:
                    case DisconnectReason.multideviceMismatch:
                        if (retries <= 3) {
                            retries++
                            await init()
                        } else {
                            text = `[ ! ] connection closed: ${reason in DisconnectReason ? DisconnectReason[reason] : reason}`
                            console.log(chalk.redBright(text))
                            session.delete(DEFAULT_CACHE_NAME)
                            process.exit(1)
                        }
                        break
                    case DisconnectReason.connectionClosed:
                    case DisconnectReason.connectionReplaced:
                    case DisconnectReason.connectionFailure:
                        text = `[ ! ] connection closed: ${reason in DisconnectReason ? DisconnectReason[reason] : reason}`
                        console.log(chalk.redBright(text))
                        session.delete(DEFAULT_CACHE_NAME)
                        break
                    case DisconnectReason.restartRequired:
                        await init()
                        break

                }
                break
        }

    }
    async function init() {
        let sock: WASocket | null = new WASocket({
            auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))},
            cachedGroupMetadata: async(jid: string) => groupMetadata.get(jid),  
            logger: logger,
            version: [2, 3000, 1015901307]
        })
        await session.set(DEFAULT_CACHE_NAME, sock)
        sock = null
        const conn = session.get(DEFAULT_CACHE_NAME)
        conn?.ev.process(async(ev: Partial<BaileysEventMap>) => {
            if (!ev) return
            if (ev["connection.update"]) await connectionUpdate(ev["connection.update"])
            if (ev['creds.update']) await saveCreds
        })

        
    }
    await init()
})()