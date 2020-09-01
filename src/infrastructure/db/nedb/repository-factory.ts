/*
|    For alternative licensing arrangements contact us at freedom@chatcola.com
|--------------------------------------------------------------------------------  
|    This file is part of chatcola.com server
|    Copyright (C) 2020 Antoni Papiewski & Milan Kazarka
|
|    This program is free software: you can redistribute it and/or modify
|    it under the terms of the GNU Affero General Public License as published by
|    the Free Software Foundation, either version 3 of the License, or
|    (at your option) any later version.
|
|    This program is distributed in the hope that it will be useful,
|    but WITHOUT ANY WARRANTY; without even the implied warranty of
|    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
|    GNU Affero General Public License for more details.
|
|    You should have received a copy of the GNU Affero General Public License
|    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
import NeDB from "nedb-promises";

export default function NedbRepositoryFactory<TEntity>(
    db: NeDB, 
    serializeFn: (doc: any) => any,
    deserializeFn: (doc: any) => TEntity
) {

    return class Repository {
        async find(predicates: any): Promise< TEntity[] > {

            const docs = await db.find(predicates);

            if(!docs)
                return [];

            return docs.map( doc => deserializeFn(doc) );
        }
    
        async findOne(predicates: any): Promise<TEntity | null> {

            const doc = await db.findOne(predicates);

            if(!doc)
                return null;

            return deserializeFn(doc);
        }

        async findByIds(ids: string[]): Promise< TEntity[] >  {
            const docs = await db.find({ _id: { $in: ids } })

            if(!docs)
                return [];

            return docs.map( doc => deserializeFn(doc) );
        }
    
        async deleteMany(predicates: any): Promise<{deletedCount: number}> {
            const deletedCount = await db.remove(predicates, { multi: true });

            return { deletedCount };
        }
        
        async deleteOne(predicates: any): Promise<void> {
            await db.remove(predicates, { multi: false });
        }
        
        async save(instance: TEntity): Promise<void> {
            await db.insert(
                serializeFn(instance)
            );
        }
    
        async persist(instance: TEntity): Promise<void> {
            const serializedInstance = serializeFn(instance);
            
            const _id = serializedInstance._id;
            delete serializedInstance._id;

            await db.update({ _id }, serializedInstance);
        }
    }
}
