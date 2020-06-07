import knex from '../database/connection';
import { Request, Response } from 'express';

class PointsController {
    async create (request: Request, response: Response) {
          // const data = request.body;
        //desestruturação
        const {
            name,
            email,
            whatsapp,
            city,
            uf,
            latitude,
            longitude,
            items
    
        } = request.body;
    
        const trx = await knex.transaction(); //Cria uma transaction

        const point = {
            image: request.file.filename,
            name,
            email,
            whatsapp,
            city,
            uf,
            latitude,
            longitude
        };
    
        const insertedIds = await trx('points').insert(point);
    
        const point_id = insertedIds[0];
    
        const pointItems = items
        .split(',')
        .map((item: string) => Number(item.trim()))
        .map((item_id: number) => {
            return {
                item_id,
                point_id,
            }
        });
        await trx('point_items').insert(pointItems);

        await trx.commit();
    
        return response.json({ id: point_id, ... point});
    }

    // async index(request: Request, response: Response) {
    //     //filtros: city, uf, items (Query params)
    //     const { city, uf, items } = request.query;

    //     const parsedItems = String(items).split(',').map(item => Number(item.trim())); //cria um array numerico
        
    //     const points = await knex('points')
    //     .join('point_items', 'points.id', '=', 'point_items.point_id')
    //     .whereIn('point_items.item_id', parsedItems)
    //     .where('city', String(city))
    //     .where('uf', String(uf))
    //     .distinct()
    //     .select('points.*');

    //     return response.json(points);
    // }

    async index(request: Request, response: Response) {
        const points = await knex('points').select('*');
    
        // const serializedPoints = points.map(
        //     point =>{
        //         return {
        //             id: point.id,
        //             name: point.name
        //         }
        //     }
        // );

        const serializedPoints = points.map(point => {
            return {
                ...point,
                image_url: `http://192.168.0.24/uploads/${point.image}`
            }
        });
    
        return response.json(serializedPoints);
    }

    

    async show(request: Request, response: Response) {
        const { id } = request.params;
        const point = await knex('points').where('id', id).first();

        if(!point) {
            return response.status(400).json({ message: 'Point not found' });
        }

        const serializedPoint = {
            ...point,
            image_url: `http://192.168.0.24/uploads/${point.image}`

        };

        /*
        select * from items
         join point_items ON items.id = point_items.item_id
         where point_items.point_id = { id }
        */

        const items = await knex('items')
        .join('point_items', 'item.id', '=', 'point_items.item_id')
        .where('point_items.point_id', id)
        .select('items.title');

        return response.json({point: serializedPoint, items});
    }

    // async delete(request: Request, response: Response)
    // {
    //     const { id } = request.params;

    //     const trx = await knex.transaction();

    //     const pont_items = await knex('point_items')
    //     .where('point_id', id)
    //     .del();

    //     const point = await knex('points')
    //     .where('id', id)
    //     .del();

    //     await trx.commit();

    //     return response.json(point);
    // }
}

export default PointsController;