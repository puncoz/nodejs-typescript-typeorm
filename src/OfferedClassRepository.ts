import * as fs             from "fs-extra"
import * as yaml           from "js-yaml"
import {
    EntityRepository,
    Repository,
}                          from "typeorm"
import { OfferedClass }    from "./entities/OfferedClass"
import { normalizeNumber } from "./utils"

@EntityRepository(OfferedClass)
export class OfferedClassRepository extends Repository<OfferedClass> {

    async allClasses(): Promise<OfferedClass[]> {
        return await this.find({
            relations: ["students"],
        })
    }

    async findOneClass(code: string): Promise<OfferedClass> {
        let cls = await this.findOne({
            where: {code},
            relations: ["students"],
        })

        if (!OfferedClassRepository.isOfferedClass(cls)) {
            // @todo
            throw new Error(`OfferedClass id ${code} did not retrieve a OfferedClass`)
        }

        return new OfferedClass()
    }

    async createAndSave(offeredClass: OfferedClass): Promise<string> {
        let cls = new OfferedClass()
        cls.code = offeredClass.code
        cls.name = offeredClass.name
        cls.hours = normalizeNumber(offeredClass.hours, "Bad number of hours.")

        if (!OfferedClassRepository.isOfferedClass(cls)) {
            throw new Error(`Not an offered class ${offeredClass}`)
        }

        await this.save(cls)

        return cls.code
    }

    async updateOfferedClass(code: string, offeredClass: OfferedClass): Promise<string> {
        if (typeof offeredClass.hours !== "undefined") {
            offeredClass.hours = normalizeNumber(offeredClass.hours, "Bad number of hours.")
        }

        if (!OfferedClassRepository.isOfferedClassUpdater(offeredClass)) {
            // @todo
            throw new Error(`OfferedClass update id ${code} did not receive a OfferedClass updater ${offeredClass}`)
        }

        await this.manager.update(OfferedClass, code, offeredClass)

        return code
    }

    async deleteOfferedClass(offeredClass: string | OfferedClass) {
        if (typeof offeredClass !== "string" && !OfferedClassRepository.isOfferedClass(offeredClass)) {
            throw new Error("Supplied offeredClass object not a OfferedClass")
        }

        await this.manager.delete(OfferedClass, typeof offeredClass === "string" ? offeredClass : offeredClass.code)
    }


    async updateClasses(classFN: string) {
        const yamlText = await fs.readFile(classFN, "utf-8")
        const offered = yaml.safeLoad(yamlText)

        if (typeof offered !== "object" || !Array.isArray(offered.classes)) {
            throw new Error(`updateClasses read incorrect data file from ${classFN}`)
        }

        let all = await this.allClasses()
        for (let cls of all) {
            let stillOffered = false
            for (let ofrd of offered.classes) {
                if (ofrd.code === cls.code) {
                    stillOffered = true
                    break
                }
            }

            if (!stillOffered) {
                this.deleteOfferedClass(cls.code)
            }
        }

        for (let updater of offered.classes) {
            if (!OfferedClassRepository.isOfferedClassUpdater(updater)) {
                // @todo
                throw new Error(`updateClasses found classes entry that is not an OfferedClassUpdater ${updater}`)
            }

            let cls
            try {
                cls = await this.findOneClass(updater.code)
            } catch (e) {
                cls = undefined
            }

            if (cls) {
                await this.updateOfferedClass(cls.code, updater)
            } else {
                await this.createAndSave(updater)
            }
        }
    }

    static isOfferedClass(offeredClass: any): offeredClass is OfferedClass {
        if (typeof offeredClass !== "object") {
            return false
        }

        if (typeof offeredClass.code !== "string") {
            return false
        }

        if (typeof offeredClass.name !== "string") {
            return false
        }

        return typeof offeredClass.hours === "number"
    }

    static isOfferedClassUpdater(updater: any): boolean {
        if (typeof updater !== "object") {
            throw new Error(`isOfferedClassUpdater must get object`)
        }

        if (typeof updater.code !== "undefined" && typeof updater.code !== "string") {
            return false
        }

        if (typeof updater.name !== "undefined" && typeof updater.name !== "string") {
            return false
        }

        return !(typeof updater.hours !== "undefined" && typeof updater.hours !== "number")
    }

}
