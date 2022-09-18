/* eslint-disable prettier/prettier */
import { CiudadEntity } from '../ciudad/ciudad.entity';
import { Column, Entity, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';

@Entity()
export class SupermercadoEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @Column()
  longitud: string;

  @Column()
  latitud: string;

  @Column()
  paginaweb: string;

  @ManyToMany(() => CiudadEntity, ciudad => ciudad.supermercados)
  ciudades: CiudadEntity[];
}
