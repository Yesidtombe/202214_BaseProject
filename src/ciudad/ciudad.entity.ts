/* eslint-disable prettier/prettier */
import { SupermercadoEntity } from '../supermercado/supermercado.entity';
import { Column, Entity, PrimaryGeneratedColumn, ManyToMany, JoinTable } from 'typeorm';

@Entity()
export class CiudadEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @Column()
  pais: string;

  @Column()
  habitantes: number;

  @ManyToMany(() => SupermercadoEntity, supermercado => supermercado.ciudades)
  @JoinTable()
  supermercados: SupermercadoEntity[];
}