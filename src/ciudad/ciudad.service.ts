/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';
import { Repository } from 'typeorm';
import { CiudadEntity } from './ciudad.entity';
import { paises } from './pais.list';

@Injectable()
export class CiudadService {
    constructor(
        @InjectRepository(CiudadEntity)
        private readonly ciudadRepository: Repository<CiudadEntity>
    ) {}

    async findAll(): Promise<CiudadEntity[]> {
        return await this.ciudadRepository.find({ relations: ["supermercados"] });
    }

    async findOne(id: string): Promise<CiudadEntity> {
        const ciudad: CiudadEntity = await this.ciudadRepository.findOne({where:{id}});
        if (!ciudad)
            throw new BusinessLogicException('La ciudad con el id dado no fue encontrada', BusinessError.NOT_FOUND,);
    
        return ciudad;
    }

    async create(ciudad: CiudadEntity): Promise<CiudadEntity> {
        if (!this.validarPais(ciudad.pais))
            throw new BusinessLogicException('El pais al que pertenece la ciudad no está permitido', BusinessError.PRECONDITION_FAILED,);

        return await this.ciudadRepository.save(ciudad);
    }

    async update(id: string, ciudad: CiudadEntity): Promise<CiudadEntity> {
        const persistedCiudad: CiudadEntity = await this.ciudadRepository.findOne({where:{id}});
        if (!persistedCiudad)
            throw new BusinessLogicException("La ciudad con el id dado no fue encontrada", BusinessError.NOT_FOUND);

        if (!this.validarPais(ciudad.pais))
            throw new BusinessLogicException('El pais al que pertenece la ciudad no está permitido', BusinessError.PRECONDITION_FAILED,);
    
        return await this.ciudadRepository.save({...persistedCiudad, ...ciudad});
    }

    async delete(id: string) {
        const ciudad: CiudadEntity = await this.ciudadRepository.findOne({where:{id}});
        if (!ciudad)
          throw new BusinessLogicException("La ciudad con el id dado no fue encontrada", BusinessError.NOT_FOUND);
    
        await this.ciudadRepository.remove(ciudad);
    }

    validarPais(pais: string): boolean {
        return paises.some(element => 
            element.toLowerCase() === pais.toLowerCase()
        )
    }
}
