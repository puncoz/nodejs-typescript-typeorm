import {
    Column,
    Entity,
    JoinTable,
    ManyToMany,
    PrimaryGeneratedColumn,
} from "typeorm"
import { OfferedClass } from "./OfferedClass"

@Entity()
export class Student {
    @PrimaryGeneratedColumn()
    id: number

    @Column({length: 100})
    name: string

    @Column({type: "int"})
    entered: number

    @Column({type: "int"})
    grade: number

    @Column()
    gender: string

    @ManyToMany(() => OfferedClass, oClass => oClass.students)
    @JoinTable()
    classes: OfferedClass[]
}
