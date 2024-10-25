import Database from 'better-sqlite3';
import { Logger } from 'pino';
import { database as Idatabase } from '../../protos/database';
import P from 'pino';
import { performance } from 'perf_hooks';

export const profiling = (name: string, func: () => any, logger: Logger) => {
    const start = performance.now();
    func();
    const end = performance.now();
    logger.info(`${name} took ${(end - start).toFixed(2)}ms`);
};

export class database {
    public logger: Logger;
    public path: string;
    public data: Idatabase.collection;
    public needProfiling: boolean;
    private db: Database.Database;
    // note: why i write this shitty ass code
    // use mongodb or mariadb fuckers
    // anyways lowdb is not compatible for commonjs modules
    /**
     * Creates a new database instance.
     *
     * @param {Object} [options] - The options to use.
     * @param {string} [options.path] - The path to the SQLite database file.
     * @param {Logger} [options.logger] - The logger to use.
     * @param {boolean} [options.needProfiling] - Whether to profile the read operation.
     *
     * @example
     * const logger = pino();
     * const db = new Database({ path: 'path/to/db.db', logger, needProfiling: true });
     */
    constructor({ path, logger, needProfiling }: { path: string, logger: Logger, needProfiling: boolean }) {
        this.path = path;
        this.logger = logger;
        this.data = Idatabase.collection.create({
            users: {},
            chats: {},
            settings: {}
        });
        
        // should profile data
        this.needProfiling = needProfiling;
        this.db = new Database(path);
        this.db.exec(`
            PRAGMA journal_mode = WAL;
            PRAGMA synchronous = NORMAL;
            PRAGMA temp_store = MEMORY;
            PRAGMA mmap_size = 268435456;
            PRAGMA cache_size = -64000;
            CREATE TABLE IF NOT EXISTS storage (
                id INTEGER PRIMARY KEY,
                data BLOB
            );
        `);


        if (this.needProfiling) {
            profiling('read', this.read.bind(this), this.logger);
        } else {
            this.read.bind(this)();
        }

        logger.info(`Database in archive ${path} initialized`);
    }

    /**
     * Reads data from the database archive.
     * If the data is already in cache, it reads from there.
     * If not, it reads from the database file.
     */
    public async read() {
        this.logger.info("Trying to decode data");
        try {
        const row: any = this.db.prepare('SELECT data FROM storage WHERE id = ?').get(1); 
        if (row) {
            const buffer = row.data;
            this.data = Idatabase.collection.decode(buffer);
            this.logger.info(`Database in archive ${this.path} read from cache (Size: ${buffer.length} bytes)`);
        }
        } catch (error) {
        this.logger.error(error);
        }
    }

    /**
     * Writes data to the database archive.
     * If this.needProfiling is true, it will profile the write operation and log the time it took.
     * If not, it will just write.
     */
    public async write() {
        // should profile data
        try {
        const writeOperation = () => {
            let writer = Idatabase.collection.encode(this.data);
            const buffer = Buffer.from(writer.finish())
            this.db.transaction(() => {
                this.db.prepare('INSERT OR REPLACE INTO storage (id, data) VALUES (?, ?)').run(1, buffer);
            })();
        };

        if (this.needProfiling) profiling('write', writeOperation, this.logger);
        else await writeOperation();
        this.logger.info(`Database in archive ${this.path} written`);
        } catch (error) {
        this.logger.error(error);
        }
    }
}

export const db = new database({ path: './database/database.db', logger: P({ level: 'debug' }), needProfiling: true })