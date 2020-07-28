/*_________________________________________________________________________________________________________________
/*|-----------------------------Copyright © Antoni Papiewski and Milan Kazarka 2020-----------------------------/*/
/*|----------Distribution of this software is only permitted in accordance with the BSL © 1.1 license----------/*/
/*|---included in the LICENSE.md file, in the software's github.com repository and on chatcola.com website.---/*/
/*¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯/*/
import mongoose from "mongoose";

import { IEntityRepository } from "../../../types/infrastructure";


export default function MongoRepository<TEntity>(
    Model: mongoose.Model<any & mongoose.Document>, 
    serializeFn: (doc: any) => any,
    deserializeFn: (doc: any) => TEntity
) {

    return class MongoRepository implements IEntityRepository<TEntity> {

        async find(predicates: any): Promise< TEntity[] > {

            const docs = await Model.find(predicates);

            if(!docs)
                return [];

            return docs.map( doc => deserializeFn(doc) );
        }
    
        async findOne(predicates: any): Promise<TEntity | null> {

            const doc = await Model.findOne(predicates);

            if(!doc)
                return null;

            return deserializeFn(doc);
        }

        async findByIds(ids: string[]): Promise< TEntity[] >  {
            
            const serializedIds = ids.map( id => mongoose.Types.ObjectId(id) )
            const docs = await Model.find({ _id: { $in: serializedIds } })

            if(!docs)
                return [];

            return docs.map( doc => deserializeFn(doc) );
        }
    
        async deleteMany(predicates: any): Promise<{deletedCount: number}> {
            const { deletedCount } = await Model.deleteMany(predicates);

            if((typeof deletedCount) === "number")
            //@ts-ignore
                return { deletedCount };

            return { deletedCount: 0 };
        }
        
        async deleteOne(predicates: any): Promise<void> {
            await Model.deleteOne(predicates);
        }
        
        async save(instance: TEntity): Promise<void> {
            const doc = new Model(serializeFn(instance));

            await doc.save();
        }
    
        async persist(instance: TEntity): Promise<void> {
            const serializedInstance = serializeFn(instance);
            
            const _id = serializedInstance._id;
            delete serializedInstance._id;

            await Model.update({ _id }, serializedInstance);
        }
    }
}