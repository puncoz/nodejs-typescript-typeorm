import {
    EntityRepository,
    Repository,
}                          from "typeorm"
import { Student }         from "./entities/Student"
import { normalizeNumber } from "./utils"

export type GenderType = "male" | "female"

export enum Gender {
    male = "male",
    female = "female"
}

@EntityRepository(Student)
export class StudentRepository extends Repository<Student> {

    async allStudents(): Promise<Student[]> {
        return await this.find()
    }

    async findOneStudent(id: number): Promise<Student> {
        let student = await this.findOne({
            where: {id},
        })

        if (!StudentRepository.isStudent(student)) {
            /** @Todo **/
            throw new Error(`Student id ${id} did not retrieve a Student`)
        }

        return student
    }

    async createAndSave(student: Student): Promise<number> {
        let stud = new Student()
        stud.name = student.name
        stud.entered = normalizeNumber(student.entered, "Bad year entered.")
        stud.grade = normalizeNumber(student.grade, "Bad grade.")
        stud.gender = student.gender

        await this.save(stud)

        return stud.id
    }

    async updateStudent(id: number, student: Student): Promise<number> {
        if (typeof student.entered !== "undefined") {
            student.entered = normalizeNumber(student.entered, "Bad year entered.")
        }

        if (typeof student.grade !== "undefined") {
            student.grade = normalizeNumber(student.grade, "Bad grade.")
        }

        if (!StudentRepository.isStudentUpdater(student)) {
            // @todo
            throw new Error(`Student update id ${id} did not receive a Student updater ${student}`)
        }

        await this.manager.update(Student, id, student)

        return id
    }

    async deleteStudent(student: number | Student) {
        if (typeof student !== "number" && !StudentRepository.isStudent(student)) {
            throw new Error("Supplied student object is not a Student.")
        }

        await this.manager.delete(Student, typeof student === "number" ? student : student.id)
    }

    static isGender(gender: any): gender is Gender {
        return typeof gender === "string"
            && (gender === "male" || gender === "female")
    }

    static isStudent(student: any): student is Student {
        if (typeof student !== "object") {
            return false
        }
        if (typeof student.name !== "string") {
            return false
        }

        if (typeof student.entered !== "number") {
            return false
        }

        if (typeof student.grade !== "number") {
            return false
        }

        return StudentRepository.isGender(student.gender)
    }

    static isStudentUpdater(updater: any): boolean {
        if (typeof updater !== "object") {
            throw new Error("isStudentUpdater must get object")
        }

        if (typeof updater.name !== "undefined" && typeof updater.name !== "string") {
            return false
        }

        if (typeof updater.entered !== "undefined" && typeof updater.entered !== "number") {
            return false
        }

        if (typeof updater.grade !== "undefined" && typeof updater.grade !== "number") {
            return false
        }

        return !(typeof updater.gender !== "undefined" && StudentRepository.isGender(updater.gender))
    }

}
