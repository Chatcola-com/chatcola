/*_________________________________________________________________________________________________________________
/*|-----------------------------Copyright © Antoni Papiewski and Milan Kazarka 2020-----------------------------/*/
/*|----------Distribution of this software is only permitted in accordance with the BSL © 1.1 license----------/*/
/*|---included in the LICENSE.md file, in the software's github.com repository and on chatcola.com website.---/*/
/*¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯/*/
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
