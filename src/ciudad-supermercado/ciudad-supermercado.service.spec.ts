/* eslint-disable prettier/prettier */
import { faker } from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CiudadEntity } from '../ciudad/ciudad.entity';
import { SupermercadoEntity } from '../supermercado/supermercado.entity';
import { Repository } from 'typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { CiudadSupermercadoService } from './ciudad-supermercado.service';

describe('CiudadSupermercadoService', () => {
  let service: CiudadSupermercadoService;
  let ciudadRepository: Repository<CiudadEntity>;
  let supermercadoRepository: Repository<SupermercadoEntity>;
  let ciudad: CiudadEntity;
  let supermercadosList: SupermercadoEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [CiudadSupermercadoService],
    }).compile();

    service = module.get<CiudadSupermercadoService>(CiudadSupermercadoService);
    ciudadRepository = module.get<Repository<CiudadEntity>>(getRepositoryToken(CiudadEntity));
    supermercadoRepository = module.get<Repository<SupermercadoEntity>>(getRepositoryToken(SupermercadoEntity));

    await seedDatabase();
  });

  const seedDatabase = async () => {
    supermercadoRepository.clear();
    ciudadRepository.clear();
 
    supermercadosList = [];
    for(let i = 0; i < 5; i++){
        const supermercado: SupermercadoEntity = await supermercadoRepository.save({
          nombre: faker.company.name(),
          longitud: faker.address.longitude(),
          latitud: faker.address.latitude(),
          paginaweb: faker.internet.domainName()
        })
        supermercadosList.push(supermercado);
    }
 
    ciudad = await ciudadRepository.save({
      nombre: faker.company.name(),
      pais: faker.address.country(),
      habitantes: faker.datatype.number(),
      supermercados: supermercadosList
    })
  }

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('addSupermarketToCity should add an supermercado to a ciudad', async () => {
    const newSupermercado: SupermercadoEntity = await supermercadoRepository.save({
      nombre: faker.company.name(),
      longitud: faker.address.longitude(),
      latitud: faker.address.latitude(),
      paginaweb: faker.internet.domainName()
    });
 
    const newCiudad: CiudadEntity = await ciudadRepository.save({
      nombre: faker.company.name(),
      pais: faker.address.country(),
      habitantes: faker.datatype.number()
    })
 
    const result: CiudadEntity = await service.addSupermarketToCity(newCiudad.id, newSupermercado.id);
   
    expect(result.supermercados.length).toBe(1);
    expect(result.supermercados[0]).not.toBeNull();
    expect(result.supermercados[0].nombre).toBe(newSupermercado.nombre);
    expect(result.supermercados[0].longitud).toBe(newSupermercado.longitud);
    expect(result.supermercados[0].latitud).toBe(newSupermercado.latitud);
    expect(result.supermercados[0].paginaweb).toBe(newSupermercado.paginaweb);
  });

  it('addSupermarketToCity should thrown exception for an invalid supermercado', async () => {
    const newCiudad: CiudadEntity = await ciudadRepository.save({
      nombre: faker.company.name(),
      pais: faker.address.country(),
      habitantes: faker.datatype.number()
    })
 
    await expect(() => service.addSupermarketToCity(newCiudad.id, "0")).rejects.toHaveProperty("message", "El supermercado con el id dado no fue encontrado");
  });

  it('addSupermarketToCity should throw an exception for an invalid ciudad', async () => {
    const newSupermercado: SupermercadoEntity = await supermercadoRepository.save({
      nombre: faker.company.name(),
      longitud: faker.address.longitude(),
      latitud: faker.address.latitude(),
      paginaweb: faker.internet.domainName()
    });
 
    await expect(() => service.addSupermarketToCity("0", newSupermercado.id)).rejects.toHaveProperty("message", "La ciudad con el id dado no fue encontrada");
  });

  it('findSupermarketFromCity should return supermercado by ciudad', async () => {
    const supermercado: SupermercadoEntity = supermercadosList[0];
    const storedSupermercado: SupermercadoEntity = await service.findSupermarketFromCity(ciudad.id, supermercado.id )
    expect(storedSupermercado).not.toBeNull();
    expect(storedSupermercado.nombre).toBe(supermercado.nombre);
    expect(storedSupermercado.longitud).toBe(supermercado.longitud);
    expect(storedSupermercado.latitud).toBe(supermercado.latitud);
    expect(storedSupermercado.paginaweb).toBe(supermercado.paginaweb);
  });

  it('findSupermarketFromCity should throw an exception for an invalid supermercado', async () => {
    await expect(()=> service.findSupermarketFromCity(ciudad.id, "0")).rejects.toHaveProperty("message", "El supermercado con el id dado no fue encontrado");
  });

  it('findSupermarketFromCity should throw an exception for an invalid ciudad', async () => {
    const supermercado: SupermercadoEntity = supermercadosList[0];
    await expect(()=> service.findSupermarketFromCity("0", supermercado.id)).rejects.toHaveProperty("message", "La ciudad con el id dado no fue encontrada");
  });

  it('findSupermarketFromCity should throw an exception for an supermercado not associated to the ciudad', async () => {
    const newSupermercado: SupermercadoEntity = await supermercadoRepository.save({
      nombre: faker.company.name(),
      longitud: faker.address.longitude(),
      latitud: faker.address.latitude(),
      paginaweb: faker.internet.domainName()
    });
 
    await expect(()=> service.findSupermarketFromCity(ciudad.id, newSupermercado.id)).rejects.toHaveProperty("message", "El supermercado con el id dado no está asociado a la ciudad");
  });

  it('findSupermarketsFromCity should return supermercados by ciudad', async ()=>{
    const supermercados: SupermercadoEntity[] = await service.findSupermarketsFromCity(ciudad.id);
    expect(supermercados.length).toBe(5)
  });

  it('findSupermarketsFromCity should throw an exception for an invalid supermercado', async () => {
    await expect(()=> service.findSupermarketsFromCity("0")).rejects.toHaveProperty("message", "La ciudad con el id dado no fue encontrada");
  });

  it('updateSupermarketsFromCity should update supermercados list for a ciudad', async () => {
    const newSupermercado: SupermercadoEntity = await supermercadoRepository.save({
      nombre: faker.company.name(),
      longitud: faker.address.longitude(),
      latitud: faker.address.latitude(),
      paginaweb: faker.internet.domainName()
    });
 
    const updatedCiudad: CiudadEntity = await service.updateSupermarketsFromCity(ciudad.id, [newSupermercado]);
    expect(updatedCiudad.supermercados.length).toBe(1);
    expect(updatedCiudad.supermercados[0].nombre).toBe(newSupermercado.nombre);
    expect(updatedCiudad.supermercados[0].longitud).toBe(newSupermercado.longitud);
    expect(updatedCiudad.supermercados[0].latitud).toBe(newSupermercado.latitud);
    expect(updatedCiudad.supermercados[0].paginaweb).toBe(newSupermercado.paginaweb);
  });

  it('updateSupermarketsFromCity should throw an exception for an invalid ciudad', async () => {
    const newSupermercado: SupermercadoEntity = await supermercadoRepository.save({
      nombre: faker.company.name(),
      longitud: faker.address.longitude(),
      latitud: faker.address.latitude(),
      paginaweb: faker.internet.domainName()
    });
 
    await expect(()=> service.updateSupermarketsFromCity("0", [newSupermercado])).rejects.toHaveProperty("message", "La ciudad con el id dado no fue encontrada");
  });

  it('updateSupermarketsFromCity should throw an exception for an invalid supermercado', async () => {
    const newSupermercado: SupermercadoEntity = supermercadosList[0];
    newSupermercado.id = "0";
 
    await expect(()=> service.updateSupermarketsFromCity(ciudad.id, [newSupermercado])).rejects.toHaveProperty("message", "El supermercado con el id dado no fue encontrado");
  });

  it('deleteSupermarketFromCity should remove an supermercado from a ciudad', async () => {
    const supermercado: SupermercadoEntity = supermercadosList[0];
   
    await service.deleteSupermarketFromCity(ciudad.id, supermercado.id);
 
    const storedCiudad: CiudadEntity = await ciudadRepository.findOne({where: {id: ciudad.id}, relations: ["supermercados"]});
    const deletedSupermercado: SupermercadoEntity = storedCiudad.supermercados.find(s => s.id === supermercado.id);
 
    expect(deletedSupermercado).toBeUndefined();
 
  });

  it('deleteSupermarketFromCity should thrown an exception for an invalid supermercado', async () => {
    await expect(()=> service.deleteSupermarketFromCity(ciudad.id, "0")).rejects.toHaveProperty("message", "El supermercado con el id dado no fue encontrado");
  });

  it('deleteSupermarketFromCity should thrown an exception for an invalid ciudad', async () => {
    const supermercado: SupermercadoEntity = supermercadosList[0];
    await expect(()=> service.deleteSupermarketFromCity("0", supermercado.id)).rejects.toHaveProperty("message", "La ciudad con el id dado no fue encontrada");
  });

  it('deleteSupermarketFromCity should thrown an exception for an non asocciated supermercado', async () => {
    const newSupermercado: SupermercadoEntity = await supermercadoRepository.save({
      nombre: faker.company.name(),
      longitud: faker.address.longitude(),
      latitud: faker.address.latitude(),
      paginaweb: faker.internet.domainName()
    });
 
    await expect(()=> service.deleteSupermarketFromCity(ciudad.id, newSupermercado.id)).rejects.toHaveProperty("message", "El supermercado con el id dado no está asociado a la ciudad");
  });
});
