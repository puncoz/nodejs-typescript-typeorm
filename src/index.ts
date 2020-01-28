import "reflect-metadata"
import {
    Connection,
    createConnection,
} from "typeorm"

let _connection: Connection

export const connect = async (databaseFN: string) => {
    _connection = await createConnection({
        type: "sqlite",
        database: databaseFN,
        synchronize: true,
        logging: false,
        entities: [],
    })
}

export const connected = () => typeof _connection !== "undefined"

// export const getStudentRepository = () => _connection.getCustomRepository()
