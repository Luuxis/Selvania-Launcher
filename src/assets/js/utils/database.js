/**
 * @author Luuxis
 * Luuxis License v1.0
 */

const { NodeBDD, DataType } = require('node-bdd');
const nodedatabase = new NodeBDD();
const { ipcRenderer } = require('electron');
const path = require('path');

const dev = process.env.NODE_ENV === 'dev';

class database {
    /**
     * Initialise la base de données de manière robuste
     */
    async creatDatabase(tableName, tableConfig) {
        // On demande au processus Main le chemin autorisé
        const userDataPath = await ipcRenderer.invoke('path-user-data');
        
        // On définit le dossier de stockage (évite les erreurs de slashs)
        const storagePath = dev 
            ? path.join(userDataPath, '..', '..') 
            : path.join(userDataPath, 'databases');

        return await nodedatabase.intilize({
            databaseName: 'LauncherData',
            fileType: dev ? 'sqlite' : 'db',
            tableName: tableName,
            path: storagePath,
            tableColumns: tableConfig,
        });
    }

    async getDatabase(tableName) {
        return await this.creatDatabase(tableName, {
            json_data: DataType.TEXT.TEXT,
        });
    }

    async createData(tableName, data) {
        const table = await this.getDatabase(tableName);
        const result = await nodedatabase.createData(table, { 
            json_data: JSON.stringify(data) 
        });
        
        const finalData = JSON.parse(result.json_data);
        finalData.ID = result.id;
        return finalData;
    }

    async readData(tableName, key = 1) {
        const table = await this.getDatabase(tableName);
        const data = await nodedatabase.getDataById(table, key);
        
        if (data) {
            const parsed = JSON.parse(data.json_data);
            parsed.ID = data.id;
            return parsed;
        }
        return undefined;
    }

    async readAllData(tableName) {
        const table = await this.getDatabase(tableName);
        const data = await nodedatabase.getAllData(table);
        
        return data.map(info => {
            const parsed = JSON.parse(info.json_data);
            parsed.ID = info.id;
            return parsed;
        });
    }

    async updateData(tableName, data, key = 1) {
        const table = await this.getDatabase(tableName);
        await nodedatabase.updateData(table, { 
            json_data: JSON.stringify(data) 
        }, key);
    }

    async deleteData(tableName, key = 1) {
        const table = await this.getDatabase(tableName);
        await nodedatabase.deleteData(table, key);
    }
}

export default database;