import { buildSavedList, encodeBuild } from "../utils/helpers.js"

const node = "savedplans"

export class SavedBuild{
    constructor(
        public name: string = "My Saved Build",
        public data: string = ""
    ) { }

    save() {
        const builds = SavedBuild.load()
        builds[this.name] = this
        localStorage.setItem(node, JSON.stringify(builds))
    }

    static load(){
        const savedBuildData: { [name: string]: SavedBuild } = JSON.parse(localStorage.getItem(node) || "{}")
        let savedBuilds = {}

        for (const name in savedBuildData) {
            const build = savedBuildData[name]
            savedBuilds[name] = new SavedBuild(name, build.data)
        }

        return savedBuilds
    }

    static import(){
        const urlParams = new URLSearchParams(window.location.search)
        const encodedData = urlParams.get('data')
        const planName =  document.getElementById("plan-name") as HTMLInputElement
    
        if (encodedData) {
            const data = decodeURIComponent(encodedData)
    
            try {
                const parsedData = JSON.parse(data)
                const value = JSON.stringify(parsedData.name || "")
                planName.value = JSON.stringify(parsedData.name || "").replace(/\"/g, "")
            } catch (error) {
                console.error("Error parsong plan data: ", error)
            }
        }
    }

    static dump(name: string){
        const plans = SavedBuild.load()

        for (const n in plans) {
            if (name == n) {
                delete plans[name]
                localStorage.setItem(node, JSON.stringify(plans))
                break
            }
        }
    }
}

export function savePlan(){
    const planName = document.getElementById("plan-name") as HTMLInputElement               
    const plans = SavedBuild.load()
    const limit = 10

    if (Object.keys(plans).length >= limit) {
        $(`#save-plan`).tooltip({ title: `Can only save ${limit} builds at this time.`, delay: { show: 500, hide: 1500 } })
        $(`#save-plan`).tooltip('show')
        return
    }

    if (planName.value != "") {
        const plan = new SavedBuild(planName.value, encodeBuild(planName.value))
        plan.save()
        buildSavedList()
        $('#saveModal').modal('hide')
    }
}